import {BitBurner as NS, Host} from "Bitburner"

export async function main(ns: NS): Promise<void> {
    let target: Host = ns.args[0];
    ns.print(`Targeting -> ${target}`);
    let firstRun: boolean = true;

    while(true) {
        await ns.weaken(target);

        if (firstRun) {
            await ns.sleep(2000);
        }
        else {
            await ns.sleep(1);
        }
    }
}