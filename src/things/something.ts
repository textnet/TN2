import { ThingTemplate } from "../model/interfaces"

const name = "Something";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "🔮",
            size: { w: 30, h: 30 },
            base64: `iVBORw0KGgoAAAANSUhEUgAAADwAAAAeCAYAAABwmH1PAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAPKADAAQAAAABAAAAHgAAAAAw3pU4AAAIQklEQVRYCdVZW2xcRxn+58zevev1NU5dxzQBVCcgCK7oQwBRlVQNEB4ocav2FYRS3voCVAWxCNo+9KFvpQ/wCqIORUIRUBGVSkW8IEpAtKECEtO0bja2Y693vbez5wzfN5uJjze2dy2c1vza3Zkzc+byzX+df5XsYTJG1PeloD4r4i3gm5UllZZhxS3XZMlUZNgcknlzVsaD70nBKCWmGxw7uNtL73U/gc7KjCfyET26IIlGUhKBlkTo+VrX4nbPQdo3XhgPdCDNZEOaC6PSFHk9mJHZcDvgew5wwRS8IyIxAm2mJaODerZl4rnQC9MAEvOU4CBEQoOPkZYXerWY8suBTlUSNakS+BsirYIqhJsxas8AXufqRCJdzvelw3p/S7wB4BswnsmpUFICwJBZCxgbDyHALeNJXYWqLKJKWvzlmpdareVKayJvNzfj9p4ATLCvSEE3i5WkymXzvgmGPd8MizaDykhWjEoZZSjLYDD4DDJiMExCZZQvytSNkooKzAoal3QysWjKlVJiLNu4RwpBVMTfd8AOrCxIqqZlQOtgDCjGPDGDQNUHIAlwTxMs0UXF1MMpEDTgBziYJiRgLRS1jPZiEOhiOpAVGZV6FHQsOsH7UadxyoOzQTw7ENP+fojobZDZIehon1LKcrUNlEZ4IwEvcCoFgPhAHsTERIVxNOkYmF+TuOhiZXl2bKYuMhtwdOccG2fc4gnC9J1oFzb2w+hzr/W2gSolB6r5QeMHt4GH4wAwAmntwxwxgIAIr3N1PP6J49G55/2/nHPPGEf0NFQtAF7DuEUJvXkV1++uZErLb0i+QUO2Iw47oIfuHfuBW4il1SaUOwFOUZ4FKBoo34POWjGWoc3AOqDP//z5E+fPX7RLHz16SE4/dNrWCZwHAxnwwOo49tMHqeAZBNJo+ukg3zySkwAtfs8cJlgHdPCOjIzcmbOLLb5ZluW5qq1ffLn43V5Bv2BmdHLxYKYv7o36JjaJnd4O9uSxoUSUswTrgA59MCWZA9quVb0cyLV/1+U68N86bjtOQ7ebUI2SCc18qLy30s1YcWH09VpPgB3YD98/Joc/fUimBqbljv477cJzq2/KP1Zekwt/uCj/fKkovYL+vSmkgrVmPmjpCfjYSS+UUXAoDT7BQLXF2IGtja3KwcP7ZSozLQdS7XUv17Fu9TW5dOGKpIv95HYHaAVDZmqhJwvw1W+J1pdLWVnpCjgK9rFHnpDjtz9ggZ5750Vb8oegSb88e6Zn0GdXvj2oPDUK03sAUjGO4eAuxFFhi6Ao2K9/6jH5ZPYUm+VPlTO25A9Bk37z51/fBFohDoMR89Fdgqy/o6U1p5upq9sCjoL98slT8rXDj9sF3M8Xn7nLVh3X+dAr6N9d+9ZkoGP7TagmoL8jUe5GwX7+ri/IAyNPuCVt+civpm350aMHLdf50Am6LdptLsPyFyXw5sTTl+1p2tHb/BCQE2H3muMwdfjVn/zVAmUf3+2F/LiXxYHmoLsQ47b7caLM8TROFGMnwm5Ox+ErF8py7md/kzN//IXt4rvOoLGBc4GbECBYe2PSDE0Zj28J2HGXBoo6e/e+e4UgV/0VWz770yeFYB2xTl3muxxDA8c5XH9n6QUqBZ+TgDWN+Np1UaaBos4eyXzOivFauGzLZ19+SgjWEevUZb7LMTRwlBD20397CFpQjQF9jJePrm6J1vjBDz0q/fEBC/q+R+92a91U0nBNnZy2FtxZ7pteut6AjcBOGWD2ECav+1p2k1MT9/TJ/UPfkD5v0IL+0jNbr/v385dk6ti0teDnX4HbemjjqgxHQxXippXEAeyACLqTeCDORXX27dYzQXfS/sM54Xen1BUwRfWFf/3IivKPLzy9YX4HlHr7ma9+/EZfVNRvNHZUwFWoV/uWB27Dba4TfSv97EvXnkNwvCwvLj653omaA0qjdfzhj93o4xiO7SReNGC1A96htxRpBhDQQauL1E2CZtlJBHti8mHbPHWy7ZMpzt38cahNHTYUwYHyeQFAhMRdKQYQjKBOP/7NE9RNkeesjnauS7D3DV1f91jbJzMQeerpdX/MOXGwjKFbgIK7czzoymEuRN0k0SA5rvJ5M066d9m/HcX9sIJDLYeI8QHVgqYrcWPIKQYVJBokx1U+R40Wn0l8N8pdztU+SGlhnRoTBcmw0T20dNaaURZ9MclFVvYBP669Vx/McTsJPOiLSeQ4DZSjU8e+YqudPpiN0cADGOaNeHMML7cNPNzEUdAUYXI6Su4A3ovQcsO6tyK0dAs40HzezctDPJ7Y55lwEmHm+K28PPh+82pj5FK1Jw5HQbPubk2unQaKdRo619athILheliIp8vSH2s1x0V7E7i874PdymLshruwCyTcrYlzU195YWA9elOyxg8xNOxVBW7+qgTh261YYr6Wk9UZKfhbWmlO1EkOELi9ocu1b2js8sA8UwGW8wgSbkgALCIBYDMVCAjRY/pgvgAafEdQ4gDZ+28kqHDtXKodO9PNGZsAgDVegtm6KshvlTOlNSQAYLw6Ipwue7wl3bwX54sfSCHFM+hSPHAlw9hahrendjzMuHhjNOY2Q6BtrlqwTOhV4eqWEL692wriV7RfWS6N/af+oPofUjxusd0oKdrMWO5mEk+DswS7WRJvRzq8GwA3m8OBdmnaoNEcAUuHkQoYgGhvm6b1mJtWUsP3/yNN6w6gbcT490o7Ea/DVl6LQvBu8kzEw26k8W4smpfGsw0qkMapeKJXAjErgRcr7flEvAPN0v3VklysJlOpTDoIWjnoaHa7v1pwDaxoHSvX69VaYyTT2O6vlv8CupkHTC8LM/kAAAAASUVORK5CYII=`,
            steps: 2,
        },
        physics: {
            box: { w: 30, h: 20, anchor: { x: 0, y: 6 } },
            mass:  { mass: 10 },
            Z: 100, // on top of everything, temp
        },
        planes: {}
    },
    plane: {
        id: "<planetId>",
        ownerId: "<ownerId>",
        things: {},
        text: "",
    }
}
