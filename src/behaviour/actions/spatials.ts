import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"



export async function place(B: BookServer, action: actions.ActionPlace) {
    const actor = await B.things.load(action.actorId);
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    let colliderId: string;
    let position: geo.Position = undefined;
    if (action.fit) {
        position = await findFitting(B, thing, plane, action.position);
        // console.log(position)
        // console.log(action.position)
        // console.log("=====>")
    } else {
        if (action.force) {
            position = deepCopy(action.position);
        } else {
            colliderId = await findCollision(B, thing, plane, action.position);
            if (!colliderId) {
                position = deepCopy(action.position);
            }
        }
    }
    if (!colliderId) {
        const plane = await B.planes.load(action.planeId);
        plane.things[thing.id] = position;
        await B.planes.save(plane);
        const event = {
            event:    action.isEnter? events.EVENT.ENTER : events.EVENT.PLACE,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thing.id,
            position: position,           
        } as events.EventPlace;
        await events.emit(B, event);
    } else {
        const thing = await B.things.load(action.thingId);
        thing.physics._inertia = deepCopy(geo.DIRECTION.NONE);
        await B.things.save(thing);
        const event = {
            event:    events.EVENT.COLLISION,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thing.id,
            colliderId: colliderId,
            position: action.position,           
        } as events.EventCollision;
        await events.emit(B, event);
    }
    return position;
}

// find a position where the thing will fit.
async function findFitting(B: BookServer, thing: ThingData, plane: PlaneData, position: geo.Position) {
    if (geo.inBounds(position, plane.physics.box) && 
        !(await findCollision(B, thing, plane, position))) {
        return deepCopy(position);
    }
    if (!thing.physics.box || !thing.physics.box.w || !thing.physics.box.h) {
        return deepCopy(position)
    }
    let size = 0;
    let pos = deepCopy(position);
    while (true) {
        size++;        
        let sequence = [];
        pos = shiftPos(pos, thing.physics.box, 0, 1);
        sequence.push(pos);
        // 2. go right (size times)
        for (let i=0; i<size; i++) {
            sequence.push(shiftPos( pos, thing.physics.box, i+1, 0 ))
        }
        // 3. go up (size+1+size)
        for (let i=0; i<size*2+1; i++) {
            sequence.push(shiftPos( pos, thing.physics.box, size, -i ))
        }
        // 4. go left (size+1+size)
        for (let i=0; i<size*2+1; i++) {
            sequence.push(shiftPos( pos, thing.physics.box, size-i, -2*size ))
        }
        // 5. go down (size+1+size)
        for (let i=0; i<size*2+1; i++) {
            sequence.push(shiftPos( pos, thing.physics.box, -size, -2*size+i ))
        }
        // 6. go right.
        for (let i=0; i<size; i++) {
            sequence.push(shiftPos( pos, thing.physics.box, -size, 0 ))
        }
        // check
        for (let p of sequence) {
            if (geo.inBounds(position, plane.physics.box)) {
                const collider = await findCollision(B, thing, plane, p);
                if (!collider) return p;
            }
        }  
    }
    return pos;
}


function shiftPos(p: geo.Position, body: geo.Box, dx: number, dy: number) {
    const pos = deepCopy(p);
    pos.x += dx * body.w;
    pos.y += dy * body.h;
    return pos;
}

// will it fit here?
async function findCollision(B: BookServer, thing: ThingData, plane: PlaneData, position: geo.Position) {
    if (thing.physics.slot) return; // slots never collide;
    for (let id in plane.things) {
        if (id != thing.id) {
            const another = await B.things.load(id);
            const anotherPos = plane.things[id];
            if (!another.physics.slot &&
                geo.boxOverlap(
                geo.positionedBox(thing.physics.box,   position),
                geo.positionedBox(another.physics.box, anotherPos))) {
                return id;
            }
        }
    }
    return undefined;
}







