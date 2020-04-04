import * as geo from "../model/geometry"
import * as physics from "../model/physics"
import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { ThingData, PlaneData } from "../model/interfaces"
import { BookServer } from "../model/book"
import { Anima } from "../anima/anima"
import * as actions from "./actions"
import * as events from "./events"
import * as movement from "./actions/movement"

interface World {
    animas: Anima[];
    things: Record<string, ThingData>;
    planes: Record<string, PlaneData>;
}

export async function applyPhysics(B: BookServer, timeDelta:number) {
    const world: World = {
        animas: [], things: {}, planes: {}
    }
    // all things visible to controllers
    for (let c of B.controllers) {
        if (c.anima) {
            world.animas.push(c.anima);
            const thing = await loadThing(B, world, c.anima.thingId);
            const hostPlane = await loadPlane(B, world, thing.hostPlaneId);
            for (let name in thing.planes) {
                const plane = await loadPlane(B, world, thing.planes[name]);
            }
        }
    }
    // all things being moved
    for (let thingId in B.waypoints) {
        if (B.waypoints[thingId].length > 0) {
            const thing = await loadThing(B, world, thingId);
            const hostPlane = await loadPlane(B, world, thing.hostPlaneId);
        }
    }
    // figuring out _momentum and _inertia
    for (let thingId in world.things) {
        const thing = world.things[thingId];
        const plane = world.planes[thing.hostPlaneId];
        if (B.waypoints[thingId] && B.waypoints[thingId].length > 0) {
            const vector = movement.process(B, thing, plane, timeDelta);
            if (vector) {
                geo.accumulateDirection(thing.physics._momentum, vector);
            }
        }
        for (let g in thing.physics.mass) {
            const gravity = plane.physics.gravity[g];
            if (thing.physics.mass[g] && gravity && 
                thing.physics.mass[g] >= gravity.minimalMass &&
                thing.physics.mass[g] <= gravity.maximalMass) {
                if (gravity._momentum) {
                    geo.accumulateDirection(thing.physics._momentum, 
                                            geo.scale(gravity.direction, gravity._momentum));
                }
                if (gravity.acceleration) {
                    geo.accumulateDirection(thing.physics._inertia, 
                                            geo.scale(gravity.direction, timeDelta/physics.TIME_ACCELERATION));
                }
            }
        }
        geo.accumulateDirection(thing.physics._momentum, thing.physics._inertia);
        const speed = geo.scale(thing.physics._momentum, thing.physics.speed/plane.physics.friction * timeDelta/physics.TIME_MOMENTUM);
        const newPosition = geo.add(plane.things[thing.id], speed);
        const finalPosition = movement.checkWaypoint(B, thing, newPosition);
        if (geo.distance(plane.things[thing.id], finalPosition) > geo.PROXIMITY.MOVE) {
            await actions.action(B, {
                action: actions.ACTION.PLACE,
                actorId: plane.ownerId,
                thingId: thing.id,
                planeId: plane.id,
                position : finalPosition
            } as actions.ActionPlace);
        }
    }  
}

export async function loadPlane(B: BookServer, world: World, planeId: string) {
    world.planes[planeId] = await B.planes.load(planeId);
    return world.planes[planeId];
}
export async function loadThing(B: BookServer, world: World, thingId: string) {
    world.things[thingId] = await B.things.load(thingId);
    world.things[thingId].physics._momentum = deepCopy(geo.DIRECTION.NONE);
    if (!world.things[thingId].physics.speed) { 
        world.things[thingId].physics.speed = physics.DEFAULT_SPEED;
    }
    if (!world.things[thingId].physics._inertia) {
        world.things[thingId].physics._inertia = deepCopy(geo.DIRECTION.NONE);
    }
    return world.things[thingId];
}

