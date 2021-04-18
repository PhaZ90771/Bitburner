export async function main(ns) {
    var target = ns.args[0];
    var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    var securityThresh = ns.getServerMinSecurityLevel(target) + 5;
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            ns.weaken(target);
        }
        else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            ns.grow(target);
        }
        else {
            ns.hack(target);
        }
        ns.sleep(1);
    }
}
