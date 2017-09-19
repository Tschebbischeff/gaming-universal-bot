'use strict'

class AsyncTaskHandler { constructor() {
    
    const taskExecutor = require("./TaskExecutor");
	
    const MAX_TASK_ERROR_COUNT = 1;
    let fs = require("fs");
    let taskDef;
    try {
        taskDef = require("./../saved/tasks.json");
    } catch (e) {
        taskDef = require("./tasks.json");
    }
    
    let saveTaskDefinitions = function() {
        fs.writeFile("./saved/tasks.json", JSON.stringify(taskDef), function(err) {
            if (err != null) {
                console.log(err);
            }
        });
    }
    
    this.resetTaskDefinitions = function() {
        for (let i = 0; i < taskDef.length; i++) {
            this.disableTaskByName(taskDef[i].name);
        }
        taskDef = require("./tasks.json");
        for (let i = 0; i < taskDef.length; i++) {
            if (taskDef[i].enabled) {
                startTask(i);
            }
        }
        return "Task configuration reloaded!";
    }
    
    this.print = function() {
        let result = {embed: {title: "__Tasks:__", description: ""}};
        for (let i = 0; i < taskDef.length; i++) {
            result.embed.description += (result.embed.description == "" ? "" : "\n") + (taskDef[i].enabled ? ":white_check_mark:\t" : ":negative_squared_cross_mark:\t") + taskDef[i].name;
        }
        return result;
    }
    
    this.disableTaskByName = function(name) {
        for (let i = 0; i < taskDef.length; i++) {
            if (taskDef[i].name.toLowerCase() == name.toLowerCase()) {
                if (taskDef[i].enabled) {
                    taskDef[i].enabled = false;
                    saveTaskDefinitions();
                    return "Task '" + name + "' successfully disabled!";
                }
                return "Task '" + name + "' already disabled!";
            }
        }
        return "No task with name '" + name + "'!";
    }
    
    this.enableTaskByName = function(name) {
        for (let i = 0; i < taskDef.length; i++) {
            if (taskDef[i].name.toLowerCase() == name.toLowerCase()) {
                if (!taskDef[i].enabled) {
                    taskDef[i].enabled = true;
                    startTask(i);
                    saveTaskDefinitions();
                    return "Task '" + name + "' successfully enabled!";
                }
                return "Task '" + name + "' already enabled!";
            }
        }
        return "No task with name " + name;
    }
    
    let getNextExecutionTime = function(taskId) {
        let nextExecution = 0;
        let now = new Date();
        switch(taskDef[taskId].type) {
	        case "INTERVAL":
	            nextExecution = taskDef[taskId].lastExecution+taskDef[taskId].interval;
	            if (nextExecution < now.getTime()) {
        	        if (taskDef[taskId].repeatAfterMiss) {
                        nextExecution = now.getTime();
        	        } else {
        	            taskDef[taskId].lastExecution = now.getTime() - 1;
        	            saveTaskDefinitions();
        	            nextExecution = getNextExecutionTime(taskId);
        	        }
                }
	        break;
	        case "SYNCED_DAY_INTERVAL":
	            nextExecution = (new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), taskDef[taskId].hour, taskDef[taskId].minute, taskDef[taskId].second))).getTime();
	            while (nextExecution < now) {
	                nextExecution += taskDef[taskId].interval;
	            }
	        break;
	    }
	    return nextExecution;
    }
	
	let sleep = function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
    
    let startTask = function(taskId) {
        let nextExecution = getNextExecutionTime(taskId);
        let asyncFnc = async function() {
            console.log("Thread for Task " + taskDef[taskId].name + " ready and running...");
            let now;
            let errorCount = 0;
    	    while(taskDef[taskId].enabled && errorCount < MAX_TASK_ERROR_COUNT) {
    	        try {
                    now = Date.now();
                	if (nextExecution<=now) {
            	        taskExecutor[taskDef[taskId].function](taskDef[taskId].args);
            	        taskDef[taskId].lastExecution = nextExecution;
            	        nextExecution = getNextExecutionTime(taskId);
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
                console.log("Thread for Task " + taskDef[taskId].name + " stopped...");
    	    } else {
    	        console.log("Task " + taskDef[taskId].name + " encountered too many errors and was stopped and disabled.");
    	        taskDef[taskId].enabled = false;
                saveTaskDefinitions();
    	    }
        };
        asyncFnc();
    }
    
	this.startTasks = function() {
		for (let i = 0; i < taskDef.length; i++) {
			if (taskDef[i].enabled) {
				startTask(i);
			}
		}
	}
}}

module.exports = new AsyncTaskHandler();