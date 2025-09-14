#!/usr/bin/env bash
set -euo pipefail

# -------- Paths --------
DOCROOT="${DEPLOYPATH:-/home/oukygmkd/public_html}"     # cPanel passes this env var if you set it; we also default it
REPO_ROOT="$(pwd)"
BUILD="$(mktemp -d)"                                    # build OUTSIDE the repo to keep working tree clean

echo "==> Build dir: $BUILD"
echo "==> Deploying to: $DOCROOT"

# Ensure target exists
mkdir -p "$DOCROOT"

# -------- Stage files (copy from repo to BUILD) --------
cp -R "$REPO_ROOT/assets" "$BUILD/"
cp -R "$REPO_ROOT/api" "$BUILD/"
cp "$REPO_ROOT/index.html" "$BUILD/" || true
cp "$REPO_ROOT/styles.css" "$BUILD/" || true
cp "$REPO_ROOT/script.js" "$BUILD/" || true
cp "$REPO_ROOT/contact.js" "$BUILD/" || true

# -------- Fingerprint CSS/JS in BUILD root --------
hash8() { sha256sum "$1" | awk '{print $1}' | cut -c1-8; }

declare -A MAP
for f in "$BUILD"/*.css "$BUILD"/*.js; do
  [ -f "$f" ] || continue
  b="$(basename "$f")"
  name="${b%.*}"
  ext="${b##*.}"
  h="$(hash8 "$f")"
  new="${name}.${h}.${ext}"
  cp "$f" "$BUILD/$new"
  MAP["$b"]="$new"
done

# Update references in index.html
if [ -f "$BUILD/index.html" ]; then
  for from in "${!MAP[@]}"; do
    to="${MAP[$from]}"
    sed -i "s#\\([\"'(/]\\)$from\\([\"')?]\\)#\\1$to\\2#g" "$BUILD/index.html"
  done
  # remove unhashed originals from BUILD
  for k in "${!MAP[@]}"; do rm -f "$BUILD/$k"; done
fi

# -------- Cache headers (.htaccess in DOCROOT) --------
cat > "$BUILD/.htaccess" <<'HTX'
# Strong caching for versioned assets
<IfModule mod_headers.c>
  <FilesMatch "\.(?:css|js|png|jpe?g|gif|svg|webp|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # HTML should revalidate
  <FilesMatch "\.html?$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
HTX

# -------- Publish (clean then copy) --------
echo "==> Publishing…"
rm -rf "${DOCROOT:?}/"*
cp -R "$BUILD/"* "$DOCROOT/"

echo "==> Deploy complete."