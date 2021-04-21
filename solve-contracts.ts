import {BitBurner as NS, Host, Script} from "Bitburner"
import {CodingContractInfo, runSolver} from "./contract-solver.js";
import {getCodingContracts} from "/scripts/find-contracts.js";

export async function main(ns: NS): Promise<void> {
    let contracts: Array<CodingContractInfo> = getCodingContracts(ns);
    contracts.forEach(function (contract: CodingContractInfo) {
        runSolver(ns, contract);
    });
}