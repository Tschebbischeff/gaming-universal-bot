'use strict'

const Discord = require("discord.js");
const Config = require("./config/Config");
const CommandHandler = require("./commands/CommandHandler");
const AsyncTaskHandler = require("./async/AsyncTaskHandler");

const client = new Discord.Client();
const config = new Config();
const commandHandler = new CommandHandler(client, config);

client.on("ready", () => {
	console.log("Gaming Universal Bot is ready!");
	client.user.setGame(config.getPrefix() + 'help')
		.catch(function(err) {
			console.log(err);
		});
	let asyncTaskHandler = new AsyncTaskHandler(client, config);
	commandHandler.setAsyncTaskHandler(asyncTaskHandler);
});

client.on("message", (message) => {
	if (!message.content.startsWith(config.getPrefix()) || message.author.bot || message.channel.type != "text") {
        return;
	}
	commandHandler.handleCommand(message);
});

client.login(process.env.GAMING_UNIVERSAL_BOT_TOKEN);