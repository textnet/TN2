import { ThingTemplate } from "../model/interfaces"

const name = "Slot";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "📥",
            size: { w: 42, h: 42 },
            base64: `iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAYAAADFw8lbAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKqADAAQAAAABAAAAKgAAAADUGqULAAABa0lEQVRYCe2ZwUrDQBCG/002SdNQCKIIIorPpRffy1Nv4jP0EfoIopcWDyriwZbGdN0/JTdhmJMrzAZy+TPw8c3kMuuWi4dwdHaJPC8QkNZxEafvd3hfP8MT8vrmFpvNF7Isg+PDLxI4IQQ0TYP5/A6eJgl5cdqiKj0KnyOPwKmcp5ePodue7aZJQp60MzR1hbLwSXDuug6vn9thJAcitpsmCdnOakzKIgnQbQQdWQ6gcSbZbppkMKkiaAqDmjl4fxjD33scIVP4n8gwcqTz1wjDZqCCIHVsRtXKhAIzKghSx2ZUrUwoMKOCIHVsRtXKhAIzKghSx2ZUrUwoMKOCIHVsRtXKhAIzKghSx2ZUrUwoMKOCIHVsRtXKhAIzKghSx//DaNzfey5KefvAw50519GIm95xgToEf/Ta78Owv3cE5T0Or0h4+8DFPlfjXEenAEp99XSK776DWy7uw/H5VXoXYpGSJgn5tnrEDzBgTcMVMubsAAAAAElFTkSuQmCC`,
        },
        physics: {
            box: { w: 42, h: 42 }, 
            slot: true,
            Z: -1,
        },
        constraints: {
            passable:  true,
            pickable:  false,
            pushable:  false,
            enterable: false,
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


