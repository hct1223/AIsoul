/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Globe, 
  Cpu, 
  Terminal, 
  CheckCircle, 
  RotateCcw,
  BookOpen,
  Wifi,
  ExternalLink,
  Loader2,
  Eye,
  X,
  Calendar,
  FileText,
  Database,
  Link2,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { CrawlerTask, KBDocument } from '../types';

interface CrawlerModuleProps {
  crawlers: CrawlerTask[];
  docs: KBDocument[];
  onCreateCrawler: (name: string, platform: string, link: string) => Promise<void>;
  onRunCrawler: (id: string) => Promise<void>;
}

export default function CrawlerModule({
  crawlers,
  docs,
  onCreateCrawler,
  onRunCrawler
}: CrawlerModuleProps) {
  // New Crawler state
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'小红书' | '微信公众号' | '企业官网' | '其他'>('小红书');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded CLI terminal log viewer id
  const [viewingLogsCrawlerId, setViewingLogsCrawlerId] = useState<string | null>(null);

  // States for Task Details View & Doc Preview
  const [selectedCrawlerForDetails, setSelectedCrawlerForDetails] = useState<CrawlerTask | null>(null);
  const [viewingScrapedDoc, setViewingScrapedDoc] = useState<KBDocument | null>(null);

  // Run progress loading states
  const [runLoading, setRunLoading] = useState<Record<string, boolean>>({});

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !link.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCrawler(name, platform, link);
      setName('');
      setLink('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartCrawl = async (id: string) => {
    setRunLoading(prev => ({ ...prev, [id]: true }));
    setViewingLogsCrawlerId(id); // Auto expand terminal logger
    try {
      await onRunCrawler(id);
    } finally {
      setRunLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getLogTerminalText = (crawler: CrawlerTask) => {
    return crawler.logs.join('\n');
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans">
      
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          智能定向网页数据采集中心
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          建立独立的目标链接爬虫任务、定时采集、多源分析，并将抓取整理到的公开文本内容全自动沉淀/沉积入库本地知识系统。
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Aspect: Create Rule Form */}
        <div className="xl:col-span-1 space-y-8">
          
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-5 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              新建定向爬网规则
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">爬取任务大名</label>
                <input
                  type="text"
                  placeholder="如: 小红书科技圈每周动态抓取"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-gray-150 rounded-xl px-3.5 py-2.5 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">主流适配渠道</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full text-xs border border-gray-150 rounded-xl px-3.5 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="小红书">小红书</option>
                    <option value="微信公众号">微信公众号</option>
                    <option value="企业官网">企业官网</option>
                    <option value="其他">其他公开资讯</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <div className="px-2.5 py-2 bg-gray-50 text-[10px] text-gray-400 rounded-lg border w-full flex items-center gap-1.5 font-semibold">
                    <Wifi className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                    <span>Scraper Socket OK</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">精准公开链接/文章URL</label>
                <input
                  type="url"
                  placeholder="请输入以 http:// 或 https:// 开头的网站链接"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full text-xs border border-gray-150 rounded-xl px-3.5 py-2.5 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100 text-[11px] text-gray-400 leading-normal">
                💡 <b>数据闭环：</b>
                抓取的外部文章会由 Gemini 完成<b>高能结构化脱水清洗</b>后直接一键同步添加进系统融合知识库。不再需要二次手动保存！
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-medium py-3 text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <>
                  <Plus className="h-4 w-4" />
                  <span>添加并保存该爬取指标</span>
                </>
              </button>
            </form>
          </div>

        </div>

        {/* Right Aspect: Current Crawlers & Monitor Console log */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Crawlers list */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-5 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
              定向采集任务调度名单 ({crawlers.length})
            </h3>

            <div className="space-y-4">
              {crawlers.length === 0 ? (
                <p className="text-center py-16 text-xs text-gray-400">暂无自定义爬虫目标文件。</p>
              ) : (
                crawlers.map((crawler) => {
                  const isRunning = crawler.status === 'running';
                  const isCompleted = crawler.status === 'completed';
                  const isFailed = crawler.status === 'failed';
                  const isLogExpanded = viewingLogsCrawlerId === crawler.id;

                  return (
                    <div key={crawler.id} className="p-4 rounded-xl border border-gray-100 hover:border-gray-250 bg-white shadow-sm flex flex-col gap-3 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.2 bg-emerald-50 text-emerald-800 border rounded">
                              {crawler.platform}
                            </span>
                            <h4 className="text-xs font-bold text-gray-900">{crawler.name}</h4>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 truncate max-w-sm flex items-center gap-1 font-mono">
                            <ExternalLink className="h-3 w-3" />
                            {crawler.link}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <span className="text-[10px] text-gray-400 mr-2">
                            发现正文数: <b>{crawler.scrapedDocsCount}</b>
                          </span>

                          <button
                            onClick={() => handleStartCrawl(crawler.id)}
                            disabled={isRunning}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              isRunning
                                ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                                : isCompleted
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-250'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {isRunning ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            <span>{isRunning ? '抓取中...' : gapCrawlStateLabel(crawler.status)}</span>
                          </button>
                        </div>
                      </div>

                      {/* Log Toggler Accordions */}
                      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-gray-50 flex-wrap gap-2">
                        <span className="text-gray-400 font-mono">创建时间: {crawler.createTime}</span>
                        
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedCrawlerForDetails(crawler)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/50 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            <span>🔍 查看任务详情与归库内容</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewingLogsCrawlerId(isLogExpanded ? null : crawler.id)}
                            className="text-indigo-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                            <span>{isLogExpanded ? '隐藏日志 ▴' : '实时日志 ▾'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Terminal monitor logging block */}
                      {isLogExpanded && (
                        <div className="rounded-xl border bg-slate-900 border-slate-950 p-4 font-mono text-[10px] text-emerald-400 block max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed animate-fadeIn">
                          {getLogTerminalText(crawler)}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 爬虫任务详情页 & 数据成果透视模态窗 (Crawler Task Details Modal) */}
      {selectedCrawlerForDetails && (() => {
        const crawler = selectedCrawlerForDetails;
        // Refresh with latest state if the crawler updated in parent list
        const updatedCrawler = crawlers.find(c => c.id === crawler.id) || crawler;
        const isRunning = updatedCrawler.status === 'running';
        const isCompleted = updatedCrawler.status === 'completed';
        const isFailed = updatedCrawler.status === 'failed';
        
        // Find matching documents in KB
        const associatedDocs = docs.filter(doc => 
          doc.crawlerId === updatedCrawler.id || 
          (doc.type === 'crawler' && doc.tags.includes(updatedCrawler.platform))
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 max-w-4xl w-full border border-gray-150 shadow-2xl relative flex flex-col max-h-[85vh] animate-scaleUp overflow-hidden">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 shrink-0">
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border rounded">
                      {updatedCrawler.platform}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isRunning 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                          : isFailed
                            ? 'bg-red-50 text-red-750 border border-red-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        isRunning ? 'bg-blue-600 animate-ping' : isCompleted ? 'bg-emerald-600' : isFailed ? 'bg-red-600' : 'bg-gray-400'
                      }`} />
                      {isRunning ? '外部链路采集运行中' : isCompleted ? '全量采集已完成' : isFailed ? '采集发生异常' : '空闲中'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">任务ID: {updatedCrawler.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-950 flex items-center gap-1.5 mt-1">
                    <Globe className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                    {updatedCrawler.name}
                  </h3>
                  <a 
                    href={updatedCrawler.link}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono break-all"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    {updatedCrawler.link}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCrawlerForDetails(null);
                    setViewingScrapedDoc(null);
                  }}
                  className="p-1 px-2.5 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer text-xs font-bold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 py-5 overflow-y-auto flex-1 min-h-0">
                
                {/* Left pane: Stats & Configuration */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-gray-50/75 border border-gray-100 rounded-2xl p-4 space-y-3.5">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 text-emerald-600" />
                      采集任务控制台大局观
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-xs">
                        <span className="block text-[10px] text-gray-400">已提取归库文献</span>
                        <span className="text-lg font-black text-emerald-700 mt-1 block">
                          {updatedCrawler.scrapedDocsCount} 篇
                        </span>
                      </div>

                      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-xs">
                        <span className="block text-[10px] text-gray-400">系统入库同步</span>
                        <span className="text-xs font-bold text-indigo-700 mt-1.5 block flex items-center gap-1">
                          <Database className="h-3 w-3 text-indigo-500" />
                          已实时同步
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px] text-gray-500 leading-normal">
                      <div className="flex justify-between border-b border-gray-100/50 pb-1.5">
                        <span>首建日期:</span>
                        <span className="font-semibold text-gray-800 font-mono">{updatedCrawler.createTime}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100/50 pb-1.5">
                        <span>解析规则:</span>
                        <span className="font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.2 rounded text-[10px]">Gemini 智能结构清洗</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100/50 pb-1.5">
                        <span>链路安全:</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> 纯净数据源
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartCrawl(updatedCrawler.id)}
                        disabled={isRunning}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-2 text-xs transition-transform active:scale-98 disabled:opacity-40 cursor-pointer"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>智能采集抽取中...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" />
                            <span>重新启动单次瞬时采集</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terminal monitor logs within details */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5 text-gray-550" />
                      抓取终端控制台(实时日志)
                    </label>
                    <div className="bg-slate-900 border border-slate-950 rounded-2xl p-3.5 font-mono text-[9px] text-emerald-400 h-44 overflow-y-auto space-y-1 leading-normal">
                      {updatedCrawler.logs.map((log, i) => (
                        <div key={i} className="hover:bg-slate-800/40 rounded px-1 text-left">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right pane: Scraped documents & Document content viewer */}
                <div className="md:col-span-3 flex flex-col min-h-0 border-l border-gray-100 pl-0 md:pl-6">
                  
                  {viewingScrapedDoc ? (
                    <div className="flex flex-col h-full bg-slate-50/50 border border-gray-150 rounded-2xl p-4 justify-between animate-fadeIn min-h-0 text-left">
                      
                      {/* Sub header for viewing doc */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <span className="text-[11px] font-bold text-gray-700">正在查阅已洗净入库文章</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewingScrapedDoc(null)}
                          className="text-[10px] bg-white border hover:bg-gray-50 font-bold text-indigo-650 border-gray-250 py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          返回文章成果一览 ↩
                        </button>
                      </div>

                      {/* Content view text body */}
                      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
                        <h4 className="text-xs font-bold text-gray-900 leading-snug">{viewingScrapedDoc.title}</h4>
                        <div className="text-[10px] text-gray-400 flex items-center gap-3">
                          <span>自动捕获于: {viewingScrapedDoc.createTime}</span>
                          <span>数据大小: {viewingScrapedDoc.size}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 mt-2 pt-3">
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap selection:bg-indigo-100">
                            {viewingScrapedDoc.content}
                          </p>
                        </div>
                      </div>

                      {/* Sync check footer */}
                      <div className="bg-white border border-gray-150 rounded-xl p-3 text-[11px] text-gray-500 mt-2 shrink-0">
                        💡 <b>智能无感持久化：</b> 该篇采捕文章已被保存在您系统中的 <b>“融合知识库 (Knowledge Base)”</b> 内，可供内容工作台编辑使用，或直接作为原料提供给炼魂池使用。
                      </div>

                    </div>
                  ) : (
                    <div className="flex flex-col h-full min-h-0 text-left">
                      <div className="flex items-center justify-between mb-3 shrink-0">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-emerald-600" />
                          已捕获沉淀文献成果列表 ({associatedDocs.length})
                        </h4>
                        <span className="text-[10px] text-gray-400">已智能分类清洗</span>
                      </div>

                      {associatedDocs.length === 0 ? (
                        <div className="flex-1 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-gray-50/50">
                          <Loader2 className="h-8 w-8 text-indigo-300 animate-spin mb-3" />
                          <h5 className="text-xs font-bold text-gray-700">正在等待数据抽取成果流入...</h5>
                          <p className="text-[10.5px] text-gray-400 text-center max-w-xs mt-1.5 leading-normal">
                            暂未检测到抓取历史记录。点击左侧的<b>“重新启动单次瞬时采集”</b>或者稍等分析运行完结，捕获物将在此为您呈现！
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                          {associatedDocs.map((doc) => (
                            <div 
                              key={doc.id} 
                              className="bg-white hover:bg-slate-50 border border-gray-150 rounded-xl p-3.5 transition-all text-left block cursor-pointer group"
                              onClick={() => setViewingScrapedDoc(doc)}
                            >
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-gray-900 leading-snug group-hover:text-indigo-650 transition-colors">
                                  📄 {doc.title}
                                </h5>
                                <p className="text-[10.5px] text-gray-400 line-clamp-2 leading-relaxed">
                                  {doc.content.replace(/【?标题：?[^】\n]+】?/g, '').trim()}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px] text-gray-400 font-mono">
                                <span>容量分贝: {doc.size} | {doc.createTime}</span>
                                <span className="text-indigo-600 group-hover:underline font-bold inline-flex items-center gap-0.5">
                                  查阅精炼全文 →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

const gapCrawlStateLabel = (status: string) => {
  if (status === 'completed') return '重新采集';
  if (status === 'failed') return '重试采集';
  return '启动采集';
};
