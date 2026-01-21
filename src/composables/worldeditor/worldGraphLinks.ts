import type { EnhancedLandmark } from '@/types/world-editor';

const ensureRelatedLandmark = (landmark: EnhancedLandmark, targetId: string) => {
  if (!landmark.relatedLandmarks) {
    landmark.relatedLandmarks = [];
  }
  if (!landmark.relatedLandmarks.includes(targetId)) {
    landmark.relatedLandmarks.push(targetId);
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

export const linkLandmarks = (
  landmarks: EnhancedLandmark[],
  sourceId: string,
  targetId: string,
  sourceHandle?: string,
  targetHandle?: string
) => {
  const sourceLandmark = landmarks.find(item => item.id === sourceId);
  const targetLandmark = landmarks.find(item => item.id === targetId);
  if (!sourceLandmark || !targetLandmark) return;

  ensureRelatedLandmark(sourceLandmark, targetId);
  ensureRelatedLandmark(targetLandmark, sourceId);
  upsertRoadConnection(sourceLandmark, targetId, sourceHandle, targetHandle);
  upsertRoadConnection(targetLandmark, sourceId, targetHandle, sourceHandle);
};

export const unlinkLandmarks = (landmarks: EnhancedLandmark[], sourceId: string, targetId: string) => {
  const sourceLandmark = landmarks.find(item => item.id === sourceId);
  const targetLandmark = landmarks.find(item => item.id === targetId);
  if (sourceLandmark) {
    sourceLandmark.relatedLandmarks = (sourceLandmark.relatedLandmarks || []).filter(id => id !== targetId);
    sourceLandmark.roadConnections = (sourceLandmark.roadConnections || []).filter(conn => conn.targetId !== targetId);
  }
  if (targetLandmark) {
    targetLandmark.relatedLandmarks = (targetLandmark.relatedLandmarks || []).filter(id => id !== sourceId);
    targetLandmark.roadConnections = (targetLandmark.roadConnections || []).filter(conn => conn.targetId !== sourceId);
  }
};
