/**
 * Host process of the Electron.
 * Responsible for persistence, networking, data manipulation.
 * Commands the renderer process, opens windows, etc.
 */
import { existsSync } from "fs"
import { app, BrowserWindow } from 'electron'
import * as commandline from "../commandline/commandline"

function onReady() {
    commandline.init(()=>{ app.quit() });
}

function onQuit() {
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
app.on("quit", () => onQuit())
