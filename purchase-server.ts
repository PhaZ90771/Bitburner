import {BitBurner as NS, Host, Script} from "Bitburner"
import {getServerPrefix as prefix} from "/scripts/import.js"
import {getMoney, Server, getServer} from "/scripts/utilities.js"

const defaultRam: number = 8;

let script: Script = "/scripts/autohack-target.js";
let target: Host = "foodnstuff";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");

    let maxServers: number = ns.getPurchasedServerLimit() - 1;
    getArgs(ns);
    let servers: Array<Server> = getPurchasedServers(ns);
    let initialPass: boolean = true;

    while(true) {
        for (let i: number = 0; i < servers.length; i++)  {
            let newHostname: string = upgradeServer(ns, servers[i]);
            let upgraded: boolean = newHostname !== "";
            if (upgraded) {
                servers[i] = getServer(ns, newHostname);
            }
            if (upgraded || initialPass) {
                await setup(ns, servers[i]);
            }
        }
        initialPass = false;

        while (servers.length < maxServers) {
            let targetHostname = generateHostname(servers.length, defaultRam);
            let success = purchaseServer(ns, targetHostname, defaultRam);
            if (success) {
                let newServer = getServer(ns, targetHostname);
                servers.push(newServer);
                await setup(ns, newServer);
            }
            await ns.sleep(1);
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
    if (need <= 0 || ns.purchaseServer(targetHostname, ram) === "") {
        let needString: string = ns.nFormat(need, "$0.000a");
        ns.print(`Server purchase failed, need an additional $${needString}`);
        return false;
    }
    ns.print(`Server purchase success`);
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
}

function upgradeServer(ns: NS, server: Server) {
    let index: number = getIndexFromHostname(server.hostname);
    let targetRam: number = server.ram * 2;
    let targetHostname: string = generateHostname(index, targetRam);
    let money: number = getMoney(ns);
    let cost: number = ns.getPurchasedServerCost(targetRam);
    if (cost <= money) {
        if (purchaseServer(ns, targetHostname, targetRam)) {
            ns.killall(server.hostname);
            ns.deleteServer(server.hostname);
            return targetHostname;
        }
    }
    return "";
}