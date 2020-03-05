# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.


## Boilerplate
* [x] storage abstraction
* [x] basic Node: create/destroy naive planets
* [x] basic Node: create/destroy consoles (w/o binding)
* [x] basic Node: create/destroy ALL consoles: one by one
* [x] basic Node: put a planet online once created
* [x] basic Node: put a planet offline before destroying
* [x] network layer for Planets: trace output
* [x] network layer for Planets: make sure it works
* [x] wait permission: make sure it works in Electron
* [x] make sure stuff is saved and loaded


## TODO: Interplanet operations:
- peer planet goes offline: move all my guests to limbo
- peer planet goes online: move guests back
- send message: event happens on the plane where are guests from other planets
- send message: console/anima issues a command to my guest visiting another planet



## Stages
1. Node stub
2. Planets on the node
3. Network of planets (discovery, online, offline)
5. Things (create, destroy) — with Planes
6. Consoles (create, destroy, connect, disconnect)
7. Text commands
8. Limbo
9. Anima
10. GUI


## Old things
    npm install   -- after cloning the repo
    ./start.sh    -- to enter the debug cycle
    yarn dist     -- to make distro package

# Until found a way to split into to different builders
### Before launching Electron
    ./node_modules/.bin/electron-rebuild
### Before launching Headless


## Console commands supported
    exit
    network
    create planet <id>
    destroy planet <id>
    planets
    create console <id> <thingId>
    destroy console <id>
    consoles

