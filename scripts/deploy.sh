#!/usr/bin/env bash
set -euo pipefail

### Paths
ROOT="$(pwd)"
DEPLOYPATH="${DEPLOYPATH:-/home/oukygmkd/public_html}"   # cPanel injects this from .cpanel.yml
BUILD="$ROOT/.build"                                     # temporary staging

echo "==> Building to $BUILD and deploying to $DEPLOYPATH"

# Clean build & stage fresh files
rm -rf "$BUILD"
mkdir -p "$BUILD"

# Copy folders as-is
cp -R "$ROOT/assets" "$BUILD/"
cp -R "$ROOT/api" "$BUILD/"

# Copy HTML (root) and plain (unhashed) assets we will fingerprint
cp "$ROOT/index.html" "$BUILD/"
cp "$ROOT/styles.css" "$BUILD/" || true
cp "$ROOT/script.js" "$BUILD/" || true
cp "$ROOT/contact.js" "$BUILD/" || true

# Fingerprint only CSS/JS in build root (you can extend to assets if you want)
hash8() { sha256sum "$1" | awk '{print $1}' | cut -c1-8; }

declare -A MAP
for f in "$BUILD"/*.css "$BUILD"/*.js; do
  [ -f "$f" ] || continue
  base="$(basename "$f")"
  name="${base%.*}"
  ext="${base##*.}"
  h="$(hash8 "$f")"
  new="${name}.${h}.${ext}"
  cp "$f" "$BUILD/$new"
  MAP["$base"]="$new"
done

# Update references in index.html to point to hashed files
if [ -f "$BUILD/index.html" ]; then
  for from in "${!MAP[@]}"; do
    to="${MAP[$from]}"
    # Replace only within src/href contexts
    sed -i "s#\\([\"'(/]\\)$from\\([\"')?]\\)#\\1$to\\2#g" "$BUILD/index.html"
  done
  # Optionally remove the un-hashed originals from build so only hashed are published
  for k in "${!MAP[@]}"; do rm -f "$BUILD/$k"; done
fi

# Cache headers at DOCROOT
cat > "$BUILD/.htaccess" <<'HTX'
# Strong caching for versioned assets (hashed names)
<IfModule mod_headers.c>
  <FilesMatch "\.(?:css|js|png|jpe?g|gif|svg|webp|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # HTML should revalidate so new HTML can reference new asset URLs
  <FilesMatch "\.html?$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>
HTX

# Publish (atomic-ish): wipe target then copy fresh build
echo "==> Publishing to $DEPLOYPATH"
rm -rf "${DEPLOYPATH:?}/"*                          # clear old site
cp -R "$BUILD/"* "$DEPLOYPATH/"

echo "==> Done. Fingerprinted assets and cache headers are live."