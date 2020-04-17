
const setupDefault = [`
create book Indiana
create thing Piano as Piano in Indiana @ 200 200
copy Indiana.Piano to GrandPiano @ 400 200
observe Indiana.Piano

create book Matrix
create thing Chest as Chest in Matrix @ 100 100
observe Matrix.Chest

create thing Player as Jones in Indiana @ 100 200
create console P1 Indiana.Player
-- gui P1
-- bind P1
-- unbind

-- offline Indiana
`, /* ---------- written ---------- */ `
-- teleport{thing="Indiana.Player", to="Matrix"}
-- function f(event)
--     debug{log=event}
-- end
-- key = on{event="enter", role="observer", handler=f}
-- teleport{thing="Bible.X", to="Alphabet"}
-- say{what="Hello, world!"}
-- debug{list="things"}
`];

const _remainder = `
things in Indiana

create console P1 Indiana.Player
bind P1
gui P1


inspect Indiana.*
inspect Indiana.* from Matrix

create book Bible
destroy book Bible

destroy thing Chest

bind P1
unbind

where Player
where Piano
where Chest

player move right 10
player kneel

exit

`