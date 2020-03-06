/**
 * Host process of the Electron.
 * Responsible for persistence, networking, data manipulation.
 * Commands the renderer process, opens windows, etc.
 */
import { existsSync } from "fs"
import { app, BrowserWindow } from 'electron'
import * as commandline from "../commandline/commandline"

import { LibraryServer } from "../network/library"
import { waitPermission } from "../network/permission"


function onReady() {
    waitPermission(function(){
        const library = new LibraryServer();
        library.start().then(()=>{
            commandline.init(library, ()=>{ library.finish().then(()=>{ app.quit() }) });    
        })
    })
}

function onQuit() {
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
app.on("quit", () => onQuit())
