import { app, BrowserWindow } from 'electron'
import { config } from "../config";
import * as serverInterop from "../gui/server/setup"
import { GuiConsole } from "../console/gui"

export function createWindow(gui: GuiConsole) {
    serverInterop.setup(gui);
    const mainWindow = new BrowserWindow({
        x: 800, y: 0,
        width:  config.gui.width,
        height: config.gui.height + config.gui.macTitle,
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
    mainWindow.loadFile('dist/index.html', { search: gui.id });
    return mainWindow;
}
        