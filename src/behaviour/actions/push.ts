import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import { ThingData, PlaneData, CONSTRAINTS, checkConstraint, ThingConstraint } from "../../model/interfaces"
import { switchPlaneId, isLimboPortalId } from "../../model/identity"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"

export async function action(B: BookServer, action: actions.ActionPush) {
    // definitive push (constraints check was during the attempt)
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    // find new position
    let newPosition: geo.Position = deepCopy(plane.things[thing.id]);
    // TODO use mass & force & friction
    // try to place the thing into this position
    // TODO: convert to movement?
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

