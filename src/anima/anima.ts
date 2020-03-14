import { BookServer } from "../model/book"
import { ThingData, PlaneData, PLANE_DEFAULT } from "../model/interfaces"
import { Controller } from "../behaviour/controller"
import * as print from "../commandline/print"
import * as cl from "../commandline/commandline"

import * as events from "../behaviour/events"

export const ANIMA = {
    PERMANENT: true
}

export class Anima {
    B: BookServer;
    thingId: string;
    controller: Controller;

    things: SyncRepository<ThingData>;
    planes: SyncRepository<PlaneData>;

    needsTimer: boolean;

    constructor(B: BookServer, thingId: string) {
        this.B = B;
        this.thingId = thingId;
        this.controller = new Controller(B, thingId);
        this.controller.connectAnima(this)
        this.things = new SyncRepository<ThingData>(this);
        this.planes = new SyncRepository<PlaneData>(this);
    }

    async str() {
        const thing = await this.B.things.load(this.thingId);
        return print.str(thing, true);
    }

    async animate(permanent?: boolean) {
        await this.controller.connect();
    }

    async terminate() {
        await this.controller.disconnect();
    }

    /**
     * Creating snapshot memory to be used synchronously within Anima's code.
     * Useful independently of the language.
     */
    async prepareMemory() {
        const things: Record<string,ThingData> = {};
        const planes: Record<string,PlaneData> = {};
        // things - 1
        const thing = await this.B.things.load(this.thingId);
        things[thing.id] = thing;
        // outer plane
        if (thing.hostPlaneId) {
            const hostPlane = await this.B.planes.load(thing.hostPlaneId)
            planes[hostPlane.id] = hostPlane;
            for (let id in hostPlane.things) {
                const a = await this.B.things.load(id);
                things[id] = a;
            }
        }
        // inner planes - 1
        for (let id in things) {
            for (let planeName in thing.planes) {
                const innerPlane = await this.B.planes.load(thing.planes[planeName])
                planes[innerPlane.id] = innerPlane;
            }
        }   
        // things - 2 (with their planes)
        for (let planeId in planes) {
            for (let thingId in planes[planeId].things) {
                const innerThing = await this.B.things.load(thingId);
                things[thingId] = innerThing;
                for (let planeName in innerThing.planes) {
                    const innerPlane = await this.B.planes.load(
                                       innerThing.planes[planeName]);
                    planes[innerPlane.id] = innerPlane;
                }
            }
        }
        // setup from scratch, yeah.
        this.things.setup(things);
        this.planes.setup(planes);

    }
    async updateMemory(prefix: string, ids: string[]|Record<string,string>) {
        for (let idx in ids) {
            this[prefix].update(await this.B[prefix].load(ids[idx]));
        }
        if (ids["host"]) {
            // add plane content
            const planeThing = await this.B.things.load(ids["host"]);
            const planeThingPlaneId = planeThing.planes[PLANE_DEFAULT];
            const planeThingPlane = await this.B.planes.load(planeThingPlaneId);
            for (let id in planeThingPlane.things) {
                const a = await this.B.things.load(id);
                this.things.update(a);
            }
            this.planes.update(planeThingPlane);
        }
    }

}


/**
 * Synchronous read-only version of the async Repository.
 * The simplest implementation is to preload everything everytime.
 */
export class SyncRepository<T> {
    A: Anima;
    contents: Record<string,T>;
    constructor(A : Anima) {
        this.A = A;
    }
    setup(contents: Record<string,T>) {
        this.contents = contents;
    }
    load(id: string) {
        return this.contents[id];
    }
    directory() {
        cl.log(`Directory > ${this.A.thingId}`)
        for (let id in this.contents) {
            cl.log(`          > ${id} ${this.contents[id]["name"]}`);
        }
    }
    update(o: any) {
        this.contents[o.id] = o;
    }
}