#!/bin/sh

echo 'Automatic updates from current Git branch enabled!'

pIdNode=$1
pIdLiveShell=$2
updateNeeded=false

sh ./scripts/git-check-status.sh
rc=$?
echo 'check status result:'
echo $rc
exit 0

while ! $updateNeeded; do
    sh ./scripts/git-check-status.sh
	rc=$?
	if [ $rc -eq 1 ]
	then
	echo 'Found update on Git...'
	    updateNeeded=true
	fi
	sleep 5
done

#Update needed, terminate node and live shell and copy git update script
echo 'Terminating current node session...'
kill -TERM $pIdNode
echo 'Copying update script...'
if [ -f /saved/git-perform-update.sh ]; then
    rm /saved/git-perform-update.sh
fi
cp /scripts/git-perform-update.sh /saved/git-perform-update.sh
echo 'Killing Live Shell...'
kill -KILL $pIdLiveShell