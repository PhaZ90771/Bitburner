import { getServers } from "/scripts/utilities.js";
const home = "home";
const autohackTarget = "foodnstuff";
const autohackScript = "/scripts/autohack-target.js";
const pservAutobuyScript = "/scripts/purchase-server-8gb.js";
const hacknetAutobuyScript = "/scripts/purchase-hacknet-node.js";
export async function main(ns) {
    disableLogs(ns);
    await homeStartup(ns);
    let serversToHack = getServers(ns);
    serversToHack.sort((a, b) => a.portsRequired - b.portsRequired);
    var lastPortRequirement = -1;
    while (serversToHack.length > 0) {
        var server = serversToHack.shift();
        while (countPortHackers(ns) < server.portsRequired) {
            ns.print("");
            ns.print(`Waiting for ${nextPortHackerToUnlock(ns)} unlock...`);
            await ns.sleep(60000);
        }
        if (lastPortRequirement < server.portsRequired) {
            ns.print("");
            ns.print(`Taking over ${++lastPortRequirement}-port servers...`);
        }
        takeover(ns, server);
        await ns.sleep(1);
    }
}
function disableLogs(ns) {
    ns.disableLog("sleep");
    ns.disableLog("brutessh");
    ns.disableLog("ftpcrack");
    ns.disableLog("relaysmtp");
    ns.disableLog("httpworm");
    ns.disableLog("sqlinject");
    ns.disableLog("nuke");
    ns.disableLog("kill");
    ns.disableLog("killall");
    ns.disableLog("scp");
    ns.disableLog("run");
    ns.disableLog("exec");
    ns.disableLog("getServerRam");
}
function countPortHackers(ns) {
    let count = 0;
    if (ns.fileExists("BruteSSH.exe"))
        count++;
    if (ns.fileExists("FTPCrack.exe"))
        count++;
    if (ns.fileExists("relaySMTP.exe"))
        count++;
    if (ns.fileExists("HTTPWorm.exe"))
        count++;
    if (ns.fileExists("SQLInject.exe"))
        count++;
    return count;
}
function nextPortHackerToUnlock(ns) {
    let portHacker;
    if (ns.fileExists("BruteSSH.exe")) {
        portHacker = "BruteSSH.exe";
        return portHacker.toString();
    }
    if (ns.fileExists("FTPCrack.exe")) {
        portHacker = "FTPCrack.exe";
        return portHacker.toString();
    }
    if (ns.fileExists("relaySMTP.exe")) {
        portHacker = "relaySMTP.exe";
        return portHacker.toString();
    }
    if (ns.fileExists("HTTPWorm.exe")) {
        portHacker = "HTTPWorm.exe";
        return portHacker.toString();
    }
    if (ns.fileExists("SQLInject.exe")) {
        portHacker = "SQLInject.exe";
        return portHacker.toString();
    }
    return "None";
}
function takeover(ns, server) {
    ns.print("");
    ns.print(`Server Takeover: ${server.hostname}`);
    downloadLitFiles(ns, server);
    var nuked = nukeServer(ns, server);
    if (nuked) {
        setup(ns, server);
        ns.print("Completed server takeover");
    }
    else {
        ns.print(`[Error] Unable to nuke the server`);
    }
}
function downloadLitFiles(ns, server) {
    ns.print("Searching for lit files");
    const filter = ".lit";
    let files = ns.ls(server.hostname, filter);
    for (let file of files) {
        ns.print(`+ ${file}`);
    }
    ns.scp(files, server.hostname, home);
    ns.print("Download lit files complete");
}
function nukeServer(ns, server) {
    if (server.rooted(ns)) {
        ns.print("Already redundant");
        return true;
    }
    if (ns.fileExists("BruteSSH.exe"))
        ns.brutessh(server.hostname);
    if (ns.fileExists("FTPCrack.exe"))
        ns.ftpcrack(server.hostname);
    if (ns.fileExists("relaySMTP.exe"))
        ns.relaysmtp(server.hostname);
    if (ns.fileExists("HTTPWorm.exe"))
        ns.httpworm(server.hostname);
    if (ns.fileExists("SQLInject.exe"))
        ns.sqlinject(server.hostname);
    ns.nuke(server.hostname);
    if (server.rooted(ns)) {
        ns.print("Root success");
        return true;
    }
    ns.print("Root failuire");
    return false;
}
function setup(ns, server) {
    ns.killall(server.hostname);
    var ram = server.ramFree(ns);
    ns.print(`${ram}GB RAM detected`);
    if (ram === 0) {
        ns.print("Autohack setup skipped");
        return;
    }
    var needed = ns.getScriptRam(autohackScript);
    ;
    var threads = ram / needed;
    ns.scp(autohackScript, server.hostname);
    ns.exec(autohackScript, server.hostname, threads, autohackTarget);
    ns.print("Autohack setup success");
}
async function homeStartup(ns) {
    ns.print("");
    ns.print("Home Setup:");
    if (ns.isRunning(pservAutobuyScript, home)) {
        ns.kill(pservAutobuyScript, home);
    }
    ns.run(pservAutobuyScript);
    ns.print("Autobuy pserv setup success");
    if (ns.isRunning(hacknetAutobuyScript, home)) {
        ns.kill(hacknetAutobuyScript, home);
    }
    ns.run(hacknetAutobuyScript);
    ns.print("Autobuy nodes setup success");
    await ns.sleep(1000);
    ;
    let ram = ns.getServerRam(home);
    let ramFree = ram[0] - ram[1];
    let needed = ns.getScriptRam(autohackScript);
    let threads = ramFree / needed;
    if (ns.isRunning(autohackScript, home)) {
        ns.kill(autohackScript, home);
    }
    ns.run(autohackScript, threads, autohackTarget);
    ns.print("Autohack setup success");
    ns.print("Complete home setup");
}
