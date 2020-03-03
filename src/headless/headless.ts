import * as commandline from "../commandline/commandline"
import { config } from "../config"
import { NodeServer } from "../network/node"

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
        console.log(`TN2 Headless Server. Version ${config.version}.`)
        const node = new NodeServer();
        node.start().then(()=>{
            commandline.init(node, ()=>{ node.finish().then(()=>{ process.exit() }); });    
        })
        // console.log(`Server running at http://${hostname}:${port}/`);
    });    
}


setupServer();