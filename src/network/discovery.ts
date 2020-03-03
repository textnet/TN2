const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
import * as crypto from "crypto";
import { Socket } from "net"

import { ok, error, log, verboseLog } from "../commandline/commandline"

import { config } from "../config"
import { NodeServer } from "./node"
import { PlanetServer } from "../model/planet"


export interface NetworkHandlers {
    message:    any;
    disconnect: any;
}


export async function connect( planet: PlanetServer ) {
    if (config.debug.forceOffline) {
        return localConnect( planet );
    } else {
        // P2P code =============
        const id = planet.data.id;
        const swarm = new Swarm(defaults({
            id: Buffer.from(id, 'utf8')
        }))
        const socketMap: Record<string,Socket> = {};
        const port = await getPort()
        swarm.listen(port);
        // console.log(`P2P: join "${discoveryChannel}" at port ${port}`);
        swarm.on("connection", (conn: Socket, info) => {
            // console.log(`(p2p) start connection ${id}---${info.id}`)
            // keep alive ---------------------------------------
            if (info.initiator) {
                // console.log(`(p2p) ${id} keep alive!`)
                try {
                    conn.setKeepAlive(true, 600)
                } catch (exception) {
                    error(`P2P Connect Exception: ${exception}`);
                }
            }
            socketMap[info.id] = conn;
            planet.receiveConnection(info.id)
            // incoming -----------------------------------------
            let connectionDataTail = "";
            conn.on('data', data => {
                // console.log(`${id}: Tail -->`, connectionDataTail)
                // console.log(`${id}: Received Message from peer ` + info.id,
                //             '----> ' + data.toString()
                // )
                const messages = (connectionDataTail+data.toString()).split("\n\n");
                for (let i=0; i<messages.length-1; i++) {
                    const fullPayload = JSON.parse(messages[i])    
                    planet.receiveMessage(info.id, fullPayload);
                }
                connectionDataTail = messages[messages.length-1]
            })
            // close --------------------------------------------
            conn.on('close', () => {
                // console.log(`(p2p) close connection ${id}-/-${info.id}`);
                planet.receiveDisconnect(info.id);
                socketMap[info.id] = null;
            })
        })
        await swarm.join(config.network.discoveryChannel);
        return {
            message: function(targetPlanetId: string, fullPayload: any) {
                let data = JSON.stringify(fullPayload);
                let socket = socketMap[targetPlanetId];
                if (socket) {
                    socket.write(data+"\n\n");
                } else {
                    error(`P2P Message: no socket!`);
                }
            },
            disconnect: function() {
                for (let id in socketMap) {
                    if (socketMap[id] && !socketMap[id].destroyed) {
                        socketMap[id].destroy();
                    }
                }
            },
        } as NetworkHandlers
        // ======================
    }
}



export async function localConnect( planet: PlanetServer, onMessage?, onConnect?, onClose? ) {
    for (let server of planet.node.planetServers) {
        await server.receiveConnection( planet.data.id )
        await planet.receiveConnection( server.data.id )
    }
    // ----------
    return {
        message: async function(targetPlanetId: string, fullPayload: any) {
            for (let server of planet.node.planetServers) {
                if (server.data.id == targetPlanetId) {
                    await server.receiveMessage( planet.data.id, fullPayload );
                }
            }    
        },
        disconnect: async function() {
            for (let server of planet.node.planetServers) {
                await server.receiveDisconnect( planet.data.id )
            }             
        },
    } as NetworkHandlers
}
