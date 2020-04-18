import { ok, error, log, register, call, message } from "./commandline";
import { getAnima } from "./written"
import { strip } from "../utils"

// import { setup } from "./scripts/minimal"
// import { setup } from "./scripts/limbo"
// import { setup } from "./scripts/movement"
import { setup } from "./scripts/push"


export async function script(library) {
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



