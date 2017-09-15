'use strict'

class TaskExecutor { constructor(discordClient, config) {
    
    //const rainbowRoleColors = ["#e87d7d","#e88a7d","#e8977d","#e8a47d","#e8b07d","#e8bd7d","#e8ca7d","#e8d77d","#e8e47d","#dfe87d","#d3e87d","#c6e87d","#b9e87d","#ace87d","#9fe87d","#92e87d","#86e87d","#7de881","#7de88e","#7de89b","#7de8a8","#7de8b5","#7de8c1","#7de8ce","#7de8db","#7de8e8","#7ddbe8","#7dcee8","#7dc1e8","#7db5e8","#7da8e8","#7d9be8","#7d8ee8","#7d81e8","#867de8","#927de8","#9f7de8","#ac7de8","#b97de8","#c67de8","#d37de8","#df7de8","#e87de4","#e87dd7","#e87dca","#e87dbd","#e87db0","#e87da4","#e87d97","#e87d8a"];
    const rainbowRoleColors = ["#e87d7d","#e8a47d","#e8ca7d","#dfe87d","#b9e87d","#92e87d","#7de88e","#7de8b5","#7de8db","#7dcee8","#7da8e8","#7d81e8","#9f7de8","#c67de8","#e87de4","#e87dbd","#e87d97"];
    let rainbowRoleIndex = 0;
    let canChangeColorAgain = true;
    
    let getGamingUniversal = function() {
        if (discordClient.guilds.has(config.get().validGuild)) {
            return discordClient.guilds.get(config.get().validGuild);
        }
        return null;
    }
    
    this.guildWarsBoss = function(args) {
        config.hardDebug("guildWarsBossLastState", {"state": 1});
        let gamingUniversal = getGamingUniversal();
        config.hardDebug("guildWarsBossLastState", {"state": 2});
        if (gamingUniversal.available && gamingUniversal.channels.has(config.get().gw2channel)) {
            config.hardDebug("guildWarsBossLastState", {"state": 3});
            let channel = gamingUniversal.channels.get(config.get().gw2channel);
            config.hardDebug("guildwarsbosschannel", channel);
            config.hardDebug("guildWarsBossLastState", {"state": 4});
            if (channel.type == "text") {
                config.hardDebug("guildWarsBossLastState", {"state": 5});
                channel.send({embed: {
                        color: 16727070,
                        title: "Worldboss spawned!",
                        description: "A [worldboss-event]("+args.eventurl+") just started!",
                        fields: [{
                            name: "Who?",
                            value: "["+args.name.caption+"]("+args.name.url+")"
                          },{
                            name: "Where?",
                            value: "["+args.area.caption+"]("+args.area.url+") in ["+args.zone.caption+"]("+args.zone.url+")"
                          }
                        ]
                    }}).catch(function(err) {
                        console.log("[guildWarsBoss] " + err.name + ":" + err.message + "\n" + err.stack);
                    });
                config.hardDebug("guildWarsBossLastState", {"state": 6});
            }
        }
    };
    
    this.changeRainbowRoleColor = function(args) {
        if (canChangeColorAgain) {
            config.hardDebug("rainbowroleLastState", {"state": 1});
            let gamingUniversal = getGamingUniversal();
            config.hardDebug("rainbowroleLastState", {"state": 2});
            if (gamingUniversal.available && gamingUniversal.roles.has(config.get().rainbowrole)) {
                config.hardDebug("rainbowroleLastState", {"state": 3});
                let role = gamingUniversal.roles.get(config.get().rainbowrole);
                config.hardDebug("rainbowrole", role);
                config.hardDebug("rainbowroleLastState", {"state": 4});
                role.setColor(rainbowRoleColors[rainbowRoleIndex])
                    .then(function(role) {
                        canChangeColorAgain = true;
                    }).catch(function(err) {
                        console.log("[changeRainbowColor] " + err.name + ":" + err.message + "\n" + err.stack);
                    });
                config.hardDebug("rainbowroleLastState", {"state": 5});
                rainbowRoleIndex = (rainbowRoleIndex+1) % rainbowRoleColors.length;
            }
        }
    };
    
}}

module.exports = TaskExecutor;