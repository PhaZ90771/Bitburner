export async function main(ns) {
    let target = ns.args[0];
    ns.print(`Targeting -> ${target}`);
    let firstRun = true;
    while (true) {
        await ns.weaken(target);
        if (firstRun) {
            await ns.sleep(2000);
        }
        else {
            await ns.sleep(1);
        }
    }
}
