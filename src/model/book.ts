import * as crypto from "crypto";
import { BookData, ThingData, PlaneData } from "./interfaces"
import { LibraryServer } from "../network/library"
import { Repository } from "../storage/repo"
import * as network from "../network/discovery"
import { log, error, ok, verboseLog } from "../commandline/commandline"

export function getBookId(id: string) {
    return id.split(".")[0]
}
export function createBookId() {
    return crypto.randomBytes(32).toString('hex')
}


// serves a book
export class BookServer {
    data: BookData; // NB: book data is static!
    library: LibraryServer;

    things: Repository<ThingData>;
    planes: Repository<PlaneData>;

    handlers: network.NetworkHandlers;

    _online: boolean;

    constructor(library: LibraryServer, data: BookData) {
        this.data = data;
        this.library = library;
        this.things = new Repository<ThingData>("things", this.data.id);
        this.planes = new Repository<PlaneData>("planes", this.data.id);
        this._online = false;
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
            this._online = false;    
        }
    }

    // will be used to send events and to issue commands
    async sendMessage(targetBookId: string, fullPayload: any) {
        return await this.handlers.message(targetBookId, fullPayload);
    }

    async receiveConnection(peerBookId: string) {
        // move all my guests on this book (back from limbo)
    }
    async receiveDisconnect(peerBookId: string) {
        // remove all my guests from the book, put them into their limbo
    }
    async receiveMessage(fromBookId: string, fullPayload: any) {
        // incoming events regarding my guests that are visiting that book
        // incoming commands from guests from that book that are visiting ours
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