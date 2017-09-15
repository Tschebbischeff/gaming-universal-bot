'use strict'

class CommandExecutor { constructor(discordClient, config) {
    
    let asyncTaskHandler = null;
    
    let getGamingUniversal = function() {
        if (discordClient.guilds.has(config.get().validGuild)) {
            return discordClient.guilds.get(config.get().validGuild);
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
    
    let displayHelp = function(message, preCommand, command) {
        message.channel.send("No help on topic '" + concatCommandChain(preCommand, command) + "' available.")
    }
    
    let requiresPrivileges = function(message, preCommand, command) {
        message.channel.send("Usage of command '" + concatCommandChain(preCommand, command) + "' needs privileges you don't have.");
    }
    
    this.commandHelp = function(message, preCommand, command, args) {
        displayHelp(message, preCommand, command);
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
    
    this.commandResetConfig = function(message, preCommand, command, args) {
        handleResult(message, config.reset());
    }
    
    this.commandResetTasks = function(message, preCommand, command, args) {
        handleResult(message, asyncTaskHandler.resetTaskDefinitions());
    }
    
    this.commandSetRainbowrole = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            let rainbowrole = parseInt(args[0]);
            if (isNaN(rainbowrole)) {
                let gamingUniversal = getGamingUniversal();
                if (gamingUniversal.available) {
                    rainbowrole = gamingUniversal.roles.find("name", args[0]);
                    if (rainbowrole != null) {
                        config.get().rainbowrole = rainbowrole.id;
                        config.save();
                        handleResult(message, "Rainbow role set!");
                    } else {
                        handleResult(message, "Couldn't find role '" + args[0] + "'!");
                    }
                }
            } else {
                config.get().rainbowrole = rainbowrole;
                config.save();
                handleResult(message, "Rainbow role set!");
            }
        }
    }
    
    this.commandSetGw2Channel = function(message, preCommand, command, args) {
        if (args.length == 0) {
            displayHelp(message, preCommand, command);
        } else {
            let channel = parseInt(args[0]);
            if (isNaN(channel)) {
                let gamingUniversal = getGamingUniversal();
                if (gamingUniversal.available) {
                    channel = gamingUniversal.channels.find("name", args[0]);
                    if (channel != null) {
                        config.get().gw2channel = channel.id;
                        config.save();
                        handleResult(message, "Guild Wars 2 channel set!");
                    } else {
                        handleResult(message, "Couldn't find channel '" + args[0] + "'!");
                    }
                }
            } else {
                config.get().gw2channel = channel;
                config.save();
                handleResult(message, "Guild Wars 2 channel set!");
            }
        }
    }
    
    this.commandGetTasks = function(message, preCommand, command, args) {
        handleResult(message, asyncTaskHandler.getTaskList());
    }
    
    this.commandGetRoles = function(message, preCommand, command, args) {
        let gamingUniversal = getGamingUniversal();
        if (gamingUniversal.available) {
            let result = "";
            gamingUniversal.roles.forEach(function(role, id) {
                result += (result == "" ? "" : "\n") + id + " -> " + role.name;
            })
            handleResult(message, result);
        }
    }
    
    this.commandGetChannels = function(message, preCommand, command, args) {
        let gamingUniversal = getGamingUniversal();
        if (gamingUniversal.available) {
            let result = "";
            gamingUniversal.channels.forEach(function(channel, id) {
                result += (result == "" ? "" : "\n") + id + " [" + channel.type + "] -> " + channel.name;
            })
            handleResult(message, result);
        }
    }
}}

module.exports = CommandExecutor;