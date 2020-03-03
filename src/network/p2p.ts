const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
import * as crypto from "crypto";
import { Socket } from "net"
import * as readline from "readline"

import { config } from "../config";


export interface ConnectionInfo {
    id: string,
    socket?: Socket,
    info;
}

export function message(connectionInfo: ConnectionInfo, fullPayload) {
    //
    let data = JSON.stringify(fullPayload);
    connectionInfo.socket.write(data+"\n\n");
}


export async function connect( id:string, onMessage?, onConnect?, onClose? ) {
    //
    const swarm = new Swarm(defaults({
        id: Buffer.from(id, 'utf8')
    }))
    const port = await getPort()
    swarm.listen(port);
    // console.log(`P2P: join "${discoveryChannel}" at port ${port}`);
    swarm.on("connection", (conn: Socket, info) => {
        let connectionDataTail = "";
        const connectionInfo = { hostId: id, socket:conn, info:info }
        // console.log(`(p2p) start connection ${id}---${info.id}`)
        // keep alive ---------------------------------------
        if (info.initiator) {
            // console.log(`(p2p) ${id} keep alive!`)
           try {
               conn.setKeepAlive(true, 600)
           } catch (exception) {
               console.log('P2P Connect Exception', exception)
           }
        }
        if (onConnect) onConnect(connectionInfo);
        // incoming -----------------------------------------
        conn.on('data', data => {
            // console.log(`${id}: Tail -->`, connectionDataTail)
            // console.log(`${id}: Received Message from peer ` + info.id,
            //             '----> ' + data.toString()
            // )
            const messages = (connectionDataTail+data.toString()).split("\n\n");
            for (let i=0; i<messages.length-1; i++) {
                const fullPayload = JSON.parse(messages[i])    
                if (onMessage) onMessage(connectionInfo, fullPayload);
            }
            connectionDataTail = messages[messages.length-1]
        })
        // close --------------------------------------------
        conn.on('close', () => {
            // console.log(`(p2p) close connection ${id}-/-${info.id}`);
            if (onClose) onClose(connectionInfo)
        })
    })
    return swarm.join(config.network.discoveryChannel);
}
