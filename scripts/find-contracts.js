import { getServers } from "/scripts/utilities.js";
import { getCodingContract } from "/scripts/contract-solver.js";
const cctFilter = ".cct";
let solvableFilter = null;
export async function main(ns) {
    getArgs(ns);
    let contracts = getCodingContracts(ns);
    if (solvableFilter !== null) {
        contracts = contracts.filter(c => c.solvable() === solvableFilter);
    }
    ns.print(`${contracts.length} coding contract(s) found:`);
    contracts.forEach(function (contract) {
        ns.print(contract.filename);
        ns.tprint(`${contract.filename} ${contract.hostname} (${contract.type}) {Solution Implemented: ${contract.solvable()}}`);
    });
}
function getArgs(ns) {
    if (ns.args.length > 0 && typeof ns.args[0] === "string") {
        solvableFilter = ns.args[0] === "true";
        let message = solvableFilter ? "solvable" : "not solvable";
        ns.tprint(`Restricting to coding contracts that are ${message}`);
    }
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
