import * as commandline from "../commandline/commandline"

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
        console.log("TN2 Headless Server.")
        commandline.init(()=>{ process.exit() });
        // console.log(`Server running at http://${hostname}:${port}/`);
    });    
}


setupServer();