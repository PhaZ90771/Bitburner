import {BitBurner as NS, CodingContractTypes, Host, Script} from "Bitburner"

export async function main(ns: NS): Promise<void> {
    let filename: Script = ns.args[0];
    let hostname: Host = ns.args[1];
    // TODO: Check whether hostname and filename are valid
    let contract: CodingContractInfo = getCodingContract(ns, filename, hostname);
    await runSolver(ns, contract);
}

export function getCodingContract(ns: NS, filename: Script, hostname: Host): CodingContractInfo {
    let contract: CodingContractInfo = {
        hostname: hostname,
        filename: filename,
        type: ns.codingcontract.getContractType(filename, hostname),
        description: ns.codingcontract.getDescription(filename, hostname),
        data: ns.codingcontract.getData(filename, hostname),
        numTries: function(ns: NS): number {
            return ns.codingcontract.getNumTriesRemaining(filename, hostname);
        },
        attempt: function (ns:NS, answer: any): string {
            let rewardMessage: string = ns.codingcontract.attempt(answer, filename, hostname, {returnReward: true}).toString();
            this.solved = rewardMessage !== "";
            if (!this.solved) {
                rewardMessage = "Wrong answer"
            }
            return rewardMessage;
        },
        solved: false,
        solvable: function (): boolean {
            return hasSolver(this.type);
        },
    };
    return contract;
}

export type CodingContractInfo = {
    hostname: Host,
    filename: Script,
    type: CodingContractTypes,
    description: string,
    data: any,
    numTries: Function,
    attempt: Function,
    solved: boolean,
    solvable: Function,
}

export function hasSolver(type: CodingContractTypes) {
    return solvers[type] != null;
}

function printStatus(ns: NS, contract: CodingContractInfo, status: string): void {
    ns.clearLog();
    
    ns.print(contract.type);

    ns.print("/data/");
    ns.print(contract.data);
    
    ns.print("/status/");
    ns.print(status);
}

export async function runSolver(ns: NS, contract: CodingContractInfo): Promise<void> {
    printStatus(ns, contract, "Selecting solver...");
    if (solvers[contract.type] != null) {
        let answer: string = await solvers[contract.type](ns, contract);
        printStatus(ns, contract, `Answer is: ${answer}`);
        let rewardMessage = contract.attempt(ns, answer);
        printStatus(ns, contract, rewardMessage);
        ns.tprint(rewardMessage);
    }
    else {
        printStatus(ns, contract, `Solver has not been implemented yet for: ${contract.type}`);
        ns.exit();
    }
}

let SubarrayWithMaximumSum_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number> {
    let args: SubarrayWithMaximumSum_Args = {
        largestSum: contract.data[0],
        start: 0,
        position: 0,
        progress: function (): string {
            return `"Largest subarray sum is: [${this.start}:#{i}]${this.largestSum}`;
        }
    }
    return await SubarrayWithMaximumSum_Solve(ns, contract, args);
}
async function SubarrayWithMaximumSum_Solve(ns: NS, contract: CodingContractInfo, args: SubarrayWithMaximumSum_Args): Promise<number> {
    await ns.sleep(1);
    printStatus(ns, contract, args.progress(ns));
    
    while (args.start < contract.data.length) {
        let sum: number = 0;
        args.position = args.start;
        while (args.position < contract.data.length) {
            sum += contract.data[args.position];
            if (sum > args.largestSum) {
                args.largestSum = sum;
                printStatus(ns, contract, args.progress());
            }
            args.position++;
        }
        args.start++;
    }
    
    return args.largestSum;
}
type SubarrayWithMaximumSum_Args = {
    largestSum: number,
    start: number,
    position: number,
    progress: Function,
}

let SpiralizeMatrix_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number[]> {
    let args: SpiralizeMatrix_Args = {
        current: 0,
        max: contract.data.length * contract.data[0].length,
        progress: function (ns: NS): string {
            return ns.nFormat(this.current / this.max, "0.0%");
        },
    }
    return await SpiralizeMatrix_Solve(ns, contract, args);
}
async function SpiralizeMatrix_Solve(ns: NS, contract: CodingContractInfo, args: SpiralizeMatrix_Args): Promise<number[]>  {
    await ns.sleep(1);
    let ret: Array<number> = [];
    printStatus(ns, contract, args.progress(ns));
    
    let left: number = 0;
    let right: number = contract.data[0].length - 1;
    let top: number = 0;
    let bottom: number = contract.data.length - 1;
    let x: number = 0;
    let y: number = 0;
    let end: boolean = false;
    
    for (let dir: number = 0; !end; dir = (dir + 1) % 4) { // Cycles through 0..3 repeatedly
        switch (dir) {
            case 0:
                x = left;
                y = top;
                break;
            case 1:
                x = right;
                y = top;
                break;
            case 2:
                x = right;
                y = bottom;
                break;
            case 3:
                x = left;
                y = bottom;
                break;
        }
        
        let dirEnd: boolean = false;
        while (!dirEnd) {
            ret.push(contract.data[y][x]);
            
            switch (dir) {
            case 0:
                x++;
                dirEnd = x > right;
                break;
            case 1:
                y++;
                dirEnd = y > bottom;
                break;
            case 2:
                x--;
                dirEnd = x < left;
                break;
            case 3:
                y--;
                dirEnd = y < top;
                break;
            }
        }
        
        switch (dir) {
            case 0:
                top++;
                break;
            case 1:
                right--;
                break;
            case 2:
                bottom--;
                break;
            case 3:
                left++;
                break;
        }
        
        end = (top > bottom) || (left > right);
        
        args.current = ret.length;
        printStatus(ns, contract, args.progress(ns));
    }
    
    return ret;
}
type SpiralizeMatrix_Args = {
    current: number,
    max: number,
    progress: Function,
}

let SolveArrayJumpingGame_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number> {
    let args: ArrayJumpingGame_Args = {
        maxValue: -1,
    };
    return await solveArrayJumpingGame_Solve(ns, contract, 0, args);
}
async function solveArrayJumpingGame_Solve(ns: NS, contract: CodingContractInfo, pos: number, args: ArrayJumpingGame_Args): Promise<number> {
    await ns.sleep(1);
    let end: number = contract.data.length - 1;
    
    if (pos <= end && pos > args.maxValue) {
        args.maxValue = pos;
        let status: string = `Current max is: ${args.maxValue}/${end}`;
        printStatus(ns, contract, status);
    }
    
    let maxJump: number = contract.data[pos];
    if (pos == end) return 1;
    if (pos >= end) return 0;
    if (pos != end && maxJump === 0) return 0;
    
    for (let jump: number = 1; jump <= maxJump; jump++) {
        let landing: number =  pos + jump;
        let result: number = await solveArrayJumpingGame_Solve(ns, contract, landing, args);
        if (result == 1) {
            return 1;
        }
    }
    return 0;
}
type ArrayJumpingGame_Args = {
    maxValue: number,
}

let MinimumPathSumInATriangle_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number> {
    let args: MinimumPathSumInATriangle_Args = {
        minValue: 0,
        depthValue: -1,
    };
    return await MinimumPathSumInATriangle_Solve(ns, contract, 0, 0, 0, args);
}
async function MinimumPathSumInATriangle_Solve(ns: NS, contract: CodingContractInfo, x: number, y: number, sum: number, args: MinimumPathSumInATriangle_Args): Promise<number> {
    await ns.sleep(1);
    let endDepth: number = contract.data.length - 1;
    let end: boolean = y == endDepth;
    sum += contract.data[y][x];
    
    if (y > args.depthValue ||( y == args.depthValue && sum < args.minValue)) {
        args.depthValue = y;
        args.minValue = sum;
        let status: string = `Min sum at current depth[${args.depthValue}/${endDepth}] is: ${args.minValue}`;
        printStatus(ns, contract, status);
    }
    
    if (end) {
        return sum;
    }
    
    let left: number = await MinimumPathSumInATriangle_Solve(ns, contract.data, x, y + 1, sum, args);
    let right: number = await MinimumPathSumInATriangle_Solve(ns, contract.data, x + 1, y + 1, sum, args);
    
    if (left < right) {
        return left;
    }
    else {
        return right;
    }
}
type MinimumPathSumInATriangle_Args = {
    minValue: number,
    depthValue: number,
}

let UniquePathsInAGridI_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number> {
    let m: number = contract.data[0];
    let n: number = contract.data[1];
    let newData = new Array(m).fill(new Array<number>(n).fill(0));
    contract.data = newData;

    return await UniquePathsInAGridII_Setup(ns, contract)
}
let UniquePathsInAGridII_Setup: Function = async function (ns: NS, contract: CodingContractInfo): Promise<number> {
    let bottom: number = contract.data.length - 1;
    let right: number = contract.data[0].length - 1;

    if (contract.data[0][0] == 1) return 0; // Top-left startpoint is blocked
    if (contract.data[bottom][right] == 1) return 0; // Bottom-right endpoint is blocked

    let args: UniquePathsInAGrid_Args = {
        bottom: bottom,
        right: right,
        paths: 0,
        closest:  bottom + right,
        updateClosest: function (x: number, y: number): void {
            let distance: number =  this.bottom - y + this.right - x;
            if (distance < this.closest)  {
                this.closest = distance;
            }
        },
        status: function (): string {
            return `Closest Distance: ${this.closest} Paths Count: ${this.paths}`;
        }
    };
    printStatus(ns, contract, args.status());
    return await UniquePathsInAGrid_Solve(ns, contract, 0, 0, args);
}
async function UniquePathsInAGrid_Solve(ns: NS, contract: CodingContractInfo, x: number, y: number, args: UniquePathsInAGrid_Args): Promise<number> {
    await ns.sleep(1);
    if (x > args.right) return 0; // Past right endge
    if (y > args.bottom) return 0; // Past bottom edge
    if (contract.data[y][x] == 1) return 0; // In obstacle
    if (y == args.bottom && x == args.right) { // At bottom-right endpoint
        args.paths++;
        args.updateClosest(x, y);
        printStatus(ns, contract, args.status());
        return 1;
    }
    else {
        args.updateClosest(x, y);
        printStatus(ns, contract, args.status());
    }
    
    let sum: number = 0;
    sum += await UniquePathsInAGrid_Solve(ns, contract, x, y + 1, args);
    sum += await UniquePathsInAGrid_Solve(ns, contract, x + 1, y, args);
    return sum;
}
type UniquePathsInAGrid_Args = {
    bottom: number,
    right: number,
    paths: number,
    closest: number,
    updateClosest: Function,
    status: Function,
}

let solvers: Object = {
    "Find Largest Prime Factor": null,
    "Subarray with Maximum Sum": SubarrayWithMaximumSum_Setup,
    "Total Ways to Sum": null,
    "Spiralize Matrix": SpiralizeMatrix_Setup,
    "Array Jumping Game": SolveArrayJumpingGame_Setup,
    "Merge Overlapping Intervals": null,
    "Generate IP Addresses": null,
    "Algorithmic Stock Trader I": null,
    "Algorithmic Stock Trader II": null,
    "Algorithmic Stock Trader III": null,
    "Algorithmic Stock Trader IV": null,
    "Minimum Path Sum in a Triangle": MinimumPathSumInATriangle_Setup,
    "Unique Paths in a Grid I": UniquePathsInAGridI_Setup,
    "Unique Paths in a Grid II": UniquePathsInAGridII_Setup,
    "Sanitize Parentheses in Expression": null,
    "Find All Valid Math Expressions": null,
};