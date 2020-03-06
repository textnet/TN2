


export interface BookData {
    id: string;
}

export interface ConsoleData {
    id: string;
    thingId?: string;
}

export interface ThingData {
    id: string;
    hostPlaneId: string;
    name: string;
    planes: Record<string, PlaneData>;
}

export interface PlaneData {
    id: string;
    ownerId: string;
    things: Record<string, Position>;
}


export interface Position {
    x: number;
    y: number;
    direction: Direction;
}

export interface Direction {
    dx: number;
    dy: number;
}