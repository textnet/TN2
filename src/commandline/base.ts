import { ok, error, log, register, call } from "./commandline";
import { NodeServer } from "../network/node";


export function setup() {

    register("reset", reset)
    register("create planet", createPlanet)
    register("destroy planet", destroyPlanet)
    register("planets", listPlanets)

    register("create console", createConsole)
    register("destroy console", destroyConsole)
    register("consoles", listConsoles)
    // TODO: bind, unbind, connect, disconnect

}


function mapParams(params, mapping) {
    const result = {};
    for (let i in mapping) {
        if (i == params.length) break;
        result[mapping[i]] = params[i]
    }
    return result;
}

function logObj(kind, item) { log(`${kind}(${item.id})`) }

export async function reset(node: NodeServer) {
    return node.reset();
}
// PLANETS
export async function createPlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    return node.createPlanet(params["id"]);
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
    const planets = await node.listPlanets();
    for (let id in planets) {
        logObj("Planet", planets[id]);
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