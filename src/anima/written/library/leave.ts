import { WrittenAnima } from "../detect"
import * as actions from "../../../behaviour/actions"

export function leave( A: WrittenAnima ) {
    const thing = A.things.load(A.thingId);
    const plane = A.planes.load(thing.hostPlaneId);
    actions.action(A.B, {
        action:  actions.ACTION.TRANSFER_UP,
        actorId: thing.id,
        planeId: thing.hostPlaneId,
    } as actions.ActionTransferUp);
}
