import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { getBookId, createThingId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as events from "./events"
import * as attempts from "./attempts"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"

// --- handlers ---
import * as say from "./actions/say"
import * as transfer from "./actions/transfer"
import * as spatials from "./actions/spatials"
import * as movement from "./actions/movement"
import * as attempt  from "./actions/attempt"
import * as push      from "./actions/push"
import * as equipment from "./actions/equipment"
export const handlers = {
    say:        say.action,
    enter:      transfer.enter,
    leave:      transfer.leave,
    transfer:   transfer.action,
    transferUp: transfer.transferUp,
    toLimbo:    transfer.transferToLimbo,
    fromLimbo:  transfer.transferFromLimbo,
    isGuest:    transfer.isGuest,
    place:      spatials.place,
    attempt:    attempt.action,
    move:       movement.add,
    halt:       movement.halt,
    push:       push.action,
    equip:      equipment.equip,
    unEquip:    equipment.unEquip,
    reEquip:    equipment.reEquip,
}

// actions happen on a plane

export const ACTION = {
    ENTER: "enter",
    LEAVE: "leave",
    TRANSFER: "transfer", // and put in stack
    TRANSFER_UP: "transferUp", // in stack
    TO_LIMBO: "toLimbo",
    FROM_LIMBO: "fromLimbo",
    IS_GUEST: "isGuest",
    PLACE: "place",
    SAY: "say",
    MOVE: "move",
    HALT: "halt",
    ATTEMPT: "attempt", // attempt a proximal action, e.g. enter
    PUSH: "push", // successful push
    EQUIP: "equip",
    UN_EQUIP: "unEquip",
    RE_EQUIP: "reEquip",
}

export const ATTEMPT = attempts.ATTEMPT;

export interface Action {
    action: string;
    actorId: string;
    planeId: string;
}
export interface ActionWithThing extends Action {
    thingId: string;
}
export interface ActionEnter extends ActionWithThing {
    position?: geo.Position;
    isUp?:boolean;
    noVisit?: boolean;
    force?: boolean;
}
export interface ActionLeave extends ActionWithThing {}
export interface ActionEquip extends ActionWithThing {
    equipThingId?: string;
    slotName?: string;
}
export interface ActionUnEquip extends Action {
    equipThingId?: string;
    slotName?: string;
    direction?: geo.Direction;
}
export interface ActionReEquip extends Action {
    equipFromId: string;
    equipToId: string;
    slotFrom?: string;
    slotTo?:   string;
}
export interface ActionTransfer extends ActionEnter {}
export interface ActionTransferUp extends Action {}
export interface ActionToLimbo    extends Action {}
export interface ActionFromLimbo  extends Action {}
export interface ActionIsGuest    extends ActionWithThing {}
export interface ActionPlace extends ActionWithThing {
    position?: geo.Position;
    fit?: boolean;
    force?: boolean;
    isEnter?: boolean;
}
export interface ActionSay extends Action {
    what: string,
    loudness: number;
}
export interface ActionAttempt extends Action {
    direction?: geo.Direction;
    slotName?: string;
    attempt: string;
}
export interface ActionPush extends ActionWithThing {
    direction: geo.Direction;
}

export interface ActionAddMovement extends ActionWithThing {
    waypoint: movement.Waypoint;
}
export interface ActionHaltMovement extends ActionWithThing {}


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


