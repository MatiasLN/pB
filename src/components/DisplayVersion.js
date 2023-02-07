import React, { useEffect, useState } from "react";
import { appVersion } from "../renderer";
const { ipcRenderer } = require("electron");

function DisplayVersion() {
    const [version, setVersion] = useState("");

    useEffect(() => {
        appVersion();
        ipcRenderer.on(
            "app_version",
            (event, arg) => {
                ipcRenderer.removeAllListeners("app_version");
                setVersion(arg.version);
            },
            []
        );
    });

    return version && <div id="version">Version: {version}</div>;
}

export default DisplayVersion;