import {BitBurner as NS, Host, Script} from "Bitburner"
import {runSolver} from "./contract-solver.js";
import {getCodingContracts} from "/scripts/find-contracts.js";
import {CodingContractInfo} from "/scripts/utilities.js";

export async function main(ns: NS): Promise<void> {
    let contracts: Array<CodingContractInfo> = getCodingContracts(ns);
    contracts.forEach(function (contract: CodingContractInfo) {
        runSolver(ns, contract);
    });
}