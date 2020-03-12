import { BookServer } from "../../model/book"
import { ThingData, PlaneData } from "../../model/interfaces"
import { Anima } from "../anima"
import * as cl from "../../commandline/commandline"
import * as print from "../../commandline/print"
import { strip } from "../../utils"
import { config } from "../../config"

import { getChunks } from "./parser"
import { fengari_init, fengari_load, fengari_call, fengari_free } from "./api"

export class WrittenAnima extends Anima {
    // B, thingId, controller
    L: any; // Lua State
    source: string;

    constructor(B: BookServer, thingId: string, source?:string) {
        super(B, thingId);
        this.source = source;           
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
        await super.terminate()
        fengari_free(this.L)
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
