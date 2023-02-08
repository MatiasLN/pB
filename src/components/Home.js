import React, { useEffect, useState } from "react";
import { startBackup } from "../renderer";

import DisplayVersion from "./DisplayVersion";
import AutoUpdate from "./AutoUpdate";
import PlexPath from "./PlexPath";
import OutputPath from "./OutputPath";
import CopyRegFile from "./CopyRegFile";

const { ipcRenderer } = require("electron");

function Home() {
	const [plexPath, setPlexPath] = useState(localStorage.getItem("plexPath"));
	const [outputPath, setOutputPath] = useState(localStorage.getItem("outputPath"));
	const [initBackup, setInitBackup] = useState(false);

	useEffect(() => {
		ipcRenderer.on("plexPath", (event, arg) => {
			ipcRenderer.removeAllListeners("plexPath");
			setPlexPath(arg.success);
		});
		ipcRenderer.on("outputPath", (event, arg) => {
			ipcRenderer.removeAllListeners("outputPath");
			setOutputPath(arg.success);
		});
		ipcRenderer.on("startBackup", (event, arg) => {
			ipcRenderer.removeAllListeners("outputPath");
			setInitBackup(arg.success);
		});
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

				{plexPath && outputPath && (
					<section className="backup">
						<div className="buttonGroup">
							<button onClick={() => startBackup()}>Start backup</button>
						</div>
						{initBackup && <div>Regkey component</div>}
					</section>
				)}
			</div>
		</>
	);
}

export default Home;
