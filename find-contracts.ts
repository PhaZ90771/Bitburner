import {BitBurner as NS, CodingContract, CodingContractTypes} from "Bitburner"
import {hasSolver} from "/scripts/contract-solver.js";
import {getServers, Server, getCodingContract, CodingContractInfo} from "/scripts/utilities.js"

const cctFilter: string = ".cct";
let numberToFind: number;

export async function main(ns: NS): Promise<void> {
    getSearchLimit(ns);
    let found: number = 0;
    let servers: Array<Server> = getServers(ns);

    for (let server of servers) {
        var files = ns.ls(server.hostname, cctFilter);
        ns.print(files.length + " contract(s) found:");

        for(let file of files) {
            let contract: CodingContractInfo = getCodingContract(ns, file, server.hostname);
            let solvable: boolean = hasSolver(contract.type);

            ns.print(file);
            ns.tprint(`[${server.hostname}] ${file} (${contract.type}) {Solution Implemented: ${solvable}}`);

            if (numberToFind != -1) {
                found++;
                if (found >= numberToFind) {
                    ns.print(`Limit of ${numberToFind} contract(s) reached`);
                    ns.exit();
                }
            }
        }
    }
}

function getSearchLimit(ns: NS): void {
    if (ns.args.length > 0 && typeof ns.args[0] === "number" && ns.args[0] > 0) {
        numberToFind = ns.args[0];
        ns.print("Limiting to first " + numberToFind + " contract(s)");
        ns.tprint("Limiting to first " + numberToFind + " contract(s)");
    }
    else {
        numberToFind = -1;
    }
}
