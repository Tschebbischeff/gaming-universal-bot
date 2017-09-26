@ECHO OFF
CLS
heroku scale worker=0 -a gaming-universal-bot
PAUSE