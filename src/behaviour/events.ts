import { BookServer } from "../model/book"
import { getBookId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"


// Events. And commands


export interface Event {
    name: string;
}

// export interface RemoteEvent {}
// export interface Payload {
//     event: string,
//     data:  RemoteEvent,
// }

// // --------------------------------------------------------------
// export interface Load extends RemoteEvent {
//     prefix: string,
//     id:     string,
// }
// export interface ArtifactEnter extends RemoteEvent {
//     artifactId: string,
//     worldId:    string,
// }