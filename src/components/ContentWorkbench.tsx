/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Settings, 
  Sparkles, 
  FileText, 
  Globe, 
  Check, 
  Cpu, 
  ArrowRight,
  Clipboard,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Share2,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { KBDocument, AIEmployee, ContentTask, CandidateTopic } from '../types';
import ContentDashboard from './ContentDashboard';

interface ContentWorkbenchProps {
  tasks: ContentTask[];
  docs: KBDocument[];
  employees: AIEmployee[];
  stepDefaults: {
    topicOfficerId: string;
    researchOfficerId: string;
    writerOfficerId: string;
  };
  onSavePresets: (topicId: string, researchId: string, writerId: string) => Promise<void>;
  onCreateTask: (taskData: any) => Promise<void>;
  onRunTaskStep: (taskId: string, step: string, selectedTopic?: string) => Promise<void>;
  onSaveToKB: (taskId: string, platform: string, title?: string) => Promise<void>;
}

export default function ContentWorkbench({
  tasks,
  docs,
  employees,
  stepDefaults,
  onSavePresets,
  onCreateTask,
  onRunTaskStep,
  onSaveToKB
}: ContentWorkbenchProps) {
  // New Task form state
  const [topic, setTopic] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [enableWebSearch, setEnableWebSearch] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<('微信公众号' | '小红书' | '微博' | '抖音')[]>(['微信公众号', '小红书']);
  const [mode, setMode] = useState<'选题' | '直接'>('选题');
  const [topicOfficerId, setTopicOfficerId] = useState(stepDefaults.topicOfficerId);
  const [researchOfficerId, setResearchOfficerId] = useState(stepDefaults.researchOfficerId);
  const [writerOfficerId, setWriterOfficerId] = useState(stepDefaults.writerOfficerId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState<'workbench' | 'dashboard'>('workbench');

  // Workflow presets widget settings toggle
  const [showPresetSettings, setShowPresetSettings] = useState(false);

  // Expanded details/active copy viewer target
  const [viewingTaskCopyId, setViewingTaskCopyId] = useState<string | null>(null);
  const [activePlatformTabs, setActivePlatformTabs] = useState<Record<string, string>>({}); // taskId -> platform tab name

  // Step edits state: chosen candidate headline
  const [editableSelectedTopic, setEditableSelectedTopic] = useState<Record<string, string>>({}); // taskId -> string

  // Loading logs block
  const [stepLoading, setStepLoading] = useState<Record<string, boolean>>({});

  // Reset defaults values sync
  React.useEffect(() => {
    setTopicOfficerId(stepDefaults.topicOfficerId);
    setResearchOfficerId(stepDefaults.researchOfficerId);
    setWriterOfficerId(stepDefaults.writerOfficerId);
  }, [stepDefaults]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsSubmitting(true);
    try {
      const taskData = {
        topic,
        boundEmployees: {
          topicOfficerId,
          researchOfficerId,
          writerOfficerId
        },
        sourceDocIds: selectedDocs,
        enableWebSearch,
        platforms: selectedPlatforms,
        mode
      };
      await onCreateTask(taskData);
      setTopic('');
      setSelectedDocs([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocPillToggle = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(prev => prev.filter(id => id !== docId));
    } else {
      setSelectedDocs(prev => [...prev, docId]);
    }
  };

  const handlePlatformCheckToggle = (platform: '微信公众号' | '小红书' | '微博' | '抖音') => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };

  const handleSavePresetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePresets(topicOfficerId, researchOfficerId, writerOfficerId);
    setShowPresetSettings(false);
  };

  const triggerRunStep = async (taskId: string, step: string, extraArg?: string) => {
    setStepLoading(prev => ({ ...prev, [`${taskId}-${step}`]: true }));
    try {
      await onRunTaskStep(taskId, step, extraArg);
    } finally {
      setStepLoading(prev => ({ ...prev, [`${taskId}-${step}`]: false }));
    }
  };

  // Automated step runners for Direct-Writing tasks
  const runDirectMethodInOneGo = async (task: ContentTask) => {
    const key = `${task.id}-direct`;
    setStepLoading(prev => ({ ...prev, [key]: true }));
    try {
      // Step A: run research directly (skips candidate selection)
      await onRunTaskStep(task.id, 'research', task.topic);
      // Step B: run writer
      await onRunTaskStep(task.id, 'write');
    } finally {
      setStepLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Helper copy to clipboard
  const [copiedTextStatus, setCopiedTextStatus] = useState<Record<string, boolean>>({});
  const handleCopyToClipboard = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextStatus(prev => ({ ...prev, [idKey]: true }));
    setTimeout(() => {
      setCopiedTextStatus(prev => ({ ...prev, [idKey]: false }));
    }, 1500);
  };

  // Archive to knowledge base with local feedback toast
  const [syncKbStatus, setSyncKbStatus] = useState<Record<string, string>>({}); // taskId-platform -> 'synced'

  const handleArchiveBackToKB = async (taskId: string, platform: string, rawText: string) => {
    const key = `${taskId}-${platform}`;
    setSyncKbStatus(prev => ({ ...prev, [key]: 'loading' }));
    try {
      const displayTitle = `《[自沉淀]由主题生成的${platform}文案草稿》`;
      await onSaveToKB(taskId, platform, displayTitle);
      setSyncKbStatus(prev => ({ ...prev, [key]: 'synced' }));
    } catch (err) {
      setSyncKbStatus(prev => ({ ...prev, [key]: 'failed' }));
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans bg-gray-50/10">
      
      {/* Header with Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            内容创作大工作台
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            并行后台任务调度，提供一键直接编译和分岗位选题-研究-写作全精美链路控制
          </p>
        </div>

        {/* Preset settings toggler button */}
        <button
          onClick={() => setShowPresetSettings(!showPresetSettings)}
          className="rounded-xl border border-gray-100 bg-white hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1.5 shrink-0 self-start"
        >
          <Settings className="h-4 w-4 text-emerald-600 animate-spin-pulse" />
          <span>配置步骤默认 AI 员工</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 pb-px gap-6">
        <button
          onClick={() => setActiveWorkbenchTab('workbench')}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
            activeWorkbenchTab === 'workbench'
              ? 'text-emerald-600 font-extrabold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>🛠️ 智能调度生产线</span>
          {activeWorkbenchTab === 'workbench' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveWorkbenchTab('dashboard')}
          className={`pb-3 text-sm font-bold transition-all relative cursor-pointer flex items-center gap-1.5 ${
            activeWorkbenchTab === 'dashboard'
              ? 'text-emerald-600 font-extrabold'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <span>📊 运营效能数据大盘</span>
          <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">Recharts 支持</span>
          {activeWorkbenchTab === 'dashboard' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Preset defaults widget drawer */}
      {showPresetSettings && (
        <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-orange-50 rounded-2xl border border-gray-150 p-6 shadow-md animate-fadeIn">
          <form onSubmit={handleSavePresetsSubmit} className="space-y-4">
            <h4 className="text-xs font-bold text-gray-800 tracking-wider uppercase flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              步骤默认 AI 员工预设 (Universial Default Presets)
            </h4>
            <p className="text-[11px] text-gray-500">
              为内容策划的[选题]、[资料深度求证库编译]以及[多端最终文笔产出]分别配置全局首选AI员工。创建新作品任务时，将全自动绑定以下人设：
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">步骤 1：主导AI 选题官</label>
                <select
                  value={topicOfficerId}
                  onChange={(e) => setTopicOfficerId(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl bg-white px-3 py-2"
                >
                  {employees.filter(e => e.role === '选题官' || e.role === 'custom').map(e => (
                    <option key={e.id} value={e.id}>{e.name} (岗:{e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">步骤 2：主导AI 研究官</label>
                <select
                  value={researchOfficerId}
                  onChange={(e) => setResearchOfficerId(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl bg-white px-3 py-2"
                >
                  {employees.filter(e => e.role === '研究官' || e.role === 'custom').map(e => (
                    <option key={e.id} value={e.id}>{e.name} (岗:{e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">步骤 3：主导AI 写作官</label>
                <select
                  value={writerOfficerId}
                  onChange={(e) => setWriterOfficerId(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl bg-white px-3 py-2"
                >
                  {employees.filter(e => e.role === '写作官' || e.role === 'custom').map(e => (
                    <option key={e.id} value={e.id}>{e.name} (岗:{e.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                保存为全局预置
              </button>
              <button
                type="button"
                onClick={() => setShowPresetSettings(false)}
                className="border hover:bg-gray-100/50 px-4 py-2 rounded-xl text-xs text-gray-500"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {activeWorkbenchTab === 'dashboard' ? (
        <ContentDashboard tasks={tasks} employees={employees} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Aspect: Ingestion Form */}
        <div className="xl:col-span-1 space-y-8">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              新建大型内容策划任务
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">核心策划创作主题</label>
                <textarea
                  placeholder="在此输入本次爆款企划的主题大纲或命题思路..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-xl px-4 py-3 h-16 focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Related/Linked KB Docs */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase flex justify-between">
                  <span>关联知识库参考素材 ({selectedDocs.length})</span>
                  <span className="text-[10px] text-gray-300">可选多篇</span>
                </label>
                
                <div className="border border-gray-50 rounded-xl p-2.5 bg-gray-50/50 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                  {docs.length === 0 ? (
                    <p className="text-[10px] text-gray-400 text-center w-full py-2">知识库仍是空状态呵</p>
                  ) : (
                    docs.map((doc) => {
                      const isSelected = selectedDocs.includes(doc.id);
                      return (
                        <button
                          type="button"
                          key={doc.id}
                          onClick={() => handleDocPillToggle(doc.id)}
                          className={`text-[9px] font-medium border px-2.5 py-1.2 rounded-full transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                              : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {doc.title.substring(0, 15)}...
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Toggle Web Search Crawler Supplement */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h5 className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <Globe className="h-3 w-3 text-emerald-600" />
                    联网爬虫背景补充增强 (Web Crawl)
                  </h5>
                  <p className="text-[9px] text-gray-400 leading-normal mt-0.5">
                    启动后，AI选题及研究官将联网嗅探行业最新动态、防止产出冷饭内容。
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Publishing target platforms checkboxes */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">分发适配新媒体平台 (多选)</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['微信公众号', '小红书', '微博', '抖音'] as const).map((platform) => {
                    const isChecked = selectedPlatforms.includes(platform);
                    return (
                      <button
                        type="button"
                        key={platform}
                        onClick={() => handlePlatformCheckToggle(platform)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-inner'
                            : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 bg-white'
                        }`}>
                          {isChecked && <Check className="h-3 w-3" />}
                        </span>
                        <span>{platform}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode switch */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">策划执行模式 (模式切换)</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('选题')}
                    className={`rounded-lg py-1.5 text-xs font-bold text-center transition-all cursor-pointer ${
                      mode === '选题' 
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    选题创作模式
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('直接')}
                    className={`rounded-lg py-1.5 text-xs font-bold text-center transition-all cursor-pointer ${
                      mode === '直接' 
                        ? 'bg-white text-gray-800 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    直接创作模式
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 leading-normal mt-1.5">
                  {mode === '选题' 
                    ? '💡 AI选题官率先头脑风暴，确定最亮眼大纲，适合深度高阶策划。' 
                    : '⚡ 跳过策划大纲头脑风暴，一键将主题直接编译编写出四大平台文稿草稿。'}
                </p>
              </div>

              {/* Selected Officer indicators */}
              <div className="pt-3 border-t text-[10px] text-gray-400 flex flex-col gap-1">
                <span><b>步骤① 选题担当:</b> {employees.find(e => e.id === topicOfficerId)?.name || '未配置'}</span>
                <span><b>步骤② 研究担当:</b> {employees.find(e => e.id === researchOfficerId)?.name || '未配置'}</span>
                <span><b>步骤③ 写作端特质:</b> {employees.find(e => e.id === writerOfficerId)?.name || '未配置'}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold py-3 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    <span>正进行后台多级调度注入...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>启动本次并行创作任务</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Aspect: Task Workflow Run panels */}
        <div className="xl:col-span-2 space-y-8">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-5 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
              并行的后台多任务流产线 ({tasks.length})
            </h3>

            {tasks.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <FileText className="h-12 w-12 mx-auto grayscale opacity-30 mb-2" />
                <p className="text-sm">暂无运行中的后台任务。</p>
                <p className="text-xs text-gray-305 mt-1">请在左侧配置需求并一键启动创作！</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tasks.map((task) => {
                  const activeTab = activePlatformTabs[task.id] || (task.platforms && task.platforms[0]) || '';
                  const generatedCopyText = (task.finalDrafts && task.finalDrafts[activeTab]) || '';
                  
                  // Progress status flags mappings
                  const statusColors: Record<string, string> = {
                    pending: 'bg-gray-100 text-gray-500 border-gray-200',
                    topics_generating: 'bg-emerald-50 text-emerald-700 border-emerald-205 animate-pulse',
                    topics_generated: 'bg-amber-50 text-amber-800 border-amber-205',
                    researching: 'bg-indigo-50 text-indigo-700 border-indigo-250 animate-pulse',
                    writing: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
                    completed: 'bg-emerald-100 text-emerald-950 border-emerald-200 font-bold',
                    failed: 'bg-red-50 text-red-700 border-red-200'
                  };

                  const statusLabels: Record<string, string> = {
                    pending: '等待就绪',
                    topics_generating: '选题头脑风暴中',
                    topics_generated: '选题已就绪(待选)',
                    researching: '深度 facts 调查中',
                    writing: '最终成品多端精修中',
                    completed: '✔️ 全链路完稿',
                    failed: '❌ 后端引擎中断'
                  };

                  return (
                    <div key={task.id} className="p-5 rounded-2xl border border-gray-100 bg-white/70 shadow-sm space-y-4 hover:border-gray-200 transition-colors">
                      {/* Title row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900 leading-snug flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
                            {task.topic}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono">创建时间: {task.createTime} | ID: {task.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-gray-50 text-gray-500 border px-2 py-0.5 rounded font-bold shrink-0">{task.mode}模式</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded border ${statusColors[task.status] || ''} shrink-0`}>
                            {statusLabels[task.status] || task.status}
                          </span>
                        </div>
                      </div>

                      {/* Log monitor stream block */}
                      <div className="rounded-xl border bg-slate-900 px-3.5 py-2.5 font-mono text-[10px] text-emerald-300 h-16 overflow-y-auto space-y-1 block leading-relaxed selection:bg-indigo-900">
                        {task.logs.slice(-3).map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>

                      {/* WORKFLOW CONTROLS BASED ON STATES */}

                      {/* Scenario A: Pending State (Waiting to run brainstorm) */}
                      {(task.status === 'pending') && (
                        <div className="bg-slate-50 border p-3 rounded-xl flex items-center justify-between gap-4">
                          <div className="text-[11px] text-gray-400 leading-normal">
                            策案已载入。您可以通过右侧启动 AI 选题官对该选题进行深度多方向扩散！
                          </div>
                          
                          {task.mode === '选题' ? (
                            <button
                              onClick={() => triggerRunStep(task.id, 'brainstorm')}
                              disabled={stepLoading[`${task.id}-brainstorm`]}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {stepLoading[`${task.id}-brainstorm`] ? <Cpu className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              <span>启动 AI 选题官 ➜</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => runDirectMethodInOneGo(task)}
                              disabled={stepLoading[`${task.id}-direct`]}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              {stepLoading[`${task.id}-direct`] ? <Cpu className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                              <span>一键全自动直接创作 ➜</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Scenario B: Topics generated and awaiting selection */}
                      {task.status === 'topics_generated' && task.candidates && (
                        <div className="space-y-3.5">
                          <p className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-bounce" />
                            AI 选题官 扩散候选大纲目录（请选定一个方案流转至AI研究官）：
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {task.candidates.map((cand, idx) => {
                              const isSelected = editableSelectedTopic[task.id] === cand.title;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setEditableSelectedTopic(prev => ({ ...prev, [task.id]: cand.title }))}
                                  className={`rounded-xl border p-4 text-left cursor-pointer transition-all relative ${
                                    isSelected 
                                      ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-600'
                                      : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/50'
                                  }`}
                                >
                                  <span className="text-[10px] text-gray-400 font-bold block mb-1">策划方案 {idx+1}</span>
                                  <h5 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{cand.title}</h5>
                                  <p className="text-[10px] text-gray-550 leading-normal mt-2 italic">{cand.explanation}</p>
                                  {isSelected && (
                                    <span className="absolute top-3 right-3 text-indigo-600 text-xs font-bold">✔️</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Editable headline selector and trigger */}
                          {editableSelectedTopic[task.id] && (
                            <div className="p-3.5 rounded-xl border border-indigo-150 bg-indigo-50/10 flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
                              <div className="flex-1 w-full min-w-0">
                                <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">选定方案标题（支持自定义微调）：</label>
                                <input
                                  type="text"
                                  value={editableSelectedTopic[task.id]}
                                  onChange={(e) => setEditableSelectedTopic(prev => ({ ...prev, [task.id]: e.target.value }))}
                                  className="w-full text-xs font-bold bg-white border border-indigo-200 rounded-lg px-2.5 py-1 text-gray-700"
                                />
                              </div>

                              <button
                                onClick={() => triggerRunStep(task.id, 'research', editableSelectedTopic[task.id])}
                                disabled={stepLoading[`${task.id}-research`]}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer shrink-0 self-end md:self-center"
                              >
                                {stepLoading[`${task.id}-research`] ? <Cpu className="h-3 w-3 animate-spin animate-spin-pulse" /> : <ChevronRight className="h-4 w-4" />}
                                <span>锁定方案・呼叫AI研究官 ➜</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Scenario C: Research report generating / compiled awaiting writing drafting */}
                      {task.status === 'writing' && task.researchReport && (
                        <div className="space-y-3 p-3.5 rounded-xl border border-purple-100 bg-purple-50/5 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-purple-600 flex items-center gap-1">
                              <Info className="h-3.5 w-3.5" />
                              由「AI研究官」为您深度编译 Facts 立论大纲：
                            </span>
                            
                            <button
                              onClick={() => triggerRunStep(task.id, 'write')}
                              disabled={stepLoading[`${task.id}-write`]}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                            >
                              {stepLoading[`${task.id}-write`] ? <Cpu className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 animate-scaleOpen" />}
                              <span>启动AI写作官・一键多端精编 ➜</span>
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-gray-550 truncate font-mono italic">
                            {task.researchReport.substring(0, 200)}...
                          </div>
                        </div>
                      )}

                      {/* Scenario D: Complete state - Display output COPY dashboard! */}
                      {task.status === 'completed' && task.finalDrafts && (
                        <div className="space-y-4 border-t pt-4 animate-fadeIn">
                          {/* Platforms selector mini-tabs */}
                          <div className="flex flex-wrap items-center gap-1.5 border-b pb-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0 mr-1.5">分发平台切换:</span>
                            {task.platforms.map((plat) => {
                              const isTabActive = activeTab === plat;
                              return (
                                <button
                                  key={plat}
                                  onClick={() => setActivePlatformTabs(prev => ({ ...prev, [task.id]: plat }))}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                                    isTabActive 
                                      ? 'bg-emerald-600 border-emerald-650 text-white shadow-sm'
                                      : 'bg-white border-gray-100 text-gray-500 hover:text-gray-700'
                                  }`}
                                >
                                  {plat}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected document/copy content view */}
                          {activeTab ? (
                            <div className="space-y-3.5">
                              <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-500 font-mono">
                                  字符数: {generatedCopyText.length} 字符
                                </span>

                                <div className="flex items-center gap-2">
                                  {/* Copy Button */}
                                  <button
                                    onClick={() => handleCopyToClipboard(generatedCopyText, `${task.id}-${activeTab}`)}
                                    className="text-[10px] font-bold text-gray-600 hover:text-gray-900 bg-white border rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-xs transition-transform transform active:scale-95"
                                  >
                                    <Clipboard className="h-3.5 w-3.5" />
                                    <span>{copiedTextStatus[`${task.id}-${activeTab}`] ? '已复制 ✔️' : '复制文案'}</span>
                                  </button>

                                  {/* Sync Back to KB database */}
                                  <button
                                    onClick={() => handleArchiveBackToKB(task.id, activeTab, generatedCopyText)}
                                    disabled={syncKbStatus[`${task.id}-${activeTab}`] === 'synced' || syncKbStatus[`${task.id}-${activeTab}`] === 'loading'}
                                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1 shadow-xs transition-colors"
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                    <span>
                                      {syncKbStatus[`${task.id}-${activeTab}`] === 'synced' 
                                        ? '已沉淀至本地库 ✔️' 
                                        : syncKbStatus[`${task.id}-${activeTab}`] === 'loading'
                                          ? '同步入库中...'
                                          : '一键自动沉淀系统'}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Formatted copy markdown draft render container */}
                              <div className="border border-gray-100 rounded-xl p-4 max-h-72 overflow-y-auto bg-gray-50/50 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap selection:bg-emerald-100">
                                {generatedCopyText}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">请在上方切换平台查看生成的最终效果文案哈。</p>
                          )}
                        </div>
                      )}

                      {/* Display task failures */}
                      {task.status === 'failed' && (
                        <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>Gemini生产流发生通信中断，可尝试回到“工作台首页”一键刷新并重试该步骤操作。</span>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
      )}

    </div>
  );
}
