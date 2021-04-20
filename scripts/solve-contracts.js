import { runSolver } from "./contract-solver";
import { getCodingContracts } from "/scripts/find-contracts";
export async function main(ns) {
    let contracts = getCodingContracts(ns);
    contracts.forEach(function (contract) {
        runSolver(ns, contract);
    });
}
