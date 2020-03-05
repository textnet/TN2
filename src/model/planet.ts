import * as crypto from "crypto";
import { PlanetData, ThingData, PlaneData } from "./interfaces"
import { NodeServer } from "../network/node"
import { Repository } from "../storage/repo"
import * as network from "../network/discovery"
import { log, error, ok, verboseLog } from "../commandline/commandline"

export function getPlanetId(id: string) {
    return id.split(".")[0]
}
export function createPlanetId() {
    return crypto.randomBytes(32).toString('hex')
}


// serves a planet
export class PlanetServer {
    data: PlanetData; // NB: planet data is static!
    node: NodeServer;

    things: Repository<ThingData>;
    planes: Repository<PlaneData>;

    handlers: network.NetworkHandlers;

    _online: boolean;

    constructor(node: NodeServer, data: PlanetData) {
        this.data = data;
        this.node = node;
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
    async sendMessage(targetPlanetId: string, fullPayload: any) {
        return await this.handlers.message(targetPlanetId, fullPayload);
    }

    async receiveConnection(peerPlanetId: string) {
        // move all my guests on this planet (back from limbo)
    }
    async receiveDisconnect(peerPlanetId: string) {
        // remove all my guests from the planet, put them into their limbo
    }
    async receiveMessage(fromPlanetId: string, fullPayload: any) {
        // incoming events regarding my guests that are visiting that planet
        // incoming commands from guests from that planet that are visiting ours
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