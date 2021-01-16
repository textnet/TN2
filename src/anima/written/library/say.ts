import { WrittenAnima } from "../detect"
import { PlaneData, ThingData, PLANE_DEFAULT, SAY } from "../../../model/interfaces"
import { isThingId, isBookId }  from "../../../model/identity"
import { BookServer } from "../../../model/book"
import * as actions from "../../../behaviour/actions"

export function say( A: WrittenAnima, what: string, loudness: number ) {
    const thing = A.things.load(A.thingId);
    actions.action(A.B, {
        action: actions.ACTION.SAY,
        actorId: thing.id,
        planeId: thing.hostPlaneId,
        what: what,
        loudness: loudness,
    } as actions.ActionSay);
}

export function shout( A: WrittenAnima, what: string ) {
    return say(A, what, SAY.SHOUT);
}

export function whisper( A: WrittenAnima, what: string ) {
    return say(A, what, SAY.WHISPER);
}