import {BitBurner as NS, Host, Script} from "Bitburner"
import {getServerPrefix as prefix} from "/scripts/import.js"
import {getMoney, Server, getServer} from "/scripts/utilities.js"

const ram: number = 8;
const target: Host = "foodnstuff";
const script: Script = "/scripts/autohack-target.js";

let maxServers: number;
let servers: Array<Server>;

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");

    maxServers = ns.getPurchasedServerLimit();
    servers = getPurchasedServers(ns);

    setupAll(ns, servers);

    while (servers.length < maxServers) {
        if (moneyNeedForNextServer(ns) > 0 || !purchaseServer(ns)) {
            let moneyNeeded: string = ns.nFormat(moneyNeedForNextServer(ns), "$0.000a");
            ns.print(`Need $${moneyNeeded} for next server`);
        }
        await ns.sleep(1);
    }
}

function getPurchasedServers(ns: NS) {
    let hostnames: Array<Host> = ns.getPurchasedServers();
    let servers: Array<Server> = [];
    hostnames.forEach(hostname => servers.push(getServer(ns, hostname)));
    return servers;
}

function purchaseServer(ns: NS): boolean {
    let hostname: Host = ns.purchaseServer(`${prefix()}-${servers.length}`, ram);
    if (hostname !== "") {
        let server: Server = getServer(ns, hostname);
        servers.push(server);
        ns.print(`New server purchased: ${server.hostname}`);
        setup(ns, server);
        return true;
    }
    return false;
}

function setupAll(ns: NS, servers: Array<Server>): void {
    servers.forEach(server => setup(ns, server));
}

function setup(ns: NS, server: Server): void {
    ns.killall(server.hostname);
    ns.scp(script, server.hostname);
    ns.exec(script, server.hostname, 3, target);
}

function moneyNeedForNextServer(ns: NS) {
    let money = getMoney(ns);
    let cost = ns.getPurchasedServerCost(ram);
    return cost - money;
}