#!/bin/bash

##Update from remote repository
echo '=== Updating ==='
echo 'Pulling update from Git ...'
git pull &> /dev/null

##Restart new main script.
echo 'Done updating, executing main launcher ...'
exec ./gub.sh

exit 0
