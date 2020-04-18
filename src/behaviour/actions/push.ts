import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import { ThingData, PlaneData, CONSTRAINTS, checkConstraint, ThingConstraint } from "../../model/interfaces"
import { switchPlaneId, isLimboPortalId } from "../../model/identity"
import * as geo from "../../model/geometry"
import * as physics from "../../model/physics"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"

export async function action(B: BookServer, action: actions.ActionPush) {
    // definitive push (constraints check was during the attempt)
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    const actor = await B.things.load(action.actorId);
    // find new position
    let possible = false;
    let force = 1;
    for (let field in thing.physics.mass) {
        if (actor.physics.force[field] && actor.physics.force[field] >= thing.physics.mass[field]) {
            force *= actor.physics.force[field] / thing.physics.mass[field];
            possible = true;
        }
    }
    if (possible) {
        let direction = geo.normalize(action.direction, force * physics.FORCE_AMPLIFIER_PUSH);
        let newPosition: geo.Position = geo.add(plane.things[thing.id], direction);
        // emit 
        await events.emit(B, {
            event: events.EVENT.PUSH,
            planeId: plane.id,
            actorId: actor.id,
            thingId: thing.id,
        } as events.EventPush);
        // TODO convert to movement
        await actions.handlers.place(B, {
            action:   actions.ACTION.PLACE,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thing.id,
            position: newPosition,
            fit:      false,
            force:    false,
        } as actions.ActionPlace)        
    }
}

