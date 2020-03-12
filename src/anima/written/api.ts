/**
 * Generic API to Fengari: setting up Lua State, registering functions, etc.
 */
import { config } from "../../config"

import { lua, lauxlib, ldebug, lualib, to_luastring, to_jsstring, LuaState } from "fengari-web"
import { push, luaopen_js, wrap, jscall } from "./interop"
import { supportedFunctions } from "./library"
import * as cl from "../../commandline/commandline"

/**
 * FengariMap is an interfact for Fengari Proxy wrapper which
 * allows easy access to data structures made inside Lua.
 * @see interop.ts:wrap()
 */
export interface FengariMap {
    get(key),
    set(key, value),
    has(key),
}

/**
 * Loads Lua code into Lua VM (defined by LuaState).
 * Required before using "fengari_call".
 * @param   {LuaState} L    
 * @param   {string}   code 
 * @returns {boolean} if code is loaded correctly (i.e. no syntax errors)
 */
export function fengari_load(L: LuaState, code:string) {
    const loadResult = lauxlib.luaL_loadstring(L, to_luastring(code));
    log(L, "luaL_loadstring", loadResult);
    return loadResult == lua.LUA_OK;
}

/**
 * Runs Lua code previously loaded into Lua VM (defined by LuaState).
 * Use in conjunction with "fengari_load".
 * @param   {LuaState} L    
 * @returns {boolean} - if code executed correctly (e.g. no runtime or OOM errors)
 */
export function fengari_call(L: LuaState) {
    const callResult = lua.lua_pcall(L, 0, 1, 0)
    log(L, "lua_pcall", callResult);
    return callResult == lua.LUA_OK;
}

/**
 * Runs Lua code previously loaded into Lua VM (defined by LuaState).
 * Use in conjunction with "fengari_load".
 * @param   {LuaState} L  
 * @param   {string}   call       - e.g. 'lua_pcall'
 * @param   {string}   callResult - error code (e.g. LUA_ERRMEM)
 */
function log(L: LuaState, call:string, callResult:string) {
    if (!config.debug.verboseConsole) return;
    const _log = (text) => {
        cl.error(`${call}: ${text}`);
        cl.error(to_jsstring(lauxlib.luaL_tolstring(L, -1)))
    };
    switch (callResult) {
        case lua.LUA_OK:        return;
        case lua.LUA_YIELD:     return _log("Yield is not supported");
        case lua.LUA_ERRMEM:    return _log("Out of memory");
        case lua.LUA_ERRERR:    return _log("WTF: Error of error");
        case lua.LUA_ERRGCMM:   return _log("Garbage issue");
        case lua.LUA_ERRSYNTAX: return _log("Syntax error" );
        case lua.LUA_ERRRUN:    return _log("Runtime error" );
    }
    return _log("Unknown Error")
}

/**
 * Registers a TypeScript function as a Lua function in global space.
 * Once done, the function can be called from Lua.
 * @param   {object}   CTX - context object to be provided into the
 *                           function as first parameter.
 *                           API is agnostic of the object type.
 * @param   {LuaState} L
 * @param   {string}   name      - Lua name for the function
 * @param   {string[]} signature - parameters to be extracted from Lua input;
 *                                 if false, the whole FengariMap will be passed.
 * @param   {function} f         - TypeScript function itself.
 */
export function fengari_register_function(CTX, L: LuaState, name: string, signature: string[], f)  {
    const fWrapper = function() {
        const argCount = lua.lua_gettop(L);
        const args = wrap(L, lua.lua_toproxy(L, 2));
        const params = [CTX];
        if (signature) {
            for (let paramName of signature) {
                params.push(args["get"](paramName));
            } 
        } else {
            params.push(args)
        }
        return f.apply(null, params);
    }
    // console.log("registered function: "+name+"("+signature.join(", ")+")")
    push(L, fWrapper);
    lua.lua_setglobal(L, to_luastring(name));
}

/**
 * Prepares Lua VM and registers all supported functions/
 * @param {object} CTX - context object to be provided into the
 *                       function as first parameter.
 *                       API is agnostic of the object type.
 * @returns {LuaState} of the VM.
 * @see library.ts for list of the supported functions.
 */
export function fengari_init(CTX) {
    // init ----------------------------------------------------------------
    const L = lauxlib.luaL_newstate();
    if (!L) {
        cl.error("luaL_newstate: out of memory")
        return;
    }
    lualib.luaL_openlibs(L);
    lauxlib.luaL_requiref(L, to_luastring("js"), luaopen_js, 1);
    lua.lua_pop(L, 1);
    // register functions ---------------------------------------------------
    for (let i in supportedFunctions) {
        fengari_register_function(CTX, L, i, supportedFunctions[i].signature, 
                                             supportedFunctions[i].f)
    }
    return L;
}

/**
 * Shuts down the VM.
 * @param   {LuaState} L
 */
export function fengari_free(L: LuaState) {
    lua.lua_close(L)
}