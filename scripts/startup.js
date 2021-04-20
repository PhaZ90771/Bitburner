import { getServers } from "/scripts/utilities.js";
const home = "home";
const autohackScript = "/scripts/autohack-target.js";
const pservAutobuyScript = "/scripts/purchase-server-8gb.js";
const hacknetAutobuyScript = "/scripts/purchase-hacknet-node.js";
let homeRamSetAside = 100;
let homeHackTarget;
export async function main(ns) {
    disableLogs(ns);
    getArgs(ns);
    let servers = getServers(ns);
    servers.sort((a, b) => a.moneyMax - b.moneyMax);
    homeHackTarget = servers[servers.length - 1];
    ns.print(`Server with the largest max money is: ${homeHackTarget.hostname}`);
    await homeStartup(ns);
    servers.sort((a, b) => a.portsRequired - b.portsRequired);
    var lastPortRequirement = -1;
    while (servers.length > 0) {
        var server = servers.shift();
        while (countPortHackers(ns) < server.portsRequired) {
            ns.print("");
            ns.print(`Waiting for ${nextPortHackerToUnlock(ns)} unlock...`);
            await ns.sleep(60000);
        }
        if (lastPortRequirement < server.portsRequired) {
            ns.print("");
            ns.print(`Taking over ${++lastPortRequirement}-port servers...`);
        }
        await takeover(ns, server);
        await ns.sleep(1);
    }
}
function getArgs(ns) {
    if (ns.args.length > 0 && typeof ns.args[0] === "number" && ns.args[0] >= 0) {
        homeRamSetAside = ns.args[0];
        ns.tprint(`Setting aside at least ${homeRamSetAside}GB of ram on home system`);
    }
    else {
        ns.tprint(`Setting aside at least ${homeRamSetAside}GB [default] of ram on home system`);
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
    if (!ns.fileExists("BruteSSH.exe")) {
        portHacker = "BruteSSH.exe";
        return portHacker.toString();
    }
    if (!ns.fileExists("FTPCrack.exe")) {
        portHacker = "FTPCrack.exe";
        return portHacker.toString();
    }
    if (!ns.fileExists("relaySMTP.exe")) {
        portHacker = "relaySMTP.exe";
        return portHacker.toString();
    }
    if (!ns.fileExists("HTTPWorm.exe")) {
        portHacker = "HTTPWorm.exe";
        return portHacker.toString();
    }
    if (!ns.fileExists("SQLInject.exe")) {
        portHacker = "SQLInject.exe";
        return portHacker.toString();
    }
    return "None";
}
async function takeover(ns, server) {
    ns.print("");
    ns.print(`Server Takeover: ${server.hostname}`);
    downloadLitFiles(ns, server);
    var nuked = nukeServer(ns, server);
    if (nuked) {
        await setup(ns, server);
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
        ns.print("Rooted already");
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
async function setup(ns, server) {
    ns.killall(server.hostname);
    for (let psCount = ns.ps(server.hostname).length; psCount > 0; psCount = ns.ps(server.hostname).length) {
        ns.print(`${psCount} scripts left running on target system`);
        await ns.sleep(1000);
    }
    var ram = server.ramFree(ns);
    ns.print(`${ram}GB RAM detected`);
    if (ram === 0) {
        ns.print("Autohack setup skipped");
        return;
    }
    var needed = ns.getScriptRam(autohackScript);
    ;
    ns.print(`${needed}GB RAM needed`);
    var threads = Math.floor(ram / needed);
    ns.print(`${threads} autohack thread(s) can be supported`);
    if (threads === 0) {
        ns.print("Not enough ram on system");
        ns.print("Autohack setup skipped");
        return;
    }
    let copy = ns.scp(autohackScript, server.hostname);
    if (copy) {
        ns.print("Autohack copy success");
    }
    else {
        ns.print("Autohack copy failure");
    }
    let id = ns.exec(autohackScript, server.hostname, threads, server.hostname);
    if (id !== 0) {
        ns.print("Autohack setup success");
    }
    else {
        ns.print("Autohack setup failure");
    }
}
async function homeStartup(ns) {
    ns.print("");
    ns.print("Home Setup:");
    if (ns.ps(home).length > 1) {
        ns.exit();
    }
    ns.run(pservAutobuyScript);
    ns.print("Autobuy pserv setup success");
    ns.run(hacknetAutobuyScript);
    ns.print("Autobuy nodes setup success");
    while (ns.ps(home).length < 3) {
        await ns.sleep(1000);
    }
    let ram = ns.getServerRam(home);
    let ramFree = ram[0] - ram[1] - homeRamSetAside;
    let needed = ns.getScriptRam(autohackScript);
    let threads = ramFree / needed;
    ns.run(autohackScript, threads, homeHackTarget.hostname);
    ns.print("Autohack setup success");
    ns.print("Complete home setup");
}
async function killAllOther(ns) {
    let thisPS = {
        filename: ns.getScriptName(),
        threads: 1,
        args: ns.args,
    };
    let ps = ns.ps(home);
    for (let i = 0; i < ps.length; i++) {
        ns.print(`Looking at ${ps[i].filename}`);
        var isSame = isSamePS(thisPS, ps[i]);
        ns.print(`Is same process? ${isSamePS}`);
        if (isSame) {
            ns.print(`Killing ${ps[i].filename}`);
            ns.kill(ps[i].filename, home, ps[i].args);
        }
    }
    let countLeft = ns.ps(home).length;
    while (countLeft > 1) {
        ns.print(`${countLeft} processes still alive, awaiting kill`);
        await ns.sleep(1000);
        countLeft = ns.ps(home).length;
    }
    ns.print("Other processes killed, proceeding");
}
async function isSamePS(p1, p2) {
    let sameFilename = p1.filename === p2.filename;
    let sameArgsLength = p1.args.length === p2.args.length;
    let sameArgsValues = p1.args.every((value, index) => value === p2.args[index]);
    return sameFilename && sameArgsLength && sameArgsValues;
}
