// @ts-ignore 
import {BitBurner as NS} from "BitBurner"

export function GetServers(ns: NS) {
    var servers = ns.scan("home");
    ns.tprint(servers);
}

export function getMoney(ns: NS) {
    return ns.getServerMoneyAvailable("home");
}