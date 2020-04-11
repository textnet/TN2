import { BookData, ThingData, PlaneData } from "./interfaces"
import { LibraryServer } from "./library"
import { Repository } from "../storage/repo"
import * as network from "../network/discovery"
import { log, error, ok, verboseLog } from "../commandline/commandline"
import { pushDefaults, nonce } from "../utils"
import { getBookId, createBookId, createPlaneId } from "./identity"
import { Controller, CONTROLLER } from "../behaviour/controller"
import * as actions from "../behaviour/actions"
import * as events from "../behaviour/events"
import * as updates from "../behaviour/updates"
import * as anima from "../anima/animate"
import { createFromThing } from "./create"
import { applyPhysics } from "../behaviour/physics"
import { Waypoint } from "../behaviour/actions/movement"


// serves a book
export class BookServer {
    data:    BookData; // NB: book data is static!
    library: LibraryServer;

    things: Repository<ThingData>;
    planes: Repository<PlaneData>;

    controllers: Controller[];
    guests: Record<string,Controller>;
    waypoints: Record<string,Waypoint[]>; // thingId -> waypoints

    handlers: network.NetworkHandlers;

    _online: boolean;

    contains(id: string|PlaneData|ThingData) {
        if (id["id"]) return this.contains(id["id"]);
        return getBookId(id as string) == this.data.id;
    }
    id() {
        return this.data.id;
    }


    constructor(library: LibraryServer, data: BookData) {
        this.data = data;
        this.library = library;
        this.things = new Repository<ThingData>("things", this.data.id, this);
        this.planes = new Repository<PlaneData>("planes", this.data.id, this);
        this._online = false;
        this.controllers = [];
        this.guests = {};
        this.waypoints = {};
    }

    async online() {
        if (!this._online) {
            this.handlers = await network.connect(this);
            this._online = true;
            // set up all animas
            const things = await this.things.all();
            for (let thingId in things) {
                await anima.animate(this, things[thingId]);
            }
            this.setupInterval();
        }
    }
    async offline() {
        if (this._online) {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = undefined;
            }
            for (let t of this.controllers) {
                await t.disconnect(CONTROLLER.UNBOUND);
            }
            await this.handlers.disconnect()
            this._online = false;    
        }
    }
    async awaken(thingId:string) {
        const thing = await this.things.load(thingId);
        await anima.animate(this, thing);
    }
    async copy(thingId:string, actorId?:string) {
        const thing = await this.things.load(thingId);
        const actor = await this.things.load(actorId);
        if (this.contains(thingId)) return thing;
        const isGuest = await actions.action(this, {
            action:  actions.ACTION.IS_GUEST,
            actorId: actorId || thingId,
            planeId: actor? actor.hostPlaneId : thing.hostPlaneId,
            thingId: thingId,
        } as actions.ActionIsGuest);
        if (isGuest) {
            return undefined;
        } else {
            return await createFromThing(this, thingId);
        }
    }

    async registerGuest(thingId: string) {
        if (!this.guests[thingId]) {
            this.guests[thingId] = new Controller(this, thingId);
            this.guests[thingId].makeProxy();
            this.bind(this.guests[thingId])
        }
    }
    async deregisterGuest(thingId: string) {
        if (this.guests[thingId]) {
            await this.unbind(this.guests[thingId]);
            delete this.guests[thingId];
        }
    }

    /**
     * Setup the base interval that creates "timer" events.
     * Those events are also used to execute on spatial commands.
     * Should be called somewhere, but only when events are in play.
     */
    interval;
    setupInterval() {
        const that = this;
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = undefined;
        }
        let prevTime = Date.now();
        this.interval = setInterval(function(){
            const nowTime = Date.now();
            const delta = nowTime - prevTime;
            prevTime = nowTime;
            for (let c of that.controllers) {
                if (c.anima && c.anima.needsTimer) {
                    c.emit({
                        event: events.EVENT.TIMER,
                        actorId: c.anima.thingId,
                        thingId: c.anima.thingId,
                        delta: delta
                    } as events.TimerEvent)                    
                }
            }
            applyPhysics(that, delta)
        }, events.EVENT_TIMER_DURATION);
    }

    // keep track of all controllers relevant for this book.
    // will send events to them when something happens.
    async bind(c: Controller) {
        this.controllers.push(c);
    }
    async unbind(c: Controller) {
        let list = [];
        for (let t of this.controllers) {
            if (t != c) {
                list.push(t)
            }
        }
        this.controllers = list;
    }
    isControlled(thingId: string) {
        for (let t of this.controllers) {
            if (t.actorId == thingId) return true;
        }
        return false;
    }

    _callbackRegistry: Record<string,any> = {}
    // will be used to send events and to issue commands
    async sendMessage(targetBookId: string, payload: network.Message) {
        const fullPayload: network.FullPayload = {
            nonce: nonce(),
            isCallback: false,
            senderId: this.data.id,
            receiverId: targetBookId,
            payload: payload,
        }
        if (targetBookId == this.data.id) {
            return await this.conductMessage(this.data.id, targetBookId, payload);
        } else {
            const promise = new Promise((resolve, reject)=>{
                this._callbackRegistry[fullPayload.nonce] = resolve;
                this.handlers.message(targetBookId, fullPayload);
            })
            return promise;
        }
    }

    async emitEvent(targetBookId: string, recipientId: string, event: events.Event) {
        const message: network.MessageEvent = {
            name: network.MESSAGE.EVENT,
            event: event,
            recipientId: recipientId,
        }
        await this.sendMessage(targetBookId, message);
    }

    async receiveConnection(peerBookId: string) {}
    async receiveDisconnect(peerBookId: string) {}
    async receiveMessage(fromBookId: string, fullPayload: network.FullPayload) {
        const that = this;
        // loads
        // incoming events regarding my guests that are visiting that book
        // incoming commands from guests from that book that are visiting ours
        if (fullPayload.isCallback) {
            const callback = this._callbackRegistry[fullPayload.nonce];
            delete this._callbackRegistry[fullPayload.nonce];
            if (callback) {
                callback(fullPayload.result);
            }
        } else {
            const promise = this.conductMessage(
                                fullPayload.senderId.toString(),
                                fullPayload.receiverId.toString(), 
                                fullPayload.payload);
            promise.then(function(result){
                const callbackPayload: network.FullPayload = {
                    result: result,
                    nonce:  fullPayload.nonce,
                    isCallback: true,
                }
                that.handlers.message(fullPayload.senderId.toString(), callbackPayload);
            })
        }
    }
    async conductMessage(fromBookId: string, toBookId: string, data: network.Message) {
        if (toBookId != this.data.id) {
            error(`Can't conduct message to (${toBookId}): landed on (${this.data.id})!`)
            return undefined;
        }
        switch(data.name) {
            ////////
            case network.MESSAGE.LOAD: 
                const loadData = data as network.MessageLoad;
                return this[loadData.kind].load(loadData.id);
            ////////
            case network.MESSAGE.ACTION: 
                const action = (data as network.MessageAction).action;
                return actions.handlers[action.action](this, action);
            ////////
            case network.MESSAGE.UPDATE: 
                const update = (data as network.MessageUpdate).update;
                return updates.handlers[update.update](this, update);
            ////////
            case network.MESSAGE.EVENT: 
                const event = (data as network.MessageEvent).event;
                return events.emit(this, event)
            ////////
            default: error(`Conduct message of unknown type: ${data.name}!`);
        }
        return undefined;
    }
    async loadRemote(kind: string, id: string) {
        const bookId = getBookId(id);
        const message: network.MessageLoad = {
            name: network.MESSAGE.LOAD,
            kind: kind,
            id: id 
        }
        return this.sendMessage(bookId, message);
    }

}






/*
export function message(connectionInfo: ConnectionInfo, fullPayload) {
export async function connect( id:string, onMessage?, onConnect?, onClose? ) {


какие методы мне нужно поддержать:
    
    - отправка сообщения планете Х
    - пришло сообщение от планеты Х
    - установлено соединение с планетой Х (оба два)
    - закрыто соединение с планетой Х

*/