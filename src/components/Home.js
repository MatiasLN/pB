import React, { useEffect, useState } from "react";
import { startBackup } from "../renderer";

import DisplayVersion from "./DisplayVersion";
import AutoUpdate from "./AutoUpdate";
import PlexPath from "./PlexPath";
import OutputPath from "./OutputPath";
import RegKey from "./RegKey";
import KillProcess from "./KillProcess";

const { ipcRenderer } = require("electron");

function Home() {
	const [plexPath, setPlexPath] = useState(localStorage.getItem("plexPath"));
	const [outputPath, setOutputPath] = useState(localStorage.getItem("outputPath"));
	const [initBackup, setInitBackup] = useState(false);
	const [regKey, setRegKey] = useState(false);
	const [killProcess, setKillProcess] = useState(false);

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
			ipcRenderer.removeAllListeners("startBackup");
			setInitBackup(arg.success);
		});
		ipcRenderer.on("copyRegKey", (event, arg) => {
			ipcRenderer.removeAllListeners("copyRegKey");
			setRegKey(arg.success);
		});
		ipcRenderer.on("killPlexProcess", (event, arg) => {
			ipcRenderer.removeAllListeners("killPlexProcess");
			setKillProcess(arg.success);
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
							<button onClick={() => startBackup(!initBackup)}>
								{initBackup ? "Stop backup" : "Start backup"}
							</button>
						</div>
						{initBackup && <RegKey outputPath={outputPath} />}
						{initBackup && regKey && <KillProcess />}
						{initBackup && killProcess && <div>Next module</div>}
					</section>
				)}
			</div>
		</>
	);
}

export default Home;
