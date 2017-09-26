@ECHO OFF
CLS
heroku scale worker=1 -a gaming-universal-bot
PAUSE