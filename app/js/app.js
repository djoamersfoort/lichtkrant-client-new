const title = document.getElementById("title");
const colorWidget = document.getElementById("colorWidget");
const color = document.getElementById("color");
const gameTitle = document.getElementById("gameTitle");

export default class App {
    constructor(socket, game, zoomed) {
        this.game = game;
        this.zoomed = zoomed;
        this.socket = socket;
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

        this.socket.on("data", buffer => {
            const data = buffer.toString();
            if (data.startsWith("#")) {
                color.value = data;
            }
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
        if (this.keys[key.key]) return;

        this.keys[key.key] = true;
        this.socket.emit("key_down", key.key)
    }
    keyUp(key) {
        if (!this.keys[key.key]) return;

        this.keys[key.key] = false;
        this.socket.emit("key_up", key.key)
    }

    disconnect() {
        this.socket.emit("leave");
    }
}