#!/bin/sh

git remote update

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

if [ $LOCAL = $REMOTE ]; then
	exit 0 #Up-to-date
elif [ $LOCAL = $BASE ]; then
	exit 1 #Need to pull
elif [ $REMOTE = $BASE ]; then
	exit 2 #Need to push
else
	exit 3 #Diverged
fi