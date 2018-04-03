#!/bin/bash

##Setting up session
set -m
echo '========== Gaming Universal Bot ===== Linux Continous Running and Updating Tool =========='
if [ -f ./saved/git-perform-update.sh ]; then
    rm ./saved/git-perform-update.sh
fi
if [ -f ./saved/botState ]; then
    rm ./saved/botState
fi

##Starting services
node --trace-warnings --trace-deprecation index.js &
pIdNode=$(jobs -p | sed '1!d')
bash ./scripts/discord-bot-live-shell.sh &
pIdLiveShell=$(jobs -p | sed '2!d')
kill -n 19 $pIdLiveShell #SIGSTOP
bash ./scripts/git-update-checker.sh $pIdNode $pIdLiveShell &
pIdUpdateChecker=$(jobs -p | sed '3!d')

##Waiting for node.js bot
echo '=== Bot initialization ==='
terminate=false
while ! $terminate; do
	if [ -f ./saved/botState ]; then
		state=$(cat ./saved/botState | sed '1!d')
		if [ "$state" = "READY" ]; then
			terminate=true
		fi
	fi
done
echo '=== Live shell ==='
kill -n 18 $pIdLiveShell #SIGCONT
fg %2 > /dev/null

##Reacting to termination
echo 'Live Shell terminated, checking update-script ...'
if [ ! -f ./saved/git-perform-update.sh ]; then
    echo 'Live Shell was terminated by user, cleaning up ...'
    kill -n 15 $pIdNode
	wait $pIdNode 2> /dev/null
	echo 'Node terminated'
    kill -n 15 $pIdUpdateChecker
	wait $pIdUpdateChecker 2> /dev/null
	echo 'Automatic updater terminated'
else
	echo 'Update-script found...'
	echo 'Terminating current node session...'
	kill -n 15 $pIdNode
	wait $pIdNode 2> /dev/null
	echo 'Terminating Live Shell...'
	kill -n 15 $pIdLiveShell
	wait $pIdLiveShell 2> /dev/null
	echo 'Terminating automatic updater...'
    kill -n 15 $pIdUpdateChecker
	wait $pIdUpdateChecker 2> /dev/null
	echo 'Executing update-script...'
    exec ./saved/git-perform-update.sh
fi
exit 0