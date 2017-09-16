'use strict'

class CommandExecutor { constructor(discordClient, config) {
    
    let asyncTaskHandler = null;
	let commandDefinitions = require("./commands.json");
	let commandHelp = require("./commands_help.json");
    
    let getValidGuild = function() {
        if (discordClient.guilds.has(config.getValidGuildId())) {
            return discordClient.guilds.get(config.getValidGuildId());
        }
        return null;
    }
    
    this.setAsyncTaskHandler = function(handler) {
        asyncTaskHandler = handler;
    }
    
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
		if (commandHelp.hasOwnProperty(commandChain)) {
			return commandHelp[commandChain];
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
		let helpMessage = "Help for command: \"" + concatCommandChain(preCommand, command) + "\"\n\n\t";
		let helpOutputType = "channel";
		let commandDef = getCommandDefinition(concatCommandChain(preCommand, command).split(" "), commandDefinitions);
		if (commandDef == null) {
			helpMessage += "This command does not exist.";
		} else {
			let mainHelpDefinition = getHelpDefinition(preCommand, command);
			if (mainHelpDefinition == null) {
				helpMessage += "There exists no help on this command.\n\n"
			} else {
				helpOutputType = mainHelpDefinition.type;
				helpMessage += mainHelpDefinition.long + "\n\n"
			}
			if (preCommand == "" && command == "help") {
				for (let i = 0; i < commandDefinitions.length; i++) {
					helpMessage += commandDefinitions[i].command + "\n\t";
					let subHelpDefinition = getHelpDefinition("", commandDefinitions[i].command);
					if (subHelpDefinition == null) {
						helpMessage += "No description available.\n";
					} else {
						helpMessage += subHelpDefinition.short + "\n";
					}
				}
			} else {
				if (commandDef.hasOwnProperty("subcommands")) {
					helpMessage += "The following subcommands are available:\n\n";
					for (let i = 0; i < commandDef.subcommands.length; i++) {
						helpMessage += commandDef.subcommands[i].command + "\n\t";
						let subHelpDefinition = getHelpDefinition(concatCommandChain(preCommand, command), commandDef.subcommands[i].command);
						if (subHelpDefinition == null) {
							helpMessage += "No description available.\n";
						} else {
							helpMessage += subHelpDefinition.short + "\n";
						}
					}
				} else {
					helpMessage += "This command has no subcommands.";
				}
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
                let gamingUniversal = getValidGuild();
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
                let gamingUniversal = getValidGuild();
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
                let gamingUniversal = getValidGuild();
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
    
    this.commandPrintTasks = function(message, preCommand, command, args) {
        handleResult(message, asyncTaskHandler.getTaskList());
    }
    
    this.commandPrintRoles = function(message, preCommand, command, args) {
        let gamingUniversal = getValidGuild();
        if (gamingUniversal.available) {
            let result = "";
            gamingUniversal.roles.forEach(function(role, id) {
                result += (result == "" ? "" : "\n") + id + " -> " + role.name;
            })
            handleResult(message, result);
        }
    }
    
    this.commandPrintChannels = function(message, preCommand, command, args) {
        let gamingUniversal = getValidGuild();
        if (gamingUniversal.available) {
            let result = "";
            gamingUniversal.channels.forEach(function(channel, id) {
                result += (result == "" ? "" : "\n") + id + " [" + channel.type + "] -> " + channel.name;
            })
            handleResult(message, result);
        }
    }
	
	this.commandPrintConfig = function(message, preCommand, command, args) {
		handleResult(message, config.getAsString());
	}
}}

module.exports = CommandExecutor;