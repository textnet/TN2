


export interface Planet {
    id: string;
}

export interface Console {
    id: string;
    thingId?: string;
}

export interface Thing {
    id: string;
    hostPlaneId: string;
    name: string;
    planes: Record<string, Plane>;
}

export interface Plane {
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