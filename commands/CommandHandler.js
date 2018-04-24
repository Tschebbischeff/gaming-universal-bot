'use strict'

class CommandHandler { constructor() {

	const config = require("./../config/Config");
	const commandExecutor = require("./CommandExecutor");
    let commandDefinitions = require("./commands.json");

	let concatCommandChain = function(preCommand, command) {
        return preCommand == "" ? command : preCommand + " " + command;
    }

    let handleSubCommand = function(message, preCommand, command, args, commandDef) {
        for (let i = 0; i < commandDef.length; i++) {
            if (commandDef[i].command.toLowerCase() == command.toLowerCase()) {
				//Check permissions
				if (commandDef[i].hasOwnProperty("permission")) {
					let guildMemberAuthor = message.guild.members.get(message.author.id);
					let requiredPermission = commandDef.permission;
					if (!guildMemberAuthor.hasPermission(commandDef[i].permission)) {
						return "You have no permission to execute '"+concatCommandChain(preCommand, command)+"'!";
					}
				}
                //Check minimum role
                if (commandDef[i].hasOwnProperty("minimumRole")) {
                    //TODO: Check minimum role
                }
                //Check exact role
                if (commandDef[i].hasOwnProperty("exactRole")) {
                    //TODO: Check exact role
                }
				//Check subcommands
                if (args.length > 0 && commandDef[i].hasOwnProperty("subcommands") && commandDef[i].subcommands.length > 0) {
                    let subPreCommand = ((preCommand == "" ? "" : preCommand + " ") + command);
                    let subCommand = args[0];
                    let subArgs = args.slice(1);
                    return handleSubCommand(message, subPreCommand, subCommand, subArgs, commandDef[i].subcommands);
                }
                if (commandExecutor.hasOwnProperty(commandDef[i].function)) {
                    commandExecutor[commandDef[i].function](message, preCommand, command, args);
                } else {
					if (commandDef[i].hasOwnProperty("hidden") && commandDef[i]["hidden"] === true) {
						continue;
					}
					commandExecutor.commandHelp(message, preCommand, command, args);
                }
                return "";
            }
        }
        return ("Unknown command: " + command);
    }

    this.handleCommand = function(message) {
        const args = message.content.slice(config.getPrefix().length).trim().match(/"([^"]*)"|'([^']*)'|[^\s]+/g);
        for (let i = 0; i < args.length; i++) {
            if (args[i].startsWith("\"")) {
                args[i] = args[i].slice(1, -1);
            }
        }
        const command = args.shift().toLowerCase();
		let commandResult = handleSubCommand(message, "", command, args, commandDefinitions);
		if (commandResult != "") {
			message.channel.send(commandResult);
        }
    };
}}

module.exports = new CommandHandler();
