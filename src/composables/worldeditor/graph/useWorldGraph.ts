import { computed, ref, watch, h, onBeforeUnmount, type CSSProperties, type ComputedRef, type Ref } from 'vue';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type Node,
  type EdgeProps,
  type Connection,
  type EdgeChange,
} from '@vue-flow/core';
import type { Project, EnhancedLandmark, EnhancedForce, EnhancedRegion, RoadConnection } from '@/types/world-editor';
import type { LandmarkNodeData, LandmarkNodeForce } from '@/types/worldeditor/worldGraphNodes';
import { linkLandmarks, recalculateRoadConnectionLengths, unlinkLandmarks } from '@/composables/worldeditor/graph/worldGraphLinks';

export interface WorldGraphProps {
  projects: Project[];
  landmarks: EnhancedLandmark[];
  forces: EnhancedForce[];
  regions: EnhancedRegion[];
  activeProjectId?: string | null;
}

export interface WorldGraphOptions {
  landmarkScope?: ComputedRef<EnhancedLandmark[]>;
}

interface WorldGraphState {
  nodes: Ref<Node[]>;
  edges: Ref<Edge[]>;
  edgeTypes: { removable: (edgeProps: EdgeProps) => ReturnType<typeof h> };
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
}

interface RemovableEdgeData {
  onRemove?: (edgeId: string) => void;
  roadLength?: number;
}

export const useWorldGraph = (props: WorldGraphProps, options?: WorldGraphOptions): WorldGraphState => {
  const nodes = ref<Node[]>([]);
  const edges = ref<Edge[]>([]);
  const selectedLandmarkId = ref<string | null>(null);

  const RemovableEdge = (edgeProps: EdgeProps): ReturnType<typeof h> => {
    const [edgePath, labelX, labelY] = getBezierPath(edgeProps);
    const edgeData = (edgeProps.data || {}) as RemovableEdgeData;
    const roadLength =
      typeof edgeData.roadLength === 'number' && Number.isFinite(edgeData.roadLength) ? edgeData.roadLength : null;
    const onRemove = (event: MouseEvent) => {
      event.stopPropagation();
      const remove = edgeData.onRemove;
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
                pointerEvents: 'all',
              },
            },
            [
              roadLength !== null
                ? h(
                    'span',
                    {
                      class: 'edge-length-label',
                      style: {
                        fontSize: '11px',
                        color: '#334155',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '999px',
                        padding: '1px 6px',
                      },
                    },
                    `${roadLength}`
                  )
                : null,
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
                  },
                },
                'X'
              ),
            ]
          ),
      }),
    ]);
  };

  const edgeTypes: WorldGraphState['edgeTypes'] = { removable: RemovableEdge };

  const activeProjectId = computed(() => {
    if (props.activeProjectId) return props.activeProjectId;
    return props.projects[0]?.id || null;
  });
  const projectLandmarksAll = computed(() => {
    if (!activeProjectId.value) return [];
    return props.landmarks.filter((l) => l.projectId === activeProjectId.value);
  });
  const projectLandmarks = computed(() => {
    if (options?.landmarkScope) return options.landmarkScope.value;
    return projectLandmarksAll.value;
  });
  const projectForces = computed(() => {
    if (!activeProjectId.value) return [];
    return props.forces.filter((f) => f.projectId === activeProjectId.value);
  });
  const projectRegions = computed(() => {
    if (!activeProjectId.value) return [];
    return props.regions.filter((r) => r.projectId === activeProjectId.value);
  });
  const regionInfoMap = computed(
    () => new Map(projectRegions.value.map((region) => [region.id, { name: region.name, color: region.color }]))
  );
  const projectLandmarkMap = computed(() => new Map(projectLandmarks.value.map((landmark) => [landmark.id, landmark])));
  const projectLandmarkMapAll = computed(
    () => new Map(projectLandmarksAll.value.map((landmark) => [landmark.id, landmark]))
  );
  const selectedLandmark = computed(() => {
    if (!selectedLandmarkId.value) return null;
    return projectLandmarkMapAll.value.get(selectedLandmarkId.value) || null;
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
    if (force.branchLocations?.some((branch) => branch.locationId === landmark.id)) {
      return '分部';
    }
    return null;
  };

  const getForcesAtLandmark = (landmark: EnhancedLandmark): LandmarkNodeForce[] =>
    projectForces.value
      .map((force) => ({ force, role: forceRoleAtLandmark(force, landmark) }))
      .filter((item) => item.role !== null)
      .map((item) => ({
        id: item.force.id,
        name: item.force.name,
        role: item.role ?? undefined,
      }));

  const selectedForces = computed(() => {
    if (!selectedLandmark.value) return [];
    return getForcesAtLandmark(selectedLandmark.value);
  });

  const buildNodes = () => {
    const list = projectLandmarks.value;
    const nodeList: Node[] = [];
    list.forEach((landmark, index) => {
      if (!landmark.position) {
        landmark.position = createDefaultPosition(index);
      }
      const resolvedPosition = {
        x: landmark.position.x,
        y: landmark.position.y,
      };
      const forcesAt = getForcesAtLandmark(landmark);
      const regionInfo = landmark.regionId ? regionInfoMap.value.get(landmark.regionId) : null;

      const data: LandmarkNodeData = {
        id: landmark.id,
        name: landmark.name,
        region: regionInfo?.name ?? '',
        regionColor: regionInfo?.color ?? '',
        importance: landmark.importance,
        population: landmark.population,
        forces: forcesAt,
        childCount: landmark.childLandmarkIds?.length ?? 0,
        type: landmark.type,
      };

      nodeList.push({
        id: landmark.id,
        type: 'landmark',
        position: resolvedPosition,
        data,
      });
    });
    nodes.value = nodeList;
  };

  const getRoadConnection = (landmark: EnhancedLandmark, targetId: string): RoadConnection | null => {
    if (!landmark.roadConnections) return null;
    return landmark.roadConnections.find((conn) => conn.targetId === targetId) || null;
  };

  const findEdgeEndpoints = (edgeId: string): { source: string; target: string } | null => {
    const currentEdges = edges.value as Array<{ id: string; source: string; target: string }>;
    for (const item of currentEdges) {
      if (item.id === edgeId) {
        return { source: item.source, target: item.target };
      }
    }
    return null;
  };

  const removeEdgeById = (edgeId: string) => {
    const endpoints = findEdgeEndpoints(edgeId);
    if (!endpoints) return;
    unlinkLandmarks(projectLandmarks.value, endpoints.source, endpoints.target);
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
      const roadLength = connection?.length ?? fallbackConnection?.length;

      edgeList.push({
        id: `edge-${key}`,
        source,
        target,
        sourceHandle,
        targetHandle,
        type: 'removable',
        data: {
          onRemove: removeEdgeById,
          roadLength,
        },
      });
    };

    list.forEach((landmark) => {
      (landmark.relatedLandmarks || []).forEach((relatedId) => {
        if (landmarkMap.has(relatedId)) {
          addEdge(landmark.id, relatedId);
        }
      });
    });

    edges.value = edgeList;
  };

  watch(
    [projectLandmarks, projectForces],
    () => {
      buildNodes();
      recalculateRoadConnectionLengths(projectLandmarksAll.value);
      buildEdges();
    },
    { deep: true, immediate: true }
  );

  watch(activeProjectId, () => {
    selectedLandmarkId.value = null;
  });

  const addConnections = (landmark: EnhancedLandmark, ids: Set<string>) => {
    (landmark.relatedLandmarks || []).forEach((id) => ids.add(id));
    (landmark.roadConnections || []).forEach((conn) => ids.add(conn.targetId));
  };

  const recalcRelativePositions = () => {
    const list = projectLandmarks.value.filter((item) => item.position);
    list.forEach((landmark) => {
      const connectedIds = new Set<string>();
      addConnections(landmark, connectedIds);
      list.forEach((other) => {
        if (other.id === landmark.id) return;
        if (
          other.relatedLandmarks?.includes(landmark.id) ||
          other.roadConnections?.some((conn) => conn.targetId === landmark.id)
        ) {
          connectedIds.add(other.id);
        }
      });
      const connectedCandidates = list.filter((item) => connectedIds.has(item.id));
      const position = landmark.position;
      if (!position) return;
      const closest = {
        north: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        south: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        east: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
        west: { id: undefined as string | undefined, dist: Number.POSITIVE_INFINITY },
      };

      connectedCandidates.forEach((other) => {
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
    const target = projectLandmarks.value.find((item) => item.id === resolvedNode.id);
    if (target) {
      target.position = { x: resolvedNode.position.x, y: resolvedNode.position.y };
      recalcRelativePositions();
      recalculateRoadConnectionLengths(projectLandmarksAll.value);
      buildEdges();
    }
  };

  const handleConnect = (params: Connection) => {
    const source = params.source;
    const target = params.target;
    if (!source || !target || source === target) return;

    const sourceHandle = params.sourceHandle ?? undefined;
    const targetHandle = params.targetHandle ?? undefined;

    linkLandmarks(projectLandmarks.value, source, target, sourceHandle, targetHandle);
    recalculateRoadConnectionLengths(projectLandmarksAll.value);
    buildEdges();
  };

  const handleEdgesChange = (changes: EdgeChange[]) => {
    const removed = changes.filter((change) => change.type === 'remove');
    if (removed.length === 0) return;

    removed.forEach((change) => {
      if (!('id' in change)) return;
      const endpoints = findEdgeEndpoints(change.id);
      if (!endpoints) return;
      unlinkLandmarks(projectLandmarks.value, endpoints.source, endpoints.target);
    });
    buildEdges();
  };

  const inspectorPosition = ref({ x: 50, y: 50 });
  const isDragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });

  const inspectorStyle = computed(
    (): CSSProperties => ({
      position: 'absolute',
      left: `${inspectorPosition.value.x}px`,
      top: `${inspectorPosition.value.y}px`,
      zIndex: 10,
    })
  );

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
  } as WorldGraphState;
};
