const openSettings = document.getElementById("openSettings");
const settings = document.getElementById("settings");
const tiles = document.getElementById("tileContent");
const brand = document.getElementById("brand");
const options = {
    ip: document.getElementById("ip")
}
const defaults = {
    ip: "100.64.0.65"
}

let toggled = false;
const open = () => {
    toggled = true;
    settings.classList.add("showSettings");
    tiles.classList.add("showSettings");
}
const close = () => {
    toggled = false;
    settings.classList.remove("showSettings");
    tiles.classList.remove("showSettings");
}

openSettings.addEventListener("click", () => {
    if (!toggled) open();
    else close();
});
document.body.addEventListener("keyup", e => {
    if (e.key === "Escape" && toggled) close();
});
brand.addEventListener("click", () => {
    if (toggled) close();
});

Object.entries(options).forEach(([key, value]) => {
    value.addEventListener("change", () => {
        localStorage.setItem(key, value.value);
    });

    value.value = localStorage.getItem(key) || defaults[key];
    localStorage.setItem(key, value.value);
});