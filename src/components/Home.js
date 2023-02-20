import React, { useEffect, useState } from "react";

import DisplayVersion from "./DisplayVersion";
import AutoUpdate from "./AutoUpdate";
import PlexPath from "./PlexPath";
import OutputPath from "./OutputPath";
import RegKey from "./RegKey";
import KillProcess from "./KillProcess";
import CompressDirectory from "./CompressDirectory";
import StartPlexProcess from "./StartPlexProcess";
import Settings from "./Settings";

const { ipcRenderer } = require("electron");

function Home() {
	const [plexPath, setPlexPath] = useState(localStorage.getItem("plexPath"));
	const [outputPath, setOutputPath] = useState(localStorage.getItem("outputPath"));
	const [initBackup, setInitBackup] = useState(false);
	const [regKey, setRegKey] = useState(false);
	const [killProcess, setKillProcess] = useState(false);
	const [compressionComplete, setCompressionComplete] = useState(false);
	const [startPlex, setStartPlex] = useState(false);
	const [backupRunning, setBackupRunning] = useState(false);

	function startBackup() {
		setBackupRunning(true);
		setInitBackup(true);
	}

	function newBackup() {
		window.location.reload(false);
	}

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
		ipcRenderer.on("compressionComplete", (event, arg) => {
			ipcRenderer.removeAllListeners("compressionComplete");
			setCompressionComplete(arg.success);
		});
		ipcRenderer.on("startPlex", (event, arg) => {
			ipcRenderer.removeAllListeners("startPlex");
			setStartPlex(arg.success);
			setBackupRunning(false);
		});
	});

	useEffect(() => {
		if (localStorage.getItem("newBackup") === "true") {
			startBackup();
			localStorage.setItem("newBackup", false);
		}
	}, []);

	return (
		<>
			<header>
				<DisplayVersion />
				<AutoUpdate />
			</header>
			<Settings />
			<div className="container">
				{!plexPath && <PlexPath />}
				{plexPath && !outputPath && <OutputPath />}

				{plexPath && outputPath && (
					<section className="backup">
						<div className="buttonGroup">
							{backupRunning ? (
								<div>Backup is running</div>
							) : compressionComplete ? (
								<button onClick={() => newBackup() + localStorage.setItem("newBackup", true)}>
									Start new backup
								</button>
							) : (
								<button onClick={() => startBackup(true)}>Start backup</button>
							)}
						</div>
						{initBackup && <RegKey outputPath={outputPath} />}
						{regKey && <KillProcess />}
						{killProcess && <CompressDirectory />}
						{compressionComplete && <StartPlexProcess />}
					</section>
				)}
			</div>
		</>
	);
}

export default Home;
