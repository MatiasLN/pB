import React, { useState, useEffect } from "react";
import { killPlexProcess } from "../renderer";

const { ipcRenderer } = require("electron");

function KillProcess() {
	const [statusMsg, setStatusMsg] = useState("Checking Plex Media Server instance");
	const [complete, setComplete] = useState(false);
	const [error, setError] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => {
		killPlexProcess();
		ipcRenderer.on("killPlexProcess", (event, arg) => {
			ipcRenderer.removeAllListeners("killPlexProcess");
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
					<div className="progressBar"></div>
				</div>
			)}
		</>
	);
}

export default KillProcess;
