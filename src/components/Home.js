import React, { useEffect, useState } from "react";
const { ipcRenderer } = require("electron");

import DisplayVersion from "./DisplayVersion";
import AutoUpdate from "./AutoUpdate";
import PlexPath from "./PlexPath";
import OutputPath from "./OutputPath";

function Home() {
	const [plexPath, setPlexPath] = useState(localStorage.getItem("plexPath"));
	const [outputPath, setOutputPath] = useState(localStorage.getItem("outputPath"));

	useEffect(() => {
		ipcRenderer.on("plexPath", (event, arg) => {
			ipcRenderer.removeAllListeners("plexPath");
			setPlexPath(arg.success);
		}),
			[];
		ipcRenderer.on(
			"outputPath",
			(event, arg) => {
				ipcRenderer.removeAllListeners("outputPath");
				setOutputPath(arg.success);
			},
			[]
		);
	});

	return (
		<>
			<header>
				<DisplayVersion />
				<AutoUpdate />
			</header>
			<div className="container">
				{!plexPath && <PlexPath />}
				{plexPath && !outputPath && <OutputPath />}

				{plexPath && outputPath && <div>Display the backup components here</div>}
			</div>
		</>
	);
}

export default Home;
