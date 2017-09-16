'use strict'

const TaskExecutor = require("./TaskExecutor");

class AsyncTaskHandler { constructor(discordClient, config) {
    
    let taskExecutor = new TaskExecutor(discordClient, config);
    const MAX_TASK_ERROR_COUNT = 1;
    let fs = require("fs");
    let taskDefinitions;
    try {
        taskDefinitions = require("./../saved/tasks.json");
    } catch (e) {
        taskDefinitions = require("./tasks.json");
    }
    
    let saveTaskDefinitions = function() {
        fs.writeFile("./saved/tasks.json", JSON.stringify(taskDefinitions), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
    
    this.resetTaskDefinitions = function() {
        for (let i = 0; i < taskDefinitions.length; i++) {
            this.disableTaskByName(taskDefinitions[i].name);
        }
        taskDefinitions = require("./tasks.json");
        for (let i = 0; i < taskDefinitions.length; i++) {
            if (taskDefinitions[i].enabled) {
                startTask(taskDefinitions[i]);
            }
        }
        return "Task configuration reloaded!";
    }
    
    this.print = function() {
        let result = {embed: {title: "__Tasks:__", description: ""}};
        for (let i = 0; i < taskDefinitions.length; i++) {
            result.embed.description += (result.embed.description == "" ? "" : "\n") + (taskDefinitions[i].enabled ? ":white_check_mark:\t" : ":negative_squared_cross_mark:\t") + taskDefinitions[i].name;
        }
        return result;
    }
    
    this.disableTaskByName = function(name) {
        for (let i = 0; i < taskDefinitions.length; i++) {
            if (taskDefinitions[i].name.toLowerCase() == name.toLowerCase()) {
                if (taskDefinitions[i].enabled) {
                    taskDefinitions[i].enabled = false;
                    saveTaskDefinitions();
                    return "Task '" + name + "' successfully disabled!";
                }
                return "Task '" + name + "' already disabled!";
            }
        }
        return "No task with name '" + name + "'!";
    }
    
    this.enableTaskByName = function(name) {
        for (let i = 0; i < taskDefinitions.length; i++) {
            if (taskDefinitions[i].name.toLowerCase() == name.toLowerCase()) {
                if (!taskDefinitions[i].enabled) {
                    taskDefinitions[i].enabled = true;
                    startTask(taskDefinitions[i]);
                    saveTaskDefinitions();
                    return "Task '" + name + "' successfully enabled!";
                }
                return "Task '" + name + "' already enabled!";
            }
        }
        return "No task with name " + name;
    }
    
    this.getTaskDefinitions = function() {
        return taskDefinitions;
    }
    
    let getNextExecutionTime = function(taskDef) {
        let nextExecution = 0;
        let now = new Date();
        switch(taskDef.type) {
	        case "INTERVAL":
	            nextExecution = taskDef.lastExecution+taskDef.interval;
	            if (nextExecution < now.getTime()) {
        	        if (taskDef.repeatAfterMiss) {
                        nextExecution = now.getTime();
        	        } else {
        	            taskDef.lastExecution = now.getTime() - 1;
        	            saveTaskDefinitions();
        	            nextExecution = getNextExecutionTime(taskDef);
        	        }
                }
	        break;
	        case "SYNCED_DAY_INTERVAL":
	            nextExecution = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), taskDef.hour, taskDef.minute, taskDef.second)).getTime();
	            while (nextExecution < now) {
	                nextExecution += taskDef.interval;
	            }
	        break;
	    }
	    return nextExecution;
    }
    
    let startTask = function(taskDef) {
        let sleep = function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        let nextExecution = getNextExecutionTime(taskDef);
        let asyncFnc = async function() {
            console.log("Thread for Task " + taskDef.name + " ready and running...");
            let now;
            let errorCount = 0;
    	    while(taskDef.enabled && errorCount < MAX_TASK_ERROR_COUNT) {
    	        try {
                    now = Date.now();
                	if (nextExecution<=now) {
            	        taskExecutor[taskDef.function](taskDef.args);
            	        taskDef.lastExecution = nextExecution;
            	        nextExecution = getNextExecutionTime(taskDef);
            	        saveTaskDefinitions();
            	    } else {
            	        await sleep(30);
            	    }
    	        } catch (err) {
                    console.log("[ASYNC] " + err.name + ":" + err.message + "\n" + err.stack);
                    errorCount++;
                }
    	    }
    	    if (errorCount < MAX_TASK_ERROR_COUNT) {
                console.log("Thread for Task " + taskDef.name + " stopped...");
    	    } else {
    	        console.log("Task " + taskDef.name + " encountered too many errors and was stopped and disabled.");
    	        taskDef.enabled = false;
                saveTaskDefinitions();
    	    }
        };
        asyncFnc();
    }
    
    for (let i = 0; i < taskDefinitions.length; i++) {
        if (taskDefinitions[i].enabled) {
            startTask(taskDefinitions[i]);
        }
    }
}}

module.exports = AsyncTaskHandler;