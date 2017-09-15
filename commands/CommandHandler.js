'use strict'

const CommandExecutor = require("./CommandExecutor");

class CommandHandler { constructor(discordClient, config) {
    
    let commandExecutor = new CommandExecutor(discordClient, config);
    let commandDefinitions = require("./commands.json");
    
    this.setAsyncTaskHandler = function(handler) {
        commandExecutor.setAsyncTaskHandler(handler);
    }
    
    let handleSubCommand = function(message, preCommand, command, args, commandDef) {
        /*let guildMemberAuthor = message.guild.members.get(message.author.id);
        let requiredPermission = commandDef.permission;
        if (!guildMemberAuthor.hasPermission()) {
            return true;
        }*/
        for (let i = 0; i < commandDef.length; i++) {
            if (commandDef[i].command.toLowerCase() == command) {
                if (args.length > 0 && commandDef[i].hasOwnProperty("subcommands") && commandDef[i].subcommands.length > 0) {
                    let subPreCommand = ((preCommand == "" ? preCommand : preCommand + " ") + command);
                    let subCommand = args[0].toLowerCase();
                    let subArgs = args.slice(1);
                    if (handleSubCommand(message, preCommand, subCommand, subArgs, commandDef[i].subcommands)) {
                        return true;
                    }
                }
                if (commandExecutor.hasOwnProperty(commandDef[i].function)) {
                    commandExecutor[commandDef[i].function](message, preCommand, command, args);
                } else {
                    console.log("Command function for command " + preCommand + " " + command + " not found.");
                }
                return true;
            }
        }
        return false;
    }
        
    this.handleCommand = function(message) {
        const args = message.content.slice(this.getPrefix().length).trim().match(/"([^"]*)"|'([^']*)'|[^\s]+/g);
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith("\"")) {
                args[i] = args[i].slice(1, -1);
            }
        }
        const command = args.shift().toLowerCase();
        if (!handleSubCommand(message, "", command, args, commandDefinitions)) {
            this.errorUnknownCommand(message, command);
        }
    };
    
    this.getPrefix = function() {
        return config.get().prefix;
    }
    
    this.errorUnknownCommand = function(message, command) {
        message.channel.send("Unknown command: " + command);
    }
}}

module.exports = CommandHandler;