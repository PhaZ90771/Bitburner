import {BitBurner as NS, Host} from "Bitburner"

export async function main(ns: NS): Promise<void> {
    var target: Host = ns.args[0];
    ns.print(`Targeting -> ${target}`);

    var moneyThresh: number = ns.getServerMaxMoney(target) * 0.75;
    var securityThresh: number = ns.getServerMinSecurityLevel(target) + 5;

    while(true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        }
        else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            await ns.grow(target);
        }
        else {
            await ns.hack(target);
        }

        await ns.sleep(1);
    }
}