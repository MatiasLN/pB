import React from "react";
import { setOutputPath } from "../renderer";

const { dialog } = require("electron").remote;

function OutputPath() {
	const handleCustomPath = () => {
		dialog
			.showOpenDialog({
				title: "Select Plex configuration directory",
				buttonLabel: "Select folder",
				properties: ["openDirectory"],
			})
			.then((file) => {
				if (!file.canceled) {
					setOutputPath();
					localStorage.setItem("outputPath", file.filePaths[0].toString());
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div className="plexPath">
			<h2>Select output directory</h2>
			<p>This is where the backups will be stored</p>

			<div className="buttonGroup">
				<button onClick={handleCustomPath}>Select directory</button>
			</div>
		</div>
	);
}

export default OutputPath;
