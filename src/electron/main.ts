/**
 * Host process of the Electron.
 * Responsible for persistence, networking, data manipulation.
 * Commands the renderer process, opens windows, etc.
 */
import { existsSync } from "fs"
import { app } from 'electron'
import * as commandline from "../commandline/commandline"
import { LibraryServer } from "../model/library"
import { waitPermission } from "../network/permission"
import { createWindow } from "./window"

let library: LibraryServer;

function onReady() {
    waitPermission(function(){
        library = new LibraryServer();
        library.start().then(()=>{
            commandline.init(library, {
                exitHandler: ()=>{ app.quit() },
                gui: createWindow,
            });
        })
    })
}

let _quitOnce: boolean = true;
function onQuit(event) {
    if (_quitOnce) {
        event.preventDefault();
        _quitOnce = false;
        library.finish().then(()=>{ 
            commandline.ok("Finished.")
            app.quit(); 
        })
    }
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
app.on("before-quit", (e) => onQuit(e))


