import { getServers } from "/scripts/utilities.js";
import { getCodingContract } from "/scripts/contract-solver.js";
const cctFilter = ".cct";
export async function main(ns) {
    let contracts = getCodingContracts(ns);
    ns.print(contracts.length + " contract(s) found:");
    contracts.forEach(function (contract) {
        ns.print(contract.filename);
        ns.tprint(`${contract.filename} ${contract.hostname} (${contract.type}) {Solution Implemented: ${contract.solvable()}}`);
    });
}
export function getCodingContracts(ns) {
    let servers = getServers(ns);
    let contracts = [];
    for (let server of servers) {
        var files = ns.ls(server.hostname, cctFilter);
        for (let file of files) {
            let contract = getCodingContract(ns, file, server.hostname);
            contracts.push(contract);
        }
    }
    return contracts;
}
