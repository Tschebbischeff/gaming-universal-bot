'use strict'

class Logger { constructor() {
    
	const config = require("./../config/Config");
	
	this.write = function() {
		let messageId = config.getServerLogMessageId(this);
	}
    
}}

module.exports = new Logger();