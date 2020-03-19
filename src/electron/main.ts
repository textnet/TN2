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


function onReady() {
    waitPermission(function(){
        const library = new LibraryServer();
        library.start().then(()=>{
            commandline.init(library, {
                exitHandler: ()=>{ library.finish().then(()=>{ app.quit() }) },
                gui: createWindow,
            });
        })
    })
}

function onQuit() {
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
app.on("quit", () => onQuit())


