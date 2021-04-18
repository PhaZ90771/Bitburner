// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

export function GetServers(ns: NS) {
    var servers: Array<string> = ns.scan("home");
    ns.tprint(servers);
}

export function getMoney(ns: NS) {
    return ns.getServerMoneyAvailable("home");
}

export function getServers(ns: NS) {
    let servers: Map<string, Server> = new Map<string, Server>();
    hostnames.forEach(hostname => addServer(ns, servers, hostname));
    return servers;
}

function addServer(ns: NS, servers: Map<string, Server>, hostname: string) {
    if (ns.serverExists(hostname)) {
        let server: Server = {
            hostname: hostname,
            portsRequired: ns.getServerNumPortsRequired(hostname),
            rooted: function(ns: NS): boolean {
                return ns.hasRootAccess(hostname);
            },
        }
        servers.set(hostname, server);
    }
}

type Server = {
    hostname: string,
    portsRequired: number,
    rooted: Function,
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