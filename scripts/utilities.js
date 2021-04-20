import { hasSolver } from "/scripts/contract-solver.js";
export function getMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}
export function getServers(ns) {
    let servers = [];
    hostnames.forEach(hostname => addServer(ns, servers, hostname));
    return servers;
}
export function getCodingContract(ns, filename, hostname) {
    let contract = {
        hostname: hostname,
        filename: filename,
        type: ns.codingcontract.getContractType(filename, hostname),
        description: ns.codingcontract.getDescription(filename, hostname),
        data: ns.codingcontract.getData(filename, hostname),
        numTries: function (ns) {
            return ns.codingcontract.getNumTriesRemaining(filename, hostname);
        },
        attempt: function (ns, answer) {
            let rewardMessage = ns.codingcontract.attempt(answer, filename, hostname, { returnReward: true }).toString();
            this.solved = rewardMessage !== "";
            if (!this.solved) {
                rewardMessage = "Wrong answer";
            }
            return rewardMessage;
        },
        solved: false,
        solvable: function () {
            return hasSolver(this.type);
        },
    };
    return contract;
}
function addServer(ns, servers, hostname) {
    if (ns.serverExists(hostname)) {
        let server = getServer(ns, hostname);
        servers.push(server);
    }
}
export function getServer(ns, hostname) {
    let server = {
        hackingRequired: ns.getServerRequiredHackingLevel(hostname),
        hostname: hostname,
        moneyMax: ns.getServerMaxMoney(hostname),
        portsRequired: ns.getServerNumPortsRequired(hostname),
        rooted: function (ns) {
            return ns.hasRootAccess(hostname);
        },
        ram: ns.getServerRam(hostname)[0],
        ramFree: function (ns) {
            return this.ram - ns.getServerRam(hostname)[1];
        },
        ramUsed: function (ns) {
            return ns.getServerRam(hostname)[1];
        },
        securityMin: ns.getServerMinSecurityLevel(hostname),
    };
    return server;
}
let hostnames = [
    "foodnstuff",
    "sigma-cosmetics",
    "joesguns",
    "nectar-net",
    "hong-fang-tea",
    "harakiri-sushi",
    "neo-net",
    "zer0",
    "max-hardware",
    "iron-gym",
    "CSEC",
    "johnson-ortho",
    "crush-fitness",
    "omega-net",
    "the-hub",
    "silver-helix",
    "avmnite-02h",
    "phantasy",
    "netlink",
    "catalyst",
    "I.I.I.I",
    "comptek",
    "rothman-uni",
    "summit-uni",
    "rho-construction",
    "syscore",
    "lexo-corp",
    "nova-med",
    "aevum-police",
    "alpha-ent",
    "global-pharm",
    "snap-fitness",
    "unitalife",
    "univ-energy",
    "zb-def",
    "run4theh111z",
    ".",
    "applied-energetics",
    "zb-institute",
    "aerocorp",
    "omnia",
    "zeus-med",
    "deltaone",
    "defcomm",
    "taiyang-digital",
    "galactic-cyber",
    "icarus",
    "solaris",
    "infocomm",
    "darkweb",
    "powerhouse-fitness",
    "stormtech",
    "omnitek",
    "blade",
    "megacorp",
    "nwo",
    "ecorp",
    "The-Cave",
    "clarkinc",
    "fulcrumassets",
    "titan-labs",
    "fulcrumtech",
    "microdyne",
    "helios",
    "vitalife",
    "4sigma",
    "kuai-gong",
    "b-and-a",
];
