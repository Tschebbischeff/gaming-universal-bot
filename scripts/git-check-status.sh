#!/bin/bash

git remote update > /dev/null

UPSTREAM=${1:-'@{u}'} > /dev/null
LOCAL=$(git rev-parse @) > /dev/null
REMOTE=$(git rev-parse "$UPSTREAM") > /dev/null
BASE=$(git merge-base @ "$UPSTREAM") > /dev/null

if [ $LOCAL = $REMOTE ]; then
	exit 0 #Up-to-date
elif [ $LOCAL = $BASE ]; then
	exit 1 #Need to pull
elif [ $REMOTE = $BASE ]; then
	exit 2 #Need to push
else
	exit 3 #Diverged
fi