let config = {
    folder: "scripts",
    rootUrl: "https://raw.githubusercontent.com/PhaZ90771/Bitburner/main/",
    serverPrefix: "PhaZ",
};
let importFilename = "import.js";
let filenames = [
    "autohack-target.js",
    "purchase-hacknet-node.js",
    "purchase-server-8gb.js",
    "utilities.js",
];
export async function main(ns) {
    let secondStage = false;
    if (ns.args.length == 1 && typeof ns.args[0] === "boolean") {
        secondStage = ns.args[0];
    }
    if (!secondStage) {
        let fileImported = await importImport(ns);
        if (fileImported) {
            ns.run(`/${config.folder}/${importFilename}`, 1, true);
        }
        else {
            ns.tprint("Download failed!");
        }
    }
    else {
        let filesImported = await importFiles(ns);
        if (filesImported) {
            ns.tprint("Download successful!");
            ns.tprint(`Files have been downloaded into ${config.folder} directory`);
        }
        else {
            ns.tprint("Download failed!");
        }
    }
}
async function importFiles(ns) {
    let filesImported = true;
    for (let filename of filenames) {
        let result = await importFile(ns, filename);
        filesImported = filesImported && result;
        ns.tprint(`File: ${filename}: ${result ? '✔' : '✖'}`);
    }
    return filesImported;
}
async function importImport(ns) {
    let result = await importFile(ns, importFilename);
    ns.tprint(`File: ${importFilename}: ${result ? '✔' : '✖'}`);
    return result;
}
async function importFile(ns, filename) {
    let remoteFileName = `${config.rootUrl}scripts/${filename}`;
    let result = await ns.wget(remoteFileName, `/${config.folder}/${filename}`);
    return result;
}
export function getServerPrefix() {
    return config.serverPrefix;
}
