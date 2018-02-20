#!/bin/bash

set -m
echo '========== Gaming Universal Bot: Linux Continous Running and Updating Tool =========='
if [ -f ./saved/git-perform-update.sh ]; then
    rm ./saved/git-perform-update.sh
fi
node --trace-warnings --trace-deprecation index.js &
pIdNode=$(jobs -p | sed '1!d')
bash ./scripts/discord-bot-live-shell.sh &
pIdLiveShell=$(jobs -p | sed '2!d')
kill -n 19 $pIdLiveShell #SIGSTOP
bash ./scripts/git-update-checker.sh $pIdNode $pIdLiveShell &
pIdUpdateChecker=$(jobs -p | sed '3!d')

terminate=false
echo 'Waiting for bot to get ready ...'
while ! $terminate; do
	if [ -f ./saved/botState ]; then
		state=$(cat ./saved/botState | sed '1!d')
		if [ "$state" = "READY" ]; then
			terminate=true
		fi
	fi
done
echo 'Bot is ready.'
echo '=== Live shell ==='
kill -n 18 $pIdLiveShell #SIGCONT
fg %2 > /dev/null

echo 'Live Shell terminated, checking for update-script...'
if [ ! -f ./saved/git-perform-update.sh ]; then
    echo 'Live Shell was terminated by user'
    kill -n 15 $pIdNode &> /dev/null
	echo 'Node terminated'
    kill -n 15 $pIdUpdateChecker &> /dev/null
	echo 'Automatic updater terminated'
else
    exec ./saved/git-perform-update.sh
fi

wait $pIdNode
wait $pIdUpdateChecker
sleep 2
exit 0 &> /dev/null