import { BookServer } from "../../model/book"
import { ThingData, PlaneData } from "../../model/interfaces"
import { Anima } from "../anima"


export class WrittenAnima extends Anima {

    async animate() {
        await super.animate()
        // create environment
        // run code
        // check if we have event subscriptions, if not — terminate
    }

    async terminate() {
        await super.terminate()
        // demolish the environment
    }
}

export async function capture(B: BookServer, thing: ThingData) {
    // check if we have anima and setup if we have it
    return undefined;
}