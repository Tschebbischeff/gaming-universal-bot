#!/bin/sh

if [ -f /saved/git-perform-update.sh ]; then
    rm /saved/git-perform-update.sh
fi
node --trace-warnings --trace-deprecation index.js &
sh ./scripts/discord-bot-live-shell.sh &
pIdNode=$(jobs -p | sed '1!d')
pIdLiveShell=$(jobs -p | sed '2!d')
kill -STOP $pIdLiveShell
sh ./scripts/git-update-checker.sh $pIdNode $pIdLiveShell &
sleep 10
echo '=== Live shell ==='
kill -CONT $pIdLiveShell
%2
echo 'Live Shell terminated, checking for update-script'
if [ ! -f /saved/git-perform-update.sh ]; then
    echo 'Live Shell was terminated by user... Terminating'
    kill -TERM %1
    kill -TERM %3
else
    exec ./saved/git-perform-update.sh
fi
echo 'Terminated, will exit now...'
exit 0