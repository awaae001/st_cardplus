import { computed, ref, watch, onBeforeUnmount, type CSSProperties, type ComputedRef, type Ref } from 'vue';
import type { Connection, Edge, EdgeChange, Node } from '@vue-flow/core';
import type { EnhancedLandmark, EnhancedRegion } from '@/types/world-editor';
import type { BridgeNodeData, LandmarkNodeForce } from '@/types/worldeditor/worldGraphNodes';
import { collectDescendantIds, getParentLandmarkId } from '@/utils/worldeditor/landmarkHierarchy';
import {
  readSessionStorageJSON,
  writeSessionStorageJSON,
  readLocalStorageJSON,
  writeLocalStorageJSON
} from '@/utils/localStorageUtils';
import { linkLandmarks, unlinkLandmarks } from '@/composables/worldeditor/worldGraphLinks';
import { useWorldGraph, type WorldGraphProps } from '@/composables/worldeditor/useWorldGraph';

interface WorldGraphViewOptions {
  onEdit?: (item: EnhancedLandmark) => void;
}

interface WorldGraphViewState {
  nodes: Ref<Node[]>;
  edges: Ref<Edge[]>;
  edgeTypes: ReturnType<typeof useWorldGraph>['edgeTypes'];
  projectRegions: ComputedRef<EnhancedRegion[]>;
  selectedLandmark: ComputedRef<EnhancedLandmark | null>;
  selectedForces: ComputedRef<LandmarkNodeForce[]>;
  inspectorStyle: ComputedRef<CSSProperties>;
  startDrag: (event: MouseEvent) => void;
  handleNodeDragStop: (event: unknown, node?: Node) => void;
  handleConnect: (params: Connection) => void;
  handleEdgesChange: (changes: EdgeChange[]) => void;
  handleNodeClick: (event: unknown, node?: Node) => void;
  clearSelection: () => void;
  childGraphVisible: Ref<boolean>;
  childGraphTitle: ComputedRef<string>;
  childGraphStyle: ComputedRef<CSSProperties>;
  childGraphSize: Ref<{ width: number; height: number }>;
  childGraphNodesWithBridges: ComputedRef<Node[]>;
  childGraphEdgesWithBridges: ComputedRef<Edge[]>;
  childEdgeTypes: ReturnType<typeof useWorldGraph>['edgeTypes'];
  childSelectedLandmark: ComputedRef<EnhancedLandmark | null>;
  childSelectedForces: ComputedRef<LandmarkNodeForce[]>;
  childInspectorStyle: ComputedRef<CSSProperties>;
  startChildInspectorDrag: (event: MouseEvent) => void;
  startChildGraphDrag: (event: MouseEvent) => void;
  startChildGraphResize: (event: MouseEvent) => void;
  handleChildNodeDragStopProxy: (event: unknown, node?: { id?: string; position?: { x: number; y: number } }) => void;
  handleChildConnectProxy: (params: Connection) => void;
  handleChildEdgesChangeProxy: (changes: EdgeChange[]) => void;
  handleChildNodeClick: (event: unknown, node?: Node) => void;
  clearChildSelection: () => void;
  closeChildGraph: () => void;
  emitEditSelected: (item?: EnhancedLandmark) => void;
}

const isRemoveChangeWithId = (change: EdgeChange): change is EdgeChange & { id: string } => {
  return change.type === 'remove' && 'id' in change && typeof (change as { id?: unknown }).id === 'string';
};

export const useWorldGraphView = (
  props: WorldGraphProps,
  options?: WorldGraphViewOptions
): WorldGraphViewState => {
  const activeProjectId = computed(() => {
    if (props.activeProjectId) return props.activeProjectId;
    return props.projects[0]?.id || null;
  });

  const rootLandmarks = computed(() => {
    if (!activeProjectId.value) return [];
    return props.landmarks.filter(landmark =>
      landmark.projectId === activeProjectId.value && !getParentLandmarkId(landmark)
    );
  });

  const mainGraphState = useWorldGraph(props, { landmarkScope: rootLandmarks });
  const {
    nodes,
    edges,
    edgeTypes,
    projectRegions,
    selectedLandmark,
    selectedForces,
    inspectorStyle,
    startDrag,
    handleNodeDragStop,
    handleConnect,
    handleEdgesChange,
    handleNodeClick: selectNode,
    clearSelection,
  } = mainGraphState;

  const childGraphVisible = ref(false);
  const childGraphParentId = ref<string | null>(null);
  const childGraphPosition = ref({ x: 80, y: 80 });
  const childGraphSize = ref({ width: 460, height: 360 });
  const isChildDragging = ref(false);
  const childDragStart = ref({ x: 0, y: 0 });
  const isChildResizing = ref(false);
  const childResizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
  const BRIDGE_POSITIONS_KEY = 'world-editor-bridge-positions';
  const CHILD_GRAPH_SIZE_KEY = 'world-editor-child-graph-size';
  const bridgePositions = ref<Record<string, { x: number; y: number }>>(
    readLocalStorageJSON<Record<string, { x: number; y: number }>>(BRIDGE_POSITIONS_KEY) || {}
  );
  const storedChildSize = readSessionStorageJSON<{ width: number; height: number }>(CHILD_GRAPH_SIZE_KEY);
  if (storedChildSize?.width && storedChildSize?.height) {
    childGraphSize.value = storedChildSize;
  }

  const childGraphParent = computed(() => {
    if (!childGraphParentId.value) return null;
    return props.landmarks.find(landmark => landmark.id === childGraphParentId.value) || null;
  });

  const childGraphTitle = computed(() => {
    if (!childGraphParent.value) return '子地标节点图';
    return `${childGraphParent.value.name} · 子地标节点图`;
  });

  const childGraphLandmarks = computed(() => {
    if (!childGraphParent.value) return [];
    const descendantIds = collectDescendantIds(props.landmarks, childGraphParent.value.id);
    return props.landmarks.filter(landmark => descendantIds.has(landmark.id));
  });

  const childGraphLandmarkIdSet = computed(() => new Set(childGraphLandmarks.value.map(landmark => landmark.id)));

  const positionToSide = (
    parent?: { x: number; y: number },
    external?: { x: number; y: number }
  ): 'left' | 'right' | 'top' | 'bottom' | null => {
    if (!parent || !external) return null;
    const dx = external.x - parent.x;
    const dy = external.y - parent.y;
    if (dx === 0 && dy === 0) return null;
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const normalized = (angle + 360) % 360;
    if (normalized >= 315 || normalized < 45) return 'top';
    if (normalized >= 45 && normalized < 135) return 'right';
    if (normalized >= 135 && normalized < 225) return 'bottom';
    return 'left';
  };

  const invertSide = (side: 'left' | 'right' | 'top' | 'bottom') => {
    switch (side) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      default:
        return side;
    }
  };

  const childGraphBridgeMeta = computed(() => {
    const meta = new Map<
      string,
      {
        nodeId: string;
        label: string;
        side: 'left' | 'right' | 'top' | 'bottom';
        handleId: string;
        externalId: string;
        externalHandle?: string;
      }
    >();
    if (!childGraphParent.value) return meta;
    const parent = childGraphParent.value;
    const externalIds = new Set<string>();

    (parent.relatedLandmarks || []).forEach(id => externalIds.add(id));
    (parent.roadConnections || []).forEach(conn => externalIds.add(conn.targetId));

    externalIds.forEach(externalId => {
      if (childGraphLandmarkIdSet.value.has(externalId)) return;
      if (externalId === parent.id) return;
      const external = props.landmarks.find(item => item.id === externalId);
      if (!external) return;
      const parentConn = parent.roadConnections?.find(conn => conn.targetId === externalId);
      const externalConn = external.roadConnections?.find(conn => conn.targetId === parent.id);
      const side = positionToSide(parent.position, external.position);
      if (!side) return;
      const nodeId = `bridge:${parent.id}:${externalId}`;
      meta.set(externalId, {
        nodeId,
        label: `来自 ${external.name} 的道路`,
        side,
        handleId: `bridge-${invertSide(side)}`,
        externalId,
        externalHandle: externalConn?.handle ?? parentConn?.targetHandle,
      });
    });

    return meta;
  });

  const getBridgeDefaults = () => {
    const positions: Record<string, { x: number; y: number }> = {};
    const sideCounts = { left: 0, right: 0, top: 0, bottom: 0 };
    const spacing = 70;
    const list = childGraphLandmarks.value;
    const columns = 4;
    const spacingX = 220;
    const spacingY = 160;
    const margin = 80;

    let minX = 0;
    let maxX = 400;
    let minY = 0;
    let maxY = 260;

    if (list.length > 0) {
      minX = Number.POSITIVE_INFINITY;
      minY = Number.POSITIVE_INFINITY;
      maxX = Number.NEGATIVE_INFINITY;
      maxY = Number.NEGATIVE_INFINITY;
      list.forEach((landmark, index) => {
        const fallback = {
          x: (index % columns) * spacingX,
          y: Math.floor(index / columns) * spacingY,
        };
        const position = landmark.position ?? fallback;
        minX = Math.min(minX, position.x);
        maxX = Math.max(maxX, position.x);
        minY = Math.min(minY, position.y);
        maxY = Math.max(maxY, position.y);
      });
    }

    childGraphBridgeMeta.value.forEach(meta => {
      const count = sideCounts[meta.side]++;
      let x = minX;
      let y = minY;
      if (meta.side === 'left') {
        x = minX - margin;
        y = minY + count * spacing;
      } else if (meta.side === 'right') {
        x = maxX + margin;
        y = minY + count * spacing;
      } else if (meta.side === 'top') {
        x = minX + count * spacing;
        y = minY - margin;
      } else if (meta.side === 'bottom') {
        x = minX + count * spacing;
        y = maxY + margin;
      }
      positions[meta.nodeId] = { x, y };
    });

    return positions;
  };

  const childGraphBridgeNodes = computed(() => {
    const nodes: Node[] = [];
    const defaults = getBridgeDefaults();

    childGraphBridgeMeta.value.forEach(meta => {
      const stored = bridgePositions.value[meta.nodeId];
      const fallback = defaults[meta.nodeId] || { x: 0, y: 0 };
      const data: BridgeNodeData = {
        label: meta.label,
        side: meta.side,
        handleSide: invertSide(meta.side),
        handleId: meta.handleId,
      };
      nodes.push({
        id: meta.nodeId,
        type: 'bridge',
        position: stored ? { x: stored.x, y: stored.y } : { x: fallback.x, y: fallback.y },
        draggable: true,
        data,
      });
    });

    return nodes;
  });

  const removeBridgeConnection = (childId: string, externalId: string) => {
    unlinkLandmarks(props.landmarks, childId, externalId);
  };

  const childGraphBridgeEdges = computed(() => {
    const edges: Edge[] = [];
    childGraphLandmarks.value.forEach(child => {
      (child.relatedLandmarks || []).forEach(externalId => {
        const meta = childGraphBridgeMeta.value.get(externalId);
        if (!meta) return;
        const childConn = child.roadConnections?.find(conn => conn.targetId === externalId);
        edges.push({
          id: `bridge-edge:${child.id}:${externalId}`,
          source: child.id,
          target: meta.nodeId,
          sourceHandle: childConn?.handle,
          targetHandle: meta.handleId,
          type: 'removable',
          data: {
            onRemove: () => removeBridgeConnection(child.id, externalId),
          },
        });
      });
    });
    return edges;
  });

  const childGraphState = useWorldGraph(props, { landmarkScope: childGraphLandmarks });
  const {
    nodes: childGraphNodes,
    edges: childGraphEdges,
    edgeTypes: childEdgeTypes,
    selectedLandmark: childSelectedLandmark,
    selectedForces: childSelectedForces,
    inspectorStyle: childInspectorStyle,
    startDrag: startChildInspectorDrag,
    handleNodeDragStop: handleChildNodeDragStop,
    handleConnect: handleChildConnect,
    handleEdgesChange: handleChildEdgesChange,
    handleNodeClick: handleChildNodeClick,
    clearSelection: clearChildSelection,
  } = childGraphState;

  const childGraphNodesWithBridges = computed(() => {
    return [...childGraphNodes.value, ...childGraphBridgeNodes.value];
  });

  const childGraphEdgesWithBridges = computed(() => {
    return [...childGraphEdges.value, ...childGraphBridgeEdges.value];
  });

  const childGraphStyle = computed<CSSProperties>(() => ({
    position: 'absolute',
    left: `${childGraphPosition.value.x}px`,
    top: `${childGraphPosition.value.y}px`,
    width: `${childGraphSize.value.width}px`,
    zIndex: 12,
  }));

  const startChildGraphDrag = (event: MouseEvent) => {
    isChildDragging.value = true;
    childDragStart.value = {
      x: event.clientX - childGraphPosition.value.x,
      y: event.clientY - childGraphPosition.value.y,
    };
    document.addEventListener('mousemove', onChildGraphDrag);
    document.addEventListener('mouseup', stopChildGraphDrag);
  };

  const onChildGraphDrag = (event: MouseEvent) => {
    if (!isChildDragging.value) return;
    childGraphPosition.value = {
      x: event.clientX - childDragStart.value.x,
      y: event.clientY - childDragStart.value.y,
    };
  };

  const stopChildGraphDrag = () => {
    isChildDragging.value = false;
    document.removeEventListener('mousemove', onChildGraphDrag);
    document.removeEventListener('mouseup', stopChildGraphDrag);
  };

  const startChildGraphResize = (event: MouseEvent) => {
    isChildResizing.value = true;
    childResizeStart.value = {
      x: event.clientX,
      y: event.clientY,
      width: childGraphSize.value.width,
      height: childGraphSize.value.height,
    };
    document.addEventListener('mousemove', onChildGraphResize);
    document.addEventListener('mouseup', stopChildGraphResize);
  };

  const onChildGraphResize = (event: MouseEvent) => {
    if (!isChildResizing.value) return;
    const nextWidth = Math.max(320, childResizeStart.value.width + (event.clientX - childResizeStart.value.x));
    const nextHeight = Math.max(260, childResizeStart.value.height + (event.clientY - childResizeStart.value.y));
    childGraphSize.value = { width: nextWidth, height: nextHeight };
  };

  const stopChildGraphResize = () => {
    isChildResizing.value = false;
    writeSessionStorageJSON(CHILD_GRAPH_SIZE_KEY, childGraphSize.value);
    document.removeEventListener('mousemove', onChildGraphResize);
    document.removeEventListener('mouseup', stopChildGraphResize);
  };

  const handleChildConnectProxy = (params: Connection) => {
    const source = params.source as string | null | undefined;
    const target = params.target as string | null | undefined;
    if (!source || !target) return;

    const isBridgeSource = source.startsWith('bridge:');
    const isBridgeTarget = target.startsWith('bridge:');

    if (isBridgeSource || isBridgeTarget) {
      const bridgeId = isBridgeSource ? source : target;
      const childId = isBridgeSource ? target : source;
      const externalId = bridgeId.split(':').slice(2).join(':');
      const meta = childGraphBridgeMeta.value.get(externalId);
      if (!meta) return;
      const childHandle = (isBridgeSource ? params.targetHandle : params.sourceHandle) ?? undefined;
      const externalHandle = meta.externalHandle ?? undefined;
      if (isBridgeSource) {
        linkLandmarks(props.landmarks, externalId, childId, externalHandle, childHandle);
      } else {
        linkLandmarks(props.landmarks, childId, externalId, childHandle, externalHandle);
      }
      return;
    }

    handleChildConnect(params);
  };

  const handleChildEdgesChangeProxy = (changes: EdgeChange[]) => {
    const removed = changes.filter(isRemoveChangeWithId);
    if (removed.length > 0) {
      removed.forEach(change => {
        const edgeId = change.id;
        if (edgeId.startsWith('bridge-edge:')) {
          const parts = edgeId.split(':');
          if (parts.length >= 3) {
            const childId = parts[1];
            const externalId = parts.slice(2).join(':');
            removeBridgeConnection(childId, externalId);
          }
        }
      });
    }
    const forwarded = changes.filter(change => !isRemoveChangeWithId(change) || !change.id.startsWith('bridge-edge:'));
    if (forwarded.length > 0) {
      handleChildEdgesChange(forwarded);
    }
  };

  const closeChildGraph = () => {
    childGraphVisible.value = false;
    clearChildSelection();
  };

  const handleChildNodeDragStopProxy = (
    event: unknown,
    node?: { id?: string; position?: { x: number; y: number } }
  ) => {
    const resolvedNode = node ?? (event as { node?: { id?: string; position?: { x: number; y: number } } })?.node;
    if (!resolvedNode?.id) return;
    if (resolvedNode.id.startsWith('bridge:') && resolvedNode.position) {
      bridgePositions.value = {
        ...bridgePositions.value,
        [resolvedNode.id]: { x: resolvedNode.position.x, y: resolvedNode.position.y },
      };
      return;
    }
    handleChildNodeDragStop(event, node as Node);
  };

  watch(bridgePositions, (value) => {
    writeLocalStorageJSON(BRIDGE_POSITIONS_KEY, value);
  }, { deep: true });

  watch(childGraphBridgeMeta, (meta) => {
    const validIds = new Set(Array.from(meta.values()).map(item => item.nodeId));
    const nextPositions: Record<string, { x: number; y: number }> = {};
    Object.entries(bridgePositions.value).forEach(([id, pos]) => {
      if (validIds.has(id)) {
        nextPositions[id] = pos;
      }
    });
    const defaults = getBridgeDefaults();
    let changed = false;
    validIds.forEach(id => {
      if (!nextPositions[id] && defaults[id]) {
        nextPositions[id] = defaults[id];
        changed = true;
      }
    });
    if (changed || Object.keys(nextPositions).length !== Object.keys(bridgePositions.value).length) {
      bridgePositions.value = nextPositions;
    }
  }, { immediate: true });

  const handleNodeClick = (event: unknown, node?: Node) => {
    selectNode(event, node);
    const resolvedId = node?.id ?? (event as { node?: { id?: string } })?.node?.id;
    if (!resolvedId) return;
    const descendantIds = collectDescendantIds(props.landmarks, resolvedId);
    if (descendantIds.size > 0) {
      childGraphParentId.value = resolvedId;
      childGraphVisible.value = true;
    }
  };

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onChildGraphDrag);
    document.removeEventListener('mouseup', stopChildGraphDrag);
    document.removeEventListener('mousemove', onChildGraphResize);
    document.removeEventListener('mouseup', stopChildGraphResize);
  });

  const emitEditSelected = (item?: EnhancedLandmark) => {
    const target = item || selectedLandmark.value;
    if (target) {
      options?.onEdit?.(target);
    }
  };

  return {
    nodes,
    edges,
    edgeTypes,
    projectRegions,
    selectedLandmark,
    selectedForces,
    inspectorStyle,
    startDrag,
    handleNodeDragStop,
    handleConnect,
    handleEdgesChange,
    handleNodeClick,
    clearSelection,
    childGraphVisible,
    childGraphTitle,
    childGraphStyle,
    childGraphSize,
    childGraphNodesWithBridges,
    childGraphEdgesWithBridges,
    childEdgeTypes,
    childSelectedLandmark,
    childSelectedForces,
    childInspectorStyle,
    startChildInspectorDrag,
    startChildGraphDrag,
    startChildGraphResize,
    handleChildNodeDragStopProxy,
    handleChildConnectProxy,
    handleChildEdgesChangeProxy,
    handleChildNodeClick,
    clearChildSelection,
    closeChildGraph,
    emitEditSelected,
  };
};
