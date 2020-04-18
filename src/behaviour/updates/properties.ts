import { BookServer } from "../../model/book"
import { getBookId, isLimbo, createPlaneId } from "../../model/identity"
import * as geo from "../../model/geometry"
import * as updates from "../updates"


export async function properties(B: BookServer, update: updates.UpdateProperties) {
    const thing = await B.things.load(update.id);
    // 1. plane properties
    if (update.planeProperties) {
        for (let planeName in thing.planes) {
            if (!update.plane || planeName == update.plane) {
                const plane = await B.planes.load(createPlaneId(planeName, update.id));
                const format = update.planeProperties["format"];
                const spawn  = update.planeProperties["spawn"];
                const physics  = update.planeProperties["physics"];
                if (format) {
                    plane.format = format;
                }
                if (spawn) {
                    plane.spawn = spawn;
                }
                if (physics) {
                    // TODO
                    // friction
                    // gravity, seasons -> update
                }
                await B.planes.save(plane);
            }
        }
    }
    // 1. thing properties
    if (update.thingProperties) {
        const thing = await B.things.load(update.id);
        for (let key of thing.API) {
            const value = update.thingProperties[key];
            if (value) {
                switch(key) {
                    case "colors":
                    case "constraints":
                        for (let k in value) {
                            thing[key][k] = value[k];
                        }
                        break;
                    case "physics":
                        // TODO
                        // speed, box, Z
                        // mass, force -> update
                        break;
                    default: thing[key] = update.thingProperties[key];
                }                
            }
        }  
        await B.things.save(thing)                     
    }    
}

