#!/bin/sh
# src/ faylından index.html qurur
cd "$(dirname "$0")"
{ cat head.html shell.html; echo "<script>"; cat icons.js data.js extras.js vids.js app.js; echo "</script>"; echo "</body></html>"; } > ../index.html
