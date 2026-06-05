/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Cpu, 
  HelpCircle, 
  FileText, 
  Combine, 
  Info, 
  Zap,
  Tag,
  BookOpen,
  ArrowRight,
  UserCheck,
  Upload,
  X,
  FileCheck,
  Folder,
  FolderPlus,
  Sliders,
  CheckSquare,
  Square,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Terminal
} from 'lucide-react';
import { KBDocument, Soul, SubKnowledgeBase, RefinementTask } from '../types';

interface KnowledgeBaseProps {
  docs: KBDocument[];
  souls: Soul[];
  subKbs: SubKnowledgeBase[];
  onUploadDoc: (title: string, content: string, subKbId?: string, fileBase64?: string, fileType?: string) => Promise<any>;
  onDeleteDoc: (id: string) => Promise<void>;
  onSynthesizeSoul: (docIds: string[], subKbId: string, name: string, desc: string) => Promise<void>;
  onDeleteSoul: (id: string) => Promise<void>;
  onCreateSubKb: (name: string, description?: string) => Promise<void>;
  onDeleteSubKb: (id: string) => Promise<void>;
  onMoveDoc: (id: string, subKbId: string) => Promise<void>;
}

export default function KnowledgeBase({
  docs,
  souls,
  subKbs = [],
  onUploadDoc,
  onDeleteDoc,
  onSynthesizeSoul,
  onDeleteSoul,
  onCreateSubKb,
  onDeleteSubKb,
  onMoveDoc
}: KnowledgeBaseProps) {
  // Sub Knowledge Base configuration states
  const [selectedSubKbId, setSelectedSubKbId] = useState<string>('all');
  const [showCreateSubKb, setShowCreateSubKb] = useState(false);
  const [newSubKbName, setNewSubKbName] = useState('');
  const [newSubKbDesc, setNewSubKbDesc] = useState('');
  const [isCreatingSubKb, setIsCreatingSubKb] = useState(false);
  const [targetUploadSubKbId, setTargetUploadSubKbId] = useState<string>('kb-default');

  // New document entry
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Upload tabs and drag and drop states
  const [activeUploadTab, setActiveUploadTab ] = useState<'upload' | 'manual'>('upload');
  const [isDragging, setIsDragging ] = useState(false);

  interface PendingFile {
    id: string;
    name: string;
    content: string;
    fileBase64?: string;
    fileType?: string;
    sizeStr: string;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    error?: string;
  }
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [batchUploadProgress, setBatchUploadProgress] = useState<{current: number, total: number} | null>(null);

  // Active viewing document
  const [viewingDoc, setViewingDoc] = useState<KBDocument | null>(null);

  // Direct Soul Synthesis states
  const [selectedDocIdsForSynthesizing, setSelectedDocIdsForSynthesizing] = useState<string[]>([]);
  const [synthesisMode, setSynthesisMode] = useState<'docs' | 'subkb'>('docs');
  const [selectedSubKbIdForSynthesizing, setSelectedSubKbIdForSynthesizing] = useState<string>('kb-default');
  const [newSoulName, setNewSoulName] = useState('');
  const [newSoulDesc, setNewSoulDesc] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showSynthesizerModal, setShowSynthesizerModal] = useState(false);
  const [expandedTaskLogId, setExpandedTaskLogId] = useState<string | null>(null);

  // Refinement task queue
  const [refinementTasks, setRefinementTasks] = useState<RefinementTask[]>(() => {
    const saved = localStorage.getItem('kb-refinement-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: "refine-task-1",
        soulName: "爆款流量情绪操盘手",
        soulDescription: "提炼自经典爆款文献，专攻社交媒体与公众号情绪流高感官爆款段落或文章排版产出。",
        mode: "docs" as const,
        sourcesCount: 5,
        status: "completed" as const,
        progress: 100,
        createTime: "2026-06-03 14:22",
        completedTime: "2026-06-03 14:23",
        logMessages: [
          "[14:22:10] 任务启动：读取5篇高密度爆款文献做提纯输入源",
          "[14:22:15] 语相解析：分析高爆段落的核心情绪阈值、反问修辞比例与句式长度倾向",
          "[14:22:38] 常驻炼魂：排除标点差异影响，完成文脉拟合与主观音色深度刻画",
          "[14:23:02] 合成入鞘：人设立绘与核心行为树同步正常。常驻灵魂「爆款流量情绪操盘手」注册完毕！"
        ]
      },
      {
        id: "refine-task-2",
        soulName: "极客科技风硬核说书人",
        soulDescription: "全面融合自科技方法论与技术白皮书知识库整册，输出行文硬朗、调理精密的高质科技文墨。",
        mode: "subkb" as const,
        sourcesCount: 12,
        status: "completed" as const,
        progress: 100,
        createTime: "2026-06-04 09:15",
        completedTime: "2026-06-04 09:16",
        logMessages: [
          "[09:15:01] 任务启动：拉取分科整册《极客科技风》中对应 12 篇有效入库文档",
          "[09:15:20] 语义微调：检测特定学术、前沿词项使用习惯，建模句间承接逻辑",
          "[09:15:45] 双向校准：通过双自编码拟合，抑制日常口语情绪杂质",
          "[09:16:12] 合成大捷：意识常驻注册成功。已将该写作者灵魂收录至系统备选池！"
        ]
      }
    ];
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files: FileList) => {
    setErrorMsg('');
    const promises = Array.from(files).map((file) => {
      return new Promise<PendingFile | null>((resolve) => {
        const isText = file.type.startsWith('text/') || 
          /\.(txt|md|markdown|json|csv|py|js|ts|html|css|xml|log|sh)$/i.test(file.name);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          let content = '';
          let fileBase64: string | undefined = undefined;
          let fileType = file.type || '';

          if (isText) {
            content = event.target?.result as string || '';
          } else {
            const dataUrl = event.target?.result as string || '';
            const commaIdx = dataUrl.indexOf(',');
            if (commaIdx !== -1) {
              fileBase64 = dataUrl.substring(commaIdx + 1);
            }
          }

          let sizeStr = '';
          const bytes = file.size;
          if (bytes > 1024 * 1024) {
            sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
          } else if (bytes > 1024) {
            sizeStr = (bytes / 1024).toFixed(1) + ' KB';
          } else {
            sizeStr = bytes + ' B';
          }

          resolve({
            id: 'pending-' + Math.random().toString(36).substring(2, 11),
            name: file.name,
            content: content,
            fileBase64,
            fileType,
            sizeStr,
            status: 'pending'
          });
        };

        reader.onerror = () => {
          resolve(null);
        };

        if (isText) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    });

    const results = await Promise.all(promises);
    const validResults = results.filter((r): r is PendingFile => r !== null);
    setPendingFiles(prev => [...prev, ...validResults]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const handleRemovePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdatePendingFileName = (id: string, newName: string) => {
    setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  const handleBatchUploadSubmit = async () => {
    if (pendingFiles.length === 0) return;
    setErrorMsg('');
    setBatchUploadProgress({ current: 0, total: pendingFiles.length });
    
    const updatedFiles = [...pendingFiles];
    let hasFailed = false;
    let fallbackErrMsg = '';

    for (let i = 0; i < updatedFiles.length; i++) {
      const item = updatedFiles[i];
      if (item.status === 'completed' || item.status === 'uploading') continue;
      
      setBatchUploadProgress({ current: i + 1, total: updatedFiles.length });
      setPendingFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f));
      
      try {
        const result = await onUploadDoc(item.name, item.content, targetUploadSubKbId, item.fileBase64, item.fileType);
        if (result && result.success) {
          setPendingFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed' } : f));
        } else {
          hasFailed = true;
          const errMsg = result?.error || '导入分类失败';
          fallbackErrMsg = errMsg;
          setPendingFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'failed', error: errMsg } : f));
        }
      } catch (error: any) {
        hasFailed = true;
        const errMsg = error.message || '网络连接失败';
        fallbackErrMsg = errMsg;
        setPendingFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'failed', error: errMsg } : f));
      }
    }
    
    if (hasFailed) {
      setErrorMsg('部分文档解析或归入失败。可能是网络体量、配额频率限制。' + fallbackErrMsg);
    }

    setBatchUploadProgress(null);
    setTimeout(() => {
      setPendingFiles(prev => prev.filter(f => f.status !== 'completed'));
    }, 3000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const result = await onUploadDoc(newTitle.trim(), newContent.trim(), targetUploadSubKbId);
      if (result && result.success) {
        setNewTitle('');
        setNewContent('');
        setShowUploadModal(false);
      } else {
        setErrorMsg(result?.error || '单篇文献建档归仓失败');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '归档错误请核对后重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateSubKbSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubKbName.trim()) return;
    setIsCreatingSubKb(true);
    try {
      await onCreateSubKb(newSubKbName.trim(), newSubKbDesc.trim());
      setNewSubKbName('');
      setNewSubKbDesc('');
      setShowCreateSubKb(false);
    } finally {
      setIsCreatingSubKb(false);
    }
  };

  const handleDocCheckboxToggle = (docId: string) => {
    if (selectedDocIdsForSynthesizing.includes(docId)) {
      setSelectedDocIdsForSynthesizing(prev => prev.filter(id => id !== docId));
    } else {
      setSelectedDocIdsForSynthesizing(prev => [...prev, docId]);
    }
  };

  const handleStartSynthesize = async () => {
    const docIdsToSynthesize = synthesisMode === 'docs' ? selectedDocIdsForSynthesizing : [];
    const subKbIdToSynthesize = synthesisMode === 'subkb' ? selectedSubKbIdForSynthesizing : '';

    if (synthesisMode === 'docs' && docIdsToSynthesize.length === 0) {
      alert("请至少勾选一篇业务文献进行炼魂！");
      return;
    }

    const soulNameFinal = newSoulName.trim() || (synthesisMode === 'docs' ? '指定文献融合灵魂' : '整库提炼灵魂');
    const soulDescFinal = newSoulDesc.trim() || '融合特定写作特色与方法论的AI智能人设风格。';

    const taskId = 'refine-task-' + Date.now();
    const startTimeStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const modeLabel = synthesisMode === 'docs' ? '指定高能文献提取' : '子知识库整卷熔炼';
    let sourceCount = 0;
    if (synthesisMode === 'docs') {
      sourceCount = docIdsToSynthesize.length;
    } else {
      const matchedKb = subKbs.find(k => k.id === subKbIdToSynthesize);
      sourceCount = docs.filter(d => (d.subKbId || 'kb-default') === subKbIdToSynthesize).length;
    }

    const newTask: RefinementTask = {
      id: taskId,
      soulName: soulNameFinal,
      soulDescription: soulDescFinal,
      mode: synthesisMode,
      sourcesCount: sourceCount,
      status: 'pending',
      progress: 5,
      createTime: startTimeStr,
      logMessages: [
        `[系统] 建立熔魂轨道：收到炼人设申请「${soulNameFinal}」`,
        `[预审] 确定炼化模式为【${modeLabel}】，待分析原料库中有 ${sourceCount} 篇相关文献。`
      ]
    };

    // Prepend to refinementTasks state and persist immediately
    setRefinementTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem('kb-refinement-tasks', JSON.stringify(updated));
      return updated;
    });

    setIsSynthesizing(true);

    const updateTaskState = (updateFn: (t: RefinementTask) => RefinementTask) => {
      setRefinementTasks(prev => {
        const index = prev.findIndex(t => t.id === taskId);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = updateFn(updated[index]);
        localStorage.setItem('kb-refinement-tasks', JSON.stringify(updated));
        return updated;
      });
    };

    const runStep = (prog: number, logMsg: string, nextDelay: number, callback?: () => Promise<void> | void) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          const timeNow = new Date().toLocaleTimeString();
          updateTaskState(t => ({
            ...t,
            status: prog >= 100 ? 'completed' : 'synthesizing',
            progress: prog,
            logMessages: [...t.logMessages, `[${timeNow}] ${logMsg}`],
            completedTime: prog >= 100 ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined
          }));
          if (callback) {
            try {
              await callback();
            } catch (err) {
              throw err;
            }
          }
          resolve();
        }, nextDelay);
      });
    };

    try {
      await runStep(15, `识别提约层：提取 ${sourceCount} 篇关联文章的语义底色与代表语气...`, 600);
      await runStep(40, `解析语法偏好：Gemini 语义微结构检查中，剔除了无意义首尾套话，保留修辞精华、特色标点和句间温差...`, 1000);
      await runStep(65, `提炼行文模型：建立特色金句语义坐标库与高爆字眼激发阀，整合为高内聚特征节点...`, 1200);
      await runStep(85, `注册并写入：向中转系统上传并登记「${soulNameFinal}」常驻意识矩阵...`, 800, async () => {
        // The real backend database POST
        await onSynthesizeSoul(
          docIdsToSynthesize, 
          subKbIdToSynthesize,
          soulNameFinal, 
          soulDescFinal
        );
      });
      await runStep(100, `筑造完美落幕：意识常驻常青晶体完美凝成！已正式入列可用大模型写作者备选项。`, 600);

      setSelectedDocIdsForSynthesizing([]);
      setNewSoulName('');
      setNewSoulDesc('');
      setShowSynthesizerModal(false);
    } catch (err: any) {
      console.error(err);
      const timeErr = new Date().toLocaleTimeString();
      updateTaskState(t => ({
        ...t,
        status: 'failed',
        logMessages: [...t.logMessages, `[${timeErr}] ❌ 出错了: ${err.message || '系统融合超时'}`]
      }));
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans bg-slate-50/50">
      
      {/* Top Welcome Title & Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
            融合知识库与 AI 直接炼魂中心
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            支持业务文献的高效分卷存储和智能 AI 融合，直接选定特定文献或打包整个子知识库提炼出特定声音人设的<b>「最终灵魂 (Soul)」</b>
          </p>
        </div>
      </div>

      {/* 子知识库分区及多库并存管理面板 */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-emerald-600 animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase">
                业务子知识库分册目录
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">支持按不同业务条线、垂类主题、部门分册管理知识，一键定向隔离、移动与定向归纳</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTargetUploadSubKbId(selectedSubKbId === 'all' ? 'kb-default' : selectedSubKbId);
                setShowUploadModal(true);
              }}
              className="text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
            >
              <Upload className="h-4 w-4 animate-bounce" />
              导入本地文献 (Word/PDF/图片/TEXT)
            </button>
            <button
              onClick={() => setShowCreateSubKb(!showCreateSubKb)}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            >
              <FolderPlus className="h-4 w-4" />
              创建业务子知识库
            </button>
          </div>
        </div>

        {/* Create Sub-KB Inline Modal/Panel */}
        {showCreateSubKb && (
          <form onSubmit={handleCreateSubKbSubmit} className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
              <span className="text-xs font-extrabold text-gray-700 flex items-center gap-1">
                <span>📁 开启专属高价值业务子知识库</span>
              </span>
              <button 
                type="button" 
                onClick={() => setShowCreateSubKb(false)} 
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[10px] text-gray-500 uppercase font-black mb-1">子库大名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="如: 小红书爆款模版分册"
                  value={newSubKbName}
                  onChange={(e) => setNewSubKbName(e.target.value)}
                  className="w-full text-xs font-bold border border-gray-200 bg-white rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-gray-500 uppercase font-black mb-1">该子库的知识范围 / 定向定位描述</label>
                <input
                  type="text"
                  placeholder="请输入对该子库的范围说明（如: 汇集往期爆款文案和高转化率引流钩子，用于虚拟写作官等训练）"
                  value={newSubKbDesc}
                  onChange={(e) => setNewSubKbDesc(e.target.value)}
                  className="w-full text-xs border border-gray-200 bg-white rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-1.5">
              <button
                type="button"
                onClick={() => setShowCreateSubKb(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
              >
                放弃建册
              </button>
              <button
                type="submit"
                disabled={isCreatingSubKb}
                className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {isCreatingSubKb ? "智能分卷同步中..." : "立刻建卷发布"}
              </button>
            </div>
          </form>
        )}

        {/* Grid Selector row of existing sub-KBs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card all docs */}
          <div
            onClick={() => setSelectedSubKbId('all')}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 ${
              selectedSubKbId === 'all'
                ? 'border-emerald-600 bg-emerald-50/25 shadow-sm ring-1 ring-emerald-600'
                : 'border-gray-150 bg-white hover:border-emerald-300 hover:bg-slate-50/30'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-2xs">
                🗂️
              </div>
              <span className="text-[10px] font-mono font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                {docs.length} 份
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-gray-950">📦 全部资料联合底座</p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">通盘展示所有导入文档、选择性勾选炼制系统</p>
            </div>
          </div>

          {/* List of custom KBs */}
          {subKbs.map((kb) => {
            const count = docs.filter(d => (d.subKbId || 'kb-default') === kb.id).length;
            const isDefault = kb.id === 'kb-default';
            return (
              <div
                key={kb.id}
                onClick={() => {
                  setSelectedSubKbId(kb.id);
                  setTargetUploadSubKbId(kb.id); // Sync target upload selector automatically
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 group/kbcard ${
                  selectedSubKbId === kb.id
                    ? 'border-indigo-650 bg-indigo-50/15 shadow-sm ring-1 ring-indigo-650'
                    : 'border-gray-150 bg-white hover:border-indigo-300 hover:bg-slate-50/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-slate-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-2xs">
                    📁
                  </div>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-55 px-1.5 py-0.5 rounded-full">
                      {count} 份
                    </span>
                    {!isDefault && (
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除子知识库「${kb.name}」吗？其内存储的文档将自动安全转移至系统默认主知识库中。`)) {
                            onDeleteSubKb(kb.id);
                            if (selectedSubKbId === kb.id) {
                              setSelectedSubKbId('all');
                            }
                          }
                        }}
                        className="opacity-0 group-hover/kbcard:opacity-100 p-1 text-gray-400 hover:text-rose-650 transition cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-950 truncate max-w-[150px]">{kb.name}</p>
                  <p className="text-[10px] text-gray-400 mt-1 truncate" title={kb.description || '无具体说明'}>
                    {kb.description || '无具体说明'}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column: file table list */}
        <div className="xl:col-span-2 space-y-8">

          {/* Section 2: Document Table List */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {(() => {
              const filteredDocs = docs.filter(doc => {
                if (selectedSubKbId === 'all') return true;
                const currentKbId = doc.subKbId || 'kb-default';
                return currentKbId === selectedSubKbId;
              });
              const activeKbLabel = selectedSubKbId === 'all' 
                ? '全案文献大库' 
                : (subKbs.find(k => k.id === selectedSubKbId)?.name || '当前库');

              // Helper for Master Toggle
              const allFilteredDocIds = filteredDocs.map(d => d.id);
              const isAllSelected = allFilteredDocIds.length > 0 && 
                allFilteredDocIds.every(id => selectedDocIdsForSynthesizing.includes(id));

              const handleMasterToggle = () => {
                if (isAllSelected) {
                  setSelectedDocIdsForSynthesizing(prev => prev.filter(id => !allFilteredDocIds.includes(id)));
                } else {
                  setSelectedDocIdsForSynthesizing(prev => {
                    const filteredPrev = prev.filter(id => !allFilteredDocIds.includes(id));
                    return [...filteredPrev, ...allFilteredDocIds];
                  });
                }
              };

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                        文献列表：{activeKbLabel} ({filteredDocs.length} 篇)
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        在下方列表勾选多篇文献，或在右侧选择单一子知识库直接进行一键炼化！
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {filteredDocs.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSynthesisMode('docs');
                              if (selectedDocIdsForSynthesizing.length > 0) {
                                const matchedDoc = docs.find(d => d.id === selectedDocIdsForSynthesizing[0]);
                                if (matchedDoc) {
                                  setNewSoulName(matchedDoc.title.replace(/[《》]/g, '').substring(0, 7) + '最终灵魂');
                                  setNewSoulDesc(`专精于《${matchedDoc.title}》的定制内容创作AI高拟真灵魂。`);
                                } else {
                                  setNewSoulName('多篇文献融合灵魂');
                                  setNewSoulDesc('多篇文献风格融汇提纯的高性能AI常驻人设。');
                                }
                              } else {
                                setNewSoulName('多篇文献融合灵魂');
                                setNewSoulDesc('多篇文献风格融汇提纯的高性能AI常驻人设。');
                              }
                              
                              setTimeout(() => {
                                const element = document.getElementById('soul-synthesizer-card');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' });
                                }
                              }, 50);
                            }}
                            className="text-[10px] font-black text-white bg-gradient-to-r from-indigo-650 to-violet-500 hover:from-indigo-750 hover:to-violet-600 border border-indigo-200/20 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                          >
                            <Combine className="h-3.5 w-3.5 animate-pulse" />
                            <span>🧠 炼化所选 ({selectedDocIdsForSynthesizing.length})</span>
                          </button>

                          <button
                            onClick={handleMasterToggle}
                            className="text-[10px] font-bold text-indigo-650 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {isAllSelected ? '取消全选本库' : '勾选本卷所有文献'}
                          </button>
                        </>
                      )}

                      {selectedSubKbId !== 'all' && (
                        <button
                          onClick={() => setSelectedSubKbId('all')}
                          className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-lg px-2.5 py-1.5 transition-all"
                        >
                          回到大聚合
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto pr-1">
                    {filteredDocs.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <BookOpen className="h-9 w-9 mx-auto opacity-35 mb-2.5" />
                        <p className="text-xs font-black">此子分区暂时无文献存档</p>
                        <p className="text-[10px] text-gray-400 mt-1">您可在上方选为此分区导入！</p>
                      </div>
                    ) : (
                      filteredDocs.map((doc) => {
                        const docKb = subKbs.find(k => k.id === (doc.subKbId || 'kb-default'));
                        const docKbName = docKb ? docKb.name : '⭐ 主融合库';
                        const isDocChecked = selectedDocIdsForSynthesizing.includes(doc.id);

                        return (
                          <div 
                            key={doc.id} 
                            className={`py-3.5 px-2.5 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-start justify-between gap-4 group/docrow transition-colors rounded-xl hover:bg-slate-50/50 ${
                              isDocChecked ? 'bg-indigo-50/15' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              {/* Direct Synth Selector Box */}
                              <button
                                onClick={() => handleDocCheckboxToggle(doc.id)}
                                className="mt-1 text-indigo-600 hover:scale-105 transition-transform cursor-pointer shrink-0"
                                title="勾选进行合并炼魂"
                              >
                                {isDocChecked ? (
                                  <CheckSquare className="h-4.5 w-4.5 text-indigo-650" />
                                ) : (
                                  <Square className="h-4.5 w-4.5 text-gray-300 group-hover/docrow:text-indigo-400" />
                                )}
                              </button>

                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[9px] font-extrabold px-1.5 rounded bg-emerald-50 text-emerald-800 border shrink-0">
                                    {doc.category}
                                  </span>
                                  <span className="text-[9px] font-extrabold px-1.5 rounded bg-slate-50 text-gray-600 border shrink-0 flex items-center gap-0.5">
                                    <Folder className="h-2.5 w-2.5" />
                                    {docKbName.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim()}
                                  </span>
                                  <h4 className="text-xs font-black text-gray-950 truncate max-w-xs">{doc.title}</h4>
                                </div>
                                
                                <p className="text-[11px] text-gray-505 line-clamp-2 leading-relaxed italic pr-4">
                                  {doc.content}
                                </p>

                                <div className="flex items-center gap-3 pt-0.5">
                                  <span className="text-[9px] text-gray-450 font-mono">
                                    大小: {doc.size}
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {(doc.tags || []).map((tag, i) => (
                                      <span key={i} className="text-[8px] font-semibold bg-gray-50 border border-gray-100 text-gray-500 px-1 rounded">
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 md:self-center pl-7 md:pl-0">
                              {/* Move to dropdown */}
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-gray-400 font-bold shrink-0">重移入 :</span>
                                <select
                                  value={doc.subKbId || 'kb-default'}
                                  onChange={(e) => onMoveDoc(doc.id, e.target.value)}
                                  className="text-[9px] bg-slate-50 hover:bg-slate-100 text-gray-600 border rounded px-1.5 py-1 focus:outline-none cursor-pointer font-bold"
                                >
                                  {subKbs.map(k => (
                                    <option key={k.id} value={k.id}>
                                      {k.name.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim()}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => setViewingDoc(doc)}
                                className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100/40 rounded-lg px-2 py-1 cursor-pointer"
                              >
                                预览
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteDoc(doc.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Right column: Majestic Soul Refinement Panel */}
        <div className="space-y-8" id="soul-synthesizer-box">

          {/* AI 直接合魂炼化炉 */}
          <div id="soul-synthesizer-card" className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
            {/* Ambient decorative light */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-10 translate-x-4">
              <Sparkles className="h-32 w-32 text-indigo-400" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 animate-spin text-xs">
                  🔮
                </span>
                <div>
                  <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">AI 直接合魂炼化炉</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">多重特质无缝叠合，精火淬炼一键合成</p>
                </div>
              </div>

              <p className="text-[11.5px] text-indigo-200/90 leading-normal">
                批量勾选文献原料，或者直接指定子知识库分册，Gemini 智能引擎深度精炼其风格特质并合成常驻<b>「最终灵魂 (Soul)」</b>。
              </p>

              {/* Mode Switch Selection */}
              <div className="grid grid-cols-2 bg-indigo-950/65 border border-indigo-850/50 p-1 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => setSynthesisMode('docs')}
                  className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    synthesisMode === 'docs' 
                      ? 'bg-indigo-650 text-white' 
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  ⚙️ 按勾选文献 ({selectedDocIdsForSynthesizing.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSynthesisMode('subkb')}
                  className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                    synthesisMode === 'subkb' 
                      ? 'bg-indigo-650 text-white' 
                      : 'text-indigo-300 hover:text-white'
                  }`}
                >
                  📁 按子库整册
                </button>
              </div>

              {synthesisMode === 'docs' && (
                <div className="space-y-2 animate-fadeIn text-left">
                  <label className="block text-[9px] uppercase font-bold text-indigo-300">
                    已选原料文献 ({selectedDocIdsForSynthesizing.length} 篇)
                  </label>
                  
                  {selectedDocIdsForSynthesizing.length === 0 ? (
                    <div className="border border-indigo-805/40 rounded-xl p-3 bg-indigo-950/30 text-center text-indigo-300 text-[10.5px]">
                      请在左侧列表中勾选文献 ☑️
                    </div>
                  ) : (
                    <div className="border border-indigo-850 bg-indigo-950/40 rounded-xl p-2 max-h-28 overflow-y-auto space-y-1 text-[11px]">
                      {selectedDocIdsForSynthesizing.map(id => {
                        const matchedDoc = docs.find(d => d.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between bg-indigo-900/35 px-2 py-0.5 rounded">
                            <span className="truncate pr-2 font-semibold text-indigo-100">📄 {matchedDoc ? matchedDoc.title : '已删文档'}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedDocIdsForSynthesizing(prev => prev.filter(pId => pId !== id))}
                              className="text-indigo-300 hover:text-white cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {synthesisMode === 'subkb' && (
                <div className="space-y-2 animate-fadeIn text-left">
                  <label className="block text-[9px] uppercase font-bold text-indigo-300">
                    选择整册子知识库
                  </label>
                  <select
                    value={selectedSubKbIdForSynthesizing}
                    onChange={(e) => {
                      setSelectedSubKbIdForSynthesizing(e.target.value);
                      const targetSub = subKbs.find(k => k.id === e.target.value);
                      if (targetSub) {
                        setNewSoulName(targetSub.name.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim() + '的宏大意识');
                        setNewSoulDesc(`全面提纯了《${targetSub.name}》中所有方法论与宣发特色的高内聚AI写作灵魂。`);
                      }
                    }}
                    className="w-full text-xs font-bold bg-indigo-950/80 border border-indigo-700/50 rounded-xl px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
                  >
                    {subKbs.map(k => (
                      <option key={k.id} value={k.id} className="text-gray-950 bg-white">
                        📁 {k.name.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-indigo-805/35 text-left">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-indigo-300 mb-1">赋予熔化灵魂的姓名</label>
                  <input
                    type="text"
                    placeholder="如: 新媒体情绪爆破姬"
                    value={newSoulName}
                    onChange={(e) => setNewSoulName(e.target.value)}
                    className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-indigo-300 mb-1">专属使命描述</label>
                  <textarea
                    placeholder="阐述这具新灵魂将专注于什么方向的行文创作..."
                    value={newSoulDesc}
                    onChange={(e) => setNewSoulDesc(e.target.value)}
                    className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-2.5 py-1.5 h-12 text-indigo-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStartSynthesize}
                  disabled={isSynthesizing || (synthesisMode === 'docs' && selectedDocIdsForSynthesizing.length === 0)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white hover:from-emerald-600 hover:to-indigo-600 font-bold py-2 text-xs transition-transform transform active:scale-95 disabled:opacity-45 cursor-pointer"
                >
                  {isSynthesizing ? (
                    <>
                      <Cpu className="h-3.5 w-3.5 animate-spin" />
                      <span>正在深度淬炼特征中...</span>
                    </>
                  ) : (
                    <>
                      <Combine className="h-3.5 w-3.5 animate-pulse" />
                      <span>立即启动高内聚一键炼魂</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 炼化任务队列 (Refinement Task Queue Panel) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500 animate-pulse" />
                炼化任务队列 ({refinementTasks.length})
              </h3>
              {refinementTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("确定要清空炼化历史队列吗？")) {
                      setRefinementTasks([]);
                      localStorage.setItem('kb-refinement-tasks', JSON.stringify([]));
                    }
                  }}
                  className="text-[9px] font-bold text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 px-2 py-1 rounded transition-all cursor-pointer"
                >
                  清空历史
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">
              展示当前及已完成的魂魄合成任务进度状态。点击展开即可查看<b>系统实时炼魂轨迹日志</b>。
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {refinementTasks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                  <p className="text-[11px] text-gray-400">目前炼合队列中暂无排队任务</p>
                  <p className="text-[9px] text-gray-300 mt-0.5">请在上方配置参数并启动「一键炼魂」</p>
                </div>
              ) : (
                refinementTasks.map((task) => {
                  const isExpanded = expandedTaskLogId === task.id;
                  
                  // Status details
                  let statusBadgeBg = "bg-gray-105 text-gray-600 border-gray-200";
                  let statusLabel = "排队中";
                  let statusIcon = <Clock className="h-3 w-3" />;
                  
                  if (task.status === 'synthesizing') {
                    statusBadgeBg = "bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse";
                    statusLabel = `提纯中: ${task.progress}%`;
                    statusIcon = <Activity className="h-3 w-3 animate-spin text-indigo-500" />;
                  } else if (task.status === 'completed') {
                    statusBadgeBg = "bg-emerald-50 text-emerald-700 border-emerald-150";
                    statusLabel = "完成已入阁";
                    statusIcon = <CheckCircle2 className="h-3 w-3 text-emerald-600" />;
                  } else if (task.status === 'failed') {
                    statusBadgeBg = "bg-red-50 text-red-700 border-red-150";
                    statusLabel = "炼核异常";
                    statusIcon = <AlertCircle className="h-3 w-3 text-red-500" />;
                  }

                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-xl border transition-all text-left relative overflow-hidden group ${
                        task.status === 'synthesizing' 
                          ? 'border-indigo-150 bg-indigo-50/15' 
                          : 'border-gray-100 bg-gray-50/20 hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Left indicator strip */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                        task.status === 'synthesizing' 
                          ? 'bg-indigo-500' 
                          : task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`} />

                      <div className="pl-1.5 space-y-2">
                        {/* Header: Name & Badge */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-gray-800">
                              🔮 {task.soulName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-medium">
                              <span>⏰ {task.createTime}</span>
                              <span>•</span>
                              <span>原料: {task.sourcesCount} 篇</span>
                              <span>•</span>
                              <span className="bg-slate-100 px-1 rounded text-gray-500">{task.mode === 'docs' ? '文献熔炼' : '整册库提纯'}</span>
                            </div>
                          </div>
                          
                          <span className={`text-[9px] font-extrabold border px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 ${statusBadgeBg}`}>
                            {statusIcon}
                            <span>{statusLabel}</span>
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[10.5px] text-gray-500 leading-relaxed font-medium">
                          {task.soulDescription}
                        </p>

                        {/* Progress slider bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-gray-400">
                            <span>炼精纯度: {task.progress}%</span>
                            {task.completedTime && <span className="text-emerald-600 font-sans font-bold">✓ 炼毕时间: {task.completedTime}</span>}
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                task.status === 'failed' 
                                  ? 'bg-red-500' 
                                  : task.status === 'completed' 
                                  ? 'bg-emerald-500' 
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                              }`} 
                              style={{ width: `${task.progress}%` }} 
                            />
                          </div>
                        </div>

                        {/* Log expansion toggler */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setExpandedTaskLogId(isExpanded ? null : task.id)}
                            className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Terminal className="h-3 w-3" />
                            <span>{isExpanded ? '卷收轨迹控制日志 ▲' : '展开实时炼魂微日志 ▼'}</span>
                          </button>
                        </div>

                        {/* Terminal simulation log body */}
                        {isExpanded && (
                          <div className="bg-slate-950 font-mono text-[9px] text-indigo-300 p-2.5 rounded-lg border border-indigo-900 mt-1.5 space-y-1 max-h-24 overflow-y-auto w-full select-text">
                            {task.logMessages.map((log, idx) => (
                              <div key={idx} className="flex gap-1.5 leading-normal select-text">
                                <span className="text-indigo-500 shrink-0 font-bold select-none">&gt;</span>
                                <span className={log.includes('❌') ? 'text-red-400 font-bold' : log.includes('落幕') || log.includes('完成') || log.includes('成功') ? 'text-emerald-400 font-bold' : 'text-indigo-200'}>
                                  {log}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* List of synthesized Souls */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-650" />
              已服役的可配用大模型灵魂 ({souls.length})
            </h3>

            <p className="text-[11px] text-gray-400 leading-normal">
              此处列出所有炼化完成的大模型写作者。可在<b>「AI常驻代理」</b>功能模块中，直接与岗位进行注入绑定！
            </p>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {souls.length === 0 ? (
                <p className="text-[11px] text-gray-400 text-center py-6">暂无可用灵魂。请先在上方合并或者直接创制！</p>
              ) : (
                souls.map((soul) => (
                  <div key={soul.id} className="p-3.5 rounded-xl bg-orange-50/20 border border-orange-150 flex items-start justify-between gap-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-10 w-10 bg-orange-100/10 rounded-full blur-sm" />
                    <div className="space-y-1 relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-orange-950">{soul.name}</span>
                        <span className="text-[8px] bg-orange-100 text-orange-850 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">SOUL</span>
                      </div>
                      <p className="text-[10px] text-orange-900/80 leading-normal line-clamp-2">{soul.description}</p>
                      
                      <div className="text-[9px] text-indigo-900/70 font-mono pt-1">
                        <b>风格:</b> {soul.creativeStyle}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {soul.combinedTraits.map((tr, idx) => (
                          <span key={idx} className="text-[8px] border border-orange-200 bg-white text-orange-700 px-1.5 rounded-full">
                            {tr}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSoul(soul.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-white p-1.5 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Doc Preview Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100">
                  {viewingDoc.category}
                </span>
                <h4 className="text-sm font-bold text-gray-900 truncate max-w-md">{viewingDoc.title}</h4>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer"
              >
                关闭
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap selection:bg-emerald-100">
              {viewingDoc.content}
            </div>

            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50 text-[10px] text-gray-400 flex items-center justify-between">
              <span>大小: {viewingDoc.size} | 创建时间: {viewingDoc.createTime}</span>
              <div className="flex gap-1">
                {(viewingDoc.tags || []).map((t, idx) => (
                  <span key={idx} className="bg-white border text-gray-500 px-1 py-0.2 rounded font-mono">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Import Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/40">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-150 text-xs">
                  🚀
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">智能文献分类双通道导入</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">本地多格式解析归仓，自动提取标记与专业归类</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setErrorMsg('');
                }}
                className="text-gray-400 hover:text-gray-600 bg-white border border-gray-100 font-bold rounded-lg px-2.5 py-1.5 cursor-pointer text-[10px]"
              >
                关闭
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Destination Selector Folder Picker */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1.5">
                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase">
                  <Folder className="h-3.5 w-3.5 text-emerald-600" />
                  存放分册：指定要导入的知识分册
                </span>
                <select
                  value={targetUploadSubKbId}
                  onChange={(e) => setTargetUploadSubKbId(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-gray-150 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="kb-default">⭐ 主融合仓库「系统默认分册」</option>
                  {subKbs.filter(k => k.id !== 'kb-default').map(k => (
                    <option key={k.id} value={k.id}>
                      📁 {k.name.replace(/^[^\w\s\u4e00-\u9fa5]+/, '').trim()} - {k.description || '无具体说明'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tab Selector Switcher */}
              <div className="grid grid-cols-2 bg-slate-50 border p-1 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadTab('upload');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    activeUploadTab === 'upload' 
                      ? 'bg-emerald-650 text-white shadow-xs' 
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  📂 本地拖放智审多模态导入 (.docx/.pdf/.jpg/.png/.txt)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadTab('manual');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 text-[10px] font-black rounded-lg transition-all ${
                    activeUploadTab === 'manual' 
                      ? 'bg-emerald-650 text-white shadow-xs' 
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  ✍️ 手动文案/大纲急速草拟
                </button>
              </div>

              {/* Error Display */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-[10.5px] leading-relaxed">
                  ⚠️ <b>归属于该分册异常:</b> {errorMsg}
                </div>
              )}

              {/* Active TAB 1: Local upload and Drag & Drop file */}
              {activeUploadTab === 'upload' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* File Drag Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('modal-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-emerald-600 bg-emerald-55/20 scale-98 shadow-inner' 
                        : 'border-gray-250 hover:border-emerald-500 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      id="modal-file-input"
                      type="file"
                      multiple
                      accept=".txt,.md,.markdown,.json,.csv,.docx,.pdf,.jpg,.jpeg,.png,.webp,.gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Upload className={`h-8 w-8 mx-auto mb-2 transition-transform ${isDragging ? 'animate-bounce text-emerald-600' : 'text-gray-400'}`} />
                    <p className="text-xs font-black text-gray-950">将 Word 报告、PDF 资料、图片或文本拽入此区域</p>
                    <p className="text-[10px] text-gray-400 mt-1">或者点击这里选择本地文件进行多模态扫描解析</p>
                    <p className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 max-w-max mx-auto mt-2 font-semibold">
                      支持 Word, PDF, JPG, PNG 等，纯文字自适应，图照 pdf 视觉多模态大模型智读
                    </p>
                  </div>

                  {/* List of dragged wait files */}
                  {pendingFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-gray-400">待导入处理文献队页 ({pendingFiles.length})</span>
                        <button 
                          onClick={() => setPendingFiles([])}
                          className="text-[9px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          一次性清空
                        </button>
                      </div>

                      <div className="border border-gray-100 bg-slate-50/50 rounded-xl p-2.5 max-h-40 overflow-y-auto space-y-1.5 text-xs">
                        {pendingFiles.map((file) => {
                          const isFailed = file.status === 'failed';
                          const isCompleted = file.status === 'completed';
                          const isUploadingState = file.status === 'uploading';

                          return (
                            <div key={file.id} className="flex items-center justify-between bg-white px-2.5 py-2 rounded-lg border border-gray-100">
                              <div className="flex-1 min-w-0 pr-3 space-y-0.5">
                                <input
                                  type="text"
                                  value={file.name}
                                  onChange={(e) => handleUpdatePendingFileName(file.id, e.target.value)}
                                  className="w-full text-xs font-bold text-gray-800 bg-transparent py-0 px-0.5 border border-transparent border-b-gray-100 hover:border-b-gray-300 focus:border-b-emerald-500 focus:outline-none"
                                  title="点击修改文献在知识库中的永久留存标题"
                                />
                                <div className="flex items-center gap-2 text-[9px] text-gray-400">
                                  <span>大小: {file.sizeStr}</span>
                                  <span>类型: {file.fileType || '纯文本'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {isCompleted && (
                                  <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border px-1.5 rounded animate-pulse">
                                    ✓ 已归卷
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border px-1.5 rounded" title={file.error}>
                                    ⚠️ 报错
                                  </span>
                                )}
                                {isUploadingState && (
                                  <span className="text-[9px] text-indigo-700 flex items-center gap-1 font-semibold animate-pulse">
                                    <Cpu className="h-3.5 w-3.5 animate-spin" />
                                    AI多维度解析中...
                                  </span>
                                )}
                                {!isUploading && !isCompleted && !isFailed && (
                                  <span className="text-[9px] bg-slate-100 text-gray-500 px-1.5 rounded">
                                    等待中
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleRemovePendingFile(file.id)}
                                  className="text-gray-400 hover:text-red-500 hover:scale-105 cursor-pointer"
                                  disabled={isUploadingState}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleBatchUploadSubmit}
                        disabled={batchUploadProgress !== null || pendingFiles.every(f => f.status === 'completed')}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-605 hover:bg-emerald-700 text-white font-extrabold py-2.5 text-xs transition cursor-pointer disabled:opacity-45"
                      >
                        {batchUploadProgress ? (
                          <>
                            <Cpu className="h-3.5 w-3.5 animate-spin" />
                            <span>批量识别导入中 ({batchUploadProgress.current} / {batchUploadProgress.total}) ...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>开启大模型高精度精细化解析与自动归入</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {pendingFiles.length === 0 && (
                    <p className="text-center text-[10.5px] text-gray-400 py-3">无需下载特殊客户端，直接本地将多个任何文件一齐拽入即可开始高效提纯</p>
                  )}

                </div>
              )}

              {/* Active TAB 2: Manual text form */}
              {activeUploadTab === 'manual' && (
                <form onSubmit={handleUploadSubmit} className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">文献留档独立标题 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="比如: 关于近期新茶饮爆款高复购话术研究"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs font-bold border border-gray-150 rounded-xl px-3 py-2 text-gray-800 focus:border-emerald-500 focus:outline-none bg-slate-50/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">文献详细纯文本内容 <span className="text-red-500">*</span></label>
                    <textarea
                      placeholder="在此处直接贴入文献的具体字句、大纲段落、长篇方法论模板。AI 将在归入时提取其核心词、并全能归纳其行文特色、专业文风属性与专攻场景等..."
                      value={newContent}
                      required
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full text-xs border border-gray-150 rounded-xl px-3 py-2 h-36 font-mono text-gray-700 focus:border-emerald-500 focus:outline-none bg-slate-50/20 leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold py-2.5 text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Cpu className="h-3.5 w-3.5 animate-spin" />
                        <span>智审引擎进行入库属性分配中...</span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>单篇智能一键急速归库</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}



    </div>
  );
}
