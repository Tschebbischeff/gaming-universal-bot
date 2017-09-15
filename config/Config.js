'use strict'

class Config { constructor() {
    
    let fs = require("fs");
    let config;
    try {
        config = require("./../saved/config.json");
    } catch (e) {
        config = require("./config.json");
    }
    
    this.reset = function() {
        config = require("./config.json");
        return "Configuration reloaded!";
    }
    
    this.get = function() {
        return config;
    }
    
    this.save = function() {
        fs.writeFile("./saved/config.json", JSON.stringify(config), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
    
    this.hardDebug = function(ident, obj) {
        fs.writeFile("./debug/"+ident+".json", JSON.stringify(obj), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
    
}}

module.exports = Config;