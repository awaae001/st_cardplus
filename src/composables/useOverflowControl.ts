import { ref, provide, inject, readonly } from 'vue';

const OVERFLOW_CONTROL_KEY = Symbol('overflow-control');

const isOverflowHidden = ref(false);

export function provideOverflowControl() {
  const setOverflowHidden = (value: boolean) => {
    isOverflowHidden.value = value;
  };

  provide(OVERFLOW_CONTROL_KEY, {
    isOverflowHidden: readonly(isOverflowHidden),
    setOverflowHidden,
  });

  return {
    isOverflowHidden,
    setOverflowHidden,
  };
}

export function useOverflowControl() {
  const control = inject<{ isOverflowHidden: Readonly<typeof isOverflowHidden>, setOverflowHidden: (value: boolean) => void }>(OVERFLOW_CONTROL_KEY);
  if (!control) {
    throw new Error('useOverflowControl() must be used after provideOverflowControl()');
  }
  return control;
}