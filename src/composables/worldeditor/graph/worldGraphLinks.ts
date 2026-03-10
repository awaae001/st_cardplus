import type { EnhancedLandmark } from '@/types/world-editor';
import { getParentLandmarkId } from '@/utils/worldeditor/landmarkHierarchy';

const ensureRelatedLandmark = (landmark: EnhancedLandmark, targetId: string) => {
  if (!landmark.relatedLandmarks) {
    landmark.relatedLandmarks = [];
  }
  if (!landmark.relatedLandmarks.includes(targetId)) {
    landmark.relatedLandmarks.push(targetId);
  }
};

type HandleSide = 'left' | 'right' | 'top' | 'bottom';

const BRIDGE_NODE_WIDTH = 120;
const BRIDGE_NODE_HEIGHT = 24;

const parseHandleSide = (handle?: string): HandleSide | undefined => {
  if (!handle) return undefined;
  if (handle === 'sr' || handle === 'tr' || handle.endsWith('right')) return 'right';
  if (handle === 'sl' || handle === 'tl' || handle.endsWith('left')) return 'left';
  if (handle === 'st' || handle === 'tt' || handle.endsWith('top')) return 'top';
  if (handle === 'sb' || handle === 'tb' || handle.endsWith('bottom')) return 'bottom';
  return undefined;
};

const isLargeLandmark = (landmark: EnhancedLandmark) => {
  const type = landmark.type || '';
  if (type === 'natural' || type === 'chasm' || type === 'canyon') return true;
};

const getNodeSize = (landmark: EnhancedLandmark) => {
  if (isLargeLandmark(landmark)) {
    return { width: 240, height: 46 };
  }

  return { width: 180, height: 38 };
};

const getNodeCenter = (landmark: EnhancedLandmark): { x: number; y: number } | null => {
  if (!landmark.position) return null;
  const { width, height } = getNodeSize(landmark);
  return { x: landmark.position.x + width / 2, y: landmark.position.y + height / 2 };
};

const getFacingEdgeMidpoint = (
  landmark: EnhancedLandmark,
  targetCenter: { x: number; y: number }
): { x: number; y: number } | null => {
  const center = getNodeCenter(landmark);
  if (!center) return null;
  const { width, height } = getNodeSize(landmark);
  const dx = targetCenter.x - center.x;
  const dy = targetCenter.y - center.y;
  const side: HandleSide = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : dy >= 0 ? 'bottom' : 'top';

  if (side === 'left') return { x: center.x - width / 2, y: center.y };
  if (side === 'right') return { x: center.x + width / 2, y: center.y };
  if (side === 'top') return { x: center.x, y: center.y - height / 2 };
  return { x: center.x, y: center.y + height / 2 };
};

const getSideMidpoint = (landmark: EnhancedLandmark, side: HandleSide): { x: number; y: number } | null => {
  const center = getNodeCenter(landmark);
  if (!center) return null;
  const { width, height } = getNodeSize(landmark);
  if (side === 'left') return { x: center.x - width / 2, y: center.y };
  if (side === 'right') return { x: center.x + width / 2, y: center.y };
  if (side === 'top') return { x: center.x, y: center.y - height / 2 };
  return { x: center.x, y: center.y + height / 2 };
};

const positionToSide = (
  parent?: { x: number; y: number },
  external?: { x: number; y: number }
): HandleSide | null => {
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

const invertSide = (side: HandleSide): HandleSide => {
  switch (side) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
  }
};

const getBridgeHandlePoint = (
  position: { x: number; y: number },
  side: HandleSide
): { x: number; y: number } => {
  if (side === 'left') return { x: position.x, y: position.y + BRIDGE_NODE_HEIGHT / 2 };
  if (side === 'right') return { x: position.x + BRIDGE_NODE_WIDTH, y: position.y + BRIDGE_NODE_HEIGHT / 2 };
  if (side === 'top') return { x: position.x + BRIDGE_NODE_WIDTH / 2, y: position.y };
  return { x: position.x + BRIDGE_NODE_WIDTH / 2, y: position.y + BRIDGE_NODE_HEIGHT };
};

const euclideanDistance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(b.x - a.x, b.y - a.y);

const isDescendantOf = (
  landmark: EnhancedLandmark,
  ancestorId: string,
  landmarkMap: Map<string, EnhancedLandmark>
): boolean => {
  let current = getParentLandmarkId(landmark);
  while (current) {
    if (current === ancestorId) return true;
    const parent = landmarkMap.get(current);
    if (!parent) return false;
    current = getParentLandmarkId(parent);
  }
  return false;
};

const getDefaultBridgePosition = (
  parent: EnhancedLandmark,
  externalId: string,
  landmarks: EnhancedLandmark[],
  landmarkMap: Map<string, EnhancedLandmark>
): { x: number; y: number } | null => {
  const descendants = landmarks.filter(
    (landmark) => landmark.id !== parent.id && isDescendantOf(landmark, parent.id, landmarkMap)
  );
  const sideCounts = { left: 0, right: 0, top: 0, bottom: 0 };
  const spacing = 70;
  const columns = 4;
  const spacingX = 220;
  const spacingY = 160;
  const margin = 80;

  let minX = 0;
  let maxX = 400;
  let minY = 0;
  let maxY = 260;

  if (descendants.length > 0) {
    minX = Number.POSITIVE_INFINITY;
    minY = Number.POSITIVE_INFINITY;
    maxX = Number.NEGATIVE_INFINITY;
    maxY = Number.NEGATIVE_INFINITY;
    descendants.forEach((landmark, index) => {
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

  const externalIds = new Set<string>();
  (parent.relatedLandmarks || []).forEach((id) => externalIds.add(id));
  (parent.roadConnections || []).forEach((conn) => externalIds.add(conn.targetId));

  for (const currentExternalId of externalIds) {
    if (currentExternalId === parent.id) continue;
    const external = landmarkMap.get(currentExternalId);
    if (!external || isDescendantOf(external, parent.id, landmarkMap)) continue;
    const side = positionToSide(parent.position, external.position);
    if (!side) continue;
    const count = sideCounts[side]++;
    let x = minX;
    let y = minY;
    if (side === 'left') {
      x = minX - margin;
      y = minY + count * spacing;
    } else if (side === 'right') {
      x = maxX + margin;
      y = minY + count * spacing;
    } else if (side === 'top') {
      x = minX + count * spacing;
      y = minY - margin;
    } else {
      x = minX + count * spacing;
      y = maxY + margin;
    }
    if (currentExternalId === externalId) {
      return { x, y };
    }
  }

  return null;
};

const resolveBridgeRouteLength = (
  source: EnhancedLandmark,
  target: EnhancedLandmark,
  landmarks: EnhancedLandmark[]
): number | undefined => {
  const landmarkMap = new Map(landmarks.map((item) => [item.id, item]));

  const resolveFor = (descendant: EnhancedLandmark, external: EnhancedLandmark): number | undefined => {
    let currentParentId = getParentLandmarkId(descendant);
    while (currentParentId) {
      const parent = landmarkMap.get(currentParentId);
      if (!parent) break;
      if (external.id !== parent.id && !isDescendantOf(external, parent.id, landmarkMap)) {
        const parentConn = parent.roadConnections?.find((conn) => conn.targetId === external.id);
        const externalConn = external.roadConnections?.find((conn) => conn.targetId === parent.id);
        if (parentConn || externalConn) {
          const bridgePosition =
            parent.bridgePositions?.[external.id] ?? getDefaultBridgePosition(parent, external.id, landmarks, landmarkMap);
          const side = positionToSide(parent.position, external.position);
          if (!bridgePosition || !side) {
            currentParentId = getParentLandmarkId(parent);
            continue;
          }
          const descendantConn = descendant.roadConnections?.find((conn) => conn.targetId === external.id);
          const reverseConn = external.roadConnections?.find((conn) => conn.targetId === descendant.id);
          const descendantToBridge = estimateRoadLengthFromLandmarkToPoint(
            descendant,
            getBridgeHandlePoint(bridgePosition, invertSide(side)),
            descendantConn?.handle ?? reverseConn?.targetHandle
          );
          const parentToExternal =
            parentConn?.length ??
            externalConn?.length ??
            calculateRoadLength(
              parent,
              external,
              parentConn?.handle ?? externalConn?.targetHandle,
              parentConn?.targetHandle ?? externalConn?.handle
            );
          if (descendantToBridge !== undefined && parentToExternal !== undefined) {
            return descendantToBridge + parentToExternal;
          }
        }
      }
      currentParentId = getParentLandmarkId(parent);
    }
    return undefined;
  };

  return resolveFor(source, target) ?? resolveFor(target, source);
};

const calculateRoadLength = (
  source: EnhancedLandmark,
  target: EnhancedLandmark,
  sourceHandle?: string,
  targetHandle?: string
): number | undefined => {
  if (!source.position || !target.position) return undefined;
  const sourceCenter = getNodeCenter(source);
  const targetCenter = getNodeCenter(target);
  if (!sourceCenter || !targetCenter) return undefined;
  const sourceSide = parseHandleSide(sourceHandle);
  const targetSide = parseHandleSide(targetHandle);
  const sourceAnchor = sourceSide ? getSideMidpoint(source, sourceSide) : getFacingEdgeMidpoint(source, targetCenter);
  const targetAnchor = targetSide ? getSideMidpoint(target, targetSide) : getFacingEdgeMidpoint(target, sourceCenter);
  if (!sourceAnchor || !targetAnchor) return undefined;
  return Math.round(euclideanDistance(sourceAnchor, targetAnchor));
};

export const estimateRoadLengthBetweenLandmarks = (
  source: EnhancedLandmark,
  target: EnhancedLandmark,
  sourceHandle?: string,
  targetHandle?: string
): number | undefined => calculateRoadLength(source, target, sourceHandle, targetHandle);

export const estimateRoadLengthFromLandmarkToPoint = (
  source: EnhancedLandmark,
  targetPoint: { x: number; y: number },
  sourceHandle?: string
): number | undefined => {
  if (!source.position) return undefined;
  const sourceCenter = getNodeCenter(source);
  if (!sourceCenter) return undefined;
  const sourceSide = parseHandleSide(sourceHandle);
  const sourceAnchor = sourceSide ? getSideMidpoint(source, sourceSide) : getFacingEdgeMidpoint(source, targetPoint);
  if (!sourceAnchor) return undefined;
  return Math.round(euclideanDistance(sourceAnchor, targetPoint));
};

const upsertRoadConnection = (
  landmark: EnhancedLandmark,
  targetId: string,
  handle?: string,
  targetHandle?: string,
  length?: number
) => {
  if (!landmark.roadConnections) {
    landmark.roadConnections = [];
  }
  const existing = landmark.roadConnections.find((conn) => conn.targetId === targetId);
  if (existing) {
    existing.handle = handle;
    existing.targetHandle = targetHandle;
    existing.length = length;
  } else {
    landmark.roadConnections.push({ targetId, handle, targetHandle, length });
  }
};

export const linkLandmarks = (
  landmarks: EnhancedLandmark[],
  sourceId: string,
  targetId: string,
  sourceHandle?: string,
  targetHandle?: string
) => {
  const sourceLandmark = landmarks.find((item) => item.id === sourceId);
  const targetLandmark = landmarks.find((item) => item.id === targetId);
  if (!sourceLandmark || !targetLandmark) return;
  const computedLength = calculateRoadLength(sourceLandmark, targetLandmark, sourceHandle, targetHandle);

  ensureRelatedLandmark(sourceLandmark, targetId);
  ensureRelatedLandmark(targetLandmark, sourceId);
  upsertRoadConnection(sourceLandmark, targetId, sourceHandle, targetHandle, computedLength);
  upsertRoadConnection(targetLandmark, sourceId, targetHandle, sourceHandle, computedLength);
};

export const getRoadConnectionLength = (
  source: EnhancedLandmark,
  target: EnhancedLandmark,
  landmarks?: EnhancedLandmark[]
): number | undefined => {
  if (landmarks) {
    const bridgeLength = resolveBridgeRouteLength(source, target, landmarks);
    if (bridgeLength !== undefined) return bridgeLength;
  }
  const direct = source.roadConnections?.find((conn) => conn.targetId === target.id);
  if (direct?.length !== undefined) return direct.length;
  const reverse = target.roadConnections?.find((conn) => conn.targetId === source.id);
  return reverse?.length;
};

export const recalculateRoadConnectionLengths = (landmarks: EnhancedLandmark[]) => {
  const landmarkMap = new Map(landmarks.map((item) => [item.id, item]));
  const processedPairs = new Set<string>();

  landmarks.forEach((source) => {
    (source.roadConnections || []).forEach((connection) => {
      const target = landmarkMap.get(connection.targetId);
      if (!target) return;
      const pairKey = [source.id, target.id].sort().join('--');
      if (processedPairs.has(pairKey)) return;
      processedPairs.add(pairKey);

      const sourceConn = source.roadConnections?.find((conn) => conn.targetId === target.id);
      const targetConn = target.roadConnections?.find((conn) => conn.targetId === source.id);
      const computedLength = calculateRoadLength(
        source,
        target,
        sourceConn?.handle ?? targetConn?.targetHandle,
        sourceConn?.targetHandle ?? targetConn?.handle
      );
      if (sourceConn) sourceConn.length = computedLength;
      if (targetConn) targetConn.length = computedLength;
    });
  });
};

export const unlinkLandmarks = (landmarks: EnhancedLandmark[], sourceId: string, targetId: string) => {
  const sourceLandmark = landmarks.find((item) => item.id === sourceId);
  const targetLandmark = landmarks.find((item) => item.id === targetId);
  if (sourceLandmark) {
    sourceLandmark.relatedLandmarks = (sourceLandmark.relatedLandmarks || []).filter((id) => id !== targetId);
    sourceLandmark.roadConnections = (sourceLandmark.roadConnections || []).filter(
      (conn) => conn.targetId !== targetId
    );
  }
  if (targetLandmark) {
    targetLandmark.relatedLandmarks = (targetLandmark.relatedLandmarks || []).filter((id) => id !== sourceId);
    targetLandmark.roadConnections = (targetLandmark.roadConnections || []).filter(
      (conn) => conn.targetId !== sourceId
    );
  }
};

export const removeLandmarkLinksForIds = (landmarks: EnhancedLandmark[], ids: Set<string>) => {
  if (ids.size === 0) return;
  landmarks.forEach((landmark) => {
    landmark.relatedLandmarks = (landmark.relatedLandmarks || []).filter((id) => !ids.has(id));
    landmark.roadConnections = (landmark.roadConnections || []).filter((conn) => !ids.has(conn.targetId));
    if (landmark.bridgePositions) {
      const next = Object.fromEntries(
        Object.entries(landmark.bridgePositions).filter(([externalId]) => !ids.has(externalId))
      );
      landmark.bridgePositions = next;
    }
  });
};

export const getRoadConnectionLengthText = (
  source: EnhancedLandmark,
  target?: EnhancedLandmark | null,
  unit?: string,
  landmarks?: EnhancedLandmark[]
): string => {
  if (!target) return '未计算';
  const length = getRoadConnectionLength(source, target, landmarks);
  if (length === undefined) return '未计算';
  return unit ? `${length} ${unit}` : String(length);
};

export const formatRoadLinkLabel = (targetName: string, distanceText: string, label: string): string =>
  `${targetName} (${label}: ${distanceText})`;
