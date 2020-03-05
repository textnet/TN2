import readline from 'readline-promise'
import { script } from "./script"
import * as baseCommands from "./base"
import { NodeServer } from "../network/node"
import { config } from "../config"

const chalk = require('chalk');
const splitargs = require('splitargs');


export function init(node: NodeServer, exitHandler) {
        baseCommands.setup();
        register("test", function(n, params) { console.log(params) })
        register("exit", async function(n, params) { 
            ok("Exit.")
            await exitHandler();
        })
        script(node).then(()=>{ commandInput(node) });
}


export function commandInput(node: NodeServer,) {
    const rl = readline.createInterface({
        terminal: true,
        input: process.stdin,
        output: process.stdout,
    });
    async function handleCommand(input?: string) {
        if (input) await parseCommand(node, input);
        rl.questionAsync(':) ').then(handleCommand);
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

export function verboseLog(what) {
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

export function register(command: string, handler: any) {
    commands[command] = handler;
}

export function call(node: NodeServer, commandString) {
    return parseCommand(node, commandString);
}


async function parseCommand(node, input: string) {
    for (let command in commands) {
        if (command == input || command+" " == input.substr(0, command.length+1)) {
            message(`:) ${input}`);
            return commands[command](node, parseParams(input.substr(command.length+1)));
        }
    }
    error(`Unknown command: ${input}`)
}
function parseParams(paramString) {
    const params = splitargs(paramString);
    return params;
}