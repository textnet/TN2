import { config }  from "../config"
import { PlanetData } from "../model/interfaces";
import { Repository } from "../storage/repo";
import { createPlanetId } from "../model/planet"


export class NodeServer {
    planets: Repository<PlanetData>;

    constructor() {
        this.planets = new Repository<PlanetData>("planets");
    }

    async start() {}
    async finish() {
        await this.planets.free();
    }


    async createPlanet(id?: string) {
        const data: PlanetData = {
            id: id || createPlanetId(),
        }
        return this.planets.save(data);
        // TODO create Planet-Thing to represent this planet. Put it in its limbo (should be fun).
    }
    async destroyPlanet(id: string) {
        return this.planets.remove(id);
    }
    async listPlanets() {
        return this.planets.all();
    }
    async reset() {
        return this.planets.clear();
    }
    async loadPlanet(id: string) {
        return this.planets.load(id)
    }

}