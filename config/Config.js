'use strict'

class Config { constructor() {
    
    let fs = require("fs");
    let config;
    try {
        config = require("./../saved/config.json");
    } catch (e) {
        config = require("./config.json");
    }
	
	let save = function() {
        fs.writeFile("./saved/config.json", JSON.stringify(config), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
	
	this.reset = function() {
        config = require("./config.json");
        return "Configuration reloaded!";
    }
	
	this.print = function() {
		let result = {embed: {title: "__Configuration variables:__", fields: []}};
		Object.keys(config).forEach(function(key) {
			result.embed.fields.push({name: key, value: String(config[key])});
		});
		return result;
	}
	
	this.getValidGuildId = function() {
		return config.validGuildId;
	}
	
	this.setPrefix = function(p) {
		config.prefix = p;
		save();
	}
    
    this.getPrefix = function() {
		if (config.hasOwnProperty("prefix")) {
			return config.prefix;
		} else {
			this.setPrefix(">>");
			return ">>";
		}
    }
	
	this.setRainbowRoleId = function(id) {
		config.rainbowRoleId = id;
		save();
	}
	
	this.getRainbowRoleId = function() {
		if (config.hasOwnProperty("rainbowRoleId")) {
			return config.rainbowRoleId;
		} else {
			this.setRainbowRoleId("0");
			return "0";
		}
	}
	
	this.setGuildWars2ChannelId = function(id) {
		config.guildWars2ChannelId = id;
		save();
	}
	
	this.getGuildWars2ChannelId = function() {
		if (config.hasOwnProperty("guildWars2ChannelId")) {
			return config.guildWars2ChannelId;
		} else {
			this.setGuildWars2ChannelId("0");
			return "0";
		}
	}
	
	this.setServerLogChannelId = function(id) {
		config.serverLogChannelId = id;
		save();
	}
	
	this.getServerLogChannelId = function() {
		if (config.hasOwnProperty("serverLogChannelId")) {
			return config.serverLogChannelId;
		} else {
			this.setServerLogChannelId("0");
			return "0";
		}
	}
	
	this.setServerLogMessageId = function(id) {
		config.serverLogMessageId = id;
		save();
	}
	
	this.getServerLogMessageId = function(logger) {
		if (config.hasOwnProperty()) {
			return config.serverLogMessageId;
		} else {
			logMessageId = logger.createLogMessage();
			this.setServerLogMessageId(logMessageId);
			return logMessageId;
		}
	}
    
    this.hardDebug = function(ident, obj) {
        fs.writeFile("./debug/"+ident+".json", JSON.stringify(obj), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
    
}}

module.exports = new Config();