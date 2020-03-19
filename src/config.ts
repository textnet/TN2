
export interface Debug {
    verboseConsole: boolean;
    forceOffline:   boolean;
    gui:            boolean;
}
export interface Network {
    discoveryChannel: string;
}
export interface GUI {
    width:    number;
    height:   number;
    padding: {
        horizontal: number;
        vertical:   number;
    }
}


export interface Configuration {
    version: string;
    debug:   Debug;
    network: Network;
    gui:     GUI;
}
export const config: Configuration = {} as Configuration;



// Actiual configuration
config.version = "1";

config.debug = {} as Debug;
config.debug.forceOffline = true;
config.debug.verboseConsole = true;
config.debug.gui = true;

config.network = {} as Network;
config.network.discoveryChannel = `Cybermonks:TN2:${config.version}:discovery`;

config.gui = {} as GUI;
config.gui.width  = 800;
config.gui.height = 600;
config.gui.padding = { horizontal: 100, vertical: 100 };