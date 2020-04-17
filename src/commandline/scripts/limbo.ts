/*
 * Check if Limbo works.
 */
export const setup = [

// Start up sequence of console commands
`
    -- 1. create two books with items: Indiana, Matrix  ==> ... 
    create book Indiana
    create thing Piano as Piano in Indiana @ 200 200
    create book Matrix
    create thing Chest as Chest in Matrix @ 100 100
    -- 2. Observe items there                           ==> (two windows)
    -- observe Indiana.Piano
    -- observe Matrix.Chest
    -- 3. Create player and bind it                     ==> Player visible in Indiana
    create thing Player as Jones in Indiana @ 100 200
    create console P1 Indiana.Player
    bind P1
    -- The rest is Written.
`
,
// Startup Written Word for the binded thing
`
    -- 4. Teleport player to Matrix                     ==> Player visible in Matrix
    teleport{thing="Indiana.Player", to="Matrix"}
    -- 5. The rest has to type.
    --     gui P1
    --     /offline Matrix                              ==> player is in Limbo, portal is UP
    --          - try to go through the portal          ==> nothing happens
    --     online Matrix                                ==> player is in Limbo, portal is DOWN
    --     offline Matrix                               ==> player is in Limbo, portal is UP
    --     online Matrix                                ==> player is in Limbo, portal is DOWN
    --          - try to go through the portal          ==> back to Matrix
    --     offline Matrix 
    --     observe Indiana.Piano
    --          - close P1 window
    --     online Matrix
    --     gui P1                                       ==> player in Matrix
`
];
