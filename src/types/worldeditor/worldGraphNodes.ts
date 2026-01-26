export interface LandmarkNodeForce {
  id: string;
  name: string;
  role?: string | null;
}

export interface LandmarkNodeData {
  id: string;
  name: string;
  region?: string;
  regionColor?: string;
  importance?: number;
  population?: number;
  forces: LandmarkNodeForce[];
  childCount?: number;
  type?: string;
}

export interface BridgeNodeData {
  label: string;
  side: 'left' | 'right' | 'top' | 'bottom';
  handleSide?: 'left' | 'right' | 'top' | 'bottom';
  handleId: string;
}
