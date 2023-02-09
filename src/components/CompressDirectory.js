import React, { useState, useEffect } from "react";
import { compressToRar, compressionComplete } from "../renderer";

const { ipcRenderer } = require("electron");
const { spawn } = window.require("child_process");

function CompressDirectory() {
	const [statusMsg, setStatusMsg] = useState("Initiating compression ...");
	const [complete, setComplete] = useState(false);
	const [error, setError] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);

	useEffect(() => {
		compressToRar();
	}, []);

	useEffect(() => {
		ipcRenderer.on("compressToRar", (event, arg) => {
			ipcRenderer.removeAllListeners("compressToRar");
			setComplete(arg.success);
			setStatusMsg(arg.statusMessage);
			setError(arg.error);
			setErrorMsg(arg.errorMessage);
		});
		ipcRenderer.on("compressionComplete", (event, arg) => {
			ipcRenderer.removeAllListeners("compressionComplete");
			setComplete(arg.success);
			setStatusMsg(arg.statusMessage);
			setError(arg.error);
			setErrorMsg(arg.errorMessage);
		});
	});

	const plexPath = localStorage.getItem("plexPath");
	const savePath = localStorage.getItem("outputPath");

	useEffect(() => {
		setStatusMsg("Initiating compression ...");
		let rarFiles = spawn(
			"rar",
			["a", `${savePath}\\plexBackup_${Date.now()}.rar`, `${plexPath}`, "-m0", "-idc", "-vn", "-x*\\Cache"],
			{ cwd: "C:\\pB\\assets\\exe" }
		);

		rarFiles.stdout.on("data", function (data) {
			if (data) {
				setStatusMsg("Compressing files to RAR");
			}
			if (data.includes("%") && !data.includes("Adding") && !data.includes("OK") && !data.includes("Updating")) {
				let percentage = data.toString().replace(/[^a-z0-9 ,.?!]/gi, "");
				console.log(percentage);
			}
		});

		rarFiles.on("close", function (code) {
			console.log("child process exited with code " + code);
			compressionComplete();
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

export default CompressDirectory;
