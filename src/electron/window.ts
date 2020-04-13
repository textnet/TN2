import { app, BrowserWindow } from 'electron'
import { config } from "../config";
import * as serverInterop from "../gui/server/setup"
import { GuiConsole } from "../console/gui"

let _count = 0;

export async function createWindow(gui: GuiConsole) {
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
    const id = gui.id + (gui.isObserver?"//observer":"");
    await mainWindow.loadFile('dist/index.html', { search: id });
    mainWindow.on("close", (e)=>{ 
        gui.unbind();
    }); 
    _count++;
    return mainWindow;
}
        