const net = require("net");
const title = document.getElementById("title");
const colorWidget = document.getElementById("colorWidget");
const color = document.getElementById("color");
const gameTitle = document.getElementById("gameTitle");

export default class App {
    constructor(game, zoomed) {
        this.game = game;
        this.zoomed = zoomed;
        title.innerText = `Playing ${this.game.name}`;
        gameTitle.innerText = this.game.name;

        this.keys = {};
        this.game.keys.forEach(key => this.keys[key] = false);

        this.setupColor();

        document.body.addEventListener("keydown", e => {this.keyDown(e)});
        document.body.addEventListener("keyup", e => {this.keyUp(e)});
        this.socket = new net.Socket();
        this.socket.connect(this.game.port, localStorage.getItem("ip") || "100.64.0.65", () => {
            this.send();
        });
        if (this.game.colors.configurable)
            this.socket.write(localStorage.getItem("lastColor"));

        this.socket.on("data", buffer => {
            const data = buffer.toString();
            if (data.startsWith("#")) {
                color.value = data;
            }
        });
        color.addEventListener("change", () => {
            if (!this.game.colors.configurable) return;

            this.socket.write(color.value);
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

    createString() {
        let base = Object.values(this.keys).map(value => value ? 1 : 0).join("");
        base += new Array(7 - base.length).join(" ");

        return base;
    }

    send() {
        this.socket.write(this.createString());
    }

    keyDown(key) {
        if (typeof this.keys[key.key] === "undefined") return;

        this.keys[key.key] = true;
        this.send();
    }
    keyUp(key) {
        if (!this.keys[key.key]) return;

        this.keys[key.key] = false;
        this.send();
    }

    disconnect() {
        this.socket.destroy();
    }
}