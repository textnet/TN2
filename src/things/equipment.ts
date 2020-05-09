import { ThingTemplate } from "../model/interfaces"

const name = "Equipment";

export const template: ThingTemplate = {
    name: name,
    thing: {
        id: "<thingId>",
        hostPlaneId: "<hostPlaneId>",
        name: name,
        colors: {}, // all default colors
        sprite: {
            symbol: "🎒",
            size: { w: 202, h: 320 },
            base64: `iVBORw0KGgoAAAANSUhEUgAAAMoAAAFACAYAAAD9OeOiAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAyqADAAQAAAABAAABQAAAAAAFrYWkAAAWUUlEQVR4Ae2d349kx1XHq3/Nj+7ddXa9IC/iYYwcJwFHEVkcGWd/ZLGiPMBbFKwkXtv8kAIC5R/Io/8HRABFrASxjGSJl0hIIIEcZERgEYjfeGWzfoi1ipRRshKz3pnupk51396aO31nqm9Vz61b9bnS7nT3rTp1zufcb1fd2933dJRS036/r/+wQQACywiMxxOlNdJXf/fvb6tOd1kTXoNA3gT2Hx6o55+5osxUMlYT9Z1//fO8iRA9BEoEuqqrvvCxXzGvztdcUzWdTkrNeAqBvAlMTfiz/2dC0Y8RSt4HBdEfJWAkMtPJbOmlZYJQjnLilcwJzDQy+5+lV+YHA+FXEzgqFP0KS69qYOzJk4ARykwts6WXXnipyWT5yXzV60p1VLfbMQRPavNo/6xP+bkYefRaOSnlPvb+ZT6U2y9rY9uQx8v7PPLJ3UbZMs/bTUC0Idv8ZF7OUcZHIpID5S+/9Zb6j7feObxP6+OZ6x9Tn//1a+YAP67NC69emdn47jumT/n5SjZsP+Y+vPDqNe3b3M9ijJf1mH+s/Z4/X2kMDxsyDls6BIxIppZQ5OFkyeVheU1Esr+/rw4ODhYE5PHo7Ei98GtXTL9lbaTx5uamuvHK88bG3t7e0ue2DWkjm3wIKmMU4xQ2bD9k39lzZ+UyhPqlVz67GGN7uK3Gk7F65+3/VXv/NxvTHsO2IWOVxxAfChv/+dYdVfht26jyU9qwpUVgvvKyrnotWXpN56/JwbS9vW0IyONuv6s+deNnley32wwGA9NGDvTiYCr2F/iWPReN/tz1p42Qut2u6Su27HGkv+2HGWMuhBs3f3Ex7v0f31fnz59X9+/fL4Y84mdVLNJB7IqNs2fPLvrLg1msbn4e6siT1hKYiWQxo8iyS5+jLFt6zWeZ4sA3776jkfrdP3pZB981fcozkbS1t7JdsWFvZr9eRl2/+Zy6+pVn1e9/7U/NbhGMPY68WPhR9De29FdvijHkuRzgIhIRQyFW2V/4WdhYFovYtW2I4Iqt8PPGK89pXz+jfu83/8TsEj+//q1XzePCj6IPf9tOYKYNiWJxVBcHkh1a8ZocPMW7sBwYcpB84tpTeln13OIAlH5bW1vmILXfjQsbsl/6ihBsMcl+mbj++tbb6r//9t3FPnscOTBlEz/MTKPtmE3/+eTnPn7Ih0IA0r/YzBhz0VfFUowhfaSNxFAITV6z47Afl/fJc7b0CBihyIwy1ev68mYvk+yDxhyM+hzlczefXSy9pK+8k4sI5K+00ZPOIbtlG8V+GUdEYu+Xx8U417562bgmz2U59jt/+NVDrk7mvhf7f/ubX1bf/Nobh3w4KZZDY2iRfeLqz5g3B7OEK8VR2FoW4yHHeNJqAnL+K9qQbT6jyNJLv62XN93m41efNOcOh3bpA+eZ6x+d9bHayLu4WfaMts3sIW3k6toqNpaNU9iQCwiLce2G8zGK/Uvbn+DHoT43PqqufvkX9EtTc9HiyJil8Zays/3jcYsJ6GTrrdPvd6d/889/pb7993/gF4zW2Vvf/kd9SfZdfTA/pa585dN+9ugNgYYJyLeHf/Xyb6jrP//52Ywis0uxnPDx7aoWh/yTLYQ9H1/oCwFfAjKXzFdeJyy9fEeiPwRaT2C29JqdzMtqfNk5SuuDJAAI1CdgZpR599nJvCy9EEp9ovRMkoCZS2YTyqOlV2f+QpIRExQE6hAwH8XNhNE3f/RHHi8///U6pugDgaQJPNz/0MSnvzyipvKJes+oJ+mYCQ4CKxMYT6bqww/3VWcw2Jj+2z99V73zve+sbIQOEEibQFc9+ekvqE9evipfImGDAAROIoBQTiLEfghoAgiFwwACDgQQigMkmkAAoXAMQMCBAEJxgEQTCCAUjgEIOBBAKA6QaAIBhMIxAAEHAgjFARJNIIBQOAYg4EAAoThAogkEEArHAAQcCCAUB0g0gQBC4RiAgAMBhOIAiSYQQCgcAxBwIIBQHCDRBAIIhWMAAg4EEIoDJJrkTUAqiCCUvI8BonckgFAcQdEsbwIIJe/8E70jAYTiCIpmeRNAKHnnn+gdCSAUR1A0y5sAQsk7/0TvSAChOIKiWd4E5lWB84bgH33s7zdLKj77B52VBYTime7xU19SO088rno9XUGjqIzpaTNY905HHRxM1d17u6p3541gZnM0hFC8st41Irn50otqb++B6urvOkht+k4njhlmqoU7Go3UrVuvq/fveAWafWeE4nkIyEwiIrlwaUcNNnRBpv5AdeTLQZFsu99/V/X78fgTCZaV3UAoKyMrddDv2jKTiEjOnL+otoZnVH+wUWrUzNOD/X2196MfxLckbAaH16gIxQvfrLMst2QmEZGMzl1Q/Y3NAFb9TYwfPlSDzS1/Q1goqgJDwoeAnJPIcktmEhHJ5tZQSXHMprd97VevN2jajSTGZ0ZZQxqNSPQVp8Y38SEGPxoH4e8AZ3n+DLGQAQGEkkGSCdGfAELxZ4iFDAgglAySTIj+BBCKP0MsZEAAoWSQZEL0J4BQ/BliIQMCCCWDJBOiPwGE4s8QC4kTmEy5AV7iKSa8UASYUUKRxE7SBBBK0ukluCAEWHoFwYiRDAgwo2SQZEL0JKC/hI1QPBnSPQ8CCCWPPBOlJwGE4gmQ7nkQQCh55JkoPQkgFE+AdM+AAJeHM0gyIQYhwIwSBCNGUieAUFLPMPEFIYBQgmDESOoEEErqGSa+IAQQShCMGEmdAEJJPcPEF4QAQgmCESOpE0AoqWeY+IIQQChBMGIkdQIIJfUME18QAgglCEaMpE4AoaSeYR2fVARj8yNAISEvfrp+uy7UI9V3ZZOaiVIOTipdxVDAZzIZm/qNE4TilWXpjFBqIPzev/yP6SVFTn/6s7MS1VJ9VwqLSs1EUw4uhkpXUj57OFTjg4kqfBbHP/Opp2tEnXcXhOKR/8lkou7e2zV13E2J6vnM4mEyWFdZbslMIiJ574PdYHZzNYRQPDN/+83X1G1PG3SPnwAn8/HnCA8jIIBQIkgCLsRPAKHEnyM8jIAAQokgCafpglypY1udACfzqzM7dHnVvuxaw9SpdeGSsB9q/fbCp7Z+COmdAwHm4QyyzHLLP8ksvTwZ2kuamJZhtl+eIdJdE2BG4TCAgAMBhOIAiSYQQCgcAxBwIIBQHCDRBAIIJcFjgKtc4ZPKVa+ATMtXmk77Klh5/IChZW+KGSX7QwAALgQQigulGm3kR11s6RBg6RUwl6e91Cq7bo/PMqxMx+85M4ofP3pnQgChZJJowvQjgFD8+C16c06yQJHkA85RPNNqnxd4mgravewX5yx+eJlR/PjROxMCCMUj0Sy3POC1rCtLL8eElZcyjt2iaVblP0sytxQxo7hxolXmBBCKwwHAEssBUuJNWHodk+Cq5coxXVq3y46RZVh1+phRqtmwBwILAswoCxT1H8T++w+WjvVzW/REKAWJmn8vf/EbaueJx3VNlI4p2lPTzHq66RotBwdTU5pC7rrPVp8AQqnPTslMIiK5+dKLam/vgXkudUk6UnErgk0qgY1GI1O/hdIUfglBKH78zEwiIrlwaUcNNnS1rf5AdSK6v69UAjNFjjzjzL07QvE9AvS7tswsIpIz5y+qreEZ1R9s+FoN0l9qSkq5PF1kMoi9nI0glADZl+WWzCQiktG5C6q/sRnAqr8JKbwqNSXZ/AkglAqGq1wpknMSWW7JTCIi2dwaKn1q3/gm1YlN4dXGPWm/AwjFyqH94Zv18soPjUhiqAosPqzghx0/Hz4eTnscl2cO+8QzCERHAKFElxIcipEAQokxK/gUHQGEEl1KcChGAgglxqzgU3QEEMo8JatcDo4uizi0dgLZXx62L4munXaLBihzyf1yMTNKiw5eXG2OAEJpjj0jt4gAQmlRsnC1OQIIpTn2jNwiAgilRcnC1eYIIJTm2DNyiwgglBYlC1ebI4BQmmPPyC0ikP0HjnVy9ejDt/a8zzzyWanyh4l1GOTWJxKhNHXATczv3U9Keupfb3G7L1lTOZLsNF84tnGhjJ/6UqP3xdq5doxMMrgvVlvuS9a788YxiVr/roaFwn2x1p/i6hHadF+y9+9Ux3EaexoWiuK+WKeR5WPGkDtccl+yYwDNdzUuFLnnFPfFOjlRa2sBfye0zQtFu9mm+2K5nfg6sY+mUZv4NwUtCqG04b5Y9uXVppIVatxHscyuZLWBf6jY69qJQihl59t6X6xyHG19Dv+jmWvy4vhRb3gFApESQCiRJga34iKAUOLKB95ESgChRJoY3IqLAEKJKx94EykBhBJpYnArLgIIJa584E2kBBBKpIkJ6ZZ88s7mRyDKDxz9Qjrl3vqr+FJ9VzapmSjl4KTS1SoFfNbl8WQyNvUbJwjFGzFC8UQoddylRLVU35XColIz0ZSDW6HSlacL1d21gEfDoRofNP/Dp2on27EHoXjlaaLu3ts1ddxNier5zOJlMlBnWW7JTCIiee+DXTUIZDdXMwjFM/Pyy7viR0Ux/Rb90RcfFSLxzLF052Q+AERMpE8AoaSfYyIMQAChBICIifQJIJT0c0yEAQgglAAQMZE+AYSSfo6JMAABhBIAIibSJ4BQAuU49duuBsLUWjN84OiZupg+ZLRDKftlfwBpt+OxGwFmFDdOtMqcQJcvYGd+BBC+EwFmFCdMNMqdAELJ/QggficCXXNXQKemNIJAvgSYUfLNPZGvQICT+RVg0TRfAswo+eaeyFcggFBWgEXTfAkglHxzT+QrEEAoDrC4L5YDpDU2iYF/v/HLwy2+L1YSX4RsMf81avOI6ca/FNnG+2KVv3B4hGrNF8pfXAw5jm3LHqeN/Gvi9erWsFC4L5ZX9rw7w98VYb/pL0Xa98VydbpOO/sd1bV/8c6b8s3jbP4+jFyZ1mkXA39O5utkjj7ZEUAo2aWcgFcnMOFOkatDW0+Pbrd971lt9Llu9ho+ma/r9ur9ivMN6VlnLb76iG49bL/KPex9bfG5HEMqz9v3NpYKeeJoFQGEUpGunJYVFQiWvpwrl+Y/mV+ajvW+aC9p1jtSu6zDpTpfzCjVbNgDgQUBhLJAwQMIVBNAKNVs2AOBBQGEskDBAwhUE0Ao1WzYA4EFAYSyQMEDCFQTQCjVbNgDgQUBhLJAwQMIVBNAKNVs2AOBBQGEskDBAwhUE0Ao1WzYA4EFAYSyQMEDCFQTQCjVbNgDgQUBhLJAwQMIVBNAKNVs1r4n1992rB3sGgbI5qfAa2BX22Sd333YfWL6WXBtCC3ryIzSsoThbjMEEEoz3Bm1ZQQQSssShrvNEEAozXBn1JYRQCgtSxjuNkOAq14BuK9+mdfn/Unf3nPFu0omUcclQJ58TCAUH3q67+UvfkPtPPG46vV0Sabp6dQG2Lnm6LQuEiT1T+7e21W333zNsRPNlhFAKMuoOL4m7+wikpsvvaj29h6Yd3opo9bp+MwYjoM7NJtq4Y5GI3Xr1uvqtkN7mlQTQCjVbJz2yEwiIrlwaUcNNrZUrz9QnRWXRk4D1Wy0+/13Vb8fh3BrhhBBt65CKL5p0O/aMrOISM6cv6i2hmdUf7DhazVI/4P9fbX3ox+c2pIwiNORGkEoARIjyy2ZSUQko3MXVH9jM4BVfxPjhw/VYHPL3xAWmFFCHANyTiLLLZlJRCSbW0PVeLVlHdi+9qvXi6GwWwjKzdpgRlkDfyMSfcWp8U18iMGPxkH4O9A9nQua/o5iAQLNEaA0XXPsGblVBLhu2Kp04WxTBBBKU+QZt0UEulQFblG2cLVBAswoDcJn6LYQ4GS+LZnCz4YJMKM0nACGbwcBhNKOPOFlwwQQSsMJYPh2EOhG8EWLdpDCy6wJMKNknX6CdyWAUFxJ0S5rAnwpMuv0E7wrAWYUV1K0y5oAQsk6/QTvSgChuJKiXdYEEErW6Sd4VwIIxZUU7bImgFCyTj/BuxLontZtQF0doh0EYiTAjBJjVvApOgIIJbqU4FCMBBDKilmhhMKKwBJpzg3wHBOZUiVeOxa72rAjiiybMaNkmXaCXpUAQlmVGO2zJIBQskw7Qa9KAKGsSoz2WRJAKA5p50qXA6TEm3DV65gE21eHjmnW6l12jFwBq04lM0o1m2T2SEUwNj8CzCh+/EyhHqm+K5vUTJRycFLpKoYCPpPJ2NRvnCAU3yxTmq6KoOt5idRxlxLVUn1XCotKzURTDi6GSldSPns4VOODSVWYvO5IgBnFAmWv162XKx+KmO7e2zV13E2J6vnMUtnhFHfIcktmEhHJex/sOo1sx8/5ymFkCOUwj5Wf3X7zNXW7otdpH2z2gV7hEi/XIkB9lFrYXDpJ7Xm2dAgwowTM5WnPIGXX7fGZXcp0/J7ztufHj95ZEKCQULA0p7TUSimWUAlm6WWRtJcu1sutfJhSLDEkgKVXDFnAh+gJIJToU4SDMRBAKDFkAR+iJ4BQok8RDsZAAKHEkAV8iJ4AQok+RTgYAwGEEkMW8CF6AuZzlP/64VDtXPkt/fVwXSM4om/AGnr66+ryVXb5lq7S34fdeeJx/PQ5rFrIs3fnDZ+Ig/Q1QpGD7+ZLL6q9vQdKPpWVr2h35MdHEWzyoyj5vcetW69rDY/x0zMnbeT5/h3PoAN0N0KRmUREcuHSjhps6B8e9QeqE9G3X+VHUfJ7D/n9B376Z71tPP0j9rcw+wqLfteWmUREcub8RbU1PKP6gw1/6wEsyM9r5ZeDZkmIn95EW8nTO2p/AzOhaDuy3JKZREQyOndB9Tc2/a0HsCC/QZef1xYbfhYk6v1tK8960YbrtRCKnJPIcktmEhHJ5tZQ6VP7xje5UYP5DfrcE/z0S0lbefpF7d97IZSyKSOSGG6QID4c4wd+ljN3wvNEeJ4QZfDdcVzaCh4WBiEQlgBCCcsTa4kSQCiJJpawwhJAKGF5Yi1JAtyuKMm0ElR4Aswo4ZliMUECCCXBpBJSeAIIJTxTLCZIAKEkmFRCCk8AoYRnisWECBRfCkEoCSWVUMITkN8xyu+gEEp4tlhMjkBHdbdH28mFRUAQCEZAr70+cvEnVXefsmXBmGIoXQIsvdLNLZEFJIBQAsLEVLoEEEq6uSWygAQQSkCYmEqXAEJJN7dEFpAAQgkIE1PpEkAo6eaWyAISQCgBYWIqXQIIJd3cEllAAgglIExMpUsAoaSbWyILSAChBISJqXQJIJR0c0tkAQkglIAwMZUuAYSSbm6JLCABhBIQJqbSJYBQ0s0tkQUiMNG/m2+NUKTSVhs2/AybpVh4zgoJ6d8FS7VY2aTGn5Qvk8pMxxXwCYuj2tpkMjb1GyemUjF+VpNy29NGnm6RrbdVX4qISh13KVEt1WKlsKjUTDTl4IqbGq3Xh+Ota/9Gw6Eay2/7tZbx83hcJ+5tI8+GFj5SGFsquk11NerO5vZw+md/8Q/qyUsXTYlqU333RNqn00CmXZlJRCTvfbCrutpr/KzPvq08n37sx/WD9uzZ0ZPFs9d/WXW2z56bPnzwQHV7vRomO2p79FiNfrMusro7bpvqSaRq6/dM9cZDu6VYa7EdjPWSrWLrWTPleL7ktJseN67dbpkPxf5ldot99t+Txlo2xsF4tkyGn7zb2zSPPl7Gb1lu+vPjX2aPYpN2+x/uqcd+4qfU/wNCnH7i1WZF+wAAAABJRU5ErkJggg==`,
        },
        physics: {
            slot: true,
            box: { w: 202, h: 320 },
            Z: -2,
        },
        constraints: {
            passable:  true,
            pickable:  false,
            pushable:  false,
            enterable: false,
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


