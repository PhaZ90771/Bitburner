import { getServerPrefix as prefix } from "/scripts/import.js";
import { getMoney, getServer } from "/scripts/utilities.js";
const ram = 8;
const target = "foodnstuff";
const script = "/scripts/autohack-target.js";
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    let serverLimit = ns.getPurchasedServerLimit();
    let purchasedServerHostnames = ns.getPurchasedServers();
    let nextServerCost = ns.getPurchasedServerCost(ram);
    for (let i = 0; i < purchasedServerHostnames.length; i++) {
        let server = getServer(ns, purchasedServerHostnames[i]);
        setup(ns, server);
    }
    while (purchasedServerHostnames.length < serverLimit) {
        let money = getMoney(ns);
        if (money <= nextServerCost) {
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
function setup(ns, server) {
    ns.killall(server.hostname);
    ns.scp(script, server.hostname);
    ns.exec(script, server.hostname, 3, target);
}
