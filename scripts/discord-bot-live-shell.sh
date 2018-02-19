#!/bin/bash

terminate=false
sleep 1

echo 'This file is a stub!' #, you can write commands, but they will not affect anything! Waiting for bot to be ready.'
while ! $terminate; do
    read cmd
	if [ "$cmd" == 'exit' ]; then
		terminate=true
	else
		sleep 1
		#Send to discord bot?
	fi
done
exit 0