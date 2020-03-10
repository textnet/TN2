import { BookData, ThingData, PlaneData } from "./interfaces"
import { LibraryServer } from "./library"
import { Repository } from "../storage/repo"
import * as network from "../network/discovery"
import { log, error, ok, verboseLog } from "../commandline/commandline"
import { pushDefaults, nonce } from "../utils"
import { getBookId, createBookId } from "./identity"
import { Controller, CONTROLLER } from "../behaviour/controller"
import * as actions from "../behaviour/actions"
import * as events from "../behaviour/events"
import * as updates from "../behaviour/updates"



// serves a book
export class BookServer {
    data:    BookData; // NB: book data is static!
    library: LibraryServer;

    things: Repository<ThingData>;
    planes: Repository<PlaneData>;

    controllers: Controller[];

    handlers: network.NetworkHandlers;

    _online: boolean;

    constructor(library: LibraryServer, data: BookData) {
        this.data = data;
        this.library = library;
        this.things = new Repository<ThingData>("things", this.data.id, this);
        this.planes = new Repository<PlaneData>("planes", this.data.id, this);
        this._online = false;
        this.controllers = [];
    }

    async online() {
        if (!this._online) {
            this.handlers = await network.connect(this);
            this._online = true;            
        }
    }
    async offline() {
        if (this._online) {
            await this.handlers.disconnect()
            for (let t of this.controllers) {
                await t.disconnect(CONTROLLER.UNBOUND);
            }
            this._online = false;    
        }
    }

    // keep trace of all controllers relevant for this book.
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

    async receiveConnection(peerBookId: string) {
        // move all my guests on this book (back from limbo)
    }
    async receiveDisconnect(peerBookId: string) {
        // remove all my guests from the book, put them into their limbo
    }
    async receiveMessage(fromBookId: string, fullPayload: network.FullPayload) {
        const that = this;
        // loads
        // incoming events regarding my guests that are visiting that book
        // incoming commands from guests from that book that are visiting ours
        if (fullPayload.isCallback) {
            const callback = this._callbackRegistry[fullPayload.nonce];
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
                // handle event!
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