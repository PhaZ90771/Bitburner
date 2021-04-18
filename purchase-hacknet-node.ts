// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

import {getMoney} from "/scripts/utilities.js"

//hacknet.maxNumNodes() currently returns undefined, which amy be fixed in the future
const maxNodes: number = 999999;
const maxLevel: number = 200;
const maxRam: number = 64;
const maxCores: number = 16;

let nextNodeCost: number;
let nodeCount: number;

export async function main(ns: NS) {
    let maxed: boolean = false;
    let atMaxNodes: boolean = false;

    updateNextNodeCost(ns);
    updateNodeCount(ns);

    while (!maxed) {
        ns.print("Looking into buying nodes");
        if (!atMaxNodes) {
            buyMaxNodes(ns);
            atMaxNodes = isAtMaxNodes(ns);
        }
        else {
            ns.print("Already at max nodes");
        }

        ns.print(`Looking through ${nodeCount} nodes`);
        var atMaxStats = true;
        for (let i: number = 0; i < nodeCount; i++) {
            ns.print(`Looking at hacknet-node-${i}`);
            var stats: NodeStats = ns.hacknet.getNodeStats(i);

            // Level
            let atMaxLevel: boolean = stats!.level >= maxLevel;
            if (!atMaxLevel) {
                buyMaxLevel(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxLevel = stats!.level >= maxLevel;
            }

            // Ram
            let atMaxRam: boolean = stats!.ram >= maxRam;
            if (!atMaxRam) {
                buyMaxRam(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxRam = stats!.ram >= maxRam;
            }

            // Core
            let atMaxCores: boolean = stats!.cores >= maxCores;
            if (!atMaxCores) {
                buyMaxCores(ns, i);
                stats = ns.hacknet.getNodeStats(i);
                atMaxCores = stats!.cores >= maxCores;
            }

            atMaxStats = atMaxStats && atMaxLevel && atMaxRam && atMaxCores;
        }

        maxed = atMaxNodes && atMaxStats;
    }

    ns.print("All nodes purchased and fully upgraded");
}

function updateNextNodeCost(ns: NS) {
    nextNodeCost = ns.hacknet.getPurchaseNodeCost();
}

function updateNodeCount(ns: NS) {
    nodeCount = ns.hacknet.numNodes();
}

function isAtMaxNodes(ns: NS) {
    return nodeCount >= maxNodes;
}

function buyNode(ns: NS) {
    let money: number = getMoney(ns);

    ns.print(`Money: $${money}; Cost: $${nextNodeCost}`);
    if (nextNodeCost <= money) {
        ns.print("Attempting node purchase");
        let success: boolean = ns.hacknet.purchaseNode() != -1;
        if (success) {
            updateNodeCount(ns);
            updateNextNodeCost(ns);
            return true;
        }
    }
    return false;
}

function buyMaxNodes(ns: NS) {
    let purchaseCount: number = 0;
    let continuePurchasing: boolean = true;
    let atMax: boolean = isAtMaxNodes(ns);

    ns.print(`Node count at ${nodeCount}/${maxNodes}`);
    while (continuePurchasing)  {
        var success: boolean = buyNode(ns);
        if (success) {
            ns.print("Node purchase success");
            purchaseCount++;
            atMax = isAtMaxNodes(ns);
        }
        else {
            ns.print("Node purchase failure");
        }
        continuePurchasing = success && !atMax;
    }

    ns.print(`Bought ${purchaseCount} nodes`);
    return;
}

function buyMaxLevel(ns: NS, i: number) {
    let money: number = getMoney(ns);
    let numToBuy: number = 0;
    let continueCounting: boolean = true;
    while (continueCounting) {
        let cost: number  = ns.hacknet.getLevelUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
    }

    var success: boolean = ns.hacknet.upgradeLevel(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} level by ${numToBuy}`);
    }
    return;
}

function buyMaxRam(ns: NS, i: number) {
    let money: number = getMoney(ns);
    let numToBuy: number = 0;
    let continueCounting: boolean = true;
    while (continueCounting) {
        let cost: number  = ns.hacknet.getRamUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
    }

    var success: boolean = ns.hacknet.upgradeRam(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} ram by ${numToBuy}`);
    }
    return;
}

function buyMaxCores(ns: NS, i: number) {
    let money: number = getMoney(ns);
    let numToBuy: number = 0;
    let continueCounting: boolean = true;
    while (continueCounting) {
        let cost: number  = ns.hacknet.getCoreUpgradeCost(i, numToBuy + 1);
        if (cost == Infinity) {
            return;
        }
        if (cost <= money) {
            numToBuy++;
        }
        else {
            continueCounting = false;
        }
    }

    var success: boolean = ns.hacknet.upgradeCore(i, numToBuy);
    if (success) {
        ns.print(`Upgrading hacknet-node-${i} cores by ${numToBuy}`);
    }
    return;
}

type NodeStats = {
    name: string,
    level: number,
    ram: number,
    cores: number,
    cache: number,
    hashCapacity: number,
    production: number,
    timeOnline: number,
    totalProduction: number
}