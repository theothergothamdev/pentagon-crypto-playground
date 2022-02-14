import { NodeConfig } from './src/interfaces';
import simulator from './src/simulator';

const nodeConfig: NodeConfig = {
  lesser: {
    type: 'lesser',
    label: 'Lesser',
    dailyReward: 0.0125,
    cost: 1,
    fusionTax: 0.0125,
    fusionCost: 5,
    fusionTarget: 'common',
  },
  common: {
    type: 'common',
    label: 'Common',
    dailyReward: 0.0718,
    cost: 5,
    fusionTax: 0.1651,
    fusionCost: 2,
    fusionTarget: 'legendary',
  },
  legendary: {
    type: 'legendary',
    label: 'Legendary',
    dailyReward: 0.1651,
    cost: 10,
    fusionTax: 1.898,
    fusionCost: 10,
    fusionTarget: 'omega',
  },
  omega: {
    type: 'omega',
    label: 'Omega',
    limit: 1,
    dailyReward: 1.1651,
  },
};

console.log(
  simulator(
    new Date(),
    107,
    nodeConfig,
    {
      lesser: 1,
      common: 0,
      legendary: 3,
      omega: 0,
    },
    { PENT: '0', MATIC: '15' }
  )
);
