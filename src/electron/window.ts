import { app, BrowserWindow } from 'electron'
import { config } from "../config";
import * as serverInterop from "../gui/server/setup"
import { GuiConsole } from "../console/gui"

let _count = 0;

export function createWindow(gui: GuiConsole) {
    serverInterop.setup(gui);
    const height = config.gui.height + config.gui.macTitle;
    const mainWindow = new BrowserWindow({
        x: 800, y: height*_count,
        width:  config.gui.width,
        height: height,
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
    _count++;
    return mainWindow;
}
        