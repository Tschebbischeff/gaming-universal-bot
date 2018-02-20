#!/bin/bash

##Update from remote repository
git pull &> /dev/null

##Restart new main script.
exec ./gub.sh

exit 0
