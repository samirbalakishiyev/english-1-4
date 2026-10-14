#!/bin/sh
cd "$(dirname "$0")"
{ cat shell.html; echo "<script>"; cat icons.js data.js extras.js vids.js app.js; echo "</script>"; } > english-1-4.html
