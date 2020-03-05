/**
 * Host process of the Electron.
 * Responsible for persistence, networking, data manipulation.
 * Commands the renderer process, opens windows, etc.
 */
import { existsSync } from "fs"
import { app, BrowserWindow } from 'electron'
import * as commandline from "../commandline/commandline"

import { NodeServer } from "../network/node"
import { waitPermission } from "../network/permission"


function onReady() {
    waitPermission(function(){
        const node = new NodeServer();
        node.start().then(()=>{
            commandline.init(node, ()=>{ node.finish().then(()=>{ app.quit() }) });    
        })
    })
}

function onQuit() {
}

app.on('ready', () => onReady())
app.on('window-all-closed', () => app.quit())
app.on("quit", () => onQuit())
