import {BitBurner as NS, CodingContractTypes, Host, Script} from "Bitburner"
import {CodingContractInfo, getCodingContract} from "/scripts/utilities.js"

let contract: CodingContractInfo;
let solvers: Map<CodingContractTypes, Function>;

export async function main(ns: NS): Promise<void> {
    let filename: Script = ns.args[0];
    let hostname: Host = ns.args[1];
    // TODO: Check whether hostname and filename are valid
    contract = getCodingContract(ns, filename, hostname);
    loadSolvers();
    runSolver(ns);
}

function printStatus(ns: NS, status: string): void {
    ns.clearLog();
    
    ns.print(contract.type);

    ns.print("/data/");
    ns.print(contract.data);
    
    ns.print("/status/");
    ns.print(status);
}

function loadSolvers(): void {
    // solvers.set("Find Largest Prime Factor", null);
    solvers.set("Subarray with Maximum Sum", SubarrayWithMaximumSum_Setup);
    // solvers.set("Total Ways to Sum", null);
    solvers.set("Spiralize Matrix", SpiralizeMatrix_Setup);
    solvers.set("Array Jumping Game", solveArrayJumpingGame_Setup);
    // solvers.set("Merge Overlapping Intervals", null);
    // solvers.set("Generate IP Addresses", null);
    // solvers.set("Algorithmic Stock Trader I", null);
    // solvers.set("Algorithmic Stock Trader II", null);
    // solvers.set("Algorithmic Stock Trader III", null);
    // solvers.set("Algorithmic Stock Trader IV", null);
    solvers.set("Minimum Path Sum in a Triangle", MinimumPathSumInATriangle_Setup);
    // solvers.set("Unique Paths in a Grid I", null);
    // solvers.set("Unique Paths in a Grid II", null);
    // solvers.set("Sanitize Parentheses in Expression", null);
    // solvers.set("Find All Valid Math Expressions", null);
}

function runSolver(ns: NS): void {
    printStatus(ns, "Selecting solver...");
    if (solvers.has(contract.type)) {
        let answer: string = solvers[contract.type](contract.data);
        printStatus(ns, `Answer is: ${answer}`);
        let rewardMessage = contract.attempt(ns, answer);
        printStatus(ns, rewardMessage);
    }
    else {
        printStatus(ns, `Solver has not been implemented yet for: ${contract.type}`);
        ns.exit();
    }
}

function SubarrayWithMaximumSum_Setup(ns: NS, data: any): number {
    let args: SubarrayWithMaximumSum_Args = {
        largestSum: data[0],
        start: 0,
        position: 0,
        progress: function (ns: NS): string {
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
                printStatus(ns, args.progress(ns));
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

function SpiralizeMatrix_Setup(ns: NS, data: any): Array<number> {
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

function solveArrayJumpingGame_Setup(ns: NS, data: any): number {
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

function MinimumPathSumInATriangle_Setup(ns: NS, data: any): number {
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

// TODO
// function uniquePathsInGrid2(data) {
//     var bottom = data.length - 1;
//     var right = data[0].length - 1;
    
//     if (data[0][0] == 1) return 0; // Top-left startpoint is blocked
//     if (data[bottom][right] == 1) return 0; // Bottom-right endpoint is blocked
    
//     var record = { };
//     record.paths = 0;
//     record.closest = bottom + right;
    
//     uniquePathsInGrid2_Status(record, 0, 0, 0);
//     return uniquePathsInGrid2_Sub(data, 0, 0, record);
// }
// function uniquePathsInGrid2_Status(record, x, y, endDelta) {
//     var updates = endDelta > 0;
    
//     record.paths += endDelta;
    
//     var bottom = data.length - 1;
//     var right = data[0].length - 1;
//     var distance = bottom - y + right - x;
//     if (distance < record.closest) {
//         record.closest = distance;
//         updates++;
//     }
    
//     if (updates > 0) {
//         printStatus("Closest Distance: " + record.closest + " Paths Count: " + record.paths);
//     }
// }
// function uniquePathsInGrid2_Sub(data, x, y, record) {
//     var bottom = data.length - 1;
//     var right = data[0].length - 1;
    
//     if (x > right) return 0; // Past right endge
//     if (y > bottom) return 0; // Past bottom edge
//     if (data[y][x] == 1) return 0; // In obstacle
//     if (y == bottom && x == right) { // At bottom-right endpoint
//         uniquePathsInGrid2_Status(record, x, y, 1);
//         return 1;
//     }
//     else {
//         uniquePathsInGrid2_Status(record, x, y, 0);
//     }
    
    
//     var sumPaths = 0;
//     sumPaths += uniquePathsInGrid2_Sub(data, x, y + 1, record);
//     sumPaths += uniquePathsInGrid2_Sub(data, x + 1, y, record);
//     return sumPaths;
// }