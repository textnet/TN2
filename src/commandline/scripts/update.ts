/*
 * To test updates
 */
export const setup = [
`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
bind P1
`,`

-- update{thing="Indiana.*", name="Test name", format="txt", spawn={x=10; y=20} }
-- update_color{thing="Indiana.*", color="floor", value="#1E76EC"}
-- update_constraint{thing="Indiana.Piano", constraint="passable", value=true}

-- update_physics{thing="Indiana.Player", speed=200, width=20, height=50}
-- update_physics{thing="Indiana.*", plane="material", friction=50}
-- update_physics{thing="Indiana.Piano", mass="neutron", value=100}
-- update_physics{thing="Indiana.Player", force="neutron", value=200}
-- update_physics{thing="Indiana.*", plane="material", gravity="neutron", value=10, direction="down", minimal=50, maximal=100}
-- update_seasons{thing="Indiana.*", plane="material", season="day", times={ 30000; 30000 }, names={"Day"; "Night"}}

-- /inspect Indiana.Player
-- /inspect Indiana.Player.material
-- /inspect Indiana.Piano
`];
