import { ok, error, log, register, call, message } from "./commandline";
import { getAnima } from "./written"
import { strip } from "../utils"

export async function script(library) {
    const lines = setupScript.split("\n");
    for (let line of lines) {
        line = line.replace(/^\s+/, "").replace(/\s+$/, "");
        if (line != "") {
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
create book Matrix
create thing Player as Jones in Indiana @ 100 200
create thing Piano as Piano in Indiana @ 200 200
create thing Chest as Chest in Indiana @ 300 200
copy Indiana.Piano to GrandPiano @ 400 200
create thing Something @ 500 200

things in Indiana

create console P1 Indiana.Player
gui P1
`;

const setupWritten = `
function f(event)
    debug{log=event}
end
-- key = on{event="enter", role="observer", handler=f}
-- teleport{thing="Bible.X", to="Alphabet"}
-- teleport{to="Bible"}
-- say{what="Hello, world!"}
-- debug{list="things"}
`;


const remainder = `

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