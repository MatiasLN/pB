// -----------------------------------------------------------------------
// IMPORTS AND DECLEARING OF VARIABLES
// -----------------------------------------------------------------------
const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const { autoUpdater } = require("electron-updater");

const {
	HANDLE_FETCH_DATA,
	FETCH_DATA_FROM_STORAGE,
	HANDLE_SAVE_DATA,
	SAVE_DATA_IN_STORAGE,
	REMOVE_DATA_FROM_STORAGE,
	HANDLE_REMOVE_DATA,
	HANDLE_PLEX_DIRECTORY,
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
			const { default: installExtension, REACT_DEVELOPER_TOOLS } = require("electron-devtools-installer");
			installExtension(REACT_DEVELOPER_TOOLS).catch((err) => console.log("Error loading React DevTools: ", err));
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

ipcMain.on("startBackup", () => {
	console.log("Main recieved: start backup");
	mainWindow.send("startBackup", {
		success: true,
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
