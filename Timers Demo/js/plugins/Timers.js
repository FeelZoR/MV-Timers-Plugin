/*:
 * @plugindesc v2.0 Creates different timers.
 * @author FeelZoR
 * @param Timer Not Existing Return Value
 * @desc Set to true if you want the methods to return true if the timer doesn't exist. False otherwise.
 * @default true
 * @help
 * ========================== Timers v2.0 by FeelZoR ==========================
 * Free to use for any project - Commercial or Non-Commercial.
 * No Credits required, but highly appreciated.
 *
 * ----------------------------- Plugin  Commands -----------------------------
 *
 * Timers CREATE NameOfTheTimer MSRollback - Creates a new Timer.
 *   NameOfTheTimer - The name of the timer. Be careful, the name is case
 *     sensitive. You can you almost any symbol you want, though it's better to
 *     keep clear and alphanumerical names.
 *   MSRollback - If you don't want the timer to use the current time, use this
 *     parameter. It will allow you to make a timer MSRollback milliseconds
 *     old.
 *  Eg: Timers CREATE Chicken 500 - If I execute this command at 2:00:00.500,
 *      it will create a Timer named Chicken with the time 2:00:00.000.
 *  Eg: Timers CREATE Chicken -500 - If I execute this command at the same
 *      time than before, it will create a Timer named Chicken with the time
 *      2:00:01.000.
 *  CAREFUL! If the timer already exists, it won't be updated!
 *
 * Timers UPDATE NameOfTheTimer MSRollback - Updates (or create) a new timer.
 *   The usage is the same than Timers CREATE NameOfTheTimer MSRollback, but it
 *   updates the Timer if it already exists and create it if it doesn't.
 *
 * Timers DELETE NameOfTheTimer - Deletes the specified timer.
 *   NameOfTheTimer - The name of the timer to delete. It is case sensitive!.
 *
 * Timers MODE mode - Changes the Timer mode.
 *   mode - The new mode to use. Accepted values are :
 *     ~ ms: Set the mode to milliseconds. (milliseconds, msec, msecs and reset
 *       are accepted values, too).
 *     ~ s: Set the mode to seconds. (sec, seconds and secs are accepted
 *       values, too).
 *     ~ min: Set the mode to minutes. (m, minutes and mins are accepted
 *       values, too).
 *   E.g.: Timers MODE s - Will set the mode to seconds.
 *
 * ------------------------------- Script calls -------------------------------
 *
 * Use $gameTimers.isOver(name, time); to know if the Timer name is older than
 * the time specified.
 * name: Case sensitive; the name of the timer.
 * time: The time that needs to be elapsed since the last timer update for this
 *       method to return true.
 * Depending on the mode, the time needs to be in milliseconds, seconds or
 * minutes.
 * E.g.: $gameTimers.isOver("Chicken", 50); will return true if the timer
 *       Chicken hasn't been updated in 50ms, 50s or 50min depending on the
 *       mode.
 *
 * Use $gameTimers.isOverVar(name, variable); to do the same than the previous
 * script call, with the content of a variable instead of a constant value.
 * E.g.: $gameTimers.isOverVar("Chicken", 2); will return true if the timer
 *       Chicken hasn't been updated since the time specified in variable 2. It
 *       also uses the mode to decide whether it's milliseconds, seconds or
 *       minutes.
 *
 * -------------------------------- Changelog ---------------------------------
 * 
 * Version 2.0:
 * + Added possibility to delete a timer
 * + Timer update is now handled by a specific command.
 * + Plugin commands used instead of script calls when possible.
 * * Timer creation cannot update timers anymore.
 *
 * Version 1.1:
 * * Some bug fixes
 *
 * Version 1.0:
 * * Initial version
 * 
 */
 

FLZ_Timers_valueToReturnIfNoTimer = Boolean(PluginManager.parameters('Timers')['Timer Not Existing Return Value'] || true);
 
function FLZ_Timers() {
    this.paused = false;
	this.pause_time = null;
	this.timers = {};
    this.mode = "ms";
}

FLZ_Timers.prototype = Object.create(FLZ_Timers.prototype);
FLZ_Timers.prototype.constructor = FLZ_Timers;
 
FLZ_Timers.prototype.createTimer = function(name, rollback) {
    if (this.timers[name] == null) {
        this.timers[name] = Date.now() - rollback;
    }
}

FLZ_Timers.prototype.updateTimer = function(name, rollback) {
    this.timers[name] = Date.now() - rollback;
}

FLZ_Timers.prototype.deleteTimer = function(name) {
    delete this.timers[name];
}

FLZ_Timers.prototype.isOverVar = function(name, variable) {
    return isOver(name, $gameVariables.value(variable));
}

FLZ_Timers.prototype.isOver = function(name, time) {
    switch (this.mode) {
        case "ms":
            return this.isTimeElapsedOverThan(name, time);
        case "s":
            return this.isTimeElapsedOverThan(name, time * 1000);
        case "min":
            return this.isTimeElapsedOverThan(name, time * 60000);
    }
}

FLZ_Timers.prototype.isTimeElapsedOverThan = function(name, milliseconds) {
	if (!(name in this.timers)) {
		return FLZ_Timers_valueToReturnIfNoTimer;
	} else {
        return Date.now() - this.timers[name] >= milliseconds;
	}
}

FLZ_Timers.prototype.update = function(active) {
	if (active) {
		this.resume();
	} else {
		this.pause();
	}
}

FLZ_Timers.prototype.pause = function() {
	if (!this.paused) {
		this.paused = true;
		this.pause_time = Date.now();
	}
}

FLZ_Timers.prototype.resume = function() {
	if (this.paused) {
		this.paused = false;
		var difference = Date.now() - this.pause_time;
		this.setTimers(this.timers, difference);
	}
}

FLZ_Timers.prototype.getTimers = function() {
	return this.timers;
}

FLZ_Timers.prototype.setTimers = function(timersIn, difference) {
	if (timersIn == null) {
		return;
	}
	
	for (var key in timersIn) {
		timersIn[key] += difference;
	}
	
	this.timers = timersIn;
}

FLZ_Timers.prototype.setMode = function(newMode) {
    switch (newMode) {
        case "ms":case "milliseconds":case "msec":case "msecs":case "reset":
            this.mode = "ms";
            break;
        case "s":case "sec":case "seconds":case "secs":
            this.mode = "s";
            break;    
        case "m":case "min":case "minutes":case "mins":
            this.mode = "min";
            break;
    }
}

//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

var FLZ_Timers_DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	
    FLZ_Timers_DataManager_createGameObjects.call(this);
	$gameTimers = new FLZ_Timers();
}

var FLZ_Timers_DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = FLZ_Timers_DataManager_makeSaveContents.call(this);
    contents.feel_timers = $gameTimers.getTimers();
	contents.feel_save_time = Date.now();
    contents.feel_timers_mode = $gameTimers.mode;
    return contents;
}

var FLZ_Timers_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    FLZ_Timers_DataManager_extractSaveContents.call(this, contents);
    var tempTimers = contents.feel_timers;
	var difference = Date.now() - contents.feel_save_time;
	$gameTimers.setTimers(tempTimers, difference);
    $gameTimers.setMode(contents.feel_timers_mode);
}

var FLZ_Timers_GameMap_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
	FLZ_Timers_GameMap_update.call(this, sceneActive);
	$gameTimers.update(sceneActive);
}

//-----------------------------------------------------------------------------
// Game_Interpreter
//
// The interpreter for running event commands.

var FLZ_Timers_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    FLZ_Timers_Game_Interpreter_pluginCommand.call(this, command, args);
    if (command === 'Timers') {
        switch (args[0].toLowerCase()) {
            case "create": // Timers create NameOfTheTimer MSToRemove (can be negative to add ms)
                $gameTimers.createTimer(String(args[1]), Number(args[2] || 0));
                break;
            case "mode": // Timers mode <ms | s | min>
                $gameTimers.setMode(args[1].toLowerCase());
                break;
            case "update": // Timers update NameOfTheTimer MSToRemove (can be negative to add ms)
                $gameTimers.updateTimer(String(args[1]), Number(args[2] || 0));
                break;
            case "delete": // Timers delete NameOfTheTimer
                $gameTimers.deleteTimer(String(args[1]));
                break;
        }
    }
}