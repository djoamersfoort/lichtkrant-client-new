import fs from "fs";
import https from "https";
import unzipper from "unzipper";
import { exec } from "child_process";

if (!fs.existsSync("./cache")) fs.mkdirSync("cache");
if (!fs.existsSync("./build")) fs.mkdirSync("build");

const version = "v0.66.1";
let platform;
let cmd;

switch (process.platform) {
    case "linux": {
        platform = `linux-${process.arch}`;
        cmd = 'nw';
        break;
    } case "win32": {
        platform = `win-${process.arch}`;
        cmd = 'nw.exe';
        break;
    } case "darwin": {
        platform = "osx-x64";
        cmd = 'nwjs.app/Contents/MacOS/nwjs';
        break;
    }
}
if (!platform) {
    throw "Platform unsupported!";
}

async function download(url, fileName) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(`cache/${fileName}`);
        https.get(url, (res) => {
            res.pipe(file);

            file.on("finish", () => {
                file.close();
                resolve(file);
            });
        });
    });
}

switch (process.argv[2]) {
    case "run": {
        const file = `nwjs-sdk-${version}-${platform}.zip`;
        const url = `https://dl.nwjs.io/${version}/${file}`;

        if (!fs.existsSync(`cache/${file}`)) {
            console.log(`Downloading assets for os: ${platform}`);
            await download(url, file);
        }

        const folder = `nwjs-sdk-${version}-${platform}`;

        if (!fs.existsSync(`cache/${folder}`)) {
            console.log(`Unzipping contents`);
            fs.createReadStream(`cache/${file}`)
                .pipe(unzipper.Extract({ path: `./cache` }))
        }

        if (process.platform === "darwin" || process.platform === "linux") {
            console.log("Making files executable");
            exec(`chmod -R +x cache/${folder}/*`);
        }

        console.log("Running app");
        exec(`./cache/${folder}/${cmd} .`);
    }
}