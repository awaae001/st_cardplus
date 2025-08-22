import type { Ref } from 'vue';
import type { EnhancedLandmark, EnhancedForce } from '@/types/world-editor';

export function useDragAndDrop(
    landmarks: Ref<EnhancedLandmark[]>,
    forces: Ref<EnhancedForce[]>
) {
    const allowDrag = (draggingNode: any) => {
        const type = draggingNode.data.type;
        return type === 'landmark' || type === 'force';
    };

    const allowDrop = (draggingNode: any, dropNode: any, type: any) => {
        const draggedType = draggingNode.data.type;
        const dropType = dropNode.data.type;
        const dropIsCategory = !dropNode.data.isEntry;

        if (draggingNode.data.id === dropNode.data.id) {
            return false;
        }

        if (dropIsCategory && type !== 'inner') {
            return false;
        }

        if (dropType === 'project' && type === 'inner') return true;
        if (dropIsCategory && type === 'inner') {
            const dropParentType = dropNode.parent.data.type;
            if (dropParentType === 'project') return true;
        }

        if (draggedType === dropType && (type === 'prev' || type === 'next')) {
            return true;
        }

        return false;
    };

    const handleNodeDrop = (draggingNode: any, dropNode: any, dropType: any): boolean => {
        const draggedItem = draggingNode.data.raw;
        const dropItemRaw = dropNode.data.raw;

        if ('region' in draggedItem) { // Dragged item is a Landmark
            const list = landmarks.value;
            const fromIndex = list.findIndex(item => item.id === draggedItem.id);
            if (fromIndex === -1) return false;

            let newProjectId: string | null = null;
            if (dropNode.data.type === 'project') {
                newProjectId = dropNode.data.id;
            } else if (!dropNode.data.isEntry) {
                newProjectId = dropNode.parent.data.id;
            } else if ('projectId' in dropItemRaw && draggedItem.projectId !== dropItemRaw.projectId) {
                newProjectId = dropItemRaw.projectId;
            }

            if (newProjectId && draggedItem.projectId !== newProjectId) {
                draggedItem.projectId = newProjectId;
                const [item] = list.splice(fromIndex, 1);
                list.unshift(item);
                return true;
            }
            
            if (dropType === 'inner' || !('projectId' in dropItemRaw)) return false;
            
            const toIndex = list.findIndex(item => item.id === dropItemRaw.id);
            if (toIndex === -1) return false;

            const [item] = list.splice(fromIndex, 1);
            const insertIndex = dropType === 'before' ? toIndex : toIndex + 1;
            list.splice(insertIndex, 0, item);
            return true;

        } else { // Dragged item is a Force
            const list = forces.value;
            const fromIndex = list.findIndex(item => item.id === draggedItem.id);
            if (fromIndex === -1) return false;

            let newProjectId: string | null = null;
            if (dropNode.data.type === 'project') {
                newProjectId = dropNode.data.id;
            } else if (!dropNode.data.isEntry) {
                newProjectId = dropNode.parent.data.id;
            } else if ('projectId' in dropItemRaw && draggedItem.projectId !== dropItemRaw.projectId) {
                newProjectId = dropItemRaw.projectId;
            }

            if (newProjectId && draggedItem.projectId !== newProjectId) {
                draggedItem.projectId = newProjectId;
                const [item] = list.splice(fromIndex, 1);
                list.unshift(item);
                return true;
            }

            if (dropType === 'inner' || !('projectId' in dropItemRaw)) return false;

            const toIndex = list.findIndex(item => item.id === dropItemRaw.id);
            if (toIndex === -1) return false;

            const [item] = list.splice(fromIndex, 1);
            const insertIndex = dropType === 'before' ? toIndex : toIndex + 1;
            list.splice(insertIndex, 0, item);
            return true;
        }
    };

    return {
        allowDrag,
        allowDrop,
        handleNodeDrop
    };
}