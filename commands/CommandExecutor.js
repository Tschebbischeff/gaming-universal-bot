'use strict'

class CommandExecutor { constructor() {
    
	const discordClient = require("./../DiscordClient");
	const config = require("./../config/Config");
	const logger = require("./../logger/Logger");
	const gubLib = require("./../GUBLib");
	const asyncTaskHandler = require("./../async/AsyncTaskHandler");
	
	let commandDefinitions = require("./commands.json");
	let commandHelp = require("./commands_help.json");
    
    let handleResult = function(message, result) {
        if (result != null) {
            message.channel.send(result);
        }
    }
    
    let concatCommandChain = function(preCommand, command) {
        return preCommand == "" ? command : preCommand + " " + command;
    }
	
	let getHelpDefinition = function(preCommand, command) {
		let commandChain = concatCommandChain(preCommand, command);
		if (commandHelp.hasOwnProperty(commandChain.toLowerCase())) {
			return commandHelp[commandChain.toLowerCase()];
		} else {
			return null;
		}
	}
	
	let getCommandDefinition = function(commandChain, commandDef) {
		let topLevelCommand = commandChain[0];
		for (let i = 0; i < commandDef.length; i++) {
			if (commandDef[i].command.toLowerCase() == topLevelCommand.toLowerCase()) {
				if (commandChain.length == 1) {
					return commandDef[i];
				} else if (commandDef[i].hasOwnProperty("subcommands")) {
					return getCommandDefinition(commandChain.slice(1), commandDef[i].subcommands);
				}
			}
		}
		return null;
	}
    
    let displayHelp = function(message, preCommand, command) {
		let helpMessage = {embed: {color: 4359924, title: "__Help for command: \"" + concatCommandChain(preCommand, command) + "\"__", type: "rich"}};
		let helpOutputType = "channel";
		let commandDef = getCommandDefinition(concatCommandChain(preCommand, command).split(" "), commandDefinitions);
		if (commandDef == null) {
			helpMessage.embed.description = "This command does not exist.";
		} else {
			let mainHelpDefinition = getHelpDefinition(preCommand, command);
			if (mainHelpDefinition == null) {
				helpMessage.embed.description = "There exists no help on this command.";
			} else {
				helpOutputType = mainHelpDefinition.type;
				helpMessage.embed.description = "*" + mainHelpDefinition.long + "*";
			}
			if (preCommand == "" && command == "help") {
				let fieldsValue = "";
				for (let i = 0; i < commandDefinitions.length; i++) {
					fieldsValue += (fieldsValue == "" ? "" : "\n") + "*__"+commandDefinitions[i].command+"__*";
					let subHelpDefinition = getHelpDefinition("", commandDefinitions[i].command);
					if (subHelpDefinition == null) {
						fieldsValue += "\n\tNo description available.";
					} else {
						fieldsValue += "\n\t"+subHelpDefinition.short.replace("\n", "\n\t");
					}
					
				}
				helpMessage.embed.fields = [{name: "Commands:", value: fieldsValue}];
			} else {
				let fieldsValue = "";
				if (commandDef.hasOwnProperty("subcommands")) {
					for (let i = 0; i < commandDef.subcommands.length; i++) {
						fieldsValue += (fieldsValue == "" ? "" : "\n") + "*__" + commandDef.subcommands[i].command + "__*";
						let subHelpDefinition = getHelpDefinition(concatCommandChain(preCommand, command), commandDef.subcommands[i].command);
						if (subHelpDefinition == null) {
							fieldsValue += "\n\tNo description available";
						} else {
							fieldsValue += "\n\t"+subHelpDefinition.short.replace("\n", "\n\t");
						}
					}
				} else {
					fieldsValue = "*This command has no subcommands*";
				}
				helpMessage.embed.fields = [{name: "The following subcommands are available:", value: fieldsValue}];
			}
		}
		switch(helpOutputType) {
			case "dm":
				message.author.createDM().then(function(dmchannel) {
					dmchannel.send(helpMessage);
				});
				break;
			case "channel":
			default:
				message.channel.send(helpMessage);
				break;
		}
    }
    
    this.commandHelp = function(message, preCommand, command, args) {
		if (preCommand == "" && command == "help" && args.length > 0) {
			displayHelp(message, args.slice(0,-1).join(" "), args.slice(-1)[0]);
		} else {
			displayHelp(message, preCommand, command);
		}
    }
    
    this.commandTasksEnable = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            handleResult(message, asyncTaskHandler.enableTaskByName(args[0]));
        }
    }
    
    this.commandTasksDisable = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            handleResult(message, asyncTaskHandler.disableTaskByName(args[0]));
        }
    }
    
    this.commandConfigReset = function(message, preCommand, command, args) {
        handleResult(message, config.reset());
    }
    
    this.commandTasksReset = function(message, preCommand, command, args) {
        handleResult(message, asyncTaskHandler.resetTaskDefinitions());
    }
    
    this.commandConfigSetRainbowRole = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            let rainbowrole = parseInt(args[0]);
            if (isNaN(rainbowrole)) {
                let gamingUniversal = gubLib.getValidGuild();
                if (gamingUniversal.available) {
                    rainbowrole = gamingUniversal.roles.find("name", args[0]);
                    if (rainbowrole != null) {
                        config.setRainbowRoleId(rainbowrole.id);
                        handleResult(message, "Rainbow role set!");
                    } else {
                        handleResult(message, "Couldn't find role '" + args[0] + "'!");
                    }
                }
            } else {
                config.setRainbowRoleId(rainbowrole);
                handleResult(message, "Rainbow role set!");
            }
        }
    }
	
	this.commandConfigSetServerLogChannel = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            let channel = parseInt(args[0]);
            if (isNaN(channel)) {
                let gamingUniversal = gubLib.getValidGuild();
                if (gamingUniversal.available) {
                    channel = gamingUniversal.channels.find("name", args[0]);
                    if (channel != null) {
                        config.setServerLogChannelId(channel.id);
                        handleResult(message, "Server Log channel set!");
                    } else {
                        handleResult(message, "Couldn't find channel '" + args[0] + "'!");
                    }
                }
            } else {
                config.setServerLogChannelId(channel);
                handleResult(message, "Server Log channel set!");
            }
        }
    }
    
    this.commandConfigSetGuildWars2Channel = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            let channel = parseInt(args[0]);
            if (isNaN(channel)) {
                let gamingUniversal = gubLib.getValidGuild();
                if (gamingUniversal.available) {
                    channel = gamingUniversal.channels.find("name", args[0]);
                    if (channel != null) {
                        config.setGuildWars2ChannelId(channel.id);
                        handleResult(message, "Guild Wars 2 channel set!");
                    } else {
                        handleResult(message, "Couldn't find channel '" + args[0] + "'!");
                    }
                }
            } else {
                config.setGuildWars2ChannelId(channel);
                handleResult(message, "Guild Wars 2 channel set!");
            }
        }
    }
	
	this.commandLogsReset = function(message, preCommand, command, args) {
		handleResult(message, logger.reset());
	}
	
	this.commandLogsShow = function(message, preCommand, command, args) {
		handleResult(message, "Sorry, I am a stupid bot and don't know how to do that yet...");
	}
    
    this.commandPrintTasks = function(message, preCommand, command, args) {
        handleResult(message, asyncTaskHandler.print());
    }
    
    this.commandPrintRoles = function(message, preCommand, command, args) {
        let gamingUniversal = gubLib.getValidGuild();
        if (gamingUniversal.available) {
            let result = {embed: {title: "__Server Roles:__", description: ""}};
            gamingUniversal.roles.forEach(function(role, id) {
				if (role != "@everyone") {
					result.embed.description += (result.embed.description == "" ? "" : "\n") + role.name + " [" + role.id + "]";
				}
            });
            handleResult(message, result);
        }
    }
    
    this.commandPrintChannels = function(message, preCommand, command, args) {
        let gamingUniversal = gubLib.getValidGuild();
        if (gamingUniversal.available) {
            let result = {embed: {title: "__Server Channels:__", description: ""}};
            gamingUniversal.channels.forEach(function(channel, id) {
                result.embed.description += (result.embed.description == "" ? "" : "\n") + channel.name + "(" + channel.type + ") [" + channel.id + "]";
            });
            handleResult(message, result);
        }
    }
	
	this.commandPrintConfig = function(message, preCommand, command, args) {
		handleResult(message, config.print());
	}
}}

module.exports = new CommandExecutor();