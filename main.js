// -----------------------------------------------------------------------
// IMPORTS AND DECLEARING OF VARIABLES
// -----------------------------------------------------------------------
const { app, ipcMain, shell, BrowserWindow, Menu } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");
const ps = require("ps-man");

let mainWindow;
let isDev = false;
// Removing 8 characters to remove "app.asar"
let strippedPath = __dirname.substring(0, __dirname.length - 8);
const date = new Date().toLocaleDateString("nb-NB", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

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
			icon: __dirname + "/src/assets/icon/icon.png",
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
// MENU
// -----------------------------------------------------------------------

const menu = isDev
	? [
			{
				label: "File",
				submenu: [{ label: "Quit", click: () => app.quit() }],
			},
			{
				label: "Settings",
				click: () =>
					mainWindow.send("settings", {
						launchWindow: true,
					}),
			},
			{
				label: "View",
				submenu: [{ role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools" }],
			},
			{
				label: "Window",
				submenu: [{ role: "minimize" }, { role: "zoom" }],
			},
			{
				label: "About",
				click: () =>
					mainWindow.send("about", {
						launchWindow: true,
					}),
			},
	  ]
	: [
			{
				label: "File",
				submenu: [{ label: "Quit", click: () => app.quit() }],
			},
			{
				label: "Settings",
				click: () =>
					mainWindow.send("settings", {
						launchWindow: true,
					}),
			},
			{
				label: "Window",
				submenu: [{ role: "minimize" }, { role: "zoom" }],
			},
			{
				label: "About",
				click: () =>
					mainWindow.send("about", {
						launchWindow: true,
					}),
			},
	  ];

// -----------------------------------------------------------------------
// APPLICATION BOOT UP AND DOWN
// -----------------------------------------------------------------------
app.on("ready", () => {
	createWindow();
	const mainMenu = Menu.buildFromTemplate(menu);
	Menu.setApplicationMenu(mainMenu);
});

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
// SETTINGS WINDOW
// -----------------------------------------------------------------------

ipcMain.on("settings", (event, status) => {
	console.log("Main recieved: settings");
	if (status === "close") {
		mainWindow.send("settings", {
			launchWindow: false,
		});
	}
});

// -----------------------------------------------------------------------
// ABOUT WINDOW
// -----------------------------------------------------------------------

ipcMain.on("about", (event, status) => {
	console.log("Main recieved: about");
	if (status === "close") {
		mainWindow.send("about", {
			launchWindow: false,
		});
	}

	if (status === "github") {
		shell.openExternal("https://github.com/MatiasLN/pB");
	}
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
	console.log("Main recieved: start backup");
	mainWindow.send("startBackup", {
		success: true,
	});
});

// -----------------------------------------------------------------------
// HANDLE REGKEY
// -----------------------------------------------------------------------

ipcMain.on("copyRegKey", (event, outputPath) => {
	console.log("Main recieved: copyRegKey");

	outputPath = outputPath + "\\" + date;
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath);
	}

	if (fs.existsSync(outputPath + "\\regKey.reg")) {
		setTimeout(() => {
			mainWindow.send("copyRegKey", {
				success: true,
				statusMessage: "Registry file already exists",
			});
		}, 2000);
	} else {
		exec(
			`REG EXPORT "HKEY_CURRENT_USER\\Software\\Plex, Inc.\\Plex Media Server" ${outputPath}\\regKey.reg`,
			(error, stdout, stderr) => {
				if (error) {
					console.log(`error: ${error.message}`);
					mainWindow.send("copyRegKey", {
						error: true,
						errorMessage: error.message,
					});
					return;
				}
				if (stderr) {
					console.log(`error: ${error.message}`);
					mainWindow.send("copyRegKey", {
						error: true,
						errorMessage: stderr,
					});
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
						errorMessage: error,
					});
				}
			});
		}

		if (error) {
			console.log(`error: ${error}`);
			mainWindow.send("killPlexProcess", {
				error: true,
				errorMessage: error,
			});
		}
	});
});

// -----------------------------------------------------------------------
// HANDLE COMPRESSION
// -----------------------------------------------------------------------

ipcMain.on("compressToRar", () => {
	console.log("starting compression");

	if (isDev) {
		mainWindow.send("compressToRar", {
			success: true,
			rarPath: app.getAppPath() + "\\src\\assets\\exe",
			statusMessage: "Compressing files to RAR",
		});
	} else {
		let rarPath = "" + strippedPath + `assets\\exe\\` + "";
		mainWindow.send("compressToRar", {
			success: true,
			rarPath: rarPath,
			statusMessage: "Compressing files to RAR",
		});
	}
});

ipcMain.on("compressionComplete", () => {
	console.log("compression complete");
	mainWindow.send("compressionComplete", {
		success: true,
		statusMessage: "Compression complete",
	});
});

// -----------------------------------------------------------------------
// START PLEX PROCESS
// -----------------------------------------------------------------------

ipcMain.on("startPlex", (event, path) => {
	setTimeout(() => {
		const startProcess = spawn(`${path}\\Plex Media Server.exe`, { detached: true, stdio: ["inherit"] });
		if (startProcess.pid) {
			mainWindow.send("startPlex", {
				success: true,
				statusMessage: "Plex Media Server started",
			});
		} else {
			startProcess.on("error", (error) => {
				mainWindow.send("startPlex", {
					error: true,
					errorMessage: "Could not start Plex Media Server",
				});
			});
		}
	}, 2000);
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
