const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')

import * as readline from 'readline'
import * as net from "net"

import { config } from "../config"



// TODO: need to debug. Somehow permission is auto granted?
export function waitPermission(next) {
    if (config.debug.forceOffline) {
        return next();
    }
    async function run() {
        const swarm = new Swarm(defaults({id:Buffer.from("TN2", 'utf8')}));
        const port = await getPort()
        swarm.listen(port);
        return new Promise((resolve, reject)=>{
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('Press <ENTER>', (answer) => {
                rl.close();
                next();
            });
        })
    }
    run()
}