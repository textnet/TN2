import { ThingData, PlaneData } from "../model/interfaces"
import * as physics from "../model/physics"
import * as model from "../model/interfaces"
import { deepCopy } from "../utils"

export const thing: ThingData = {
    id: "<1>",
    hostPlaneId: "<2>",
    name: "Book",
    colors: {}, // all default colors
    constraints: {}, // see below
    sprite: {
        symbol: "📗",
        size: { w: 32, h: 32 },
    },
    physics: {
        box: { w: 32, h: 32 },
        Z: 0,
        mass:  { mass: 100 },
        force: { mass: 100 },
    },
    planes: {}
}

export const plane: PlaneData = {
    id: "<3>",
    ownerId: "<1>",
    physics: {
        gravity : { mass: physics.GRAVITY.TOPDOWN },
        seasons : { day:  physics.SEASON.DAY },
    },
    things: {}
}
thing.planes[model.PLANE_DEFAULT] = deepCopy(plane);
thing.planes[model.PLANE.LIMBO]   = deepCopy(plane);

thing.constraints[model.CONSTRAINT.pushable] = true;
thing.constraints[model.CONSTRAINT.pickable] = false;
thing.constraints[model.CONSTRAINT.passable] = false;
thing.constraints[model.CONSTRAINT.locked]   = false;

