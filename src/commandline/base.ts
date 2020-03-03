import { ok, error, log, register, call } from "./commandline";
import { NodeServer } from "../network/node";


export function setup() {

    register("reset", reset)
    register("create planet", createPlanet)
    register("destroy planet", destroyPlanet)
    register("planets", listPlanets)

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

export async function createPlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    return node.createPlanet(params["id"]);
}
export async function destroyPlanet(node: NodeServer, paramList) {
    const params = mapParams(paramList, ["id"])
    const planetData = await node.loadPlanet(params["id"]);
    if (planetData) {
        return node.destroyPlanet(planetData.id)
    } else {
        error(`No planet to destroy.`)
    }
}
export async function reset(node: NodeServer) {
    return node.reset();
}
export async function listPlanets(node: NodeServer) {
    const planets = await node.listPlanets();
    for (let id in planets) {
        logObj("Planet", planets[id]);
    }
}

// commands to do:

/*
reset
create planet <id>
create thing <id> @ <planetid> "template" x y
create console <thing_id>

destroy planet <id>
destroy thing <id>

connect <thing_id>
disconnect
gui <thing_id>

where <thing_id>

*/