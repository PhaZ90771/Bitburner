import {BitBurner as NS, CodingContractTypes, Host, Script} from "Bitburner"
import {CodingContractInfo, getCodingContract} from "/scripts/utilities.js"

let contract: CodingContractInfo;

export async function main(ns: NS): Promise<void> {
    let filename: Script = ns.args[0];
    let hostname: Host = ns.args[1];
    // TODO: Check whether hostname and filename are valid
    contract = getCodingContract(ns, filename, hostname);
    runSolver(ns);
}

export function hasSolver(type: CodingContractTypes) {
    return solvers[type] != null;
}

function printStatus(ns: NS, status: string): void {
    ns.clearLog();
    
    ns.print(contract.type);

    ns.print("/data/");
    ns.print(contract.data);
    
    ns.print("/status/");
    ns.print(status);
}

function runSolver(ns: NS): void {
    printStatus(ns, "Selecting solver...");
    if (solvers[contract.type] != null) {
        let answer: string = solvers[contract.type](ns, contract.data);
        printStatus(ns, `Answer is: ${answer}`);
        let rewardMessage = contract.attempt(ns, answer);
        printStatus(ns, rewardMessage);
        ns.tprint(rewardMessage);
    }
    else {
        printStatus(ns, `Solver has not been implemented yet for: ${contract.type}`);
        ns.exit();
    }
}

let SubarrayWithMaximumSum_Setup: Function = function (ns: NS, data: any): number {
    let args: SubarrayWithMaximumSum_Args = {
        largestSum: data[0],
        start: 0,
        position: 0,
        progress: function (): string {
            return `"Largest subarray sum is: [${this.start}:#{i}]${this.largestSum}`;
        }
    }
    return SubarrayWithMaximumSum_Solve(ns, data, args);
}
function SubarrayWithMaximumSum_Solve(ns: NS, data: any, args: SubarrayWithMaximumSum_Args): number {
    printStatus(ns, args.progress(ns));
    
    while (args.start < data.length) {
        let sum: number = 0;
        args.position = args.start;
        while (args.position < data.length) {
            sum += data[args.position];
            if (sum > args.largestSum) {
                args.largestSum = sum;
                printStatus(ns, args.progress());
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

let SpiralizeMatrix_Setup: Function = function (ns: NS, data: any): Array<number> {
    let args: SpiralizeMatrix_Args = {
        current: 0,
        max: data.length * data[0].length,
        progress: function (ns: NS): string {
            return ns.nFormat(this.current / this.max, "0.0%");
        },
    }
    return SpiralizeMatrix_Solve(ns, data, args);
}
function SpiralizeMatrix_Solve(ns: NS, data: any, args: SpiralizeMatrix_Args): Array<number>  {
    let ret: Array<number> = [];
    printStatus(ns, args.progress(ns));
    
    let left: number = 0;
    let right: number = data[0].length - 1;
    let top: number = 0;
    let bottom: number = data.length - 1;
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
            ret.push(data[y][x]);
            
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
        printStatus(ns, args.progress(ns));
    }
    
    return ret;
}
type SpiralizeMatrix_Args = {
    current: number,
    max: number,
    progress: Function,
}

let SolveArrayJumpingGame_Setup: Function = function (ns: NS, data: any): number {
    let args: ArrayJumpingGame_Args = {
        maxValue: -1,
    };
    return solveArrayJumpingGame_Solve(ns, data, 0, args);
}
function solveArrayJumpingGame_Solve(ns: NS, data: any, pos: number, args: ArrayJumpingGame_Args): number {
    let end: number = data.length - 1;
    
    if (pos <= end && pos > args.maxValue) {
        args.maxValue = pos;
        let status: string = `Current max is: ${args.maxValue}/${end}`;
        printStatus(ns, status);
    }
    
    let maxJump: number = data[pos];
    if (pos == end) return 1;
    if (pos >= end) return 0;
    if (pos != end && maxJump === 0) return 0;
    
    for (let jump: number = 1; jump <= maxJump; jump++) {
        let landing: number =  pos + jump;
        let result: number = solveArrayJumpingGame_Solve(ns, data, landing, args);
        if (result == 1) {
            return 1;
        }
    }
    return 0;
}
type ArrayJumpingGame_Args = {
    maxValue: number,
}

let MinimumPathSumInATriangle_Setup: Function = function MinimumPathSumInATriangle_Setup(ns: NS, data: any): number {
    let args: MinimumPathSumInATriangle_Args = {
        minValue: 0,
        depthValue: -1,
    };
    return MinimumPathSumInATriangle_Solve(ns, data, 0, 0, 0, args);
}
function MinimumPathSumInATriangle_Solve(ns: NS, data: any, x: number, y: number, sum: number, args: MinimumPathSumInATriangle_Args): number {
    let endDepth: number = data.length - 1;
    let end: boolean = y == endDepth;
    sum += data[y][x];
    
    if (y > args.depthValue ||( y == args.depthValue && sum < args.minValue)) {
        args.depthValue = y;
        args.minValue = sum;
        let status: string = `Min sum at current depth[${args.depthValue}/${endDepth}] is: ${args.minValue}`;
        printStatus(ns, status);
    }
    
    if (end) {
        return sum;
    }
    
    let left: number = MinimumPathSumInATriangle_Solve(ns, data, x, y + 1, sum, args);
    let right: number = MinimumPathSumInATriangle_Solve(ns, data, x + 1, y + 1, sum, args);
    
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

let UniquePathsInAGridII_Setup: Function = function UniquePathsInAGridII_Setup(ns: NS, data: any): number {
    let bottom: number = data.length - 1;
    let right: number = data[0].length - 1;

    if (data[0][0] == 1) return 0; // Top-left startpoint is blocked
    if (data[bottom][right] == 1) return 0; // Bottom-right endpoint is blocked

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
    ns.print(args.status());
    return UniquePathsInAGrid_Solve(ns, data, 0, 0, args);
}
function UniquePathsInAGrid_Solve(ns: NS, data: any, x: number, y: number, args: UniquePathsInAGrid_Args): number {
    if (x > args.right) return 0; // Past right endge
    if (y > args.bottom) return 0; // Past bottom edge
    if (data[y][x] == 1) return 0; // In obstacle
    if (y == args.bottom && x == args.right) { // At bottom-right endpoint
        args.paths++;
        args.updateClosest(x, y);
        ns.print(args.status());
        return 1;
    }
    else {
        args.updateClosest(x, y);
        ns.print(args.status());
    }
    
    let sum: number = 0;
    sum += UniquePathsInAGrid_Solve(ns, data, x, y + 1, args);
    sum += UniquePathsInAGrid_Solve(ns, data, x + 1, y, args);
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
    "Unique Paths in a Grid I": null,
    "Unique Paths in a Grid II": UniquePathsInAGridII_Setup,
    "Sanitize Parentheses in Expression": null,
    "Find All Valid Math Expressions": null,
};