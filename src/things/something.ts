import { ThingTemplate } from "../model/interfaces"

const name = "Something";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "?",
            size: { w: 32, h: 32 },
        },
        physics: {
            box: { w: 32, h: 32 },
            Z: 0,
            mass:  { mass: 100 },
            force: { mass: 100 },
        },
        planes: {}
    },
    plane: {
        id: "<planetId>",
        ownerId: "<ownerId>",
        things: {},
        text: "",
    }
}
