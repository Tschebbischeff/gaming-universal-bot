#!/bin/bash

##Let the main script pause this
sleep 1

##Unpaused, listen for input
terminate=false
echo 'You may issue bot commands in this shell directly.'
echo 'Type exit to terminate the bot gracefully.'
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