export function GetServers(ns) {
    var servers = ns.scan("home");
    ns.tprint(servers);
}
export function getMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}
