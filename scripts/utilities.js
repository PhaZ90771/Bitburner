export function GetServers(ns) {
    var servers = ns.scan("home");
    ns.tprint(servers);
}
