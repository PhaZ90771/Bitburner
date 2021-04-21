import {BitBurner as NS} from "Bitburner"
import {getServers, Server} from "/scripts/utilities.js"
import {getCodingContract, CodingContractInfo} from "/scripts/contract-solver.js"

const cctFilter: string = ".cct";

export async function main(ns: NS): Promise<void> {
    let contracts: Array<CodingContractInfo> = getCodingContracts(ns);
    ns.print(contracts.length + " contract(s) found:");
    contracts.forEach(function (contract: CodingContractInfo) {
        ns.print(contract.filename);
        ns.tprint(`${contract.filename} ${contract.hostname} (${contract.type}) {Solution Implemented: ${contract.solvable()}}`);
    });
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