import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { Controller } from "../behaviour/controller"
import { Anima } from "./anima"

import * as written from "./written/detect"
const spirits = [ written ]

export async function animate(B: BookServer, thing: ThingData) {
    for (let spirit of spirits) {
        const anima: Anima = await spirit.capture(B, thing);
        if (anima) {
            await anima.animate();
        }
    }
}
