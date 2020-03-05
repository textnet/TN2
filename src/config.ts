
export interface Debug {
    verboseConsole: boolean;
    forceOffline:   boolean;
}

export interface Network {
    discoveryChannel: string;
}

export interface Configuration {
    version: string;
    debug:   Debug;
    network: Network;
}

export const config: Configuration = {} as Configuration;


// Actiual configuration
config.version = "1";

config.debug = {} as Debug;
config.debug.forceOffline = false;
config.debug.verboseConsole = true;

config.network = {} as Network;
config.network.discoveryChannel = `Cybermonks:TN2:${config.version}:discovery`;
