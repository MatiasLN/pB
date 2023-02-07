import React, { useState } from "react";
import { restartApp } from "../renderer";
const { ipcRenderer } = require("electron");

function AutoUpdate() {
    const [update, setUpdate] = useState("");

    ipcRenderer.on("update_downloaded", () => {
        ipcRenderer.removeAllListeners("update_downloaded");
        setUpdate("New version available. ");
    });

    return (
        update && (
            <div className="updateAvailable">
                {update}
                <a href="#" onClick={() => restartApp()}>
                    Restart to install
                </a>
            </div>
        )
    );
}

export default AutoUpdate;