import { config }  from "../config"
import { PlanetData, ConsoleData } from "../model/interfaces";
import { Repository } from "../storage/repo";
import { createPlanetId, PlanetServer } from "../model/planet"
import { ok, log, error, verboseLog } from "../commandline/commandline"


export class NodeServer {
    planets: Repository<PlanetData>;
    consoles: Repository<ConsoleData>;
    planetServers: Record<string, PlanetServer>;

    constructor() {
        this.planets  = new Repository<PlanetData>("planets");
        this.consoles = new Repository<ConsoleData>("consoles");
        this.planetServers = {};
    }

    async start() {
        // start up all planet servers
        const data = await this.planets.all();
        for (let id in data) {
            await this.startPlanet(data[id]);
        }
        ok("Node started.")
    }
    async finish() {
        for (let id in this.planetServers) {
            const server = this.planetServers[id];
            await server.offline();
        }
        await this.planets.free();
    }

    // planet creation
    async startPlanet(data: PlanetData) {
        const server = new PlanetServer(this, data);
        await server.online();
        this.planetServers[data.id] = server;
        verboseLog(`Planet(${data.id}) started.`)
    }
    async createPlanet(id?: string) {
        const data: PlanetData = {
            id: id || createPlanetId(),
        }
        const result = await this.planets.save(data);
        await this.startPlanet(data)
        return result;
        // TODO create Planet-Thing to represent this planet. Put it in its limbo (should be fun).
    }
    async destroyPlanet(id: string) {
        if (this.planetServers[id]) {
            await this.planetServers[id].offline();
        }
        return this.planets.remove(id);
    }
    async listPlanets() {
        return this.planets.all();
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