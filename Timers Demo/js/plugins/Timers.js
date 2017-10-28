/*:
 * @plugindesc v1.0 Creates different timers.
 * @author FeelZoR
 * @param Test
 * @desc Set to true if you want the methods to return true if the timer doesn't exist. False otherwise.
 * @default true
 * @help ========================= Timers v1.0 by FeelZoR =========================
 * Free to use for any project - Commercial or Non-Commercial.
 * No Credits required, but highly appreciated.
 *
 * --------------- Commands ---------------
 * Use $gameTimers.createTimer(name); to create a timer.
 *     Replace name with the name you want to give to your timer. Remember to put this name between ''.
 *     eg: createTimer('Example'); will create a timer called Example.
 *
 * Use $gameTimers.isTimeElapsedOverThanMilli(name, milliseconds); to check if the time elapsed since the creation of the timer is over the specified milliseconds.
 *     Replace name with the name you gave to your timer when it was created. Remember to put this name between ''.
 *     Replace milliseconds by the number of milliseconds that must have been elapsed since the timer has been created to return true.
 *     eg: isTimeElapsedOverThanMilli('Example', 500); will only return true if the time elapsed since the creation of the timer is over 500 milliseconds.
 *
 * $gameTimers.isTimeElapsedOverThanSec(name, seconds); and $gameTimers.isTimeElapsedOverThanMin(name, minutes); does the same thing with seconds and minutes, respectively.
 */
 
FLZ_Timers_valueToReturnIfNoTimer = Boolean(PluginManager.parameters('Timers')['Test'] || true);
 
function FLZ_Timers() {
    this.paused = false;
	this.pause_time = null;
	this.timers = {};
}

FLZ_Timers.prototype = Object.create(FLZ_Timers.prototype);
FLZ_Timers.prototype.constructor = FLZ_Timers;
 
FLZ_Timers.prototype.createTimer = function(name) {
	this.timers[name] = Date.now();
}

FLZ_Timers.prototype.isTimeElapsedOverThanMilli = function(name, milliseconds) {
	if (!(name in this.timers)) {
		return FLZ_Timers_valueToReturnIfNoTimer;
	} else {
		return Date.now() - this.timers[name] >= milliseconds;
	}
}

FLZ_Timers.prototype.isTimeElapsedOverThanSec = function(name, seconds) {
	return this.isTimeElapsedOverThanMilli(name, seconds * 1000);
}

FLZ_Timers.prototype.isTimeElapsedOverThanMin = function(name, minutes) {
	return this.isTimeElapsedOverThanMilli(name, minutes * 60000);
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
    var contents = LNM_GameTime_DataManager_makeSaveContents.call(this);
    contents.feel_timers = $gameTimers.getTimers();
	contents.feel_save_time = Date.now();
    return contents;
}

var FLZ_Timers_DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    LNM_GameTime_DataManager_extractSaveContents.call(this, contents);
    var tempTimers = contents.feel_timers;
	var difference = Date.now() - contents.feel_save_time;
	$gameTimers.setTimers(tempTimers, difference);
}

var FLZ_Timers_GameMap_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
	FLZ_Timers_GameMap_update.call(this, sceneActive);
	$gameTimers.update(sceneActive);
}