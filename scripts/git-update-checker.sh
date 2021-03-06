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
	#Update needed, copy git update script to signify needed update (This is also triggered after the internet connection was gone)
	echo 'Copying update script...'
	if [ -f ./saved/git-perform-update.sh ]; then
		rm ./saved/git-perform-update.sh
	fi
	cp ./scripts/git-perform-update.sh ./saved/git-perform-update.sh
    echo 'Terminating Live Shell...'
	kill -n 15 $pIdLiveShell
	wait $pIdLiveShell 2> /dev/null
	while true; do
		#Waiting for termination through main script
		sleep 5
	done
else
	echo 'Terminating updater, due to diverging update!'
fi
exit 0
