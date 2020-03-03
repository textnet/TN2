import * as crypto from "crypto";
import { PlanetData, ThingData, PlaneData } from "./interfaces"
import { NodeServer } from "../network/node"
import { Repository } from "../storage/repo"

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

    constructor(node: NodeServer, data: PlanetData) {
        this.data = data;
        this.things = new Repository<ThingData>("things", this.data.id);
        this.planes = new Repository<PlaneData>("planes", this.data.id);
    }

    connect() {}
    disconnect() {}

}