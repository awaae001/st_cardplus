import { ref } from 'vue';
import { DEFAULT_SYNC_ACTION, SYNC_PROGRESS_RESET_DELAY_MS } from './constants';
import type { SyncAction } from '@/types/dataSync';

export function useSyncProgress() {
  const active = ref(false);
  const text = ref('');
  const action = ref<SyncAction | null>(DEFAULT_SYNC_ACTION);

  const start = (nextAction: SyncAction, nextText: string) => {
    active.value = true;
    action.value = nextAction;
    text.value = nextText;
  };

  const update = (nextText?: string) => {
    if (nextText) text.value = nextText;
  };

  const reset = (nextText?: string) => {
    if (nextText) text.value = nextText;
    setTimeout(() => {
      active.value = false;
      text.value = '';
      action.value = DEFAULT_SYNC_ACTION;
    }, SYNC_PROGRESS_RESET_DELAY_MS);
  };

  return {
    active,
    text,
    action,
    start,
    update,
    finish: reset,
    fail: reset,
  };
}
