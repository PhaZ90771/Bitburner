// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

let Config = {
    folder: "scripts",
    rootUrl: "https://raw.githubusercontent.com/PhaZ90771/Bitburner/main/",
}

export async function main(ns: NS) {
    let filesImported = await importFiles(ns);
    if (filesImported) {
        ns.tprint("Download successful!");
        ns.tprint(`Files have been downloaded into ${Config.folder} directory`);
    }
    else {
        ns.tprint("Download failed!");
    }
}

async function importFiles(ns: NS) {
    let files = [
        "utilities.js"
    ];
    let filesImported = true;

    for (let file of files) {
        let remoteFileName = `${Config.rootUrl}scripts/${file}`;
        let result = await ns.wget(remoteFileName, `/${Config.folder}/${file}`);
        filesImported = filesImported && result;
        ns.tprint(`File: ${file}: ${result ? '✔' : '✖'}`);
    }

    return filesImported;
}