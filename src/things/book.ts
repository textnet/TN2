import { ThingTemplate } from "../model/interfaces"

const name = "Book";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "📗",
            size: { w: 32, h: 32 },
        },
        physics: {
            box: { w: 32, h: 32 },
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
    },
    equipment: {
        id: "<equipId>",
        ownerId: "<ownerId>",
        things: {},
        text: "",
    }
}

// TODO move to commands somewhere
template.plane.text = `
Welcome to Textnet Game v.2.0!
==============================
The game is a sandbox where you can alter everything you see.
Move your character with cursor keys.
Use <Shift> to push objects while you move, e.g. chairs:
Use <Alt> to pick objects up and to put them back down.
Dive into objects by coming close to them and moving in while holding <Ctrl>.
Last but not least, hit <Ctrl-Enter> to alter this text.
Yes, this text is a fine example of what this game is about. Not only you can alter it, but you can also make this text affect the game. It is called *Written Word*, and it goes like this:

    print("Initialised Written Word of the book")
    self{ name="Indiana Jones and Textbook of Honour" }
    physics{ thing="Indiana.Player", speed=150 }
    local everything = get_things{}
    for i = 0, #everything-1 do
        print ("Thing: "..everything[i].name)
    end
    function welcome(event)
        print("Welcome "..event.object.name.."!")
    end
    on{ event="enter", role="host", handler=welcome }

You see, once you indented a block of text by a couple spaces, it becomes a chunk of *Written Word*. Written word is LUA with some special sauce.

Currently, there is no special sauce, as there are no more objects than those two sad chairs. There is no *Spoken Word* yet either. And for sure, there are no Gods.
I bet you were hoping to find god inside here.

Not just yet, chap.

P.S.
Here is a simple way to transfer any parameters around:
#health 100
`;
