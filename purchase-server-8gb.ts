import {BitBurner as NS, Host, Script} from "Bitburner"
import {getServerPrefix as prefix} from "/scripts/import.js"
import {getMoney, Server, getServer} from "/scripts/utilities.js"

const ram: number = 8;
const target: Host = "foodnstuff";
const script: Script = "/scripts/autohack-target.js";

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");

    let serverLimit: number = ns.getPurchasedServerLimit();

    let purchasedServerHostnames: Array<Host> = ns.getPurchasedServers();
    let nextServerCost: number = ns.getPurchasedServerCost(ram);

    for (let i: number = 0; i < purchasedServerHostnames.length; i++) {
        let server: Server = getServer(ns, purchasedServerHostnames[i]);
        setup(ns, server);
    }

    while (purchasedServerHostnames.length < serverLimit) {
        let money: number = getMoney(ns);

        if (money <= nextServerCost) {
            let hostname: Host = ns.purchaseServer(`${prefix()}-${purchasedServerHostnames.length}`, ram);
            purchasedServerHostnames = ns.getPurchasedServers();
            nextServerCost = ns.getPurchasedServerCost(ram);

            let server: Server = getServer(ns, hostname);
            ns.print(`New server purchased: ${server.hostname}`);

            setup(ns, server);
        }
        else {
            let need: number = nextServerCost - money;
            ns.print(`Need $${need} for next server`);
        }
        await ns.sleep(1);
    }
}

function setup(ns: NS, server: Server): void {
    ns.killall(server.hostname);
    ns.scp(script, server.hostname);
    ns.exec(script, server.hostname, 3, target);
}