import { ok, error, log, register, call, message } from "./commandline";
import { getAnima } from "./written"
import { strip } from "../utils"

export async function script(library) {

    const setup = setupMinimal;

    const setupScript  = setup[0];
    const setupWritten = setup[1];
    const lines = setupScript.split("\n");
    for (let line of lines) {
        line = line.replace(/^\s+/, "").replace(/\s+$/, "");
        if (line != "" && line.substr(0,2) != "--") {
            await call(library, line);
        }
    }
    const anima = getAnima();
    if (anima) {
        message(`Anima Written Word:${setupWritten}`)
        await anima.call(strip(setupWritten));
    }
    
}


const setupMinimal = [`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
gui P1
`, /* ---------- written ---------- */ `
`];

const setupLimboTest = [`
    -- 1. create two books with items: Indiana, Matrix  ==> ... 
    create book Indiana
    create thing Piano as Piano in Indiana @ 200 200
    create book Matrix
    create thing Chest as Chest in Matrix @ 100 100
    -- 2. Observe items there                           ==> (two windows)
    -- observe Indiana.Piano
    -- observe Matrix.Chest
    -- 3. Create player and bind it                     ==> Player visible in Indiana
    create thing Player as Jones in Indiana @ 100 200
    create console P1 Indiana.Player
    bind P1
    -- The rest is Written.
`, /* ---------- written ---------- */ `
    -- 4. Teleport player to Matrix                     ==> Player visible in Matrix
    teleport{thing="Indiana.Player", to="Matrix"}
    -- 5. The rest has to type.
    --     gui P1
    --     /offline Matrix                              ==> player is in Limbo, portal is UP
    --          - try to go through the portal          ==> nothing happens
    --     online Matrix                                ==> player is in Limbo, portal is DOWN
    --     offline Matrix                               ==> player is in Limbo, portal is UP
    --     online Matrix                                ==> player is in Limbo, portal is DOWN
    --          - try to go through the portal          ==> back to Matrix
    --     offline Matrix 
    --     observe Indiana.Piano
    --          - close P1 window
    --     online Matrix
    --     gui P1                                       ==> player in Matrix
`];



const setupDefault = [`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
copy Indiana.Piano to GrandPiano @ 400 200
observe Indiana.Piano

create book Matrix
create thing Chest as Chest in Matrix @ 100 100
observe Matrix.Chest

create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
-- gui P1
-- bind P1
-- unbind

-- offline Indiana
`, /* ---------- written ---------- */ `
-- teleport{thing="Indiana.Player", to="Matrix"}
-- function f(event)
--     debug{log=event}
-- end
-- key = on{event="enter", role="observer", handler=f}
-- teleport{thing="Bible.X", to="Alphabet"}
-- say{what="Hello, world!"}
-- debug{list="things"}
`];

const _remainder = `
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