import {BitBurner as NS, Host, Script} from "Bitburner"
import {getServerPrefix as prefix} from "/scripts/import.js"
import {getMoney, Server, getServer} from "/scripts/utilities.js"

const defaultRam: number = 8;
const maxRam: number = 1048576;

let script: Script = "/scripts/autohack-target.js";
let target: Host = "foodnstuff";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("getServerMinSecurityLevel");
    ns.disableLog("getServerRequiredHackingLevel");
    ns.disableLog("getServerMaxMoney");
    ns.disableLog("getServerNumPortsRequired");
    ns.disableLog("getServerRam");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");

    let maxServers: number = ns.getPurchasedServerLimit();
    getArgs(ns);
    let servers: Array<Server> = getPurchasedServers(ns);
    let initialSetupPass: boolean = true;
    let workToBeDone: boolean = true;

    while(workToBeDone) {
        // Upgrade Check
        let serversNeedingUpgrade = servers.filter(server => server.ram < maxRam);
        for (let i: number = 0; i < serversNeedingUpgrade.length; i++)  {
            let newHostname: string = upgradeServer(ns, servers[i]);
            let upgraded: boolean = newHostname !== "";
            if (upgraded) {
                servers[i] = getServer(ns, newHostname);
            }
            if (upgraded || initialSetupPass) {
                await setup(ns, servers[i]);
            }
        }
        initialSetupPass = false;

        // Purchase Check
        while (servers.length < maxServers - 1) {
            let targetHostname = generateHostname(servers.length, defaultRam);
            let success = purchaseServer(ns, targetHostname, defaultRam);
            if (success) {
                let newServer = getServer(ns, targetHostname);
                servers.push(newServer);
                await setup(ns, newServer);
            }
            await ns.sleep(1);
        }

        // Final Purchase
        if (serversNeedingUpgrade.length == 0 && servers.length == maxServers - 1) {
            ns.print(`All other purchase and upgrades complete`);
            ns.print(`Proceeding to final purchase at max ram`);
            let targetHostname = generateHostname(servers.length, maxRam);
            let success = purchaseServer(ns, targetHostname, maxRam);
            if (success) {
                let newServer = getServer(ns, targetHostname);
                servers.push(newServer);
                await setup(ns, newServer);
                workToBeDone = false;
                ns.print(`Final purchase at max ram complete`);
            }
        }
        await ns.sleep(1);
    }
}

function getArgs(ns: NS): void {
    if (ns.args.length > 0) {
        if (typeof ns.args[0] === "string" && ns.args[0] != "") {
            script = ns.args[0];
        }
    }

    if (ns.args.length > 1) {
        if (typeof ns.args[1] === "string" && ns.args[1] != "") {
            target = ns.args[1];
        }
    }
}

function getPurchasedServers(ns: NS): Array<Server> {
    let hostnames: Array<Host> = ns.getPurchasedServers();
    let servers: Array<Server> = [];
    hostnames.forEach(hostname => servers.push(getServer(ns, hostname)));
    return servers;
}

function generateHostname(index: number, ram: number): string {
    return `${prefix()}-${index}-${ram}GB`;
}

function getIndexFromHostname(hostname: string) {
    return parseInt(hostname.split("-")[1], 10);
}

function purchaseServer(ns: NS, targetHostname: Host, ram: number): boolean {
    let money: number = getMoney(ns);
    let cost: number = ns.getPurchasedServerCost(ram);
    let need: number = cost - money;
    if (need > 0 || ns.purchaseServer(targetHostname, ram) === "") {
        let needString: string = ns.nFormat(need, "$0.000a");
        ns.print(`Server purchase failed, need an additional $${needString}`);
        return false;
    }
    ns.print(`Server purchase success: ${targetHostname}`);
    return true;
}

async function setup(ns: NS, server: Server): Promise<void> {
    ns.scp(script, server.hostname);

    ns.killall(server.hostname);
    while (ns.ps(server.hostname).length > 0) {
        await ns.sleep(1);
    }

    let ram: number = server.ramFree(ns);
    let needed: number = ns.getScriptRam(script);
    let threads: number = Math.floor(ram / needed);
    ns.exec(script, server.hostname, threads, target);
    ns.print(`Server setup success: ${server.hostname}`);
}

function upgradeServer(ns: NS, server: Server) {
    let targetRam: number = server.ram * 2;
    if (targetRam > maxRam) { // Max ram for purchased servers
        return ""
    }
    let index: number = getIndexFromHostname(server.hostname);
    let targetHostname: string = generateHostname(index, targetRam);
    let money: number = getMoney(ns);
    let cost: number = ns.getPurchasedServerCost(targetRam);
    if (cost <= money) {
        if (purchaseServer(ns, targetHostname, targetRam)) {
            ns.killall(server.hostname);
            ns.deleteServer(server.hostname);
            ns.print(`Server upgrade success: ${targetHostname}`);
            return targetHostname;
        }
    }
    return "";
}