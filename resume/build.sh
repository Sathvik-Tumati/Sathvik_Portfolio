#!/bin/sh
# Rebuild the resume PDF from resume.md + resume.css.
# Set MAKE_PDF_BIN to a markdown-to-PDF tool that takes the arguments below.
set -e
cd "$(dirname "$0")"
PDF_BIN="${MAKE_PDF_BIN:?set MAKE_PDF_BIN to your PDF tool}"
OUT=Sathvik_Tumati_Resume.pdf
TMP=$(mktemp -d)
{ echo '<style>'; cat resume.css; echo '</style>'; echo; cat resume.md; } > "$TMP/resume.md"
"$PDF_BIN" generate "$TMP/resume.md" "$PWD/$OUT" --page-size a4 --margins 11mm \
  --no-confidential --no-page-numbers --no-chapter-breaks --quiet \
  --title "Sathvik Tumati - Resume" --author "Sathvik Tumati"
rm -r "$TMP"
cp "$OUT" ../public/"$OUT"
