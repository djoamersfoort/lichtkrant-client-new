const title = document.getElementById("title");
const colorWidget = document.getElementById("colorWidget");
const color = document.getElementById("color");
const gameTitle = document.getElementById("gameTitle");

export default class App {
    constructor(game, zoomed) {
        this.socket = io(`http://${localStorage.getItem("ip") || "100.64.0.65"}:5000`);
        this.game = game;
        this.zoomed = zoomed;
        title.innerText = `Playing ${this.game.name}`;
        gameTitle.innerText = this.game.name;

        this.keys = {};
        this.game.keys.forEach(key => this.keys[key] = false);

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