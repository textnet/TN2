import { ok, error, log, register, call } from "./commandline";
import { LibraryServer } from "../model/library";
import { debugPeers } from "../network/discovery"
import { BookServer } from "../model/book"
import { config } from "../config"
import * as written from "./written"
import { getBookId } from "../model/identity"


export function setup() {

    register("create book", createBook)
    register("destroy book", destroyBook)
    register("online",  onlineBook)
    register("offline", offlineBook)
    register("books", listBooks)

    register("create console", createConsole)
    register("destroy console", destroyConsole)
    register("consoles", listConsoles)
    register("bind", bindConsole);
    register("unbind", unbindConsole);

    register("network", network);
}

export async function getBookServers(L: LibraryServer, id?: string) {
    const books = [];   
    if (id && L.bookServers[id]) {
        books.push(L.bookServers[id])
    } else {
        for (let id in L.bookServers) {
            books.push(L.bookServers[id])
        }
    }
    return books;
}


function network() {
    if (config.debug.forceOffline) {
        console.log("Force offline mode is on. All local libraries are connected to each other.")
        return;
    }
    for (let host in debugPeers) {
        console.log(`HOST: ${host}`);
        for (let peer in debugPeers[host]["sockets"]) {
            console.log(`      - ${peer}`);
            if (debugPeers[host]["sockets"][peer] != null) {
                for (let socket of debugPeers[host]["sockets"][peer]) {
                    console.log(`        ^ :${socket.address().port} -> `+ (socket.destroyed?"destroyed":"alive"))
                }
            }
        }
    }
}

export function mapParams(params, mapping) {
    const result = {};
    for (let i in mapping) {
        if (i == params.length) break;
        result[mapping[i]] = params[i]
    }
    return result;
}

export function logObj(item, more) { log(`(${item.id})-`+more) }

// BOOKS
export async function createBook(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    return library.createBook(params["id"]);
}
export async function onlineBook(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    if (library.bookServers[params["id"]]) {
        library.bookServers[params["id"]].online()
    } else {
        error(`Unknown book: ${params["id"]})`);
    }
}
export async function offlineBook(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    if (library.bookServers[params["id"]]) {
        library.bookServers[params["id"]].offline()
    } else {
        error(`Unknown book: ${params["id"]})`);
    }
}
export async function destroyBook(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const data = await library.loadBook(params["id"]);
    if (data) {
        return library.destroyBook(data.id)
    } else {
        error(`No book to destroy.`)
    }
}
export async function listBooks(library: LibraryServer) {
    const servers = library.bookServers;
    for (let id in servers) {
        logObj(servers[id].data, (servers[id]._online?"ONLINE":"offline"));
    }
}

// CONSOLES
export async function createConsole(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id", "thingId"])
    return library.createConsole(params["id"], params["thingId"]);
}
export async function destroyConsole(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const data = await library.loadConsole(params["id"]);
    if (data) {
        return library.destroyConsole(data.id)
    } else {
        error(`No console to destroy.`)
    }
}
export async function listConsoles(library: LibraryServer) {
    const consoles = await library.listConsoles();
    for (let id in consoles) {
        log(`Console ${id}: ${consoles[id].thingId}`)
    }
}

export async function bindConsole(library: LibraryServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const data = await library.loadConsole(params["id"]);
    const bookId = getBookId(data.thingId)
    const server = library.bookServers[bookId];
    await written.bind(server, data.thingId, data.id);
}

export async function unbindConsole(library: LibraryServer) {
    await written.unbind();
}


// commands to do:

/*
gui
where <thing_id>
*/