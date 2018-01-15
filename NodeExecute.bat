@ECHO OFF
:START
CLS
node --trace-warnings --trace-deprecation index.js
PAUSE
GOTO START