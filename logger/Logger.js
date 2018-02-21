'use strict'

class Logger { constructor() {
    
	const discordClient = require("./../DiscordClient");
	const config = require("./../config/Config");
	const gubLib = require("./../GUBLib");
	const MAX_LOG_LENGTH = 2500;
	const DISCORD_CHARACTER_LIMIT = 2000;
	
	let needsUpdating = true;
	let updatingLogMessage = false;
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
		if (log[index].timestamp) {
			let ts = new Date(log[index].timestamp);
			return "[" + (ts.getHours() < 10 ? "0" : "")+ts.getHours()+":"+(ts.getMinutes() < 10 ? "0" : "")+ts.getMinutes()+":"+(ts.getSeconds() < 10 ? "0" : "")+ts.getSeconds() + "]: " + log[index].message;
		} else {
			return log[index].message;
		}
	}
	
	let compileLogPage = function(page) {
		let message = "";
		let currentPage = 0;
		let pageLineBegin = log.length-1;
		while (currentPage < page && pageLineBegin > 0) {
			let line = "";
			message = "";
			currentPage++;
			for (let i = pageLineBegin; i >= 0; i--) {
				pageLineBegin = i;
				line = compileLogLine(i);
				if (message.length + line.length > (DISCORD_CHARACTER_LIMIT - 20)) {
					break;
				}
				message = "\n" + line + message;
			}
		}
		if (currentPage < page && page > 1) {
			return "There is no page number " + page + "!";
		}
		return message == "" ? "" : "```markdown\n" + message + "\n```";
	}
	
	this.getLogPage = function(page) {
		return compileLogPage(page);
	}
	
	this.reset = function() {
		log = [];
		save();
		config.setServerLogMessageId("0");
		this.updateLogMessage();
	}
	
	this.write = function(msg) {
		let now = new Date();
		if (log.length == 0 || ((new Date()).getDate() != (new Date(log[log.length-1].timestamp)).getDate())) {
			log.push({message: "### "+(now.getDate() < 10 ? "0" : "")+now.getDate()+"."+(now.getMonth() < 9 ? "0" : "")+(now.getMonth()+1)+"."+now.getFullYear()+" ###"});
		}
		let eventObj = {timestamp: now.getTime(), message: msg};
		log.push(eventObj);
		while (log.length > MAX_LOG_LENGTH) {
			log.shift();
		}
		needsUpdating = true;
		save();
		this.updateLogMessage();
	}
	
	let sendLogMessage = function(channel) {
		let message = compileLogPage(1);
		if (message != "") {
			channel.send(message)
			.then(function(msg) {
				config.setServerLogMessageId(msg.id);
				channel.send({embed: {title: "Want to see more logs?", description: "Go to #bot_cmds and issue __"+config.getPrefix()+"help logs__ for more info."}})
				creatingLogMessage = false;
			}).catch(function(err) {
				console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
				creatingLogMessage = false;
			});
		} else {
			creatingLogMessage = false;
		}
	}
	
	let createLogMessage = function() {
		if (!updatingLogMessage && !creatingLogMessage) {
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
	
	this.updateLogMessage = function() {
		if (needsUpdating && !updatingLogMessage && !creatingLogMessage) {
			updatingLogMessage = true;
			needsUpdating = false;
			let messageId = config.getServerLogMessageId(this);
			if (messageId == "0") {
				updatingLogMessage = false;
				createLogMessage();
			} else {
				let validGuild = gubLib.getValidGuild();
				let channelId = config.getServerLogChannelId();
				if (validGuild.available && validGuild.channels.has(channelId)) {
					let channel = validGuild.channels.get(channelId);
					if (channel.type == "text") {
						channel.fetchMessages()
						.then(function(msgs) {
							if (msgs.has(messageId)) {
								let message = msgs.get(messageId);
								if (message.editable) {
									message.edit(compileLogPage(1))
									.then(function(msg) {
										updatingLogMessage = false;
									}).catch(function(err) {
										console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
										updatingLogMessage = false;
									});
								} else {
									updatingLogMessage = false;
									createLogMessage();
								}
							} else {
								updatingLogMessage = false;
								createLogMessage();
							}
						}).catch(function(err) {
							console.log("[Logger] " + err.name + ":" + err.message + "\n" + err.stack);
							updatingLogMessage = false;
						});
					} else {
						updatingLogMessage = false;
					}
				} else {
					updatingLogMessage = false;
				}
			}
		}
	}
	
	this.registerCallbacks = function() {
		let validGuild = gubLib.getValidGuild();
		discordClient.on("guildMemberUpdate", (oldMember, newMember) => {
			if (oldMember.guild.id == validGuild.id || newMember.guild.id == validGuild.id) {
				if (oldMember.nickname != newMember.nickname) {
					this.write("\"" + (oldMember.nickname ? oldMember.nickname : oldMember.user.username) + "\" is now called \"" + (newMember.nickname ? newMember.nickname : newMember.user.username) + "\"");
				}
			}
		});
		discordClient.on("guildMemberAdd", (guildMember) => {
			if (guildMember.guild.id == validGuild.id) {
				this.write("\"" + (guildMember.nickname ? guildMember.nickname : guildMember.user.username) + "\" has joined the server");
			}
		});
		discordClient.on("guildBanAdd", (guild, user) => {
			if (guild.id == validGuild.id) {
				this.write("\"" + user.username + "\" has been banned from the server");
			}
		});
		discordClient.on("guildBanRemove", (guild, user) => {
			if (guild.id == validGuild.id) {
				this.write("\"" + user.username + "\" is no longer banned");
			}
		});
		discordClient.on("guildMemberRemove", (member) => {
			if (member.guild.id == validGuild.id) {
				this.write("\"" + (member.nickname ? member.nickname : member.user.username) + "\" has left the server");
			}
		});
		/*discordClient.on("presenceUpdate", (oldMember, newMember) => {
			if (oldMember.guild.id == validGuild.id || newMember.guild.id == validGuild.id) {
				console.log("presenceUpdate");
			}
		});*/
		discordClient.on("voiceStateUpdate", (oldMember, newMember) => {
			if (oldMember.guild.id == validGuild.id || newMember.guild.id == validGuild.id) {
				if (!oldMember.voiceChannelID && newMember.voiceChannelID) {
					this.write("\"" + (newMember.nickname ? newMember.nickname : newMember.user.username) + "\" joined Channel \"" + newMember.voiceChannel.name + "\"");
				} else if (oldMember.voiceChannelID && !newMember.voiceChannelID) {
					this.write("\"" + (newMember.nickname ? newMember.nickname : newMember.user.username) + "\" left Channel \"" + oldMember.voiceChannel.name + "\"");
				} else {
					if (oldMember.voiceChannelID != newMember.voiceChannelID) {
						this.write("\"" + (newMember.nickname ? newMember.nickname : newMember.user.username) + "\" went from Channel \"" + oldMember.voiceChannel.name + "\" to Channel \"" + newMember.voiceChannel.name + "\"");
					}
				}
				//console.log("voiceStateUpdate");
			}
		});
		this.updateLogMessage();
	}
    
}}

module.exports = new Logger();