/*
 * Test movement
 */
export const setup = [

// Start up sequence of console commands
`
create book Indiana
create thing Piano as Piano in Indiana @ 100 100
create console P0 Indiana.Piano
gui P0

create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
bind P1

`
,
// Startup Written Word for the binded thing
`
-- move_to{x=500,   y=200}
-- move_to{x=200,   y=100}
-- move_by{dx=-500, dy=10}
-- move_by{direction="DOWN", distance=100}

`
];


