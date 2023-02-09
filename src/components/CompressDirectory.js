import React, { useState, useEffect } from "react";
import { compressToRar, compressionComplete } from "../renderer";

const { ipcRenderer } = require("electron");
const { spawn } = window.require("child_process");

function CompressDirectory() {
	const [statusMsg, setStatusMsg] = useState("Initiating compression ...");
	const [complete, setComplete] = useState(false);
	const [error, setError] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);
	const [percentage, setPercentage] = useState(null);
	const [rarPath, setRarPath] = useState(null);
	const plexPath = localStorage.getItem("plexPath");
	const savePath = localStorage.getItem("outputPath");

	useEffect(() => {
		compressToRar();
	}, []);

	useEffect(() => {
		ipcRenderer.on("compressToRar", (event, arg) => {
			ipcRenderer.removeAllListeners("compressToRar");
			setComplete(arg.success);
			setStatusMsg(arg.statusMessage);
			setRarPath(arg.rarPath);
		});
		ipcRenderer.on("compressionComplete", (event, arg) => {
			ipcRenderer.removeAllListeners("compressionComplete");
			setComplete(arg.success);
			setStatusMsg(arg.statusMessage);
		});
	}, []);

	useEffect(() => {
		setStatusMsg("Initiating compression ...");

		if (rarPath) {
			let rarFiles = spawn(
				"rar",
				["a", `${savePath}\\plexBackup_${Date.now()}.rar`, `${plexPath}`, "-m0", "-idc", "-vn", "-x*\\Cache"],
				{ cwd: rarPath }
			);

			rarFiles.stdout.on("data", function (data) {
				if (data) {
					setStatusMsg("Compressing files to RAR");
				} else {
					setError(true);
					setErrorMsg("An unknown error occured");
				}
				if (
					data.includes("%") &&
					!data.includes("Adding") &&
					!data.includes("OK") &&
					!data.includes("Updating")
				) {
					let percentage = data.toString().replace(/[^a-z0-9 ,.?!]/gi, "");
					setPercentage(percentage);
				}
			});

			rarFiles.on("close", function (code) {
				console.log("child process exited with code " + code);
				setPercentage("100");
				compressionComplete();
			});
		}
	}, [rarPath]);

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
					<div className={complete ? "image success" : "image"}>{percentage && percentage + "%"}</div>
					<div className="status">{statusMsg}</div>
					<div className="progressBar"></div>
				</div>
			)}
		</>
	);
}

export default CompressDirectory;
