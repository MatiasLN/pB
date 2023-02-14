import React, { useEffect, useState } from "react";
import { setPlexPath } from "../renderer";

const remote = require("electron").remote;
const { dialog } = require("electron").remote;
const fs = window.require("fs");
let userHomePath = remote.app.getPath("home");

const PlexPath = () => {
	const [path, setPath] = useState(null);

	const handleDefaultPath = () => {
		setPlexPath();
		localStorage.setItem("plexPath", path);
	};

	const handleCustomPath = () => {
		dialog
			.showOpenDialog({
				title: "Select Plex configuration directory",
				buttonLabel: "Select folder",
				properties: ["openDirectory"],
			})
			.then((file) => {
				if (!file.canceled) {
					setPlexPath();
					localStorage.setItem("plexPath", file.filePaths[0].toString());
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		if (fs.existsSync(userHomePath + "/AppData/Local/Plex Media Server")) {
			setPath(userHomePath + "/AppData/Local/Plex Media Server");
		}
	}, []);

	return (
		<div className="plexPath">
			{path ? (
				<>
					<h2>Select Plex configuration directory</h2>
					<strong>Found default Plex configuration</strong>
					<div>{path}</div>
					<h4>Do you want to use this configuration?</h4>
					<div className="buttonGroup">
						<button onClick={handleDefaultPath}>Use configuration</button>
						<p>or</p>
						<button onClick={handleCustomPath}>Select custom directory</button>
					</div>
				</>
			) : (
				<>
					<strong>Could not locate the default Plex configuration</strong>
					<p>Please select the Plex configuration directory to backup</p>
					<div className="buttonGroup">
						<button onClick={handleCustomPath}>Select directory</button>
					</div>
				</>
			)}
		</div>
	);
};

export default PlexPath;
