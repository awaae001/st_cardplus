import { computed, ref, watch, h, onBeforeUnmount, type CSSProperties, type ComputedRef, type Ref } from 'vue';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type Node,
  type EdgeProps,
  type Connection,
  type EdgeChange
} from '@vue-flow/core';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion, RoadConnection } from '@/types/world-editor';

export interface WorldGraphProps {
  projects: Project[];
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  regions: EnhancedRegion[];
  activeProjectId?: string | null;
}

interface WorldGraphState {
  nodes: Ref<Node[]>;
  edges: Ref<Edge[]>;
  edgeTypes: { removable: (edgeProps: EdgeProps) => ReturnType<typeof h> };
  projectRegions: ComputedRef<EnhancedRegion[]>;
  selectedLandmark: ComputedRef<EnhancedLandmark | null>;
  selectedForces: ComputedRef<Array<{ id: string; name: string; role: string }>>;
  inspectorStyle: ComputedRef<CSSProperties>;
  startDrag: (event: MouseEvent) => void;
  handleNodeDragStop: (event: unknown, node?: Node) => void;
  handleConnect: (params: Connection) => void;
  handleEdgesChange: (changes: EdgeChange[]) => void;
  handleNodeClick: (event: unknown, node?: Node) => void;
  clearSelection: () => void;
}

export const useWorldGraph = (props: WorldGraphProps): WorldGraphState => {
  const nodes = ref<Node[]>([]);
  const edges = ref<Edge[]>([]);
  const selectedLandmarkId = ref<string | null>(null);

  const RemovableEdge = (edgeProps: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath(edgeProps);
    const onRemove = (event: MouseEvent) => {
      event.stopPropagation();
      const remove = edgeProps.data?.onRemove as undefined | ((edgeId: string) => void);
      remove?.(edgeProps.id);
    };

    return h('g', { class: 'removable-edge' }, [
      h(BaseEdge, { path: edgePath, markerEnd: edgeProps.markerEnd }),
      h(EdgeLabelRenderer, null, {
        default: () =>
          h(
            'div',
            {
              class: 'edge-label',
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all'
              }
            },
            [
              h(
                'button',
                {
                  class: 'edge-remove-button',
                  type: 'button',
                  onClick: onRemove,
                  style: {
                    borderRadius: '999px',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '11px',
                    lineHeight: '1',
                  }
                },
                'X'
              )])
      })]);
  };

  const edgeTypes = { removable: RemovableEdge };

  const activeProjectId = computed(() => {
    if (props.activeProjectId) return props.activeProjectId;
    return props.projects[0]?.id || null;
  });
  const projectLandmarks = computed(() => {
    if (!activeProjectId.value) return [];
    return props.landmarks.filter(l => l.projectId === activeProjectId.value);
  });
  const projectForces = computed(() => {
    if (!activeProjectId.value) return [];
    return props.forces.filter(f => f.projectId === activeProjectId.value);
  });
  const projectRegions = computed(() => {
    if (!activeProjectId.value) return [];
    return props.regions.filter(r => r.projectId === activeProjectId.value);
  });
  const regionInfoMap = computed(() => new Map(
    projectRegions.value.map(region => [region.id, { name: region.name, color: region.color }])
  ));
  const projectLandmarkMap = computed(() => new Map(projectLandmarks.value.map(landmark => [landmark.id, landmark])));
  const selectedLandmark = computed(() => {
    if (!selectedLandmarkId.value) return null;
    return projectLandmarkMap.value.get(selectedLandmarkId.value) || null;
  });

  const createDefaultPosition = (index: number) => {
    const columns = 4;
    const spacingX = 220;
    const spacingY = 160;
    return {
      x: (index % columns) * spacingX,
      y: Math.floor(index / columns) * spacingY,
    };
  };

  const forceRoleAtLandmark = (force: EnhancedForce, landmark: EnhancedLandmark) => {
    if (force.headquarters === landmark.id || force.headquarters === landmark.name) {
      return '总部';
    }
    if (force.branchLocations?.some(branch => branch.locationId === landmark.id)) {
      return '分部';
    }
    return null;
  };

  const getForcesAtLandmark = (landmark: EnhancedLandmark) => projectForces.value
    .map(force => ({ force, role: forceRoleAtLandmark(force, landmark) }))
    .filter(item => item.role !== null)
    .map(item => ({
      id: item.force.id,
      name: item.force.name,
      role: item.role as string,
    }));

  const selectedForces = computed(() => {
    if (!selectedLandmark.value) return [];
    return getForcesAtLandmark(selectedLandmark.value);
  });

  const buildNodes = () => {
    const list = projectLandmarks.value;
    nodes.value = list.map((landmark, index) => {
      if (!landmark.position) {
        landmark.position = createDefaultPosition(index);
      }
      const forcesAt = getForcesAtLandmark(landmark);
      const regionInfo = landmark.regionId ? regionInfoMap.value.get(landmark.regionId) : null;

      return {
        id: landmark.id,
        type: 'landmark',
        position: landmark.position,
        data: {
          id: landmark.id,
          name: landmark.name,
          region: regionInfo?.name ?? '',
          regionColor: regionInfo?.color ?? '',
          forces: forcesAt,
          type: landmark.type,
        },
      };
    });
  };

  const getRoadConnection = (landmark: EnhancedLandmark, targetId: string): RoadConnection | null => {
    if (!landmark.roadConnections) return null;
    return landmark.roadConnections.find(conn => conn.targetId === targetId) || null;
  };

  const unlinkLandmarks = (sourceId: string, targetId: string) => {
    const sourceLandmark = projectLandmarkMap.value.get(sourceId);
    const targetLandmark = projectLandmarkMap.value.get(targetId);
    if (sourceLandmark) {
      sourceLandmark.relatedLandmarks = (sourceLandmark.relatedLandmarks || []).filter(id => id !== targetId);
      sourceLandmark.roadConnections = (sourceLandmark.roadConnections || []).filter(conn => conn.targetId !== targetId);
    }
    if (targetLandmark) {
      targetLandmark.relatedLandmarks = (targetLandmark.relatedLandmarks || []).filter(id => id !== sourceId);
      targetLandmark.roadConnections = (targetLandmark.roadConnections || []).filter(conn => conn.targetId !== sourceId);
    }
  };

  const removeEdgeById = (edgeId: string) => {
    const edge = edges.value.find(item => item.id === edgeId);
    if (!edge) return;
    unlinkLandmarks(edge.source, edge.target);
    buildEdges();
  };

  const buildEdges = () => {
    const list = projectLandmarks.value;
    const landmarkMap = projectLandmarkMap.value;
    const existing = new Set<string>();
    const edgeList: Edge[] = [];

    const addEdge = (a: string, b: string) => {
      if (a === b) return;
      const ids = [a, b].sort();
      const key = `${ids[0]}--${ids[1]}`;
      if (existing.has(key)) return;
      existing.add(key);

      const source = ids[0];
      const target = ids[1];
      const sourceLandmark = landmarkMap.get(source);
      const targetLandmark = landmarkMap.get(target);
      const connection = sourceLandmark ? getRoadConnection(sourceLandmark, target) : null;
      const fallbackConnection = targetLandmark ? getRoadConnection(targetLandmark, source) : null;
      const sourceHandle = connection?.handle ?? fallbackConnection?.targetHandle;
      const targetHandle = connection?.targetHandle ?? fallbackConnection?.handle;

      edgeList.push({
        id: `edge-${key}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: 'removable',
        data: {
          onRemove: removeEdgeById
        }
      });
    };

    list.forEach(landmark => {
      (landmark.relatedLandmarks || []).forEach(relatedId => {
        if (landmarkMap.has(relatedId)) {
          addEdge(landmark.id, relatedId);
        }
      });
    });

    edges.value = edgeList;
  };

  watch([projectLandmarks, projectForces], () => {
    buildNodes();
    buildEdges();
  }, { deep: true, immediate: true });

  watch(activeProjectId, () => {
    selectedLandmarkId.value = null;
  });

  const addConnections = (landmark: EnhancedLandmark, ids: Set<string>) => {
    (landmark.relatedLandmarks || []).forEach(id => ids.add(id));
    (landmark.roadConnections || []).forEach(conn => ids.add(conn.targetId));
  };

  const recalcRelativePositions = () => {
    const list = projectLandmarks.value.filter(item => item.position);
    list.forEach(landmark => {
      const connectedIds = new Set<string>();
      addConnections(landmark, connectedIds);
      list.forEach(other => {
        if (other.id === landmark.id) return;
        if (
          other.relatedLandmarks?.includes(landmark.id) ||
          other.roadConnections?.some(conn => conn.targetId === landmark.id)
        ) {
          connectedIds.add(other.id);
        }
      });
      const connectedCandidates = list.filter(item => connectedIds.has(item.id));
      const position = landmark.position;
      if (!position) return;
      const closest = {
        north: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        south: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        east: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        west: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
      };

      connectedCandidates.forEach(other => {
        if (other.id === landmark.id || !other.position) return;
        const dx = other.position.x - position.x;
        const dy = other.position.y - position.y;
        const dist = dx * dx + dy * dy;

        if (dy < 0 && Math.abs(dy) >= Math.abs(dx) && dist < closest.north.dist) {
          closest.north = { id: other.id, dist };
        } else if (dy > 0 && Math.abs(dy) >= Math.abs(dx) && dist < closest.south.dist) {
          closest.south = { id: other.id, dist };
        } else if (dx > 0 && Math.abs(dx) >= Math.abs(dy) && dist < closest.east.dist) {
          closest.east = { id: other.id, dist };
        } else if (dx < 0 && Math.abs(dx) >= Math.abs(dy) && dist < closest.west.dist) {
          closest.west = { id: other.id, dist };
        }
      });

      if (!landmark.relativePosition) {
        landmark.relativePosition = {};
      }
      const singleSelection = (id?: string) => (id ? [id] : []);
      landmark.relativePosition.north = singleSelection(closest.north.id);
      landmark.relativePosition.south = singleSelection(closest.south.id);
      landmark.relativePosition.east = singleSelection(closest.east.id);
      landmark.relativePosition.west = singleSelection(closest.west.id);
    });
  };

  const handleNodeDragStop = (event: unknown, node?: Node) => {
    const resolvedNode = node ?? (event as { node?: Node })?.node;
    if (!resolvedNode?.id) return;
    const target = projectLandmarks.value.find(item => item.id === resolvedNode.id);
    if (target) {
      target.position = { x: resolvedNode.position.x, y: resolvedNode.position.y };
      recalcRelativePositions();
    }
  };

  const upsertRoadConnection = (
    landmark: EnhancedLandmark,
    targetId: string,
    handle?: string,
    targetHandle?: string
  ) => {
    if (!landmark.roadConnections) {
      landmark.roadConnections = [];
    }
    const existing = landmark.roadConnections.find(conn => conn.targetId === targetId);
    if (existing) {
      existing.handle = handle;
      existing.targetHandle = targetHandle;
    } else {
      landmark.roadConnections.push({ targetId, handle, targetHandle });
    }
  };

  const handleConnect = (params: Connection) => {
    const source = params.source;
    const target = params.target;
    if (!source || !target || source === target) return;

    const sourceHandle = params.sourceHandle ?? undefined;
    const targetHandle = params.targetHandle ?? undefined;

    const sourceLandmark = projectLandmarks.value.find(item => item.id === source);
    const targetLandmark = projectLandmarks.value.find(item => item.id === target);
    if (!sourceLandmark || !targetLandmark) return;

    if (!sourceLandmark.relatedLandmarks) {
      sourceLandmark.relatedLandmarks = [];
    }
    if (!targetLandmark.relatedLandmarks) {
      targetLandmark.relatedLandmarks = [];
    }
    if (!sourceLandmark.relatedLandmarks.includes(target)) {
      sourceLandmark.relatedLandmarks.push(target);
    }
    if (!targetLandmark.relatedLandmarks.includes(source)) {
      targetLandmark.relatedLandmarks.push(source);
    }
    upsertRoadConnection(sourceLandmark, target, sourceHandle, targetHandle);
    upsertRoadConnection(targetLandmark, source, targetHandle, sourceHandle);
    buildEdges();
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    const removed = changes.filter(change => change.type === 'remove');
    if (removed.length === 0) return;

    removed.forEach(change => {
      if (!('id' in change)) return;
      const edge = edges.value.find(item => item.id === change.id);
      if (!edge) return;
      unlinkLandmarks(edge.source, edge.target);
    });
    buildEdges();
  };

  const inspectorPosition = ref({ x: 50, y: 50 });
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });

  const inspectorStyle = computed((): CSSProperties => ({
    position: 'absolute',
    left: `${inspectorPosition.value.x}px`,
    top: `${inspectorPosition.value.y}px`,
    zIndex: 10,
  }));

  const startDrag = (event: MouseEvent) => {
    isDragging.value = true;
    dragStart.value = {
      x: event.clientX - inspectorPosition.value.x,
      y: event.clientY - inspectorPosition.value.y,
    };
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const onDrag = (event: MouseEvent) => {
    if (!isDragging.value) return;
    inspectorPosition.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y,
    };
  };

  const stopDrag = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  };

  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  });

  const handleNodeClick = (event: unknown, node?: Node) => {
    const resolvedNode = node ?? (event as { node?: Node })?.node;
    if (!resolvedNode?.id) return;
    selectedLandmarkId.value = resolvedNode.id;
  };

  const clearSelection = () => {
    selectedLandmarkId.value = null;
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
  } as const;
};
