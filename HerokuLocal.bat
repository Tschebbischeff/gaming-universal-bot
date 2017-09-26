@ECHO OFF
IF EXIST .running GOTO START
type nul > .running
cmd /k HerokuLocal.bat

:START
DEL .running
CLS
heroku scale worker=0 -a gaming-universal-bot
DEL .env
heroku config:get GAMING_UNIVERSAL_BOT_TOKEN -s >> .env
heroku local
heroku scale worker=1 -a gaming-universal-bot
EXIT /B