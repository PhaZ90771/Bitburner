import {BitBurner as NS, Host, Script} from "Bitburner"
import {getServerPrefix as prefix} from "/scripts/import.js"
import {getMoney} from "/scripts/utilities.js"

const ram: number = 8;
const target: Host = "foodnstuff";
const script: Script = "/scripts/autohack-target.js";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");

    let serverLimit: number = ns.getPurchasedServerLimit();

    let servers: Array<Host> = ns.getPurchasedServers();
    let nextServerCost: number = ns.getPurchasedServerCost(ram);

    for (let i: number = 0; i < servers.length; i++) {
        setup(ns, servers[i]);
    }

    while (servers.length < serverLimit) {
        let money: number = getMoney(ns);

        if (money <= nextServerCost) {
            let server: Host = ns.purchaseServer(`${prefix()}-${servers.length}`, ram);
            servers = ns.getPurchasedServers();
            nextServerCost = ns.getPurchasedServerCost(ram);
            ns.print(`New server purchased: ${server}`);

            setup(ns, server);
        }
        else {
            let need: number = nextServerCost - money;
            ns.print(`Need $${need} for next server`);
        }
        await ns.sleep(1);
    }
}

function setup(ns: NS, server: Host): void {
    ns.killall(server);
    ns.scp(script, server);
    ns.exec(script, server, 3, target);
}