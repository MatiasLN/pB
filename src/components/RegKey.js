import React, { useState, useEffect } from "react";
import { copyRegKey } from "../renderer";

const { ipcRenderer } = require("electron");

function RegKey({ outputPath }) {
	const [complete, setComplete] = useState(false);
	const [error, setError] = useState(null);
	const [statusMsg, setStatusMsg] = useState("Initiating copy of settings file");
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => {
		copyRegKey(outputPath);
		ipcRenderer.on("copyRegKey", (event, arg) => {
			ipcRenderer.removeAllListeners("copyRegKey");
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

export default RegKey;
