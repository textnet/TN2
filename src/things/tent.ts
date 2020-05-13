import { ThingTemplate } from "../model/interfaces"

const name = "Tent";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "⛺",
            size: { w: 150, h: 160 },
            base64: `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`,
        },
        physics: {
            box: { w: 146, h: 110, anchor: { x: 0, y: 25 } },
            mass:  { mass: 100 },
        },
        planes: {},
        equipment: {
            thingSprite: {
                symbol: "🧻",
                size: { w: 22, h: 50 },
                base64: `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`,
            },
        },
    },
    plane: {
        id: "<planetId>",
        ownerId: "<ownerId>",
        things: {},
        text: "",
    }
}


