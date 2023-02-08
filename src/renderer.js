const { ipcRenderer } = require("electron");
const { FETCH_DATA_FROM_STORAGE, SAVE_DATA_IN_STORAGE, REMOVE_DATA_FROM_STORAGE } = require("./utils/constants");

// Ask main to load data from its persistent storage
function loadSavedData() {
	console.log("Renderer sending: FETCH_DATA_FROM_STORAGE");
	ipcRenderer.send(FETCH_DATA_FROM_STORAGE, "itemsToStore");
}

// Send item message to main
function saveDataInStorage(item) {
	console.log("Renderer sending: SAVE_DATA_IN_STORAGE");
	ipcRenderer.send(SAVE_DATA_IN_STORAGE, item);
}

// Remove an item
function removeDataFromStorage(item) {
	console.log("Renderer sending: REMOVE_DATA_FROM_STORAGE");
	ipcRenderer.send(REMOVE_DATA_FROM_STORAGE, item);
}

// Restart application
function restartApp() {
	console.log("Restart app");
	ipcRenderer.send("restart_app");
}

// Handle with app version
function appVersion() {
	ipcRenderer.send("app_version");
}

// Handle Plex path
function setPlexPath() {
	ipcRenderer.send("plexPath");
}

// Handle output path
function setOutputPath() {
	ipcRenderer.send("outputPath");
}

// Handle start of backup
function startBackup() {
	ipcRenderer.send("startBackup");
}

module.exports = {
	loadSavedData,
	saveDataInStorage,
	removeDataFromStorage,
	restartApp,
	appVersion,
	setPlexPath,
	setOutputPath,
	startBackup,
};
