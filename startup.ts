// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

import {getServers, Server} from "/scripts/utilities.js"

const home: string = "home";
const autohackTarget: string = "foodnstuff";
const autohackScript: string = "/scripts/autohack-target.js";
const pservAutobuyScript: string = "/scripts/purchase-server-8gb.js";
const hacknetAutobuyScript: string = "/scripts/purchase-hacknet-node.js";

export async function main(ns: NS) {
    disableLogs(ns);

    await homeStartup(ns);

    let serversToHack: Array<Server> = getServers(ns);
    serversToHack.sort((a: Server, b: Server) => a.portsRequired - b.portsRequired);
    
    var lastPortRequirement = -1;
    while (serversToHack.length > 0) {
        var server = serversToHack.shift();

        while (countPortHackers(ns) < server!.portsRequired) {
            ns.print("");
            ns.print(`Waiting for ${nextPortHackerToUnlock(ns)} unlock...`);
            await ns.sleep(60000);
        }

        if (lastPortRequirement < server!.portsRequired) {
            ns.print("");
            ns.print(`Taking over ${++lastPortRequirement}-port servers...`);
        }

        takeover(ns, server!);

        await ns.sleep(1);
    }
}

function disableLogs(ns: NS) {
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

function countPortHackers(ns: NS) {
    let count: number = 0;
    if(ns.fileExists("BruteSSH.exe")) count++;
    if(ns.fileExists("FTPCrack.exe")) count++;
    if(ns.fileExists("relaySMTP.exe")) count++;
    if(ns.fileExists("HTTPWorm.exe")) count++;
    if(ns.fileExists("SQLInject.exe")) count++;
    return count;
}

function nextPortHackerToUnlock(ns: NS) {
    if(ns.fileExists("BruteSSH.exe")) return "BruteSSH.exe";
    if(ns.fileExists("FTPCrack.exe")) return "FTPCrack.exe";
    if(ns.fileExists("relaySMTP.exe")) return "relaySMTP.exe";
    if(ns.fileExists("HTTPWorm.exe")) return "HTTPWorm.exe";
    if(ns.fileExists("SQLInject.exe")) return "SQLInject.exe";
    return null;
}

function takeover(ns: NS, server: Server) {
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

function downloadLitFiles(ns: NS, server: Server) {
    ns.print("Searching for lit files");
    const filter  = ".lit";
    let files: Array<string> = ns.ls(server.hostname, filter);
    for (let file of files) {
        ns.print(`+ ${file}`);
    }
    ns.scp(files, server.hostname, home);
    ns.print("Download lit files complete");
}

function nukeServer(ns: NS, server: Server) {
    if (server.rooted(ns)) {
        ns.print("Already redundant")
        return true;
    }

    if(ns.fileExists("BruteSSH.exe")) ns.brutessh(server.hostname);
    if(ns.fileExists("FTPCrack.exe")) ns.ftpcrack(server.hostname);
    if(ns.fileExists("relaySMTP.exe")) ns.relaysmtp(server.hostname);
    if(ns.fileExists("HTTPWorm.exe")) ns.httpworm(server.hostname);
    if(ns.fileExists("SQLInject.exe")) ns.sqlinject(server.hostname);
    ns.nuke(server.hostname);

    if (server.rooted(ns)) {
        ns.print("Root success");
        return true;
    }
    ns.print("Root failuire");
    return false;
}

function setup(ns: NS, server: Server) {
    ns.killall(server.hostname);

    var ram = server.ramFree(ns);
    ns.print(`${ram}GB RAM detected`);
    if (ram === 0) {
        ns.print("Autohack setup skipped");
        return;
    }

    var needed = ns.getScriptRam(autohackScript);;
    var threads = ram / needed;

    ns.scp(autohackScript, server.hostname);
    ns.exec(autohackScript, server.hostname, threads, autohackTarget);

    ns.print("Autohack setup success");
}

async function homeStartup(ns: NS) {
    ns.print("");
    ns.print("Home Setup:");

    if (ns.isRunning(pservAutobuyScript, home)) {
        ns.kill(pservAutobuyScript, home);
    }
    ns.run(pservAutobuyScript);
    ns.print("Autobuy pserv setup success");

    if(ns.isRunning(hacknetAutobuyScript, home)) {
        ns.kill(hacknetAutobuyScript, home);
    }
    ns.run(hacknetAutobuyScript);
    ns.print("Autobuy nodes setup success");

    await ns.sleep(1000);;

    let ram: number = ns.getServerRam(home);
    let ramFree: number = ram[0] - ram[1];
    let needed: number = ns.getScriptRam(autohackScript);
    let threads: number = ramFree / needed;

    if(ns.isRunning(autohackScript, home)) {
        ns.kill(autohackScript, home);
    }
    ns.run(autohackScript, threads, autohackTarget);
    ns.print("Autohack setup success");
    ns.print("Complete home setup");
}