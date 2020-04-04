
export interface Debug {
    verboseConsole: boolean;
    forceOffline:   boolean;
    gui:            boolean;
    skipTitle:      boolean;
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
    macTitle: number;
    planeTitle: {
        height: number;    // height of the plane title
        fontSize: number;  // font size for the title
        fontFamily: string;
    }
}


export interface Configuration {
    version: string;
    debug:   Debug;
    network: Network;
    gui:     GUI;
}
export const config: Configuration = {} as Configuration;



// Actual configuration
config.version = "1";

config.debug = {} as Debug;
config.debug.forceOffline = true;
config.debug.verboseConsole = true;
config.debug.gui = true;
config.debug.skipTitle = true;

config.network = {} as Network;
config.network.discoveryChannel = `Cybermonks:TN2:${config.version}:discovery`;

config.gui = {} as GUI;
config.gui.width  = 1000;
config.gui.height = 400;
config.gui.padding = { horizontal: 50, vertical: 50 };
config.gui.macTitle = 26;
config.gui.planeTitle = { height: 24, fontSize: 16, fontFamily: "Nanum Gothic Coding, monospace" };
