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
  UserCheck
} from 'lucide-react';
import { KBDocument, SoulFragment, Soul } from '../types';

interface KnowledgeBaseProps {
  docs: KBDocument[];
  fragments: SoulFragment[];
  souls: Soul[];
  onUploadDoc: (title: string, content: string) => Promise<void>;
  onDeleteDoc: (id: string) => Promise<void>;
  onExtractFragment: (docId: string, fragmentName: string) => Promise<void>;
  onSynthesizeSoul: (fragmentIds: string[], name: string, desc: string) => Promise<void>;
  onDeleteSoul: (id: string) => Promise<void>;
}

export default function KnowledgeBase({
  docs,
  fragments,
  souls,
  onUploadDoc,
  onDeleteDoc,
  onExtractFragment,
  onSynthesizeSoul,
  onDeleteSoul
}: KnowledgeBaseProps) {
  // New document entry
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Active viewing document
  const [viewingDoc, setViewingDoc] = useState<KBDocument | null>(null);

  // Refine Fragment state
  const [selectedDocIdForRefine, setSelectedDocIdForRefine] = useState<string>('');
  const [customFragmentName, setCustomFragmentName] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Synthesize Soul states
  const [selectedFragsForSynthesizing, setSelectedFragsForSynthesizing] = useState<string[]>([]);
  const [newSoulName, setNewSoulName] = useState('');
  const [newSoulDesc, setNewSoulDesc] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsUploading(true);
    try {
      await onUploadDoc(newTitle, newContent);
      setNewTitle('');
      setNewContent('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartRefine = async () => {
    if (!selectedDocIdForRefine) return;
    setIsRefining(true);
    try {
      await onExtractFragment(selectedDocIdForRefine, customFragmentName);
      setSelectedDocIdForRefine('');
      setCustomFragmentName('');
    } finally {
      setIsRefining(false);
    }
  };

  const handleFragCheckboxToggle = (fragId: string) => {
    if (selectedFragsForSynthesizing.includes(fragId)) {
      setSelectedFragsForSynthesizing(prev => prev.filter(id => id !== fragId));
    } else {
      setSelectedFragsForSynthesizing(prev => [...prev, fragId]);
    }
  };

  const handleStartSynthesize = async () => {
    if (selectedFragsForSynthesizing.length === 0) return;
    setIsSynthesizing(true);
    try {
      await onSynthesizeSoul(
        selectedFragsForSynthesizing, 
        newSoulName, 
        newSoulDesc
      );
      setSelectedFragsForSynthesizing([]);
      setNewSoulName('');
      setNewSoulDesc('');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const getSourceDocLabel = (docId: string) => {
    const doc = docs.find(d => d.id === docId);
    return doc ? doc.title : '已删除文献';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans">
      
      {/* Top Welcome Title & Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            融合知识库与人格炼化中枢
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            支持各格式文本智能化入库并归类整理，并可将资料淬水融合成具备专业创造力的「虚拟员工灵魂（Soul）」
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Aspect: Ingestion Form & Documentation Source list */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Section 1: Upload / Add Document */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              导入业务文档与智能AI归类
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">文档标题/文献来源名</label>
                <input
                  type="text"
                  placeholder="如：《2026年爆款小红书文案黄金排版公式手册》"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-2.5 focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">文献正文内容</label>
                <textarea
                  placeholder="在此写入或粘贴入库内容正文。系统将调用 Gemini 自动分析语境、提取核心 Tags 属性标签，并匹配最贴切的项目分类目录..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 h-32 focus:border-emerald-500 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-medium py-3 text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md shadow-emerald-500/10"
              >
                {isUploading ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    <span>Gemini 智能分类及提取主题标笺中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>一键文档智能入库归档</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Section 2: Document List */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-emerald-600" />
                入库文献及自动标签簿 ({docs.length})
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-50 border px-2 py-0.5 rounded-full">
                自动回流与二次复用
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto pr-1">
              {docs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="h-10 w-10 mx-auto opacity-35 mb-2" />
                  <p className="text-sm">知识库为空。请在上方输入首份业务数据！</p>
                </div>
              ) : (
                docs.map((doc) => (
                  <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 group">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 shrink-0">
                          {doc.category}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 truncate">{doc.title}</h4>
                      </div>
                      
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic pr-4">
                        {doc.content.substring(0, 180)}...
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 shrink-0">
                          大小: {doc.size}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag, i) => (
                            <span key={i} className="text-[9px] font-mono bg-gray-50 border border-gray-100 text-gray-500 px-1.5 rounded flex items-center gap-0.5">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        预览正文
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDocIdForRefine(doc.id);
                          setCustomFragmentName(doc.title.replace(/[《》]/g, '') + '的文案碎魂');
                        }}
                        className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1 transition-colors"
                      >
                        🔮 人格炼魂
                      </button>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Aspect:煉魂 "Soul Refinement" & 合魂 "Synthesis" Panels */}
        <div className="space-y-8">
          
          {/* Section 3: "炼魂" Crucible (萃取灵魂碎片) */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-6">
              <Zap className="h-48 w-48 text-indigo-400" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-white animate-spin">
                  🔮
                </span>
                <h4 className="text-sm font-bold tracking-wider uppercase">炼魂炉 (Trait Extractor)</h4>
              </div>

              <p className="text-xs text-indigo-200 leading-relaxed">
                选定一份知识库文档，AI将淬火分析其独一无二的声音，行文词藻及态度句式，从而提炼剥离出一枚<b>「灵魂碎片 - Fragment」</b>
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1">选择源炼制文献</label>
                  <select
                    value={selectedDocIdForRefine}
                    onChange={(e) => {
                      setSelectedDocIdForRefine(e.target.value);
                      const doc = docs.find(d => d.id === e.target.value);
                      if (doc) {
                        setCustomFragmentName(doc.title.replace(/[《》]/g, '') + '的文案碎魂');
                      }
                    }}
                    className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-3 py-2 text-indigo-105 focus:outline-none"
                  >
                    <option value="" className="text-indigo-950">-- 请选取一份可炼化的知识分子 --</option>
                    {docs.map(d => (
                      <option key={d.id} value={d.id} className="text-indigo-950">{d.title}</option>
                    ))}
                  </select>
                </div>

                {selectedDocIdForRefine && (
                  <div className="space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1">碎片的命名</label>
                      <input
                        type="text"
                        placeholder="如：极简极客之魂"
                        value={customFragmentName}
                        onChange={(e) => setCustomFragmentName(e.target.value)}
                        className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-3 py-2 text-indigo-50 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleStartRefine}
                      disabled={isRefining}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-400 to-indigo-500 text-white hover:from-orange-500 hover:to-indigo-600 font-bold py-2.5 text-xs transition-transform transform active:scale-95 disabled:opacity-50"
                    >
                      {isRefining ? (
                        <>
                          <Cpu className="h-3.5 w-3.5 animate-spin" />
                          <span>正在AI解析提取文章之魂...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" />
                          <span>启动人格提炼萃取法案</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Merging / Synthesizing Soul Furnace */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 tracking-wider uppercase flex items-center gap-2">
              <Combine className="h-4.5 w-4.5 text-indigo-600" />
              合魂合成熔炉 (Soul Synthesizer)
            </h3>

            <p className="text-[11px] text-gray-400 leading-normal">
              多重特质叠加！自由勾选下方已解封的「灵魂碎片」，将不同的声音与技能糅合，AI将整合成一套完整的超高拟真创造性
              <b>「最终灵魂 (Soul)」</b>大卡！
            </p>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-bold text-gray-400">已解锁的灵魂特质碎片 ({fragments.length})</label>
              
              <div className="border border-gray-50 rounded-xl p-2.5 bg-gray-50/50 max-h-40 overflow-y-auto space-y-2">
                {fragments.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-4">无可用碎片，请先对左侧文档进行“人格炼魂”！</p>
                ) : (
                  fragments.map((frag) => (
                    <label key={frag.id} className="flex items-start gap-2.5 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedFragsForSynthesizing.includes(frag.id)}
                        onChange={() => handleFragCheckboxToggle(frag.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 scale-95"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{frag.name}</p>
                        <p className="text-[9px] text-indigo-600 font-medium mt-0.5 flex gap-1 flex-wrap">
                          {frag.traits.map((t, idx) => <span key={idx}>• {t}</span>)}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedFragsForSynthesizing.length > 0 && (
                <div className="space-y-3 pt-2 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">合成灵魂的大名</label>
                    <input
                      type="text"
                      placeholder="如：科技温情新青年"
                      value={newSoulName}
                      onChange={(e) => setNewSoulName(e.target.value)}
                      className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">结合灵魂的使命描述</label>
                    <textarea
                      placeholder="概括该虚拟灵魂将擅长应付哪方面的宣发任务..."
                      value={newSoulDesc}
                      onChange={(e) => setNewSoulDesc(e.target.value)}
                      className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2 h-16 text-gray-700"
                    />
                  </div>

                  <button
                    onClick={handleStartSynthesize}
                    disabled={isSynthesizing}
                    className="w-full flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-500/10"
                  >
                    {isSynthesizing ? (
                      <>
                        <Cpu className="h-3.5 w-3.5 animate-spin" />
                        <span>多级神经拟态灵魂合成中...</span>
                      </>
                    ) : (
                      <>
                        <Combine className="h-3.5 w-3.5" />
                        <span>一键魂力结合合成完整的「灵魂」</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* List of synthesized Souls */}
            <div className="pt-4 border-t border-gray-50 space-y-3">
              <label className="block text-[10px] uppercase font-bold text-gray-400">已装配的可配用灵魂 ({souls.length})</label>
              
              <div className="space-y-3">
                {souls.map((soul) => (
                  <div key={soul.id} className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100/30 flex items-start justify-between gap-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-10 w-10 bg-orange-100/10 rounded-full blur-sm" />
                    <div className="space-y-1 relative z-10 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-orange-950">{soul.name}</span>
                        <span className="text-[8px] bg-orange-100 text-orange-800 px-1 py-0.2 rounded font-mono font-bold shrink-0">SOUL</span>
                      </div>
                      <p className="text-[10px] text-orange-850/80 leading-normal line-clamp-2">{soul.description}</p>
                      
                      <div className="text-[9px] text-gray-500 font-mono pt-1">
                        <b>合成调性:</b> {soul.creativeStyle}
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
                      className="text-gray-400 hover:text-red-600 hover:bg-white p-1.5 rounded-lg transition-colors shrink-0 elevation-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
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
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-white border rounded-lg px-2.5 py-1.5"
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
                {viewingDoc.tags.map((t, idx) => (
                  <span key={idx} className="bg-white border text-gray-500 px-1 py-0.2 rounded font-mono">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
