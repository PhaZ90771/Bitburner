import { getServerPrefix as prefix } from "/scripts/import.js";
import { getMoney, getServer } from "/scripts/utilities.js";
const ram = 8;
const target = "foodnstuff";
const script = "/scripts/autohack-target.js";
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");
    let serverLimit = ns.getPurchasedServerLimit();
    let purchasedServerHostnames = ns.getPurchasedServers();
    setupAll(ns, purchasedServerHostnames);
    while (purchasedServerHostnames.length < serverLimit) {
        if (needForPurchase(ns) <= 0 && ) {
            let hostname = ns.purchaseServer(`${prefix()}-${purchasedServerHostnames.length}`, ram);
            if (hostname !== "") {
                purchasedServerHostnames = ns.getPurchasedServers();
                nextServerCost = ns.getPurchasedServerCost(ram);
                let server = getServer(ns, hostname);
                ns.print(`New server purchased: ${server.hostname}`);
                setup(ns, server);
            }
            else {
                money = getMoney(ns);
                let need = nextServerCost - money;
                ns.print(`Need $${need} for next server`);
            }
        }
        else {
            let need = nextServerCost - money;
            ns.print(`Need $${need} for next server`);
        }
        await ns.sleep(1);
    }
}
function purchaseServer(ns) {
    let hostname = ns.purchaseServer(`${prefix()}-${purchasedServerHostnames.length}`, ram);
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
function needForPurchase(ns) {
    let money = getMoney(ns);
    let cost = ns.getPurchasedServerCost(ram);
    return cost - money;
}
