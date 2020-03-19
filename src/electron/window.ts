import { app, BrowserWindow } from 'electron'
import { config } from "../config";

export function createWindow() {
    const mainWindow = new BrowserWindow({
        x: 800, y: 0,
        width:  config.gui.width,
        height: config.gui.height,
        resizable: false,
        fullscreen: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    if (config.debug.gui) {
        mainWindow.webContents.openDevTools({ mode:"detach" })
    }
    mainWindow.loadFile("dist/index.html")
    return mainWindow;
}
        