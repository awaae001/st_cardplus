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
}
interface AppSettingsHandlers {
  onBetaFeaturesToggle: (value: boolean) => void;
  onUseOldWorldEditorToggle: (value: boolean) => void;
  onUmamiToggle: (value: boolean) => void;
  onAutoSaveIntervalChange: (value: number | undefined) => void;
}

export const getAppSettings = (models: AppSettingsModels, handlers: AppSettingsHandlers): SettingOption[] => {
  return [
    {
      id: 'betaFeaturesEnabled',
      label: '显示测试版功能',
      icon: 'material-symbols:experiment-outline',
      iconColor: 'var(--el-color-warning)',
      description: '开启后将在侧边栏显示测试版功能，包括 EJS 模板编辑器和世界书功能 ',
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
      id: 'useOldCharCardEditor',
      label: '使用旧版本角色信息编辑页面（已移除）',
      icon: 'material-symbols:block',
      iconColor: 'var(--el-color-danger)',
      description: '🚫 此功能已被完全移除。新版编辑器提供了更强大的功能和更好的用户体验。',
      type: 'switch',
      model: models.useOldSidebar,
      handler: () => { },
      disabled: true,
    },
    {
      id: 'useOldSidebar',
      label: '使用旧版本侧边栏特性（已移除）',
      icon: 'material-symbols:block',
      iconColor: 'var(--el-color-danger)',
      description: '🚫 此功能已被完全移除。旧版侧边栏已被新版侧边栏管理系统替代。新版本支持自定义侧边栏顺序、显示/隐藏项目等高级功能。请前往"个性化"页面体验全新的侧边栏管理功能。',
      type: 'switch',
      model: models.useOldSidebar,
      handler: () => { }, // 空处理器，功能已被移除
      disabled: true,
    }
  ];
};