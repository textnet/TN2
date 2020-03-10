import { config }  from "../config"
import { BookData, ConsoleData } from "./interfaces";
import { Repository } from "../storage/repo";
import { BookServer } from "./book"
import { createFromTemplate, TEMPLATE_BOOK } from "./create"
import { createBookId } from "./identity"
import { ok, log, error, verboseLog } from "../commandline/commandline"


export class LibraryServer {
    books: Repository<BookData>;
    consoles: Repository<ConsoleData>;
    bookServers: Record<string, BookServer>;

    constructor() {
        this.books  = new Repository<BookData>("books", "library");
        this.consoles = new Repository<ConsoleData>("consoles", "library");
        this.bookServers = {};
    }

    async start() {
        // start up all book servers
        const data = await this.books.all();
        for (let id in data) {
            await this.startBook(data[id]);
        }
        ok("Library started.")
    }
    async finish() {
        for (let id in this.bookServers) {
            const server = this.bookServers[id];
            await server.offline();
        }
        await this.books.free();
    }

    // book creation
    async startBook(data: BookData) {
        const server = new BookServer(this, data);
        await server.online();
        this.bookServers[data.id] = server;
        verboseLog(`Book(${data.id}) started.`)
    }
    async createBook(id?: string) {
        const data: BookData = {
            id: id || createBookId(),
        }
        const tempServer = new BookServer(this, data);
        const thing = await createFromTemplate(tempServer, TEMPLATE_BOOK, "*");
        data["thingId"] = thing.id;
        await this.books.save(data);
        await this.startBook(data)
    }
    async updateBook(data: BookData) {
        return await this.books.save(data);
    }
    async destroyBook(id: string) {
        if (this.bookServers[id]) {
            await this.bookServers[id].offline();
            // TODO destroy all things and planes
            delete this.bookServers[id];
        }
        return this.books.remove(id);
    }
    async listBooks() {
        return this.books.all();
    }
    async loadBook(id: string) {
        return this.books.load(id)
    }

    // console creation
    async createConsole(id?: string, thingId?: string) {
        const data: ConsoleData = {
            id: id || createBookId(), // NB: it is just a random id. TODO
            thingId: thingId,
        }
        return this.consoles.save(data);
    }
    async destroyConsole(id: string) {
        return this.consoles.remove(id);
    }
    async listConsoles() {
        return this.consoles.all();
    }
    async loadConsole(id: string) {
        return this.consoles.load(id)
    }
    async bindConsole(id: string, thingId: string) {
        const data = await this.loadConsole(id);
        data.thingId = thingId;
        return this.consoles.save(data)
    }
    async unbindConsole(id: string) {
        const data = await this.loadConsole(id);
        data.thingId = null;
        return this.consoles.save(data)
    }

}