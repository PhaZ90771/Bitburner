import { getServerPrefix as prefix } from "/scripts/import.js";
import { getMoney, getServer } from "/scripts/utilities.js";
const defaultRam = 8;
let script = "/scripts/autohack-target.js";
let target = "foodnstuff";
export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("purchaseServer");
    ns.disableLog("sleep");
    let maxServers = ns.getPurchasedServerLimit() - 1;
    getArgs(ns);
    let servers = getPurchasedServers(ns);
    let initialPass = true;
    while (true) {
        for (let i = 0; i < servers.length; i++) {
            let newHostname = upgradeServer(ns, servers[i]);
            let upgraded = newHostname !== "";
            if (upgraded) {
                servers[i] = getServer(ns, newHostname);
            }
            if (upgraded || initialPass) {
                await setup(ns, servers[i]);
            }
        }
        initialPass = false;
        while (servers.length < maxServers) {
            let targetHostname = generateHostname(servers.length, defaultRam);
            let success = purchaseServer(ns, targetHostname, defaultRam);
            if (success) {
                let newServer = getServer(ns, targetHostname);
                servers.push(newServer);
                await setup(ns, newServer);
            }
            await ns.sleep(1);
        }
        await ns.sleep(1);
    }
}
function getArgs(ns) {
    if (ns.args.length > 0) {
        if (typeof ns.args[0] === "string" && ns.args[0] != "") {
            script = ns.args[0];
        }
    }
    if (ns.args.length > 1) {
        if (typeof ns.args[1] === "string" && ns.args[1] != "") {
            target = ns.args[1];
        }
    }
}
function getPurchasedServers(ns) {
    let hostnames = ns.getPurchasedServers();
    let servers = [];
    hostnames.forEach(hostname => servers.push(getServer(ns, hostname)));
    return servers;
}
function generateHostname(index, ram) {
    return `${prefix()}-${index}-${ram}GB`;
}
function getIndexFromHostname(hostname) {
    return parseInt(hostname.split("-")[1], 10);
}
function purchaseServer(ns, targetHostname, ram) {
    let money = getMoney(ns);
    let cost = ns.getPurchasedServerCost(ram);
    let need = cost - money;
    if (need <= 0 || ns.purchaseServer(targetHostname, ram) === "") {
        let needString = ns.nFormat(need, "$0.000a");
        ns.print(`Server purchase failed, need an additional $${needString}`);
        return false;
    }
    ns.print(`Server purchase success`);
    return true;
}
async function setup(ns, server) {
    ns.scp(script, server.hostname);
    ns.killall(server.hostname);
    while (ns.ps(server.hostname).length > 0) {
        await ns.sleep(1);
    }
    let ram = server.ramFree(ns);
    let needed = ns.getScriptRam(script);
    let threads = Math.floor(ram / needed);
    ns.exec(script, server.hostname, threads, target);
}
function upgradeServer(ns, server) {
    let index = getIndexFromHostname(server.hostname);
    let targetRam = server.ram * 2;
    let targetHostname = generateHostname(index, targetRam);
    let money = getMoney(ns);
    let cost = ns.getPurchasedServerCost(targetRam);
    if (cost <= money) {
        if (purchaseServer(ns, targetHostname, targetRam)) {
            ns.killall(server.hostname);
            ns.deleteServer(server.hostname);
            return targetHostname;
        }
    }
    return "";
}