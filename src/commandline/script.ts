import { ok, error, log, register, call } from "./commandline";

export async function script(node) {
    const lines = setupScript.split("\n");
    for (let line of lines) {
        line = line.replace(/^\s+/, "").replace(/\s+$/, "");
        if (line != "") {
            await call(node, line);
        }
    }
}

const setupScript = `
reset

create planet Earth
create thing Chair1 @ Earth "chair" 100 50
create thing Chair2 @ Earth "chair" 50  50
create thing Player @ Earth "professor" 100 100
create thing WrongChair @ Earth "chair" 50 150

create planet Mars
create thing Chair @ Mars "chair" 200 100

create planet Saturn
destroy planet Saturn
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