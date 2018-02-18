'use strict'

const client = require("./DiscordClient");
const config = require("./config/Config");
const asyncTaskHandler = require("./async/AsyncTaskHandler");
const commandHandler = require("./commands/CommandHandler");
const logger = require("./logger/Logger");

client.on("ready", () => {
	console.log("Gaming Universal Bot is ready!");
	client.user.setActivity(config.getPrefix() + 'help', {"type": "LISTENING"})
		.catch(function(err) {
			console.log(err);
		});
	asyncTaskHandler.startTasks();
	logger.registerCallbacks();
});

client.on("message", (message) => {
	if (!message.content.startsWith(config.getPrefix()) || message.author.bot || message.channel.type != "text") {
        return;
	}
	commandHandler.handleCommand(message);
});

client.login(process.env.GAMING_UNIVERSAL_BOT_TOKEN);