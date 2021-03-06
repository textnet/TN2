import readline from 'readline-promise'
import { script } from "./script"
import { LibraryServer } from "../model/library"
import { BookServer } from "../model/book"
import { config } from "../config"

import * as baseCommands from "./base"
import * as thingCommands from "./things"
import * as equipCommands from "./equipment"
import * as planeCommands from "./planes"
import * as written from "./written"
import * as print from "./print"

export const str = print.str;
export const debugEquipment = print.debugEquipment;


const chalk = require('chalk');
const splitargs = require('splitargs');


export interface CommandLineConfig {
    exitHandler?: any; 
    gui?: any;
}

let _config: CommandLineConfig;
export function getConfig() { return _config };

export function init(library: LibraryServer, config: CommandLineConfig) {
    _config = config;    
    baseCommands.setup();
    thingCommands.setup();
    equipCommands.setup();
    planeCommands.setup();
    print.setup();
    register("test", function(n, params) { console.log(params) })
    register("exit", async function(n, params) { 
        ok("Finalizing...")
        await config["exitHandler"]();
    })
    script(library).then(()=>{ commandInput(library) });
}


export function commandInput(library: LibraryServer,) {
    const rl = readline.createInterface({
        terminal: true,
        input: process.stdin,
        output: process.stdout,
    });
    async function handleCommand(input?: string) {
        const anima = written.getAnima();
        const prefix = anima?((await anima.str())+"\n:) "):">> ";
        if (input) {
            if (anima) {
                if (input[0] == "/") {
                    await parseCommand(library, input.substr(1));
                } else {
                    await anima.prepareMemory()
                    await anima.call(input)
                }
            } else {
                await parseCommand(library, input);    
            }
        }
        rl.questionAsync(prefix).then(handleCommand);
    }

    handleCommand();
}


export function ok(what) {
    console.log(chalk.green(">> "+what))
}
export function error(what) {
    console.log(chalk.red(">> "+what))
}
export function log(what) {
    console.log(chalk.yellow(">> "+what))
}

export function verboseLog(what, whatwhat?) {
    if (whatwhat) {
        const B = (what.B || what) as BookServer;
        return verboseLog(`Book(${B.id()}) ${whatwhat}`)
    }
    if (config.debug.verboseConsole) {
        console.log(chalk.grey(">> "+what))
    }
}

export function message(what) {
    if (config.debug.verboseConsole) {
        console.log(chalk.blue(">> "+what))
    }
}


const commands: Record<string, any> = {}

export function register(command: string, handler: any, paramsRe?: RegExp, mapping?: string[]) {
    commands[command] = { handler: handler, paramsRe: paramsRe, mapping:mapping };
}

export function call(library: LibraryServer, commandString) {
    return parseCommand(library, commandString);
}

export function mapParams(params, mapping) {
    const result = {};
    for (let i in mapping) {
        if (i == params.length) break;
        result[mapping[i]] = params[i]
    }
    return result;
}


async function parseCommand(library, input: string) {
    for (let command in commands) {
        if (command == input || command+" " == input.substr(0, command.length+1)) {
            message(`${input}`);
            if (commands[command]["paramsRe"]) {
                const re = commands[command]["paramsRe"] as RegExp;
                const h  = commands[command]["handler"];
                const map = commands[command]["mapping"];
                const paramsList = input.substr(command.length+1).match(re).splice(1) || []; 
                return h(library, mapParams(paramsList, map));    
            } else {
                return commands[command]["handler"](library, parseParams(input.substr(command.length+1)));    
            }
            
        }
    }
    error(`Unknown command: ${input}`)
}
function parseParams(paramString) {
    const params = splitargs(paramString);
    return params;
}