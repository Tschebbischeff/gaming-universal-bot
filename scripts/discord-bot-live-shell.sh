#!/bin/bash

terminate=false
sleep 1

echo 'This file is a stub! You can write commands, but they will not affect anything!'
while ! $terminate; do
    read cmd
	if [ "$cmd" = "exit" ]; then
		terminate=true
	else
		sleep 1
		#Send to discord bot?
	fi
done
exit 0