import { runSolver } from "./contract-solver.js";
import { getCodingContracts } from "/scripts/find-contracts.js";
export async function main(ns) {
    let contracts = getCodingContracts(ns);
    contracts.forEach(function (contract) {
        runSolver(ns, contract);
    });
}
