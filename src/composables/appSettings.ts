import type { Ref } from 'vue';

interface BaseSetting {
  id: string;
  label: string;
  icon: string;
  iconColor: string;
  description: string;
}

interface SwitchSetting extends BaseSetting {
  type: 'switch';
  model: Ref<boolean>;
  handler: (value: boolean) => void;
  disabled?: boolean;
}

interface NumberInputSetting extends BaseSetting {
  type: 'numberInput';
  model: Ref<number>;
  handler: (value: number | undefined) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export type SettingOption = SwitchSetting | NumberInputSetting;

interface AppSettingsModels {
  betaFeaturesEnabled: Ref<boolean>;
  useOldSidebar: Ref<boolean>;
  useOldWorldEditor: Ref<boolean>;
  umamiEnabled: Ref<boolean>;
  autoSaveInterval: Ref<number>;
  autoSaveDebounce: Ref<number>;
}
interface AppSettingsHandlers {
  onBetaFeaturesToggle: (value: boolean) => void;
  onUseOldWorldEditorToggle: (value: boolean) => void;
  onUmamiToggle: (value: boolean) => void;
  onAutoSaveIntervalChange: (value: number | undefined) => void;
  onAutoSaveDebounceChange: (value: number | undefined) => void;
}

export const getAppSettings = (models: AppSettingsModels, handlers: AppSettingsHandlers): SettingOption[] => {
  return [
    {
      id: 'betaFeaturesEnabled',
      label: '显示测试版功能',
      icon: 'material-symbols:experiment-outline',
      iconColor: 'var(--el-color-warning)',
      description: '开启后将在导航栏显示测试版功能，包括 EJS 模板编辑器和世界书功能 ',
      type: 'switch',
      model: models.betaFeaturesEnabled,
      handler: handlers.onBetaFeaturesToggle,
    },
    {
      id: 'useOldWorldEditor',
      label: '使用旧版本地标编辑器',
      icon: 'gis:globe-users',
      iconColor: 'var(--el-color-primary)',
      description: '开启后将使用旧版本的地标编辑器，它将缺乏维护，并且功能落后 ',
      type: 'switch',
      model: models.useOldWorldEditor,
      handler: handlers.onUseOldWorldEditorToggle,
    },
    {
      id: 'umamiEnabled',
      label: 'umami匿名遥测',
      icon: 'material-symbols:analytics-outline',
      iconColor: 'var(--el-color-info)',
      description: '开启后将收集匿名使用数据以帮助改进应用，不会收集任何个人信息或角色卡内容 ',
      type: 'switch',
      model: models.umamiEnabled,
      handler: handlers.onUmamiToggle,
    },
    {
      id: 'autoSaveInterval',
      label: '自动保存间隔',
      icon: 'material-symbols:save-outline',
      iconColor: 'var(--el-color-success)',
      description: '设置编辑器中内容的自动保存间隔，范围：1-60秒 ',
      type: 'numberInput',
      model: models.autoSaveInterval,
      handler: handlers.onAutoSaveIntervalChange,
      min: 1,
      max: 60,
      step: 1,
      unit: '秒',
    },
    {
      id: 'autoSaveDebounce',
      label: '自动保存防抖',
      icon: 'material-symbols:hourglass-top-outline',
      iconColor: 'var(--el-color-warning)',
      description: '监听模式下的防抖时间，范围：0.1-10秒 ',
      type: 'numberInput',
      model: models.autoSaveDebounce,
      handler: handlers.onAutoSaveDebounceChange,
      min: 0.1,
      max: 10,
      step: 0.1,
      unit: '秒',
    },
  ];
};
