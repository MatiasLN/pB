const { ipcRenderer } = require("electron");

// Restart application
function restartApp() {
	console.log("Restart app");
	ipcRenderer.send("restart_app");
}

// Handle with app version
function appVersion() {
	ipcRenderer.send("app_version");
}

// Handle Settings window
function settings(status) {
	ipcRenderer.send("settings", status);
}

// Handle About window
function about(status) {
	ipcRenderer.send("about", status);
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
function startBackup(initBackup) {
	ipcRenderer.send("startBackup", initBackup);
}

// Handle copy of regkey
function copyRegKey() {
	const outputPath = localStorage.getItem("outputPath");
	ipcRenderer.send("copyRegKey", outputPath);
}

// Handle killing of plex process
function killPlexProcess() {
	ipcRenderer.send("killPlexProcess");
}

// Handle starting plex process
function startPlex(path) {
	ipcRenderer.send("startPlex", path);
}

// Handle compression to rar
function compressToRar() {
	ipcRenderer.send("compressToRar");
}

function compressionComplete() {
	ipcRenderer.send("compressionComplete");
}

module.exports = {
	restartApp,
	appVersion,
	setPlexPath,
	setOutputPath,
	startBackup,
	copyRegKey,
	killPlexProcess,
	compressToRar,
	compressionComplete,
	startPlex,
	settings,
	about,
};
