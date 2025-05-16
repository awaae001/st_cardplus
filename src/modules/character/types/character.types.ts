// src/modules/character/types/character.types.ts
import type { UID, Timestamp, Nullable } from '../../core/types/common.types';

/**
 * @description 角色卡元数据接口
 * 用于存储角色卡的创建者、创建日期等信息
 */
export interface ICharacterMetadata {
  /**
   * @description 角色卡唯一ID (可选，新建时可能没有)
   */
  id?: UID;
  /**
   * @description 角色卡名称
   */
  name: string;
  /**
   * @description 角色卡描述或简介
   */
  description: string;
  /**
   * @description 角色标签/关键词
   */
  tags: string[];
  /**
   * @description 创建时间戳
   */
  createdAt: Timestamp;
  /**
   * @description 最后更新时间戳
   */
  updatedAt: Timestamp;
  /**
   * @description 创作者信息 (可选)
   */
  author?: string;
  /**
   * @description 版本号 (可选)
   */
  version?: string;
  /**
   * @description 角色卡封面图片URL (可选)
   */
  avatarUrl?: string;
}

/**
 * @description 角色基础信息接口
 */
export interface ICharacterBasicInfo {
  /**
   * @description 角色全名
   */
  fullName: string;
  /**
   * @description 角色昵称/别名 (可选)
   */
  nicknames?: string[];
  /**
   * @description 年龄
   */
  age: Nullable<number | string>; // 可以是数字或 "青年", "未知" 等字符串
  /**
   * @description 性别
   */
  gender: Nullable<string>;
  /**
   * @description 身高 (例如 "175cm")
   */
  height?: Nullable<string>;
  /**
   * @description 体重 (例如 "65kg")
   */
  weight?: Nullable<string>;
  /**
   * @description 种族/物种 (例如 "人类", "精灵")
   */
  race?: Nullable<string>;
  /**
   * @description 职业/身份 (例如 "法师", "侦探")
   */
  occupation?: Nullable<string>;
}

/**
 * @description 外貌特征接口
 */
export interface IAppearanceFeatures {
  /**
   * @description 整体外貌描述
   */
  overall: Nullable<string>;
  /**
   * @description 发型与发色
   */
  hair: Nullable<string>;
  /**
   * @description 眼睛颜色与形状
   */
  eyes: Nullable<string>;
  /**
   * @description 肤色与特征
   */
  skin: Nullable<string>;
  /**
   * @description 特殊标记 (如纹身、疤痕)
   */
  markings?: Nullable<string>;
}

/**
 * @description 服饰设定接口
 */
export interface IAttireSettings {
  /**
   * @description 日常服饰描述
   */
  casual: Nullable<string>;
  /**
   * @description 特殊场合服饰 (如战斗装、礼服)
   */
  special?: Nullable<string>;
  /**
   * @description 配饰 (如首饰、眼镜)
   */
  accessories?: Nullable<string>;
}

/**
 * @description 性格特质接口
 */
export interface IPersonalityTraits {
  /**
   * @description 性格核心概述
   */
  summary: Nullable<string>;
  /**
   * @description 积极特质列表 (可选)
   */
  positive?: string[];
  /**
   * @description 消极特质列表 (可选)
   */
  negative?: string[];
  /**
   * @description 心理活动/内在想法描述
   */
  innerThoughts?: Nullable<string>;
  /**
   * @description 角色语录/口头禅
   */
  quotes?: string[];
}

/**
 * @description 喜好、厌恶与日常作息接口
 */
export interface ILikesDislikesRoutine {
  /**
   * @description 喜欢的事物/活动
   */
  likes: Nullable<string>;
  /**
   * @description 厌恶的事物/活动
   */
  dislikes: Nullable<string>;
  /**
   * @description 日常作息/习惯
   */
  routine?: Nullable<string>;
}

/**
 * @description 背景故事接口
 */
export interface IBackgroundStory {
  /**
   * @description 出身与家庭
   */
  origin: Nullable<string>;
  /**
   * @description 重要经历/转折点
   */
  keyEvents: Nullable<string>;
  /**
   * @description 目前的目标与动机
   */
  goalsAndMotivations?: Nullable<string>;
}

/**
 * @description 技能/能力接口
 */
export interface ISkill {
  /**
   * @description 技能名称
   */
  name: string;
  /**
   * @description 技能描述
   */
  description: string;
  /**
   * @description 技能等级/熟练度 (可选)
   */
  level?: string | number;
}

/**
 * @description 角色关系接口
 */
export interface IRelationship {
  /**
   * @description 关系人姓名
   */
  name: string;
  /**
   * @description 与该人的关系类型 (例如 "朋友", "敌人", "亲人")
   */
  type: string;
  /**
   * @description 关系描述
   */
  description: string;
}

/**
 * @description 角色对话示例接口
 */
export interface IDialogueExample {
  /**
   * @description 对话发生的场景或情境
   */
  scenario?: string;
  /**
   * @description 对话内容
   */
  content: string;
}

/**
 * @description 角色卡输出设置接口
 */
export interface ICharacterOutputSettings {
  /**
   * @description 角色在对话开始时的问候语/开场白
   */
  greeting?: Nullable<string>;
  /**
   * @description 备选问候语列表 (可选)
   */
  alternateGreetings?: string[];
  /**
   * @description 角色行为或互动的场景设定 (可选)
   */
  scenario?: Nullable<string>;
  /**
   * @description 角色行为或对话的示例 (可选)
   */
  exampleDialogue?: IDialogueExample[];
  /**
   * @description 其他与角色输出相关的备注或设定
   */
  notes?: Nullable<string>;
}


/**
 * @description 完整的角色卡数据结构
 */
export interface ICharacterCardData {
  /**
   * @description 角色卡元数据
   */
  metadata: ICharacterMetadata;
  /**
   * @description 角色基础信息
   */
  basicInfo: ICharacterBasicInfo;
  /**
   * @description 外貌特征
   */
  appearance: IAppearanceFeatures;
  /**
   * @description 服饰设定
   */
  attire?: Nullable<IAttireSettings>;
  /**
   * @description 性格特质
   */
  personality: IPersonalityTraits;
  /**
   * @description 喜好、厌恶与日常
   */
  preferences?: Nullable<ILikesDislikesRoutine>;
  /**
   * @description 背景故事
   */
  background: IBackgroundStory;
  /**
   * @description 技能列表 (可选)
   */
  skills?: ISkill[];
  /**
   * @description 人际关系列表 (可选)
   */
  relationships?: IRelationship[];
  /**
   * @description 角色卡输出相关设定 (可选)
   */
  outputSettings?: Nullable<ICharacterOutputSettings>;
  /**
   * @description 扩展字段，用于存储不固定结构的数据 (可选)
   */
  customFields?: Record<string, any>;
}
//
// Types for Character Card Editor Form
// These types are specifically designed for the structure of the character card editor form.
//

/**
 * @description 编辑器中使用的外貌详细信息接口
 * @interface IEditorAppearance
 */
export interface IEditorAppearance {
  height: string;
  hairColor: string;
  hairstyle: string;
  eyes: string;
  nose: string;
  lips: string;
  skin: string;
  body: string;
  bust: string;
  waist: string;
  hips: string;
  breasts: string;
  genitals: string;
  anus: string;
  pubes: string;
  thighs: string;
  butt: string;
  feet: string;
  [key: string]: string; // For custom appearance fields
}

/**
 * @description 编辑器中使用的服饰项目接口 (带ID)
 * @interface IEditorAttire
 */
export interface IEditorAttire {
  id: string;
  name: string;
  description: string;
  tops: string;
  bottoms: string;
  shoes: string;
  socks: string;
  underwears: string;
  accessories: string;
}

/**
 * @description 编辑器中使用的性格特质项目接口 (带ID和示例)
 * @interface IEditorTrait
 */
export interface IEditorTrait {
  id: string;
  name: string;
  description: string;
  dialogueExamples: string[];
  behaviorExamples: string[];
}

/**
 * @description 编辑器中使用的关系项目接口 (带ID和详细特征)
 * @interface IEditorRelationship
 */
export interface IEditorRelationship {
  id: string;
  name: string;
  description: string;
  features: string;
  dialogueExamples: string[];
}

/**
 * @description 编辑器中使用的日常作息详细接口
 * @interface IEditorDailyRoutine
 */
export interface IEditorDailyRoutine {
  earlyMorning: string;
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  lateNight: string;
}

/**
 * @description 编辑器中使用的技能项目接口 (带ID和示例)
 * @interface IEditorSkill
 */
export interface IEditorSkill {
  id: string;
  name: string;
  description: string;
  dialogExample: string;
  behaviorExample: string;
}

/**
 * @description 角色卡编辑器表单的完整数据结构接口
 * @interface IEditorCharacterCard
 */
export interface IEditorCharacterCard {
  name?: string;
  chineseName: string;
  japaneseName: string;
  gender: string;
  customGender: string;
  age: number;
  identity: string;
  background: string;
  appearance: IEditorAppearance;
  attires: IEditorAttire[];
  mbti: string;
  traits: IEditorTrait[];
  relationships: IEditorRelationship[];
  likes: string;
  dislikes: string;
  dailyRoutine: IEditorDailyRoutine;
  skills: IEditorSkill[];
}