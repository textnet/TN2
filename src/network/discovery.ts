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


export const debugPeers: Record<string, any> = {};

export async function connect( planet: PlanetServer ) {
    if (config.debug.forceOffline) {
        return await localConnect( planet );
    } else {
        // P2P code =============
        const id = planet.data.id;
        const swarm = new Swarm(defaults({
            id: Buffer.from(id, 'utf8')
        }))
        let socketMap: Record<string,Socket[]> = {};
        const port = await getPort()
        swarm.listen(port);
        debugPeers[id] = { sockets: {} }
        // verboseLog(`Network: (${id}) joining discovery channel.`)
        swarm.on("connection", (conn: Socket, info) => {
            verboseLog(`Network: (${id}) <-- by (${info.id}).`)
            // keep alive ---------------------------------------
            if (info.initiator) {
                // verboseLog(`Network: (${id}) ^ initiated.`)
                try {
                    conn.setKeepAlive(true, 600)
                } catch (exception) {
                    error(`P2P Connect Exception: ${exception}`);
                }
            }
            if (!socketMap[info.id]) socketMap[info.id] = [];
            socketMap[info.id].push(conn)
            debugPeers[id]["sockets"] = socketMap;
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
            conn.on('close', (hadError) => {
                // verboseLog(`Network: (${id}) >/< by (${info.id})`)
                let newMap = [];
                for (let socket of socketMap[info.id]) {
                    if (!socket.destroyed) newMap.push(socket);
                }
                socketMap[info.id] = newMap;
                debugPeers[id]["sockets"] = socketMap;
            })
        })
        swarm.on('connection-closed', (conn: Socket, peer)=> {
            // verboseLog(`Network: (${id}) closed connection with (${peer.id})`)
            planet.receiveDisconnect(peer.id);
        })

        await swarm.join(config.network.discoveryChannel);
        return {
            message: function(targetPlanetId: string, fullPayload: any) {
                let data = JSON.stringify(fullPayload);
                let sockets = socketMap[targetPlanetId];
                for (let socket of sockets) {
                    if (!socket.destroyed) {
                        socket.write(data+"\n\n");
                    }
                }
            },
            disconnect: function() {
                swarm.leave(config.network.discoveryChannel)
                for (let socketId in socketMap) {
                    for (let socket of socketMap[socketId]) {
                        // verboseLog(`Network: (${id}) closing (${peer.id})`)
                        socket.end();
                    }
                }
            },
        } as NetworkHandlers
        // ======================
    }
}



export async function localConnect( planet: PlanetServer, onMessage?, onConnect?, onClose? ) {
    verboseLog(`Network-Local: (${planet.data.id}) joining discovery channel.`)   
    for (let id in planet.node.planetServers) {
        if (id != planet.data.id) {
            const server = planet.node.planetServers[id];
            verboseLog(`Network-Local: (${planet.data.id}) <-> (${server.data.id}).`)
            await server.receiveConnection( planet.data.id )
            await planet.receiveConnection( server.data.id )            
        }
    }
    // ----------
    return {
        message: async function(targetPlanetId: string, fullPayload: any) {
            for (let id in planet.node.planetServers) {
                const server = planet.node.planetServers[id];
                if (server.data.id != planet.data.id && server.data.id == targetPlanetId) {
                    await server.receiveMessage( planet.data.id, fullPayload );
                }
            }    
        },
        disconnect: async function() {
            for (let id in planet.node.planetServers) {
                if (id != planet.data.id) {
                    verboseLog(`Network: Planet(${id}) >/< by Planet(${planet.data.id})`)
                    const server = planet.node.planetServers[id];
                    await server.receiveDisconnect( planet.data.id )
                }
            }             
        },
    } as NetworkHandlers
}
