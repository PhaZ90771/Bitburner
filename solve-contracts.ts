import {BitBurner as NS, Host, Script} from "Bitburner"
import { runSolver } from "./contract-solver";
import {getCodingContracts} from "/scripts/find-contracts";
import {CodingContractInfo} from "/scripts/utilities";

export async function main(ns: NS): Promise<void> {
    let contracts: Array<CodingContractInfo> = getCodingContracts(ns);
    contracts.forEach(function (contract: CodingContractInfo) {
        runSolver(ns, contract);
    });
}