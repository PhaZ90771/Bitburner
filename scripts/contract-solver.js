export async function main(ns) {
    let filename = ns.args[0];
    let hostname = ns.args[1];
    let contract = getCodingContract(ns, filename, hostname);
    await runSolver(ns, contract);
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
export function hasSolver(type) {
    return solvers[type] != null;
}
function printStatus(ns, contract, status) {
    ns.clearLog();
    ns.print(contract.type);
    ns.print("/data/");
    ns.print(contract.data);
    ns.print("/status/");
    ns.print(status);
}
export async function runSolver(ns, contract) {
    printStatus(ns, contract, "Selecting solver...");
    if (solvers[contract.type] != null) {
        let answer = await solvers[contract.type](ns, contract);
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
let SubarrayWithMaximumSum_Setup = async function (ns, contract) {
    let args = {
        largestSum: contract.data[0],
        start: 0,
        position: 0,
        progress: function () {
            return `"Largest subarray sum is: [${this.start}:#{i}]${this.largestSum}`;
        }
    };
    return await SubarrayWithMaximumSum_Solve(ns, contract, args);
};
async function SubarrayWithMaximumSum_Solve(ns, contract, args) {
    await ns.sleep(1);
    printStatus(ns, contract, args.progress(ns));
    while (args.start < contract.data.length) {
        let sum = 0;
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
let SpiralizeMatrix_Setup = async function (ns, contract) {
    let args = {
        current: 0,
        max: contract.data.length * contract.data[0].length,
        progress: function (ns) {
            return ns.nFormat(this.current / this.max, "0.0%");
        },
    };
    return await SpiralizeMatrix_Solve(ns, contract, args);
};
async function SpiralizeMatrix_Solve(ns, contract, args) {
    await ns.sleep(1);
    let ret = [];
    printStatus(ns, contract, args.progress(ns));
    let left = 0;
    let right = contract.data[0].length - 1;
    let top = 0;
    let bottom = contract.data.length - 1;
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
let ArrayJumpingGame_Setup = async function (ns, contract) {
    let args = {
        maxValue: -1,
    };
    return await ArrayJumpingGame_Solve(ns, contract, 0, args);
};
async function ArrayJumpingGame_Solve(ns, contract, pos, args) {
    await ns.sleep(1);
    let end = contract.data.length - 1;
    if (pos <= end && pos > args.maxValue) {
        args.maxValue = pos;
        let status = `Current max is: ${args.maxValue}/${end}`;
        printStatus(ns, contract, status);
    }
    let maxJump = contract.data[pos];
    if (pos == end)
        return 1;
    if (pos >= end)
        return 0;
    if (pos != end && maxJump === 0)
        return 0;
    for (let jump = 1; jump <= maxJump; jump++) {
        let landing = pos + jump;
        let result = await ArrayJumpingGame_Solve(ns, contract, landing, args);
        if (result == 1) {
            return 1;
        }
    }
    return 0;
}
let MinimumPathSumInATriangle_Setup = async function (ns, contract) {
    let args = {
        minValue: 0,
        depthValue: -1,
    };
    return await MinimumPathSumInATriangle_Solve(ns, contract, 0, 0, 0, args);
};
async function MinimumPathSumInATriangle_Solve(ns, contract, x, y, sum, args) {
    await ns.sleep(1);
    let endDepth = contract.data.length - 1;
    let end = y == endDepth;
    sum += contract.data[y][x];
    if (y > args.depthValue || (y == args.depthValue && sum < args.minValue)) {
        args.depthValue = y;
        args.minValue = sum;
        let status = `Min sum at current depth[${args.depthValue}/${endDepth}] is: ${args.minValue}`;
        printStatus(ns, contract, status);
    }
    if (end) {
        return sum;
    }
    let left = await MinimumPathSumInATriangle_Solve(ns, contract, x, y + 1, sum, args);
    let right = await MinimumPathSumInATriangle_Solve(ns, contract, x + 1, y + 1, sum, args);
    if (left < right) {
        return left;
    }
    else {
        return right;
    }
}
let UniquePathsInAGridI_Setup = async function (ns, contract) {
    let m = contract.data[0];
    let n = contract.data[1];
    let newData = new Array(m).fill(new Array(n).fill(0));
    contract.data = newData;
    return await UniquePathsInAGridII_Setup(ns, contract);
};
let UniquePathsInAGridII_Setup = async function (ns, contract) {
    let bottom = contract.data.length - 1;
    let right = contract.data[0].length - 1;
    if (contract.data[0][0] == 1)
        return 0;
    if (contract.data[bottom][right] == 1)
        return 0;
    let args = {
        bottom: bottom,
        right: right,
        paths: 0,
        closest: bottom + right,
        updateClosest: function (x, y) {
            let distance = this.bottom - y + this.right - x;
            if (distance < this.closest) {
                this.closest = distance;
            }
        },
        status: function () {
            return `Closest Distance: ${this.closest} Paths Count: ${this.paths}`;
        }
    };
    printStatus(ns, contract, args.status());
    return await UniquePathsInAGrid_Solve(ns, contract, 0, 0, args);
};
async function UniquePathsInAGrid_Solve(ns, contract, x, y, args) {
    await ns.sleep(1);
    if (x > args.right)
        return 0;
    if (y > args.bottom)
        return 0;
    if (contract.data[y][x] == 1)
        return 0;
    if (y == args.bottom && x == args.right) {
        args.paths++;
        args.updateClosest(x, y);
        printStatus(ns, contract, args.status());
        return 1;
    }
    else {
        args.updateClosest(x, y);
        printStatus(ns, contract, args.status());
    }
    let sum = 0;
    sum += await UniquePathsInAGrid_Solve(ns, contract, x, y + 1, args);
    sum += await UniquePathsInAGrid_Solve(ns, contract, x + 1, y, args);
    return sum;
}
let solvers = {
    "Find Largest Prime Factor": null,
    "Subarray with Maximum Sum": SubarrayWithMaximumSum_Setup,
    "Total Ways to Sum": null,
    "Spiralize Matrix": SpiralizeMatrix_Setup,
    "Array Jumping Game": ArrayJumpingGame_Setup,
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
