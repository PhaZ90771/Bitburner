// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

export function getMoney(ns: NS): number {
    return ns.getServerMoneyAvailable("home");
}

export function getServers(ns: NS): Array<Server> {
    let servers: Array<Server> = [];
    hostnames.forEach(hostname => addServer(ns, servers, hostname));
    return servers;
}

export function getSolvableContractTypes(): Array<string> {
    let solvableContractTypes: Array<string> = [
        "Array Jumping Game",
        "Minimum Path Sum in a Triangle",
        "Spiralize Matrix",
        "Subarray with Maximum Sum",
        "Unique Paths in a Grid II",
    ];
    return solvableContractTypes;
}

function addServer(ns: NS, servers: Array<Server>, hostname: string): void {
    if (ns.serverExists(hostname)) {
        let server: Server = {
            hostname: hostname,
            portsRequired: ns.getServerNumPortsRequired(hostname),
            rooted: function(ns: NS): boolean {
                return ns.hasRootAccess(hostname);
            },
            ram: ns.getServerRam(hostname)[0],
            ramFree: function(ns: NS): number {
                return this.ram - ns.getServerRam(hostname)[1];
            },
            ramUsed: function(ns: NS): number {
                return ns.getServerRam(hostname)[1];
            },
        }
        servers.push(server);
    }
}

type Server = {
    hostname: string,
    portsRequired: number,
    rooted: Function,
    ram: number,
    ramFree: Function,
    ramUsed: Function,
}

let hostnames: Array<string> = [
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