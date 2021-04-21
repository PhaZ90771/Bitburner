import { getServerPrefix as prefix } from "/scripts/import.js";
import { getMoney, getServer } from "/scripts/utilities.js";
const ram = 8;
const target = "foodnstuff";
const script = "/scripts/autohack-target.js";
let maxServers;
let servers;
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");
    maxServers = ns.getPurchasedServerLimit();
    servers = getPurchasedServers(ns);
    setupAll(ns, servers);
    while (servers.length < maxServers) {
        if (moneyNeedForNextServer(ns) > 0 || !purchaseServer(ns)) {
            let moneyNeeded = ns.nFormat(moneyNeedForNextServer(ns), "$0.000a");
            ns.print(`Need $${moneyNeeded} for next server`);
        }
        await ns.sleep(1);
    }
}
function getPurchasedServers(ns) {
    let hostnames = ns.getPurchasedServers();
    let servers = [];
    hostnames.forEach(hostname => servers.push(getServer(ns, hostname)));
    return servers;
}
function purchaseServer(ns) {
    let hostname = ns.purchaseServer(`${prefix()}-${servers.length}`, ram);
    if (hostname !== "") {
        let server = getServer(ns, hostname);
        ns.print(`New server purchased: ${server.hostname}`);
        setup(ns, server);
        return true;
    }
    return false;
}
function setupAll(ns, servers) {
    servers.forEach(server => setup(ns, server));
}
function setup(ns, server) {
    ns.killall(server.hostname);
    ns.scp(script, server.hostname);
    ns.exec(script, server.hostname, 3, target);
}
function moneyNeedForNextServer(ns) {
    let money = getMoney(ns);
    let cost = ns.getPurchasedServerCost(ram);
    return cost - money;
}
