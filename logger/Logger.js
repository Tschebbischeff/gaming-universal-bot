'use strict'

class Logger { constructor() {
    
	const discordClient = require("./../DiscordClient");
	const config = require("./../config/Config");
	const gubLib = require("./../GUBLib");
	const MAX_LOG_LENGTH_FILE = 250;
	const MAX_LOG_LENGTH_SHOW = 50;
	
	let creatingLogMessage = false;
	let requiresUpdate = false;
	let fs = require("fs");
    let log;
    try {
        log = require("./../saved/server_log.json");
    } catch (e) {
        log = [];
    }
	
	let save = function() {
        fs.writeFile("./saved/server_log.json", JSON.stringify(log), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
	
	let compileLogLine = function(index) {
		return "<" + (new Date(log[index].timestamp)).toLocaleTimeString() + ">: " + log[index].message;
	}
	
	let compileLogMessage = function() {
		let message = "";
		for (let i = 0; i < Math.min(MAX_LOG_LENGTH_SHOW, log.length); i++) {
			message += (message == "" ? "": "\n") + compileLogLine(i);
		}
		return message == "" ? "" : "```html\n" + message + "\n```";
	}
	
	this.reset = function() {
		log = [];
		save();
		//config.setServerLogMessageId("0");
		this.updateLogMessage();
	}
	
	this.write = function(msg) {
		let eventObj = {timestamp: Date.now(), message: msg};
		log.push(eventObj);
		while (log.length > MAX_LOG_LENGTH_FILE) {
			log.shift();
		}
		save();
		this.updateLogMessage();
	}
	
	/*this.updateLogMessage = function() {
		this.createLogMessage();
		let messageId = config.getServerLogMessageId(this);
		if (messageId == "0") {
			this.createLogMessage();
		} else {
			let validGuild = gubLib.getValidGuild();
			let channelId = config.getServerLogChannelId();
			if (validGuild.available && validGuild.channels.has(channelId)) {
				let channel = validGuild.channels.get(channelId);
				if (channel.type == "text") {
					channel.fetchMessages().then(function(msgs) {
						if (msgs.has(messageId)) {
							let message = msgs.get(messageId);
							console.log("EDITABLE?" + message.editable);
							if (message.editable) {
								message.edit(compileLogMessage());
							} else {
								this.createLogMessage();
							}
						} else {
							this.createLogMessage();
						}
					}).catch(function(err) {
						console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
						creatingLogMessage = false;
					});
				}
			}
		}
	}*/
	
	let sendLogMessage = function(channel) {
		let message = compileLogMessage();
		if (message != "") {
			channel.send(message)
			.then(function(msg) {
				config.setServerLogMessageId(msg.id);
				creatingLogMessage = false;
			}).catch(function(err) {
				console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
				creatingLogMessage = false;
			});
		} else {
			creatingLogMessage = false;
		}
	}
	
	this.updateLogMessage = function() {
		if (!creatingLogMessage) {
			creatingLogMessage = true;
			let validGuild = gubLib.getValidGuild();
			let channelId = config.getServerLogChannelId();
			if (validGuild.available && validGuild.channels.has(channelId)) {
				let channel = validGuild.channels.get(channelId);
				if (channel.type == "text") {
					channel.fetchMessages().then(function(msgs) {
						if (msgs.size > 1) {
							channel.bulkDelete(msgs)
							.then(function(msgsB) {
								sendLogMessage(channel);
							}).catch(function(err) {
								console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
								creatingLogMessage = false;
							});
						} else if (msgs.size == 1) {
							msgs.first().delete()
							.then(function(msg) {
								sendLogMessage(channel);
							}).catch(function(err) {
								console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
								creatingLogMessage = false;
							});
						} else {
							sendLogMessage(channel);
						}
					}).catch(function(err) {
						console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
						creatingLogMessage = false;
					});
					
				} else {
					creatingLogMessage = false;
				}
			} else {
				creatingLogMessage = false;
			}
		}
	}
	
	this.registerCallbacks = function() {
		let validGuild = gubLib.getValidGuild();
		discordClient.on("guildMemberUpdate", (oldMember, newMember) => {
			this.write("\"" + (oldMember.nickname ? oldMember.nickname : oldMember.user.username) + "\" is now called \"" + (newMember.nickname ? newMember.nickname : newMember.user.username) + "\"");
		});
	}
    
}}

module.exports = new Logger();