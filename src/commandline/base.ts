import { ok, error, log, register, call } from "./commandline";
import { NodeServer } from "../network/node";
import { debugPeers } from "../network/discovery"
import { PlanetServer } from "../model/planet"
import { config } from "../config"


export function setup() {

    register("create planet", createPlanet)
    register("destroy planet", destroyPlanet)
    register("online",  onlinePlanet)
    register("offline", offlinePlanet)
    register("planets", listPlanets)

    register("create console", createConsole)
    register("destroy console", destroyConsole)
    register("consoles", listConsoles)
    // TODO: bind, unbind, connect, disconnect


    register("network", network);
}


function network() {
    if (config.debug.forceOffline) {
        console.log("Force offline mode is on. All local nodes are connected to each other.")
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

function mapParams(params, mapping) {
    const result = {};
    for (let i in mapping) {
        if (i == params.length) break;
        result[mapping[i]] = params[i]
    }
    return result;
}

function logObj(item, more) { log(`(${item.id})-`+more) }

// PLANETS
export async function createPlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    return node.createPlanet(params["id"]);
}
export async function onlinePlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    if (node.planetServers[params["id"]]) {
        node.planetServers[params["id"]].online()
    } else {
        error(`Unknown planet: ${params["id"]})`);
    }
}
export async function offlinePlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    if (node.planetServers[params["id"]]) {
        node.planetServers[params["id"]].offline()
    } else {
        error(`Unknown planet: ${params["id"]})`);
    }
}
export async function destroyPlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const data = await node.loadPlanet(params["id"]);
    if (data) {
        return node.destroyPlanet(data.id)
    } else {
        error(`No planet to destroy.`)
    }
}
export async function listPlanets(node: NodeServer) {
    const servers = node.planetServers;
    for (let id in servers) {
        logObj(servers[id].data, (servers[id]._online?"ONLINE":"offline"));
    }
}

// CONSOLES
export async function createConsole(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id", "thingId"])
    return node.createConsole(params["id"], params["thingId"]);
}
export async function destroyConsole(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const data = await node.loadConsole(params["id"]);
    if (data) {
        return node.destroyConsole(data.id)
    } else {
        error(`No console to destroy.`)
    }
}
export async function listConsoles(node: NodeServer) {
    const consoles = await node.listConsoles();
    for (let id in consoles) {
        logObj("Console", consoles[id]);
    }
}

// commands to do:

/*
create thing <id> @ <planetid> "template" x y
destroy thing <id>

connect
disconnect
gui

where <thing_id>

*/