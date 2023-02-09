// -----------------------------------------------------------------------
// IMPORTS AND DECLEARING OF VARIABLES
// -----------------------------------------------------------------------
const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const { exec } = require("child_process");
const { autoUpdater } = require("electron-updater");
const ps = require("ps-man");

const {
	HANDLE_FETCH_DATA,
	FETCH_DATA_FROM_STORAGE,
	HANDLE_SAVE_DATA,
	SAVE_DATA_IN_STORAGE,
	REMOVE_DATA_FROM_STORAGE,
	HANDLE_REMOVE_DATA,
} = require("./src/utils/constants");
const storage = require("electron-json-storage");

let mainWindow;
let itemsToStore;
let isDev = false;

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development") {
	isDev = true;
}

// -----------------------------------------------------------------------
// HANDLE MAIN WINDOW
// -----------------------------------------------------------------------
function createWindow() {
	// Create the browser window.
	if (isDev) {
		mainWindow = new BrowserWindow({
			width: 1600,
			height: 768,
			show: false,
			// icon: __dirname + "./assets/icon.png",
			webPreferences: {
				nodeIntegration: true,
			},
		});
	} else {
		mainWindow = new BrowserWindow({
			width: 1200,
			height: 768,
			show: false,
			webPreferences: {
				nodeIntegration: true,
			},
		});
	}

	// Load the index.html of the app.
	let indexPath;
	if (isDev && process.argv.indexOf("--noDevServer") === -1) {
		indexPath = url.format({
			protocol: "http:",
			host: "localhost:8080",
			pathname: "index.html",
			slashes: true,
		});
	} else {
		indexPath = url.format({
			protocol: "file:",
			pathname: path.join(__dirname, "dist", "index.html"),
			slashes: true,
		});
	}
	mainWindow.loadURL(indexPath);

	// Don't show until we are ready and loaded
	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
		autoUpdater.checkForUpdatesAndNotify(); // init check for updates

		// Open devtools if dev
		if (isDev) {
			mainWindow.webContents.openDevTools();
		}
	});

	// Emitted when the window is closed.
	mainWindow.on("closed", function () {
		mainWindow = null;
	});
}
// -----------------------------------------------------------------------
// APPLICATION BOOT UP AND DOWN
// -----------------------------------------------------------------------
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (mainWindow === null) {
		createWindow();
	}
});

// -----------------------------------------------------------------------
// HANDLE STORAGE
// -----------------------------------------------------------------------

// Receives a FETCH_DATA_FROM_STORAGE from renderer
ipcMain.on(FETCH_DATA_FROM_STORAGE, (event, message) => {
	console.log("Main received: FETCH_DATA_FROM_STORAGE with message:", message);
	storage.get(message, (error, data) => {
		// if the itemsToStore key does not yet exist in storage, data returns an empty object, so we will declare itemsToStore to be an empty array
		itemsToStore = JSON.stringify(data) === "{}" ? [] : data;
		if (error) {
			mainWindow.send(HANDLE_FETCH_DATA, {
				success: false,
				message: "itemsToStore not returned",
			});
		} else {
			// Send message back to window
			mainWindow.send(HANDLE_FETCH_DATA, {
				success: true,
				message: itemsToStore, // do something with the data
			});
		}
	});
});

// Receive a SAVE_DATA_IN_STORAGE call from renderer
ipcMain.on(SAVE_DATA_IN_STORAGE, (event, message) => {
	console.log("Main received: SAVE_DATA_IN_STORAGE");

	// update the itemsToStore array.
	itemsToStore.push(message);

	// Save itemsToStore to storage
	storage.set("itemsToStore", itemsToStore, (error) => {
		if (error) {
			console.log("We errored! What was data?");
			mainWindow.send(HANDLE_SAVE_DATA, {
				success: false,
				message: "items not saved",
			});
		} else {
			// Send message back to window as 2nd arg "data"
			mainWindow.send(HANDLE_SAVE_DATA, {
				success: true,
				message: message,
			});
		}
	});
});

// Receive a REMOVE_DATA_FROM_STORAGE call from renderer
ipcMain.on(REMOVE_DATA_FROM_STORAGE, (event, message) => {
	console.log("Main Received: REMOVE_DATA_FROM_STORAGE");
	// Update the items to Track array.
	itemsToStore = itemsToStore.filter(function (el) {
		return el.showName !== message.showName;
	});
	// Save itemsToStore to storage
	storage.set("itemsToStore", itemsToStore, (error) => {
		if (error) {
			console.log("We errored! What was data?");
			mainWindow.send(HANDLE_REMOVE_DATA, {
				success: false,
				message: "itemsToStore not saved",
			});
		} else {
			// Send new updated array to window as 2nd arg "data"
			mainWindow.send(HANDLE_REMOVE_DATA, {
				success: true,
				message: itemsToStore,
			});
		}
	});
});

// -----------------------------------------------------------------------
// PLEX & OUTPUT PATHS
// -----------------------------------------------------------------------

ipcMain.on("plexPath", () => {
	console.log("Main recieved: plexPath");
	mainWindow.send("plexPath", {
		success: true,
	});
});

ipcMain.on("outputPath", () => {
	console.log("Main recieved: outputPath");
	mainWindow.send("outputPath", {
		success: true,
	});
});

// -----------------------------------------------------------------------
// HANDLE BACKUP
// -----------------------------------------------------------------------

ipcMain.on("startBackup", (event, initBackup) => {
	console.log(initBackup);
	if (initBackup) {
		console.log("Main recieved: start backup");
		mainWindow.send("startBackup", {
			success: true,
		});
	} else {
		console.log("Main recieved: stop backup");
		mainWindow.send("startBackup", {
			success: false,
		});
	}
});

// -----------------------------------------------------------------------
// HANDLE REGKEY
// -----------------------------------------------------------------------

ipcMain.on("copyRegKey", (event, outputPath) => {
	console.log("Main recieved: copyRegKey");
	if (fs.existsSync(outputPath + "\\export.reg")) {
		setTimeout(() => {
			mainWindow.send("copyRegKey", {
				success: true,
				statusMessage: "Registry file already exists",
			});
		}, 2000);
	} else {
		exec(
			`REG EXPORT "HKEY_CURRENT_USER\\Software\\Plex, Inc.\\Plex Media Server" ${outputPath}\\export.reg`,
			(error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					mainWindow.send("copyRegKey", {
						error: true,
						errorMsg: error.message,
					});
					return;
				}
				if (stderr) {
					ipcRenderer.send("copyRegKey", stderr);
					return;
				}
				if (stdout) {
					setTimeout(() => {
						mainWindow.send("copyRegKey", {
							success: true,
							statusMessage: "Copy of registry file complete",
						});
					}, 2000);
				}
			}
		);
	}
});

// -----------------------------------------------------------------------
// KILL PLEX PROCESS
// -----------------------------------------------------------------------

ipcMain.on("killPlexProcess", () => {
	console.log("Main recieved: killPlexProcess");

	let options = {
		name: "Plex Media Server",
	};

	ps.list(options, function (error, result) {
		if (result[0] === undefined) {
			mainWindow.send("killPlexProcess", {
				success: true,
				statusMessage: "Plex is not runnng",
			});
		} else if (result[0].command === "Plex Media Server.exe") {
			mainWindow.send("killPlexProcess", {
				success: true,
				statusMessage: "Stopped Plex Media Server",
			});
			ps.kill([result[0].pid], function (error) {
				mainWindow.send("killPlexProcess", {
					success: true,
					statusMessage: "Stopped Plex Media Server",
				});
				if (error) {
					console.log(`error: ${error}`);
					mainWindow.send("killPlexProcess", {
						error: true,
						errorMsg: error,
					});
				}
			});
		}

		if (error) {
			console.log(`error: ${error}`);
			mainWindow.send("killPlexProcess", {
				error: true,
				errorMsg: error,
			});
		}
	});
});

// -----------------------------------------------------------------------
// HANDLE COMPRESSION
// -----------------------------------------------------------------------

ipcMain.on("compressToRar", () => {
	console.log("starting compression");
	mainWindow.send("compressToRar", {
		success: true,
		statusMessage: "Compressing files to RAR",
	});
});

ipcMain.on("compressionComplete", () => {
	console.log("compression complete");
	mainWindow.send("compressionComplete", {
		success: true,
		statusMessage: "Complete!",
	});
});

// -----------------------------------------------------------------------
// VERSION & AUTO UPDATE
// -----------------------------------------------------------------------

ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});

autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
