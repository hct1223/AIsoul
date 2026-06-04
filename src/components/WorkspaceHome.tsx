/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Cpu, 
  Database, 
  Sparkles, 
  PenTool, 
  Globe, 
  Share2, 
  ArrowRight,
  BookOpen,
  Shuffle,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SidebarTab } from './Sidebar';

interface WorkspaceHomeProps {
  docsCount: number;
  fragmentsCount: number;
  soulsCount: number;
  employeesCount: number;
  tasksCount: number;
  crawlersCount: number;
  feedsCount: number;
  setActiveTab: (tab: SidebarTab) => void;
}

export default function WorkspaceHome({
  docsCount,
  fragmentsCount,
  soulsCount,
  employeesCount,
  tasksCount,
  crawlersCount,
  feedsCount,
  setActiveTab
}: WorkspaceHomeProps) {
  const bentoStats = [
    { label: '融合知识库文献', count: `${docsCount} 篇`, icon: Database, tab: 'kb' as const, bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50' },
    { label: '提炼灵魂碎片', count: `${fragmentsCount} 个`, icon: Sparkles, tab: 'kb' as const, bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/50' },
    { label: '装配灵魂人设', count: `${soulsCount} 具`, icon: Shuffle, tab: 'kb' as const, bg: 'bg-orange-50 text-orange-700 hover:bg-orange-100/50' },
    { label: '智能虚拟常驻员工', count: `${employeesCount} 位`, icon: Cpu, tab: 'employees' as const, bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100/50' },
    { label: '多渠道独立爬虫', count: `${crawlersCount} 组`, icon: Globe, tab: 'crawler' as const, bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100/50' },
    { label: '业务系统同步线', count: `${feedsCount} 条活跃`, icon: Share2, tab: 'business' as const, bg: 'bg-pink-50 text-pink-700 hover:bg-pink-100/50' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans">
      
      {/* Intro section */}
      <div className="bg-gradient-to-r from-emerald-600 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-6">
          <Cpu className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 border border-white/10 backdrop-blur-sm">
            <Award className="h-3.5 w-3.5 animate-bounce" /> Enterprise Multi-Agent Closed-Loop Operations
          </span>
          
          <h2 className="text-3xl font-extrabold tracking-tight">
            企业级 AI 智能多代理创作 & 融合知识管理系统
          </h2>
          
          <p className="text-sm text-emerald-100/90 leading-relaxed md:pr-12">
            打破传统自媒体运营硬拼人力的瓶颈！本系统无缝集成了 <b>“文献自动分类”</b>、<b>“🔮 人格炼魂与合魂”</b>、<b>“多渠道爬虫采集即同步”</b> 以及 <b>“CRM客服大盘同步”</b>。
            通过多工位并行流水线，将商业一手料重塑为小红书、微信号爆款，形成完整的<b>“采集 ➜ 融汇 ➜ 提炼 ➜ 创作 ➜ 沉淀”</b>全生命周期双向闭环。
          </p>

          <button
            onClick={() => setActiveTab('workbench')}
            className="flex items-center gap-1 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-gray-900 shadow hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            <span>立即进入创作工作台</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bento Grid layout statistics */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">系统双向同步链路大盘</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {bentoStats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(item.tab)}
                className={`p-4 rounded-2xl border border-gray-100/60 transition-all cursor-pointer select-none flex flex-col justify-between h-32 ${item.bg}`}
              >
                <div className="h-8 w-8 rounded-lg bg-white/80 border flex items-center justify-center shadow-xs">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-gray-400 font-bold truncate leading-none mb-1">{item.label}</p>
                  <p className="text-lg font-black font-mono leading-none">{item.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured system Walkthrough explaining the 6 core components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Document map capacity details card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 uppercase flex items-center gap-2">
            <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
            系统六大核心功能流转地图
          </h3>

          <div className="relative border-l-2 border-gray-50 pl-5 ml-2.5 space-y-6">
            
            {/* Map step 1 */}
            <div className="relative">
              <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black font-mono text-white">
                1
              </span>
              <h4 className="text-xs font-bold text-gray-900">融合知识库与「合魂合成」技术</h4>
              <p className="text-[11px] text-gray-550 leading-relaxed mt-1">
                支持行业资料、微信旧文批量导入。系统智能分类打上标签。支持选中某个爆款指南长文提取「灵魂碎片」(voice traits)；并能将多个碎片的写作习惯、发声倾向熔炼，生成综合「最终灵魂（Soul）」。
              </p>
            </div>

            {/* Map step 2 */}
            <div className="relative">
              <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black font-mono text-white">
                2
              </span>
              <h4 className="text-xs font-bold text-gray-900">AI 员工生命周期管理 + 灵魂注入</h4>
              <p className="text-[11px] text-gray-550 leading-relaxed mt-1">
                支持选题、研究、写作在内的多岗位员工管理。每一个员工都可以深度和刚才合成出的「Soul」灵魂人设绑定，彻底改变单纯大语言模型死板说话、缺乏网感和企业个性的通病。
              </p>
            </div>

            {/* Map step 3 */}
            <div className="relative">
              <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black font-mono text-white">
                3
              </span>
              <h4 className="text-xs font-bold text-gray-900">多工位并行爆款生产大工作台</h4>
              <p className="text-[11px] text-gray-550 leading-relaxed mt-1">
                支持并行建立多档创作任务。可使用“选题创作模式”（两步走：AI选题拓展 ➜ 选择方案 ➜ 研究事实查核快报 ➜ 一人千面分平台精修最终文）；亦支持直接一键输出微信、小红书、微博、抖音分发稿，草稿支持一键沉淀、无底洞追加知识库本地管理。
              </p>
            </div>

          </div>
        </div>

        {/* Closed-loop data architecture diagram visual */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-gray-800 uppercase flex items-center gap-2">
            <Shuffle className="h-4.5 w-4.5 text-indigo-600" />
            双向回流・无感自动沉积闭环流程
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box A: Web Crawler auto loop */}
            <div className="p-4 rounded-xl border border-indigo-150/50 bg-indigo-50/5 space-y-2">
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-indigo-600 animate-pulse" />
                <h4 className="text-xs font-bold text-gray-900">爬虫渠道采集沉淀</h4>
              </div>
              <p className="text-[11px] text-gray-505 leading-relaxed">
                创建针对微信公众号、小红书或企业外部站的定时爬虫任务。采集提取出的干净图文正文，将<b>无需二次备份，自动流转并沉淀存储到主数据库文献库中。</b>
              </p>
            </div>

            {/* Box B: CRM / ERP sync feedback loop */}
            <div className="p-4 rounded-xl border border-indigo-150/50 bg-indigo-50/5 space-y-2">
              <div className="flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-gray-900">ERP/CRM 业务数据复用</h4>
              </div>
              <p className="text-[11px] text-gray-505 leading-relaxed">
                实时探知 CRM 客诉与 ERP 清单。点击一键数据自动回流本地库，AI员工一键可按此商品卖点、退货理由生成最符合品牌特质的宣发定制公关文书。
              </p>
            </div>

          </div>

          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/10 text-xs text-emerald-800 flex items-start gap-1.5 leading-normal">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              💡 <b>大闭环：</b>
              采集(外部链接/系统数据) ➜ 融会(自动分类打上标签) ➜ 提炼炼魂(灵魂特征卡) ➜ 工作台并行创作(多新媒体适配) ➜ 数据沉淀(文稿一键进KB再复用)。这在行业上组成了多智能体的生态壁垒。
            </span>
          </div>

          <div className="border border-dashed border-gray-150 rounded-xl p-4 text-center text-xs text-gray-400">
            📊 <b>系统当前状态判定：</b> 全系统 6 大核心模块及全域认知已达 <b>100% 融合打通</b>。
          </div>
        </div>

      </div>

    </div>
  );
}
