import { NodeDistribution, NodeConfig, SimulationResults, Wallet, NodeType, Log, DailyLog, Diff } from './interfaces';

function getWalletDiff(start: Wallet<number>, end: Wallet<number>): Wallet<number> {
  const diff: Wallet<number> = {};

  Object.keys(start).forEach(key => {
    diff[key] = Math.round(((end[key] || 0) - (start[key] || 0)) * 10000) / 10000;
  });

  return diff;
}

function getDailyRewardDiff(start: Wallet<number>, end: Wallet<number>): Wallet<number> {
  const diff: Wallet<number> = {};

  Object.keys(start).forEach(key => {
    diff[key] = Math.round(((end[key] || 0) - (start[key] || 0)) * 10000) / 10000;
  });

  return diff;
}

function getDistributionDiff(start: NodeDistribution, end: NodeDistribution): NodeDistribution {
  const diff: NodeDistribution = { lesser: 0, common: 0, legendary: 0, omega: 0 };

  Object.keys(start).forEach(key => {
    diff[key as NodeType] = (end[key as NodeType] || 0) - (start[key as NodeType] || 0);
  });

  return diff;
}

function claimAll(pendingRewards: number[]): number {
  let rewards = 0;
  while (pendingRewards.length) {
    rewards += pendingRewards.pop() || 0;
  }
  return rewards;
}

function simulateRewards(nodeConfig: NodeConfig, nodeDistribution: NodeDistribution): number {
  let rewards = 0;

  for (const [type, count] of Object.entries(nodeDistribution)) {
    rewards += nodeConfig[type as NodeType].dailyReward * count;
  }

  return rewards;
}

const simulate = (
  startDate: Date,
  numDays: number,
  nodeConfig: NodeConfig,
  nodeDistribution: NodeDistribution,
  initialWallet: Wallet<string>,
  coinPrice: number,
  avgGasPrice
): SimulationResults => {
  const wallet: SimulationResults['wallet'] = Object.entries(initialWallet).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: parseInt(value) }),
    {}
  );
  const startWallet = { ...wallet };

  const dailyRewards: SimulationResults['dailyRewards'] = {};

  const _nodeDistribution = { ...nodeDistribution };

  const log: Log = {};
  const pendingRewards: number[] = [];

  // Record rewards at start to calculate diff
  const rewardsStart: Wallet<number> = {};
  const pentRewards = simulateRewards(nodeConfig, _nodeDistribution);
  rewardsStart['PENT'] = pentRewards;
  rewardsStart['USD'] = pentRewards * coinPrice;

  let smallestNodeToBuy = nodeConfig['lesser'];
  for (let day = 1; day < numDays; day++) {
    const date = new Date(startDate?.getTime());
    date.setHours(startDate.getHours() + day * 24);
    const dailyLog: DailyLog = [];

    // Claim all outstanding rewards
    const claimedRewards = claimAll(pendingRewards);
    wallet['PENT'] = claimedRewards + wallet['PENT'];
    dailyLog.push(`Claimed ${claimedRewards} PENT`);

    // Buy the smallest node
    if (smallestNodeToBuy.cost && wallet['PENT'] > smallestNodeToBuy.cost + avgGasPrice) {
      const numNodesToBuy = Math.floor(wallet['PENT'] / smallestNodeToBuy.cost);
      wallet['PENT'] -= numNodesToBuy * smallestNodeToBuy.cost;
      wallet['MATIC'] -= avgGasPrice;
      _nodeDistribution[smallestNodeToBuy.type] = _nodeDistribution[smallestNodeToBuy.type] + numNodesToBuy;

      dailyLog.push(
        `Spent ${smallestNodeToBuy.cost} PENT and ${avgGasPrice} MATIC to buy a ${smallestNodeToBuy.label} node`
      );
    }

    // Fuse nodes into higher tier
    for (const [type, count] of Object.entries(_nodeDistribution)) {
      const node = nodeConfig[type as NodeType];
      if (node.fusionTarget && node.fusionCost) {
        // Check if there are limits on the next tier. E.g. There can only be 1 Omega
        if (_nodeDistribution[node.fusionTarget] >= (nodeConfig[node.fusionTarget as NodeType].limit || 10000)) {
          continue;
        }

        if (count >= node.fusionCost) {
          _nodeDistribution[type as NodeType] = _nodeDistribution[type as NodeType] - node.fusionCost;
          _nodeDistribution[node.fusionTarget as NodeType] += 1;
          wallet['PENT'] -= node.fusionTax || 0;
          wallet['MATIC'] -= avgGasPrice;

          dailyLog.push(`Fusing ${type} to ${node.fusionTarget}`);
          dailyLog.push(`Spent ${node.fusionTax || 0} PENT and ${avgGasPrice} MATIC`);
        }
      }
    }

    // Daily rewards
    const newRewards = simulateRewards(nodeConfig, _nodeDistribution);
    dailyRewards['PENT'] = newRewards;
    dailyRewards['USD'] = Math.round(newRewards * coinPrice * 100) / 100;

    // If we're earning more per day than the current fusion rate then we can just buy the next tier
    if (smallestNodeToBuy.fusionTarget && smallestNodeToBuy.fusionCost && newRewards > smallestNodeToBuy.fusionCost) {
      smallestNodeToBuy = nodeConfig[smallestNodeToBuy.fusionTarget];
    }

    pendingRewards.push(newRewards);
    dailyLog.push(`Generated ${newRewards} PENT`);

    log[date.toISOString().split('T')[0]] = dailyLog;
  }

  wallet['PENT'] = Math.round(wallet['PENT'] * 100000) / 100000;
  wallet['MATIC'] = Math.round(wallet['MATIC'] * 100000) / 100000;

  const diff: Diff = {
    dailyRewards: getDailyRewardDiff(rewardsStart, dailyRewards),
    nodeDistribution: getDistributionDiff(nodeDistribution, _nodeDistribution),
    wallet: getWalletDiff(startWallet, wallet),
  };

  return { log, numDays, wallet, dailyRewards, nodeDistribution: _nodeDistribution, diff };
};

export default simulate;
