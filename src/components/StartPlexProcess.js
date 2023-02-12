import React, { useState, useEffect } from "react";
import { startPlex } from "../renderer";

const { dialog } = require("electron").remote;
const fs = window.require("fs");
const { ipcRenderer } = require("electron");

export default function StartPlexProcess() {
	const [complete, setComplete] = useState(false);
	const [error, setError] = useState(null);
	const [statusMsg, setStatusMsg] = useState("Starting Plex Server");
	const [errorMsg, setErrorMsg] = useState(null);
	const [toggleBrowse, setToggleBrowse] = useState(false);
	const plexInstallPath = "C:\\Program Files (x86)\\Plex\\Plex Media Server";

	const handleCustomPath = () => {
		dialog
			.showOpenDialog({
				title: "Select Plex installation directory",
				buttonLabel: "Select folder",
				properties: ["openDirectory"],
			})
			.then((file) => {
				if (!file.canceled) {
					localStorage.setItem("plexInstallPath", file.filePaths[0].toString());
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		//setStatusMsg("Starting Plex Server");
		if (fs.existsSync(plexInstallPath)) {
			localStorage.setItem("plexInstallPath", plexInstallPath);
			//console.log(plexInstallPath);
		} else {
			setStatusMsg("Could not find the default Plex installation directory. Click browse to add it manually");
			setToggleBrowse(true);
		}
	}, []);

	useEffect(() => {
		startPlex(plexInstallPath);
		ipcRenderer.on("startPlex", (event, arg) => {
			ipcRenderer.removeAllListeners("startPlex");
			console.log(arg.statusMessage);
			setComplete(arg.success);
			setStatusMsg(arg.statusMessage);
			setError(arg.error);
			setErrorMsg(arg.errorMessage);
		});
	}, []);

	return (
		<>
			{error && (
				<div className="block error">
					<div className="image"></div>
					<div className="errorMsg">{errorMsg}</div>
					<div className="progressBar"></div>
				</div>
			)}

			{statusMsg && (
				<div className="block">
					<div className={complete ? "image success" : "image"}></div>
					<div className="status">{statusMsg}</div>
					{toggleBrowse && (
						<div className="buttonGroup">
							<button onClick={handleCustomPath}>Select directory</button>
						</div>
					)}
				</div>
			)}
		</>
	);
}
