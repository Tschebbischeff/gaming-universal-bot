'use strict'

const client = require("./DiscordClient");
const config = require("./config/Config");
const asyncTaskHandler = require("./async/AsyncTaskHandler");
const commandHandler = require("./commands/CommandHandler");
const logger = require("./logger/Logger");

client.on("ready", () => {
	console.log("Gaming Universal Bot is ready!");
	client.user.setGame(config.getPrefix() + 'help')
		.catch(function(err) {
			console.log(err);
		});
	asyncTaskHandler.startTasks();
});

client.on("message", (message) => {
	if (!message.content.startsWith(config.getPrefix()) || message.author.bot || message.channel.type != "text") {
        return;
	}
	commandHandler.handleCommand(message);
});

/*process.on('unhandledRejection', function(err) {
	console.log("[UNHANDLED] " + err.name + ":" + err.message + "\n" + err.stack);
});*/

client.login(process.env.GAMING_UNIVERSAL_BOT_TOKEN);