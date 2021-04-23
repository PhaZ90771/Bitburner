import {BitBurner as NS} from "Bitburner"
import {getServers, Server} from "/scripts/utilities.js"
import {getCodingContract, CodingContractInfo} from "/scripts/contract-solver.js"

const cctFilter: string = ".cct";

let solvableFilter: boolean | null = null;

export async function main(ns: NS): Promise<void> {
    let contracts: Array<CodingContractInfo> = getCodingContracts(ns);
    if (solvableFilter !== null) {
        let message: string = solvableFilter ? "solvable" : "not solvable";
        ns.print(`Restricting to coding contracts that are ${message}`);
        contracts = contracts.filter(c => c.solvable() === solvableFilter);
    }
    ns.print(`${contracts.length} coding contract(s) found:`);
    contracts.forEach(function (contract: CodingContractInfo) {
        ns.print(contract.filename);
        ns.tprint(`${contract.filename} ${contract.hostname} (${contract.type}) {Solution Implemented: ${contract.solvable()}}`);
    });
}

function getArgs(ns: NS) {
    if (ns.args.length > 0 && typeof ns.args[0] === "string") {
        solvableFilter = ns.args[0] === "true";
    }
}

export function getCodingContracts(ns: NS): Array<CodingContractInfo> {
    let servers: Array<Server> = getServers(ns);
    let contracts: Array<CodingContractInfo> = [];

    for (let server of servers) {
        var files = ns.ls(server.hostname, cctFilter);

        for(let file of files) {
            let contract: CodingContractInfo = getCodingContract(ns, file, server.hostname);
            contracts.push(contract);
        }
    }
    return contracts;
}