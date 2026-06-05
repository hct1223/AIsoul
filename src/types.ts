/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KBDocument {
  id: string;
  title: string;
  content: string;
  type: 'doc' | 'url' | 'crawler' | 'business';
  category: string; // 智能分类：例如 '市场分析', '教程文档', '运营方案', '日常记录', '企业规章'
  size: string; // 如 '12 KB'
  tags: string[];
  createTime: string;
  subKbId?: string; // 子知识库归属 ID
  crawlerId?: string; // 关联的爬虫任务 ID
}

export interface SubKnowledgeBase {
  id: string;
  name: string;
  description: string;
  createTime: string;
}

export interface SoulFragment {
  id: string;
  name: string;
  description: string;
  sourceDocId: string;
  sourceDocTitle: string;
  traits: string[]; // 特质，例如 ["温和幽默", "专业严谨", "数据敏感"]
  voiceStyle: string; // 写作风格，如 "深度科普, 亲近口语"
  toneDescription: string;
  createTime: string;
}

export interface Soul {
  id: string;
  name: string;
  description: string;
  fragmentIds: string[];
  combinedTraits: string[];
  creativeStyle: string; // 合成风格
  toneDescription: string;
  createTime: string;
}

export interface AIEmployee {
  id: string;
  name: string;
  avatar: string; // emoji or design icon or local image URL
  role: '选题官' | '研究官' | '写作官' | 'custom';
  soulId: string | null; // 绑定的灵魂 ID
  bio: string;
  tags: string[];
  speed: number; // 效率 (1-100)
  creativity: number; // 创意 (1-100)
  reasoning: number; // 逻辑/严谨度 (1-100)
  isDefault?: boolean;
}

export interface CandidateTopic {
  title: string;
  explanation: string;
}

export interface ContentTask {
  id: string;
  topic: string;
  boundEmployees: {
    topicOfficerId?: string;
    researchOfficerId?: string;
    writerOfficerId?: string;
  };
  sourceDocIds: string[];
  enableWebSearch: boolean;
  platforms: ('微信公众号' | '小红书' | '微博' | '抖音')[];
  mode: '选题' | '直接';
  status: 'pending' | 'topics_generating' | 'topics_generated' | 'researching' | 'writing' | 'completed' | 'failed';
  currentStep: 'idle' | 'topic_brainstorm' | 'topic_select' | 'research' | 'write' | 'done';
  selectedTopic?: string;
  candidates?: CandidateTopic[];
  researchReport?: string;
  finalDrafts?: Record<string, string>; // platform key -> content markdown
  logs: string[];
  createTime: string;
}

export interface CrawlerTask {
  id: string;
  name: string;
  platform: '小红书' | '微信公众号' | '企业官网' | '其他';
  link: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  logs: string[];
  scrapedDocsCount: number;
  syncStatus: 'synced' | 'pending';
  createTime: string;
}

export interface BusinessConnection {
  id: string;
  systemName: string;
  systemType: 'ERP' | 'CRM' | 'CMS' | 'HELP_CENTER';
  syncCount: number;
  autoSync: boolean;
  lastSyncTime?: string;
  status: 'connected' | 'disconnected';
}

export interface BusinessFeed {
  id: string;
  title: string;
  source: string;
  category: string;
  content: string;
  date: string;
  syncToKbStatus: 'synced' | 'unsynced';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface RefinementTask {
  id: string;
  soulName: string;
  soulDescription: string;
  mode: 'docs' | 'subkb';
  sourcesCount: number;
  status: 'pending' | 'synthesizing' | 'completed' | 'failed';
  progress: number;
  createTime: string;
  completedTime?: string;
  logMessages: string[];
}

