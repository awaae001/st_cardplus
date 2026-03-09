import type { EnhancedLandmark } from '@/types/world-editor';

const ensureRelatedLandmark = (landmark: EnhancedLandmark, targetId: string) => {
  if (!landmark.relatedLandmarks) {
    landmark.relatedLandmarks = [];
  }
  if (!landmark.relatedLandmarks.includes(targetId)) {
    landmark.relatedLandmarks.push(targetId);
  }
};

type HandleSide = 'left' | 'right' | 'top' | 'bottom';

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
  return type.includes('天堑');
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

const euclideanDistance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(b.x - a.x, b.y - a.y);

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

export const getRoadConnectionLength = (source: EnhancedLandmark, target: EnhancedLandmark): number | undefined => {
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
  unit?: string
): string => {
  if (!target) return '未计算';
  const length = getRoadConnectionLength(source, target);
  if (length === undefined) return '未计算';
  return unit ? `${length} ${unit}` : String(length);
};

export const formatRoadLinkLabel = (targetName: string, distanceText: string, label: string): string =>
  `${targetName} (${label}: ${distanceText})`;
