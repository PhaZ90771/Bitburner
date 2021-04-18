import { getServerPrefix as prefix } from "/scripts/import.js";
import { getMoney } from "/scripts/utilities.js";
const ram = 8;
const target = "foodnstuff";
const script = "/scripts/autohack-target.js";
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    let serverLimit = ns.getPurchasedServerLimit();
    let servers = ns.getPurchasedServers();
    let nextServerCost = ns.getPurchasedServerCost(ram);
    for (let i = 0; i < servers.length; i++) {
        setup(ns, servers[i]);
    }
    while (servers.length < serverLimit) {
        let money = getMoney(ns);
        if (money <= nextServerCost) {
            let server = ns.purchaseServer(`${prefix()}-${servers.length}`, ram);
            servers = ns.getPurchasedServers();
            nextServerCost = ns.getPurchasedServerCost(ram);
            ns.print(`New server purchased: ${server}`);
            setup(ns, server);
        }
        else {
            let need = nextServerCost - money;
            ns.print(`Need $${need} for next server`);
        }
        await ns.sleep(1);
    }
}
function setup(ns, server) {
    ns.killall(server);
    ns.scp(script, server);
    ns.exec(script, server, 3, target);
}
