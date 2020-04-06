import * as commandline from "../commandline/commandline"
import { config } from "../config"
import { LibraryServer } from "../model/library"
import { waitPermission } from "../network/permission";

function setupServer() {
    const http = require('http');
    const hostname = '127.0.0.1';
    const port = 3000;

    const server = http.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Hello World');
    });

    server.listen(port, hostname, () => {
        commandline.log(`TN2 Headless Server. Version ${config.version}.`)
        // waitPermission(function(){
            const library = new LibraryServer();
            library.start().then(()=>{
                commandline.init(library, {
                    exitHandler: async function(){ await library.finish(); await process.exit() },
                    gui: ()=>{ commandline.error("GUI consoles are not supported in headless mode.") }
                });    
            })           
        // })
    });    
}


setupServer();