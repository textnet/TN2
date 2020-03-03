import { config }  from "../config"
import { PlanetData, ConsoleData } from "../model/interfaces";
import { Repository } from "../storage/repo";
import { createPlanetId, PlanetServer } from "../model/planet"


export class NodeServer {
    planets: Repository<PlanetData>;
    consoles: Repository<ConsoleData>;
    planetServers: PlanetServer[];

    constructor() {
        this.planets  = new Repository<PlanetData>("planets");
        this.consoles = new Repository<ConsoleData>("consoles");
        this.planetServers = [];
    }

    async start() {
        // start up all planet servers
        const data = await this.planets.all();
        for (let id in data) {
            const server = new PlanetServer(this, data[id]);
            await server.online();
            this.planetServers.push(server)
        }
    }
    async finish() {
        for (let server of this.planetServers) {
            await server.offline();
        }
        await this.planets.free();
    }

    // planet creation
    async createPlanet(id?: string) {
        const data: PlanetData = {
            id: id || createPlanetId(),
        }
        return this.planets.save(data);
        // TODO start PlanetServer!
        // TODO create Planet-Thing to represent this planet. Put it in its limbo (should be fun).
    }
    async destroyPlanet(id: string) {
        return this.planets.remove(id);
        // TODO stop PlanetServer!
    }
    async listPlanets() {
        return this.planets.all();
    }
    async reset() {
        // destroyPlanets one by one.
        // destroyConsoles one by one
        await this.planets.clear();
        await this.consoles.clear();
    }
    async loadPlanet(id: string) {
        return this.planets.load(id)
    }

    // console creation
    async createConsole(id?: string, thingId?: string) {
        const data: ConsoleData = {
            id: id || createPlanetId(), // NB: it is just a random id. TODO
            thingId: thingId,
        }
        return this.consoles.save(data);
    }
    async destroyConsole(id: string) {
        return this.consoles.remove(id);
    }
    async listConsoles() {
        return this.consoles.all();
    }
    async loadConsole(id: string) {
        return this.consoles.load(id)
    }
    async bindConsole(id: string, thingId: string) {
        const data = await this.loadConsole(id);
        data.thingId = thingId;
        return this.consoles.save(data)
    }
    async unbindConsole(id: string) {
        const data = await this.loadConsole(id);
        data.thingId = null;
        return this.consoles.save(data)
    }

}