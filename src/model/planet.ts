import * as crypto from "crypto";
import { PlanetData } from "./interfaces"


export function getPlanetId(id: string) {
    return id.split(".")[0]
}
export function createPlanetId() {
    return crypto.randomBytes(32).toString('hex')
}