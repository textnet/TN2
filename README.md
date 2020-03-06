# TN2 – 2nd Generation of Textnet.

This is an Excalibur+Electron prototype of the TXTNET.


## WORDS MATTER
* [x] rename Planets into Books
* [x] rename Nodes into Libraries

## Model: Things and Planes
* [ ] document physics and sprite approaches
* [ ] thing model with sprites and physics
* [ ] plane model
* [ ] thing templates
* [ ] create Planet-Thing and place it in the right place
* [ ] create thing command
* [ ] destroy thing command




## TODO: Interplanet operations:
- peer book goes offline: move all my guests to limbo
- peer book goes online: move guests back
- send message: event happens on the plane where are guests from other book
- send message: console/anima issues a command to my guest visiting another book



## Stages
1. (+) Library stub
2. (+) Naive books in the library
3. (+) Network of libraries (discovery, online, offline)
5. Things (create, destroy) — with Planes
6. Text consoles (connect, disconnect)
7. Text controls over things (A LOT OF WORK HERE: events, collisions, network communication)
8. Imagination Limbo (=off-book behaviour)
9. Anima (written word)
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

    create book <id>
    destroy book <id>
    online <bookId>
    offline <bookId>
    books

    create console <id> <thingId>
    destroy console <id>
    consoles

