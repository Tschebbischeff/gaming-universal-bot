'use strict'

class GUBLib { constructor() {
    
	const discordClient = require("./DiscordClient");
	const config = require("./config/Config");
	
	this.getValidGuild = function() {
        if (discordClient.guilds.has(config.getValidGuildId())) {
            return discordClient.guilds.get(config.getValidGuildId());
        }
        return null;
    }
    
}}

module.exports = new GUBLib();