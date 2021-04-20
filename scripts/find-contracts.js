import { hasSolver } from "/scripts/contract-solver.js";
import { getServers, getCodingContract } from "/scripts/utilities.js";
const cctFilter = ".cct";
let numberToFind;
export async function main(ns) {
    getSearchLimit(ns);
    let found = 0;
    let servers = getServers(ns);
    for (let server of servers) {
        var files = ns.ls(server.hostname, cctFilter);
        ns.print(files.length + " contract(s) found:");
        for (let file of files) {
            let contract = getCodingContract(ns, file, server.hostname);
            let solvable = hasSolver(contract.type);
            ns.print(file);
            ns.tprint(`${file} ${server.hostname} (${contract.type}) {Solution Implemented: ${solvable}}`);
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
function getSearchLimit(ns) {
    if (ns.args.length > 0 && typeof ns.args[0] === "number" && ns.args[0] > 0) {
        numberToFind = ns.args[0];
        ns.print("Limiting to first " + numberToFind + " contract(s)");
        ns.tprint("Limiting to first " + numberToFind + " contract(s)");
    }
    else {
        numberToFind = -1;
    }
}
