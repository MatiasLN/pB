import React, { useEffect, useState } from "react";

export default function ToggleTheme() {
	const [toggle, setToggle] = useState(localStorage.getItem("theme"));

	useEffect(() => {
		toggle
			? document.body.classList.add("dark") + document.body.classList.remove("light")
			: document.body.classList.add("light") + document.body.classList.remove("dark") + console.log("run");
	}, [toggle]);

	const handleToggle = () => {
		console.log("does it run?");
		const overlay = document.querySelector("#overlay");
		setToggle(!toggle);
		console.log(toggle);
		toggle
			? document.body.classList.add("dark") +
			  document.body.classList.remove("light") +
			  overlay.classList.toggle("mooned") +
			  localStorage.setItem("theme", true)
			: document.body.classList.add("light") +
			  document.body.classList.remove("dark") +
			  overlay.classList.toggle("mooned") +
			  localStorage.setItem("theme", false);
	};

	return (
		<div id="toggleContainer" onClick={() => handleToggle()}>
			<svg id="sunmoon" width="200" height="200">
				<defs>
					<mask id="hole">
						<rect width="100%" height="100%" fill="white" />
						<circle id="overlay" className={toggle ? "mooned" : ""} r="80" cx="230" cy="-30" fill="black" />
					</mask>

					<filter id="blur">
						<feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="hsl(210 15% 90%)" />
					</filter>
				</defs>
				{toggle ? (
					<circle fill="hsl(210 10% 70%)" id="donut" r="80" cx="100" cy="100" mask="url(#hole)" />
				) : (
					<circle fill="hsl(210 10% 30%)" id="donut" r="80" cx="100" cy="100" mask="url(#hole)" />
				)}
			</svg>
		</div>
	);
}
