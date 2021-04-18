import {BitBurner as NS, Script} from "Bitburner"

let config: Config = {
    folder: "scripts",
    rootUrl: "https://raw.githubusercontent.com/PhaZ90771/Bitburner/main/",
    serverPrefix: "PhaZ",
}

let importFilename: Script = "import.js";

let filenames: Array<Script> = [
    "autohack-target.js",
    "find-contracts.js",
    "purchase-hacknet-node.js",
    "purchase-server-8gb.js",
    "startup.js",
    "utilities.js",
];

export async function main(ns: NS): Promise<void> {
    let secondStage: boolean = false;
    if (ns.args.length == 1 && typeof ns.args[0] === "boolean") {
        secondStage = ns.args[0];
    }

    if (!secondStage) {
        let fileImported: boolean = await importImport(ns);
        if (fileImported) {
            ns.run(`/${config.folder}/${importFilename}`, 1, true);
        }
        else {
            ns.tprint("Download failed!");
        }
    }
    else {
        let filesImported: boolean = await importFiles(ns);
        if (filesImported) {
            ns.tprint("Download successful!");
            ns.tprint(`Files have been downloaded into ${config.folder} directory`);
        }
        else {
            ns.tprint("Download failed!");
        }
    }
}

async function importFiles(ns: NS): Promise<boolean> {
    let filesImported: boolean = true;

    for (let filename of filenames) {
        let result: boolean = await importFile(ns, filename);
        filesImported = filesImported && result;
        ns.tprint(`File: ${filename}: ${result ? '✔' : '✖'}`);
    }

    return filesImported;
}

async function importImport(ns: NS): Promise<boolean> {
    let result: boolean = await importFile(ns, importFilename)
    ns.tprint(`File: ${importFilename}: ${result ? '✔' : '✖'}`);
    return result;
}

async function importFile(ns: NS, filename): Promise<boolean> {
    let remoteFileName: string = `${config.rootUrl}scripts/${filename}`;
    let result: boolean = await ns.wget(remoteFileName, `/${config.folder}/${filename}`);
    return result;
}

export function getServerPrefix(): string {
    return config.serverPrefix;
}

type Config = {
    folder: string,
    rootUrl: string,
    serverPrefix: string,
}