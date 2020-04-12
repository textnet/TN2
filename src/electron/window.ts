import { app, BrowserWindow } from 'electron'
import { config } from "../config";
import * as serverInterop from "../gui/server/setup"
import { GuiConsole } from "../console/gui"

let _count = 0;

export function createWindow(gui: GuiConsole) {
    serverInterop.setup(gui);
    // const height = config.gui.height + config.gui.macTitle;
    const mainWindow = new BrowserWindow({
        x: config.gui.width * _count, 
        y: 0,
        width:  config.gui.width,
        height: (config.gui.height + config.gui.macTitle) *2,
        resizable: false,
        fullscreen: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    if (config.debug.gui) {
        mainWindow.webContents.openDevTools({mode:"bottom"})   // ({ mode:"detach" })
    }
    mainWindow.loadFile('dist/index.html', { search: gui.id });
    mainWindow.on("close", (e)=>{ }); // TODO: terminate Console on close
    _count++;
    return mainWindow;
}
        