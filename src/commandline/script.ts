import { ok, error, log, register, call, message } from "./commandline";
import { getAnima } from "./written"
import { strip } from "../utils"

export async function script(library) {
    const lines = setupScript.split("\n");
    for (let line of lines) {
        line = line.replace(/^\s+/, "").replace(/\s+$/, "");
        if (line != "" && line.substr(0,2) != "--") {
            await call(library, line);
        }
    }
    const anima = getAnima();
    if (anima) {
        message(`Anima Written Word:\n${setupWritten}`)
        await anima.call(strip(setupWritten));
    }
    
}

const setupScript = `
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
copy Indiana.Piano to GrandPiano @ 400 200

create book Matrix
create thing Chest as Chest in Matrix @ 100 100

create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
bind P1
gui P1
observe Indiana.Piano
-- observe Matrix.Chest
-- inspect Indiana.*.material
`;

const setupWritten = `
teleport{thing="Indiana.Player", to="Matrix"}
`; `
-- function f(event)
--     debug{log=event}
-- end
-- key = on{event="enter", role="observer", handler=f}
-- teleport{thing="Bible.X", to="Alphabet"}
-- say{what="Hello, world!"}
-- debug{list="things"}

teleport{thing="Indiana.GrandPiano", to="Matrix"}
-- teleport{thing="Indiana.Player",     to="Matrix"}

`;


const remainder = `
things in Indiana

create console P1 Indiana.Player
bind P1
gui P1


inspect Indiana.*
inspect Indiana.* from Matrix

create book Bible
destroy book Bible

destroy thing Chest

bind P1
unbind

where Player
where Piano
where Chest

player move right 10
player kneel

exit

`