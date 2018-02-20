#!/bin/bash

echo 'Automatic updates from current Git branch enabled!'

pIdNode=$1
pIdLiveShell=$2
updateNeeded=false
terminate=false

while ! $terminate; do
    sh ./scripts/git-check-status.sh
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

if $updateNeeded; then
	#Update needed, terminate node and live shell and copy git update script
	echo 'Terminating current node session...'
	kill -n 15 $pIdNode
	echo 'Copying update script...'
	if [ -f ./saved/git-perform-update.sh ]; then
		rm ./saved/git-perform-update.sh
	fi
	cp ./scripts/git-perform-update.sh ./saved/git-perform-update.sh
	echo 'Killing Live Shell...'
	kill -n 9 $pIdLiveShell
else
	echo 'Terminating updater, due to diverging update!'
fi
exit 0