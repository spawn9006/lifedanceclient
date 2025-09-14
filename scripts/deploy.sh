#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "==> START deploy.sh"

DOCROOT="${DEPLOYPATH:-/home/oukygmkd/public_html}"
REPO_ROOT="$(pwd)"
BUILD="$(mktemp -d)"

echo "DOCROOT: $DOCROOT"
echo "REPO_ROOT: $REPO_ROOT"
echo "BUILD: $BUILD"

mkdir -p "$DOCROOT"

# Stage files
cp -R "$REPO_ROOT/assets" "$BUILD/" || true
cp -R "$REPO_ROOT/api" "$BUILD/" || true
cp "$REPO_ROOT/index.html" "$BUILD/" || true
cp "$REPO_ROOT/styles.css" "$BUILD/" || true
cp "$REPO_ROOT/script.js" "$BUILD/" || true
cp "$REPO_ROOT/contact.js" "$BUILD/" || true

# Hash helper (sha256sum or shasum)
hash8() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}' | cut -c1-8
  else
    shasum -a 256 "$1" | awk '{print $1}' | cut -c1-8
  fi
}

declare -A MAP
for f in "$BUILD"/*.css "$BUILD"/*.js; do
  [ -f "$f" ] || continue
  b="$(basename "$f")"; name="${b%.*}"; ext="${b##*.}"
  h="$(hash8 "$f")"; new="${name}.${h}.${ext}"
  echo "Hashing $b → $new"
  cp "$f" "$BUILD/$new"
  MAP["$b"]="$new"
done

# Update references in index.html
if [ -f "$BUILD/index.html" ]; then
  for from in "${!MAP[@]}"; do
    to="${MAP[$from]}"
    echo "Rewriting $from → $to in index.html"
    sed -i "s#\\([\"'(/]\\)$from\\([\"')?]\\)#\\1$to\\2#g" "$BUILD/index.html"
  done
  # remove unhashed originals
  for k in "${!MAP[@]}"; do rm -f "$BUILD/$k"; done
fi

# Cache headers
cat > "$BUILD/.htaccess" <<'HTX'
<IfModule mod_headers.c>
  <FilesMatch "\.(?:css|js|png|jpe?g|gif|svg|webp|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.html?$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
HTX

echo "Deploying to $DOCROOT …"
rm -rf "${DOCROOT:?}/"*
cp -R "$BUILD/"* "$DOCROOT/"

echo "Final tree:"
/bin/ls -lah "$DOCROOT"
/bin/ls -lah "$DOCROOT/assets" || true
/bin/ls -lah "$DOCROOT/api" || true

echo "==> DONE deploy.sh"