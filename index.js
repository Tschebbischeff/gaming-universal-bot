'use strict'

const client = require("./DiscordClient");
const config = require("./config/Config");
const asyncTaskHandler = require("./async/AsyncTaskHandler");
const commandHandler = require("./commands/CommandHandler");
const logger = require("./logger/Logger");

let fs = require("fs");
if (!fs.existsSync('./saved')){
    fs.mkdirSync('./saved');
}
let setState = function(state) {
	fs.writeFile("./saved/botState", state, function(err) {
		if (err != null) {
			console.log(err);
		}
	});
}
setState("INIT");

client.on("ready", () => {
	console.log("Gaming Universal Bot is ready!");
	client.user.setActivity(config.getPrefix() + 'help', {"type": "LISTENING"})
		.catch(function(err) {
			console.log(err);
		});
	asyncTaskHandler.startTasks();
	logger.registerCallbacks();
	setState("READY");
});

client.on("message", (message) => {
	if (!message.content.startsWith(config.getPrefix()) || message.author.bot || message.channel.type != "text") {
        return;
	}
	commandHandler.handleCommand(message);
});

client.login(process.env.GAMING_UNIVERSAL_BOT_TOKEN);