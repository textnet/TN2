import { BookServer } from "../../model/book"
import * as actions from "../actions"
import * as actions_equipment from "./equipment"
import * as actions_spatials from "./spatials"
import * as events from "../events"
import * as geo from "../../model/geometry"
import * as interfaces from "../../model/interfaces"
import * as identity from "../../model/identity"
import * as create from "../../model/create"


export async function summon(B: BookServer, action: actions.ActionSummon) {
    const actor = await B.things.load(action.actorId);
    const plane = await B.planes.load(actor.hostPlaneId);
    const thing = await createThing(B, action.idPostfix, action.prototypeId, action.source )
    const position = action.position 
                     || actions_equipment.findDirection(actor, plane, thing, action.direction)

    if (actions_spatials.willFit(B, thing, plane, position)) {
        // enter
        let success = await actions.action(B, {
            action: actions.ACTION.ENTER,
            actorId: actor.id,
            thingId: thing.id,
            planeId: plane.id,
            position: position,
        } as actions.ActionEnter)
        // event
        await events.emit(B, {
            event: events.EVENT.SUMMON,
            planeId: action.planeId,
            actorId: action.actorId,
            thingId: thing.id,
            position: position,
            source: action.source,
            prototypeId: action.prototypeId,
        } as events.EventSummon);
        // -
        return success;
    }
    return false;
}


export async function createThing(B: BookServer, 
                                  idPostfix?: string,
                                  prototypeId?: string,
                                  source?: string,
                                  ) {
    // 1. generate id
    let id = await identity.createThingId(B, idPostfix);
    // 2. 
    let result: interfaces.ThingData;
    source = source || create.SUMMON_SOURCE_DEFAULT;
    switch(source) {

        // create from template
        case create.SUMMON_SOURCE.TEMPLATE:
            result = await create.createFromTemplate(B, prototypeId, id);
            break;

        // create from thing
        case create.SUMMON_SOURCE.LOCAL:
        default: 
            result = await create.createFromThing(B, prototypeId, id)
    }

    return result;
}