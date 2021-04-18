// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

let config = {
    folder: "scripts",
    rootUrl: "https://raw.githubusercontent.com/PhaZ90771/Bitburner/main/",
    serverPrefix: "PhaZ",
}

export async function main(ns: NS) {
    let filesImported = await importFiles(ns);
    if (filesImported) {
        ns.tprint("Download successful!");
        ns.tprint(`Files have been downloaded into ${config.folder} directory`);
    }
    else {
        ns.tprint("Download failed!");
    }
}

async function importFiles(ns: NS) {
    let files = [
        "autohack-target.js",
        "import.js",
        "purchase-server-8gb.js",
        "utilities.js",
    ];
    let filesImported = true;

    for (let file of files) {
        let remoteFileName = `${config.rootUrl}scripts/${file}`;
        let result = await ns.wget(remoteFileName, `/${config.folder}/${file}`);
        filesImported = filesImported && result;
        ns.tprint(`File: ${file}: ${result ? '✔' : '✖'}`);
    }

    return filesImported;
}

export function getServerPrefix() {
    return config.serverPrefix;
}