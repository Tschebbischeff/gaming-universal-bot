#!/bin/bash

##Updating refs
git remote update

##Determining status
UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

##Returning status
if [ $LOCAL = $REMOTE ]; then
	exit 0 #Up-to-date
elif [ $LOCAL = $BASE ]; then
	exit 1 #Need to pull
elif [ $REMOTE = $BASE ]; then
	exit 2 #Need to push
else
	exit 3 #Diverged
fi