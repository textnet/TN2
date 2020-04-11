import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { getBookId, createThingId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as events from "./events"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"

import * as say from "./actions/say"
import * as transfer from "./actions/transfer"
import * as spatials from "./actions/spatials"
import * as movement from "./actions/movement"
// actions happen on a plane

export const ACTION = {
    ENTER: "enter",
    LEAVE: "leave",
    TRANSFER: "transfer",
    IS_GUEST: "isGuest",
    PLACE: "place",
    SAY: "say",

    MOVE: "move",
    HALT: "halt",
}

export interface Action {
    action: string;
    actorId: string;
    planeId: string;
}
export interface ActionEnter extends Action {
    thingId: string;
    position?: geo.Position;
}
export interface ActionLeave extends Action {
    thingId: string;
}
export interface ActionTransfer extends Action {
    thingId: string;
}
export interface ActionIsGuest extends Action {
    thingId: string;
}
export interface ActionPlace extends Action {
    thingId: string;
    position: geo.Position;
    fit?: boolean;
    force?: boolean;
    isEnter?: boolean;
}
export interface ActionSay extends Action {
    what: string,
    loudness: number;
}

export interface ActionAddMovement extends Action {
    thingId: string;
    waypoint: movement.Waypoint;
}
export interface ActionHaltMovement extends Action {
    thingId: string;
}


// --- dispatcher ---
export async function action(B: BookServer, action: Action) {
    const targetBookId = getBookId(action.planeId)
    const message: network.MessageAction = {
        name: network.MESSAGE.ACTION,
        action: action,
    }
    // print(action)
    return B.sendMessage(targetBookId, message)
}
const dispatchAction = action;

// --- handlers ---
export const handlers = {
    say:       say.action,
    enter:     transfer.enter,
    leave:     transfer.leave,
    transfer:  transfer.action,
    isGuest:   transfer.isGuest,
    place:     spatials.place,
    move:      movement.add,
    halt:      movement.halt,
}
