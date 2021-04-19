import { getCodingContract } from "/scripts/utilities.js";
let contract;
let solvers;
export async function main(ns) {
    let filename = ns.args[0];
    let hostname = ns.args[1];
    contract = getCodingContract(ns, filename, hostname);
    loadSolvers();
    runSolver(ns);
}
function printStatus(ns, status) {
    ns.clearLog();
    ns.print(contract.type);
    ns.print("/data/");
    ns.print(contract.data);
    ns.print("/status/");
    ns.print(status);
}
function loadSolvers() {
    solvers.set("Subarray with Maximum Sum", SubarrayWithMaximumSum_Setup);
    solvers.set("Spiralize Matrix", SpiralizeMatrix_Setup);
    solvers.set("Array Jumping Game", solveArrayJumpingGame_Setup);
    solvers.set("Minimum Path Sum in a Triangle", MinimumPathSumInATriangle_Setup);
}
function runSolver(ns) {
    printStatus(ns, "Selecting solver...");
    if (solvers.has(contract.type)) {
        let answer = solvers[contract.type](contract.data);
        printStatus(ns, `Answer is: ${answer}`);
        let rewardMessage = contract.attempt(ns, answer);
        printStatus(ns, rewardMessage);
    }
    else {
        printStatus(ns, `Solver has not been implemented yet for: ${contract.type}`);
        ns.exit();
    }
}
function SubarrayWithMaximumSum_Setup(ns, data) {
    let args = {
        largestSum: data[0],
        start: 0,
        position: 0,
        progress: function (ns) {
            return `"Largest subarray sum is: [${this.start}:#{i}]${this.largestSum}`;
        }
    };
    return SubarrayWithMaximumSum_Solve(ns, data, args);
}
function SubarrayWithMaximumSum_Solve(ns, data, args) {
    printStatus(ns, args.progress(ns));
    while (args.start < data.length) {
        let sum = 0;
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
function SpiralizeMatrix_Setup(ns, data) {
    let args = {
        current: 0,
        max: data.length * data[0].length,
        progress: function (ns) {
            return ns.nFormat(this.current / this.max, "0.0%");
        },
    };
    return SpiralizeMatrix_Solve(ns, data, args);
}
function SpiralizeMatrix_Solve(ns, data, args) {
    let ret = [];
    printStatus(ns, args.progress(ns));
    let left = 0;
    let right = data[0].length - 1;
    let top = 0;
    let bottom = data.length - 1;
    let x = 0;
    let y = 0;
    let end = false;
    for (let dir = 0; !end; dir = (dir + 1) % 4) {
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
        let dirEnd = false;
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
function solveArrayJumpingGame_Setup(ns, data) {
    let args = {
        maxValue: -1,
    };
    return solveArrayJumpingGame_Solve(ns, data, 0, args);
}
function solveArrayJumpingGame_Solve(ns, data, pos, args) {
    let end = data.length - 1;
    if (pos <= end && pos > args.maxValue) {
        args.maxValue = pos;
        let status = `Current max is: ${args.maxValue}/${end}`;
        printStatus(ns, status);
    }
    let maxJump = data[pos];
    if (pos == end)
        return 1;
    if (pos >= end)
        return 0;
    if (pos != end && maxJump === 0)
        return 0;
    for (let jump = 1; jump <= maxJump; jump++) {
        let landing = pos + jump;
        let result = solveArrayJumpingGame_Solve(ns, data, landing, args);
        if (result == 1) {
            return 1;
        }
    }
    return 0;
}
function MinimumPathSumInATriangle_Setup(ns, data) {
    let args = {
        minValue: 0,
        depthValue: -1,
    };
    return MinimumPathSumInATriangle_Solve(ns, data, 0, 0, 0, args);
}
function MinimumPathSumInATriangle_Solve(ns, data, x, y, sum, args) {
    let endDepth = data.length - 1;
    let end = y == endDepth;
    sum += data[y][x];
    if (y > args.depthValue || (y == args.depthValue && sum < args.minValue)) {
        args.depthValue = y;
        args.minValue = sum;
        let status = `Min sum at current depth[${args.depthValue}/${endDepth}] is: ${args.minValue}`;
        printStatus(ns, status);
    }
    if (end) {
        return sum;
    }
    let left = MinimumPathSumInATriangle_Solve(ns, data, x, y + 1, sum, args);
    let right = MinimumPathSumInATriangle_Solve(ns, data, x + 1, y + 1, sum, args);
    if (left < right) {
        return left;
    }
    else {
        return right;
    }
}
