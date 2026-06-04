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
  Loader2
} from 'lucide-react';
import { CrawlerTask } from '../types';

interface CrawlerModuleProps {
  crawlers: CrawlerTask[];
  onCreateCrawler: (name: string, platform: string, link: string) => Promise<void>;
  onRunCrawler: (id: string) => Promise<void>;
}

export default function CrawlerModule({
  crawlers,
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
                      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-gray-50">
                        <span className="text-gray-400 font-mono">创建时间: {crawler.createTime}</span>
                        
                        <button
                          onClick={() => setViewingLogsCrawlerId(isLogExpanded ? null : crawler.id)}
                          className="text-indigo-600 hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Terminal className="h-3.5 w-3.5" />
                          <span>{isLogExpanded ? '隐藏控制台日志 ▴' : '查看控制台实时日志 ▾'}</span>
                        </button>
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

    </div>
  );
}

const gapCrawlStateLabel = (status: string) => {
  if (status === 'completed') return '重新采集';
  if (status === 'failed') return '重试采集';
  return '启动采集';
};
