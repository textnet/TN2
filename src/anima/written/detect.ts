import { BookServer } from "../../model/book"
import { ThingData, PlaneData } from "../../model/interfaces"
import { Anima } from "../anima"
import * as cl from "../../commandline/commandline"
import * as print from "../../commandline/print"
import { strip, nonce } from "../../utils"
import { config } from "../../config"
import * as events from "../../behaviour/events"
import { getThingId } from "../../model/identity"

import { getChunks } from "./parser"
import { fengari_init, fengari_load, fengari_call, fengari_free } from "./api"
import { writtenThing } from "./library/thing"

export class WrittenAnima extends Anima {
    // B, thingId, controller
    L: any; // Lua State
    source: string;
    subscribedKeys: Record<string,any>;   

    constructor(B: BookServer, thingId: string, source?:string) {
        super(B, thingId);
        this.source = source;  
        this.subscribedKeys = {};         
    }

    async animate(permanent?: boolean) {
        await super.animate(permanent);
        this.L = fengari_init(this);
        if (this.source == undefined) {
            this.source = await extractSource(this.B, await this.B.things.load(this.thingId));
        }
        permanent = permanent || await this.call(this.source);
        if (config.debug.verboseConsole) {
            cl.verboseLog(await this.str() + ` <Written Word> ready.` + (permanent?" And left alive.":""));    
        }
        if (!permanent) {
            await this.terminate();
        }
    }

    async call(code: string) {
        if (strip(code) != "") {
            await this.prepareMemory()
            let success = fengari_load(this.L, code);
            if (!success) return;
            success = fengari_call(this.L);
            if (!success) return;
            // TODO: check if there are event handlers
            return true;
        }      
        return false;

    }

    async terminate() {
        for (let i in this.subscribedKeys) {
            this.controller.off(this.subscribedKeys[i]["event"], this.subscribedKeys[i]["listener"]);
            delete this.subscribedKeys[i];
        }
        this.subscribedKeys = {};
        fengari_free(this.L)
        await super.terminate()

    }

    subscribe(thingId: string, event: string, role: string, handler: any) {
        if (event == events.EVENT.TIMER && !this.interval) {
            this.setupInterval();
        }
        if (!thingId) {
            thingId = this.thingId;
        }
        const cachedThing = this.things.load(thingId);
        const that = this;
        const listener = (fullData) => {
            let caught = false;
            if (fullData.targetIds) {
                if (fullData.targetIds[role]) {
                    if (fullData.targetIds[role] == thingId) {
                        caught = true;
                    }
                }
            } else {
                caught = true;
            }
            if (role == events.EVENT_ROLE.OBSERVER && fullData.targetIds[events.EVENT_ROLE.HOST]) {
                if (getThingId(cachedThing.hostPlaneId) == fullData.targetIds[events.EVENT_ROLE.HOST]) {
                    caught = true; // was on the plane of event host.
                }
            }
            if (caught) {
                const eventData = {
                    event: event,
                    role: role,
                    data: fullData.data,
                    targetIds: fullData.targetIds,
                }
                if (handler.invoke) {
                    that.prepareMemory().then(function(){
                         that.updateMemory("things", fullData.targetIds)
                            .then(function(){
                            for (let ROLE in events.EVENT_ROLE) {
                                const i = events.EVENT_ROLE[ROLE];
                                const targetId = fullData.targetIds[i];
                                if (targetId) {
                                    eventData[i] = writtenThing(that, that.things.load(targetId));
                                }
                            }
                            handler.invoke(eventData, {})    
                        })
                    })
                } else {
                    handler.call(this, eventData);
                }
            }
        };
        this.controller.on(event, listener);
        const key = nonce();
        this.subscribedKeys[key] = {event:event, role: role, listener:listener, key:key};
        cl.verboseLog(`(${this.thingId}) SUBSCRIBE <${thingId}> #${event}:${role}`)
        return key;
    }


    unsubscribe(thingId: string, event: string, role: string, key) {
        if (!thingId) {
            thingId = this.thingId;
        }
        const handler = this.subscribedKeys[key];
        if (handler) {
            this.controller.off(event, handler["listener"]);
            cl.verboseLog(`(${thingId}) unsubscribe <${thingId}> #${event}:${role}`)
            delete this.subscribedKeys[key];
        }
    }      
}

async function extractSource(B: BookServer, thing: ThingData) {
    let resultList = []
    for (let planeName in thing.planes) {
        const plane = await B.planes.load(thing.planes[planeName]);
        const chunks = getChunks(plane.text);
        for (let chunk of chunks) {
            resultList.push(chunk.data);
        }
    }
    return resultList.join("\n")
}

export async function capture(B: BookServer, thing: ThingData) {
    const source = await extractSource(B, thing);
    if (strip(source) != "") {
        return new WrittenAnima(B, thing.id, source);
    } else {
        return undefined
    }
}
