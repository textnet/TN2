import { WrittenAnima } from "../detect"
import { PlaneData, ThingData, PLANE_DEFAULT } from "../../../model/interfaces"
import { isThingId, isBookId }  from "../../../model/identity"
import { BookServer } from "../../../model/book"
import * as actions from "../../../behaviour/actions"

export function teleport( A: WrittenAnima, 
                          thing: any,
                          destination?: any) {
    const thingId = thing?(thing["id"] || thing):A.thingId;
    const targetId = destination["id"] || destination;
    _teleport(A, thingId, targetId);
}

async function _teleport( A:WrittenAnima, thingId:string, targetId: string ) {
    if (isBookId(targetId)) {
        const book = await A.B.library.books.load(targetId);
        targetId = book.thingId;
    }
    if (isThingId) {
        const thing = await A.B.things.load(targetId);
        targetId = thing.planes[PLANE_DEFAULT];
    }
    actions.action(A.B, {
        action: actions.ACTION.TRANSFER,
        actorId: A.thingId,
        thingId: thingId,
        planeId: targetId,
    } as actions.ActionTransfer)
}

