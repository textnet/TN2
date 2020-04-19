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
                for(let key of ["format", "spawn"]) {
                    if (update.planeProperties[key]) {
                        plane[key] = update.planeProperties[key];
                    }
                }
                const physics  = update.planeProperties["physics"];
                if (physics) {
                    for (let k of ["friction"]) {
                        if (physics[k]) thing.physics[k] = physics[k];
                    }
                    for (let k of ["gravity", "seasons"]) {
                        if (physics[k]) {
                            for (let kk in physics[k]) {
                                plane.physics[k][kk] = physics[k][kk];
                            }                            
                        }
                    }
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
                        const physics  = value;
                        if (physics) {
                            for (let k of ["speed", "box", "Z"]) {
                                if (physics[k]) thing.physics[k] = physics[k];
                            }
                            for (let k of ["mass", "force"]) {
                                if (physics[k]) {
                                    for (let kk in physics[k]) {
                                        thing.physics[k][kk] = physics[k][kk];
                                    }                            
                                }
                            }
                        }
                        break;
                    default: thing[key] = update.thingProperties[key];
                }                
            }
        }  
        await B.things.save(thing)                     
    }    
}

