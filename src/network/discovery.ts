const Swarm = require('discovery-swarm')
const defaults = require('dat-swarm-defaults')
const getPort = require('get-port')
import * as crypto from "crypto";
import { Socket } from "net"

import { ok, error, log, verboseLog } from "../commandline/commandline"

import { config } from "../config"
import { LibraryServer } from "../model/library"
import { BookServer } from "../model/book"
import * as actions from "../behaviour/actions"
import * as events from "../behaviour/events"
import * as updates from "../behaviour/updates"


export interface NetworkHandlers {
    message:    any;
    disconnect: any;
}
export interface FullPayload {
    nonce: string,
    isCallback: boolean;
    senderId?: string;
    receiverId?: string;
    result?: string;
    payload?: Message;
}

export const MESSAGE = {
    LOAD: "load",
    ACTION: "action",
    EVENT:  "event",
    UPDATE: "update",
}

export interface Message {
    name: string;
}
export interface MessageLoad extends Message {
    kind: string;
    id: string;
}
export interface MessageAction extends Message {
    action: actions.Action;
}
export interface MessageEvent extends Message {
    recipientId: string; // which controller should get the event
    event: events.Event;
}
export interface MessageUpdate extends Message {
    update: updates.Update;
}


export const debugPeers: Record<string, any> = {};

export async function connect( book: BookServer ) {
    if (config.debug.forceOffline) {
        return await localConnect( book );
    } else {
        // P2P code =============
        const id = book.data.id;
        const swarm = new Swarm(defaults({
            id: Buffer.from(id, 'utf8')
        }))
        let socketMap: Record<string,Socket[]> = {};
        const port = await getPort()
        swarm.listen(port);
        debugPeers[id] = { sockets: {} }
        verboseLog(`Network: (${id}) joining discovery channel.`)
        swarm.on("connection", (conn: Socket, info) => {
            // verboseLog(`Network: (${id}) <-- by (${info.id}).`)
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
            book.receiveConnection(info.id)
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
                    book.receiveMessage(info.id, fullPayload);
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
            if (peer.id) {
                // verboseLog(`Network: (${id}) closed connection with (${peer.id}).`)
                book.receiveDisconnect(peer.id);
            }
        })

        await swarm.join(config.network.discoveryChannel);
        return {
            message: function(targetBookId: string, fullPayload: FullPayload) {
                let data = JSON.stringify(fullPayload);
                let sockets = socketMap[targetBookId];
                for (let socket of sockets) {
                    if (!socket.destroyed) {
                        socket.write(data+"\n\n");
                    }
                }
            },
            disconnect: function() {
                verboseLog(`Network: (${id}) leaving discovery channel.`)
                swarm.destroy();
            },
        } as NetworkHandlers
        // ======================
    }
}


export async function localConnect( book: BookServer, onMessage?, onConnect?, onClose? ) {
    verboseLog(`Network-Local: (${book.data.id}) joining discovery channel.`)   
    for (let id in book.library.bookServers) {
        if (id != book.data.id) {
            const server = book.library.bookServers[id];
            // verboseLog(`Network-Local: (${book.data.id}) <-> (${server.data.id}).`)
            await server.receiveConnection( book.data.id )
            await book.receiveConnection( server.data.id )            
        }
    }
    // ----------
    return {
        message: async function(targetBookId: string, fullPayload: FullPayload) {
            for (let id in book.library.bookServers) {
                const server = book.library.bookServers[id];
                if (server.data.id != book.data.id && server.data.id == targetBookId) {
                    return await server.receiveMessage( book.data.id, fullPayload );
                }
            }    
        },
        disconnect: async function() {
            verboseLog(`Network-Local: (${book.data.id}) leaving discovery channel.`)
            for (let id in book.library.bookServers) {
                if (id != book.data.id) {
                    // verboseLog(`Network: Book(${id}) >/< by Book(${book.data.id})`)
                    const server = book.library.bookServers[id];
                    await server.receiveDisconnect( book.data.id )
                }
            }             
        },
    } as NetworkHandlers
}
