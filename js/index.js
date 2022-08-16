import App from "./app.js";
const res = await fetch("../games.json");
const games = await res.json();

const windowTitle = document.getElementById("title");
const place = document.getElementById("place");
const tiles = document.getElementById("tiles");
const playingOverlay = document.getElementById("playingOverlay");
const list = [];
const zoom = ({e, title, description}) => {
    const rect = e.getBoundingClientRect();
    // move to center
    const xChange = window.innerWidth / 2 - rect.x - (e.clientWidth / 2);
    const yChange = window.innerHeight / 2 - rect.y - (e.clientHeight / 2);

    // scale
    const xScale = window.innerWidth / e.clientWidth;
    const yScale = window.innerHeight / e.clientHeight;

    e.style.transform = `translate(${xChange}px, ${yChange}px) scale(${xScale}, ${yScale})`;
    e.style.borderRadius = "unset";
    e.style.cursor = "unset";
    title.style.filter = "opacity(0)";
    description.style.filter = "opacity(0)";
}

let currentApp = null;
let pending = false;
for (const key in games) {
    const game = games[key];

    const e = document.createElement("div");
    e.classList.add("tile");
    e.style.background = `linear-gradient(162.22deg, ${game.color.from} 0%, ${game.color.to} 100%)`;
    const title = document.createElement("h2");
    title.classList.add("title")
    title.innerText = game.name;
    const description = document.createElement("div");
    description.classList.add("description");
    description.innerText = game.description;
    e.append(title, description);

    e.addEventListener("click", () => {
        if (currentApp || pending) return;
        pending = true;

        e.style.transition = ".3s ease";
        zoom({e, title, description});

        setTimeout(() => {
            currentApp = new App(game, { e, title, description });
            playingOverlay.style.display = "flex";
            pending = false;
        }, 300)
    })

    tiles.append(e);
    list.push({e, title, description});
}

document.body.addEventListener("keyup", e => {
    if (!currentApp) return
    switch (e.key) {
        case "Escape": {
            currentApp.disconnect();

            const { e, title, description } = currentApp.zoomed;
            e.style.transform = "";
            e.style.borderRadius = "5px";
            e.style.filter = "";
            e.style.cursor = "pointer";
            title.style.filter = "";
            description.style.filter = "";
            windowTitle.innerText = "Lichtkrant Client";
            playingOverlay.style.display = "none";

            setTimeout(() => {
                e.style.transition = ".1s ease";
            }, 300)
            currentApp = null;
        }
    }
})

place.addEventListener("click", () => {
    document.location.assign("https://place.sverben.nl");
})