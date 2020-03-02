import { ok, error, log, register, call } from "./commandLine";

export async function script() {
    const lines = setupScript.split("\n");
    for (let line of lines) {
        line = line.replace(/^\s+/, "").replace(/\s+$/, "");
        if (line != "") {
            await call(line);
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

create console Player
connect Player
disconnect

where Chair1
where Player

player move right 10
player kneel

`