import React from "react";
import { render } from "react-dom";
import App from "./containers/App";

// Import CSS
import "./containers/App.css";
import "./components/Home.css";
import "./components/AutoUpdate.css";
import "./components/DisplayVersion.css";
import "./components/PlexPath.css";
import "./components/Settings.css";

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

// Now we can render our application into it
render(<App />, document.getElementById("root"));
