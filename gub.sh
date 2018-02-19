#!/bin/sh

if [ -f /saved/git-perform-update.sh ]; then
    rm /saved/git-perform-update.sh
fi
node --trace-warnings --trace-deprecation index.js &
pIdNode=$(jobs -p | sed '1!d')
sh ./scripts/discord-bot-live-shell.sh &
pIdLiveShell=$(jobs -p | sed '2!d')
kill -n -19 $pIdLiveShell #SIGSTOP
sh ./scripts/git-update-checker.sh $pIdNode $pIdLiveShell &
pIdUpdateChecker=$(jobs -p | sed '3!d')
sleep 10
echo '=== Live shell ==='
kill -n -18 $pIdLiveShell #SIGCONT
jobs
fg %2
echo 'Live Shell terminated, checking for update-script'
if [ ! -f /saved/git-perform-update.sh ]; then
    echo 'Live Shell was terminated by user... Terminating'
    kill -n -15 $pIdNode
    kill -n -15 $pIdUpdateChecker
else
    exec ./saved/git-perform-update.sh
fi
echo 'Terminated, will exit now...'
exit 0