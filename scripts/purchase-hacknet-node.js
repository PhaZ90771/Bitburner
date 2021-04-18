import { getMoney } from "/scripts/utilities.js";
const maxNodes = 999999;
const maxLevel = 200;
const maxRam = 64;
const maxCores = 16;
let nextNodeCost;
let nodeCount;
export async function main(ns) {
    let maxed = false;
    let atMaxNodes = false;
    updateNextNodeCost(ns);
    updateNodeCount(ns);
    while (!maxed) {
        ns.print("Looking into buying nodes");
        if (!atMaxNodes) {
            await buyMaxNodes(ns);
            atMaxNodes = isAtMaxNodes(ns);
        }
        else {
            ns.print("Already at max nodes");
        }
        ns.print(`Looking through ${nodeCount} nodes`);
        var atMaxStats = true;
        for (let i = 0; i < nodeCount; i++) {
            ns.print(`Looking at hacknet-node-${i}`);
            var stats = ns.hacknet.getNodeStats(i);
            let atMaxLevel = stats.level >= maxLevel;
            if (!atMaxLevel) {
                await buyMaxLevel(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxLevel = stats.level >= maxLevel;
            }
            let atMaxRam = stats.ram >= maxRam;
            if (!atMaxRam) {
                await buyMaxRam(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxRam = stats.ram >= maxRam;
            }
            let atMaxCores = stats.cores >= maxCores;
            if (!atMaxCores) {
                await buyMaxCores(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxCores = stats.cores >= maxCores;
            }
            atMaxStats = atMaxStats && atMaxLevel && atMaxRam && atMaxCores;
            await ns.sleep(1);
        }
        maxed = atMaxNodes && atMaxStats;
        await ns.sleep(1);
    }
    ns.print("All nodes purchased and fully upgraded");
}
function updateNextNodeCost(ns) {
    nextNodeCost = ns.hacknet.getPurchaseNodeCost();
}
function updateNodeCount(ns) {
    nodeCount = ns.hacknet.numNodes();
}
function isAtMaxNodes(ns) {
    return nodeCount >= maxNodes;
}
function buyNode(ns) {
    let money = getMoney(ns);
    ns.print(`Money: $${money}; Cost: $${nextNodeCost}`);
    if (nextNodeCost <= money) {
        ns.print("Attempting node purchase");
        let success = ns.hacknet.purchaseNode() != -1;
        if (success) {
            updateNodeCount(ns);
            updateNextNodeCost(ns);
            return true;
        }
    }
    return false;
}
async function buyMaxNodes(ns) {
    let purchaseCount = 0;
    let continuePurchasing = true;
    let atMax = isAtMaxNodes(ns);
    ns.print(`Node count at ${nodeCount}/${maxNodes}`);
    while (continuePurchasing) {
        var success = buyNode(ns);
        if (success) {
            ns.print("Node purchase success");
            purchaseCount++;
            atMax = isAtMaxNodes(ns);
        }
        else {
            ns.print("Node purchase failure");
        }
        continuePurchasing = success && !atMax;
        await ns.sleep(1);
    }
    ns.print(`Bought ${purchaseCount} nodes`);
    return;
}
async function buyMaxLevel(ns, i) {
    let money = getMoney(ns);
    let numToBuy = 0;
    let continueCounting = true;
    while (continueCounting) {
        let cost = ns.hacknet.getLevelUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
        await ns.sleep(1);
    }
    var success = ns.hacknet.upgradeLevel(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} level by ${numToBuy}`);
    }
    return;
}
async function buyMaxRam(ns, i) {
    let money = getMoney(ns);
    let numToBuy = 0;
    let continueCounting = true;
    while (continueCounting) {
        let cost = ns.hacknet.getRamUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
        await ns.sleep(1);
    }
    var success = ns.hacknet.upgradeRam(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} ram by ${numToBuy}`);
    }
    return;
}
async function buyMaxCores(ns, i) {
    let money = getMoney(ns);
    let numToBuy = 0;
    let continueCounting = true;
    while (continueCounting) {
        let cost = ns.hacknet.getCoreUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
        await ns.sleep(1);
    }
    var success = ns.hacknet.upgradeCore(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} cores by ${numToBuy}`);
    }
    return;
}
