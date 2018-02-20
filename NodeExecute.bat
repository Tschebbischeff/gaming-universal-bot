@ECHO OFF
IF NOT EXIST saved MKDIR saved
:START
CLS
node --trace-warnings --trace-deprecation index.js
PAUSE
GOTO START