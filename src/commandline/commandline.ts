import readline from 'readline-promise'
import { script } from "./script"
import * as baseCommands from "./base"

const chalk = require('chalk');
const splitargs = require('splitargs');


export function init(exitHandler) {
        baseCommands.setup();
        register("test", function(params) { console.log(params) })
        register("exit", function() { 
            ok("Exit.")
            exitHandler();
        })
        script().then(commandInput);

}


export function commandInput() {
    const rl = readline.createInterface({
        terminal: true,
        input: process.stdin,
        output: process.stdout,
    });
    async function handleCommand(input?: string) {
        if (input) await parseCommand(input);
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


const commands: Record<string, any> = {}

export function register(command: string, handler: any) {
    commands[command] = handler;
}

export function call(commandString) {
    return parseCommand(commandString);
}


async function parseCommand(input: string) {
    for (let command in commands) {
        if (command == input || command+" " == input.substr(0, command.length+1)) {
            return commands[command](parseParams(input.substr(command.length+1)));
        }
    }
    error(`Unknown command: ${input}`)
}
function parseParams(paramString) {
    const params = splitargs(paramString);
    return params;
}