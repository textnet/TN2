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
create book Alphabet
create book Bible
create thing X
create thing Player in Alphabet
copy Alphabet.X to Z

things in Alphabet
planes in Bible.*

create console P1 Alphabet.Player
consoles

bind P1

`;

const setupWritten = `
function f(event)
    debug{log=event}
end
-- key = on{event="enter", role="observer", handler=f}
-- teleport{thing="Bible.X", to="Alphabet"}
teleport{to="Bible"}
say{what="Hello, world!"}
`;


const remainder = `
inspect Alphabet.*
inspect Alphabet.* from Bible


create book Earth
create book Mars

create book Saturn
destroy book Saturn


exit

create thing Chair1 @ Earth "chair" 100 50
create thing Chair2 @ Earth "chair" 50  50
create thing Player @ Earth "professor" 100 100
create thing WrongChair @ Earth "chair" 50 150
create thing Chair @ Mars "chair" 200 100
destroy thing WrongChair

create console C1
bind C1 Player
connect C1
disconnect

where Chair1
where Player

connect C1
player move right 10
player kneel

`