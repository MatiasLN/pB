import React, { useState, useEffect } from "react";
import { settings } from "../renderer";
const { ipcRenderer } = require("electron");
const remote = require("electron").remote;
const { dialog } = require("electron").remote;

export default function Settings() {
	const [launchwindow, setLaunchWindow] = useState(false);
	const [plexPath, setPlexPath] = useState(localStorage.getItem("plexPath"));
	const [outputPath, setOutputPath] = useState(localStorage.getItem("outputPath"));

	useEffect(() => {
		settings();
		ipcRenderer.on("settings", (event, arg) => {
			setLaunchWindow(arg.launchWindow);
		});

		return () => {
			ipcRenderer.removeAllListeners("settings");
		};
	}, [launchwindow]);

	const handleCustomPath = (type) => {
		dialog
			.showOpenDialog({
				title: "Select directory",
				buttonLabel: "Select folder",
				properties: ["openDirectory"],
			})
			.then((file) => {
				if (!file.canceled) {
					if (type === "plex") {
						localStorage.setItem("plexPath", file.filePaths[0].toString());
						setPlexPath(file.filePaths[0].toString());
					}

					if (type === "output") {
						localStorage.setItem("outputPath", file.filePaths[0].toString());
						setOutputPath(file.filePaths[0].toString());
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return launchwindow ? (
		<div className="settings">
			<header>
				<h3>Settings</h3>
				<button
					className="closeWindow"
					onClick={() => {
						settings("close");
					}}
				>
					Close
				</button>
			</header>
			<div className="plexPath">
				<h4>Plex configuration path</h4>
				<p>{plexPath}</p>
				<div className="buttonGroup">
					<button onClick={() => handleCustomPath("plex")}>Change directory</button>
				</div>
			</div>
			<div className="outputPath">
				<h4>Output path</h4>
				<p>{outputPath}</p>
				<div className="buttonGroup">
					<button onClick={() => handleCustomPath("output")}>Change directory</button>
				</div>
			</div>
		</div>
	) : null;
}
