#!/bin/bash

##Setting up session
echo 'Starting updater. Listening for changes on current Git branch!'
pIdNode=$1
pIdLiveShell=$2
updateNeeded=false
terminate=false

##Listening for updates on remote
while ! $terminate; do
    bash ./scripts/git-check-status.sh &> /dev/null
	rc=$?
	if [ $rc -eq 1 ]; then
	    echo 'Found update on Git...'
	    updateNeeded=true
		terminate=true
	elif [ $rc -eq 3 ]; then
		echo 'Found diverging update on Git...'
		terminate=true
	fi
	sleep 5
done

##Reacting to update on remote
if $updateNeeded; then
	#Update needed, terminate node and live shell and copy git update script
	echo 'Terminating current node session...'
	kill -n 15 $pIdNode
	wait $pIdNode 2> /dev/null
	echo 'Copying update script...'
	if [ -f ./saved/git-perform-update.sh ]; then
		rm ./saved/git-perform-update.sh
	fi
	cp ./scripts/git-perform-update.sh ./saved/git-perform-update.sh
	echo 'Killing Live Shell...'
	kill -n 15 $pIdLiveShell
	wait $pIdLiveShell 2> /dev/null
else
	echo 'Terminating updater, due to diverging update!'
fi
exit 0