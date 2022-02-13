export type NodeType = 'lesser' | 'common' | 'legendary' | 'omega';
export interface Node {
  type: NodeType;
  label: string;
  dailyReward: number;
  cost?: number;
  fusionTax?: number;
  fusionCost?: number;
  fusionTarget?: NodeType;
  limit?: number;
}

export type NodeDistribution = Record<NodeType, number>;
export type NodeConfig = Record<NodeType, Node>;
export type Wallet<T = string | number> = Record<string, T>;
export type Log = Record<string, DailyLog>;
export type DailyLog = string[];

export type SimulationResults = {
  log?: Log;
  numDays: number;
  wallet: Wallet<number>;
  nodeDistribution: NodeDistribution;
  dailyRewards: Wallet<number>;
};
