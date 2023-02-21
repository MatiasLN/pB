import React, { useState, useEffect } from "react";
import { about } from "../renderer";
import DisplayVersion from "./DisplayVersion";
const { ipcRenderer } = require("electron");

export default function About() {
	const [launchwindow, setLaunchWindow] = useState(false);

	useEffect(() => {
		about();
		ipcRenderer.on("about", (event, arg) => {
			setLaunchWindow(arg.launchWindow);
		});

		return () => {
			ipcRenderer.removeAllListeners("about");
		};
	}, [launchwindow]);

	return launchwindow ? (
		<div className="about">
			<div className="container">
				<div className="logo"></div>
				<p>pB - A Plex backup utility</p>
				<DisplayVersion />
				<span>Author: Matias Lie-Nielsen</span>
				<div className="github">
					<div className="github-icon"></div>
					<a href="#" onClick={() => about("github")}>
						Github Repo
					</a>
				</div>
				<button
					className="closeWindow"
					onClick={() => {
						about("close");
					}}
				>
					Close
				</button>
			</div>
		</div>
	) : null;
}
