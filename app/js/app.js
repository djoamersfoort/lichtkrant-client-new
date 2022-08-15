const title = document.getElementById("title");
const colorWidget = document.getElementById("colorWidget");
const color = document.getElementById("color");
const gameTitle = document.getElementById("gameTitle");
const keys = document.getElementById("keys");

export default class App {
    constructor(game, zoomed) {
        this.socket = io(`http://${localStorage.getItem("ip") || "100.64.0.65"}:5000`);
        this.game = game;
        this.zoomed = zoomed;
        title.innerText = `Playing ${this.game.name}`;
        gameTitle.innerText = this.game.name;

        this.keys = {};
        this.game.keys.forEach(key => this.keys[key] = false);
        this.setKeys();

        this.setupColor();

        document.body.addEventListener("keydown", e => {this.keyDown(e)});
        document.body.addEventListener("keyup", e => {this.keyUp(e)});
        this.socket.emit("join", game.id);
        if (this.game.colors.configurable)
            this.socket.emit("color", localStorage.getItem("lastColor"));

        this.socket.on("color", code => {
            color.value = code;
        });
        color.addEventListener("change", () => {
            if (!this.game.colors.configurable) return;

            this.socket.emit("color", color.value);
            localStorage.setItem("lastColor", color.value);
        });
    }

    setKeys() {
        keys.innerHTML = "<h3>Keys</h3>";
        for (const explanation of this.game.explanation) {
            const line = document.createElement("div");
            line.classList.add("line");
            switch (explanation.type) {
                case "grid": {
                    const layout = document.createElement("div");
                    layout.classList.add("grid");
                    for (const row of explanation.layout) {
                        const rowE = document.createElement("div");
                        rowE.classList.add("row");
                        for (const char of row) {
                            const e = document.createElement("div");
                            if (char !== null) {
                                e.classList.add("key");
                                e.innerText = char.toUpperCase();
                            }
                            rowE.append(e);
                        }
                        layout.append(rowE);
                    }
                    line.append(layout);
                    break;
                } case "large": {
                    const e = document.createElement("div");
                    e.classList.add("large");
                    e.innerText = explanation.text;

                    line.append(e);
                    break;
                }
            }
            const name = document.createElement("div");
            name.classList.add("description");
            name.innerText = explanation.description;
            line.append(name);

            keys.append(line);
        }
    }

    setupColor() {
        if (!this.game.colors.visible) {
            colorWidget.style.display = "none";
            return;
        }
        colorWidget.style.display = "flex";
        color.disabled = !this.game.colors.configurable;
        if (!localStorage.getItem("lastColor"))
            localStorage.setItem("lastColor",  "#19947d");
        color.value = localStorage.getItem("lastColor");
    }

    keyDown(key) {
        if (typeof this.keys[key.key] === "undefined") return;

        this.keys[key.key] = true;
        this.socket.emit("key_down", key.key)
    }
    keyUp(key) {
        if (typeof this.keys[key.key] === "undefined") return;

        this.keys[key.key] = false;
        this.socket.emit("key_up", key.key)
    }

    disconnect() {
        this.socket.disconnect();
    }
}