import React, { useEffect, useState } from "react";

export default function ToggleTheme() {
	const [toggle, setToggle] = useState(true);
	useEffect(() => {
		console.log(toggle);
		toggle
			? document.body.classList.add("dark") + document.body.classList.remove("light")
			: document.body.classList.add("light") + document.body.classList.remove("dark");
	}, [toggle]);
	return (
		<div className={toggle ? "holder off" : "holder on"}>
			<div className="toggle" onClick={() => setToggle(!toggle)}></div>
		</div>
	);
}
