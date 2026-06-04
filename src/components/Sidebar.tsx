/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  PenTool, 
  Globe, 
  Share2, 
  HelpCircle,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export type SidebarTab = 'workspace' | 'kb' | 'employees' | 'workbench' | 'crawler' | 'business' | 'help';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  openaiOk: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, openaiOk }: SidebarProps) {
  const menuItems = [
    { id: 'workspace' as const, label: '工作台首页', icon: LayoutDashboard, desc: '数据统计与运行看板' },
    { id: 'kb' as const, label: '融合知识库', icon: Database, desc: '文件分类与「人格炼魂」' },
    { id: 'employees' as const, label: 'AI 员工管理', icon: Users, desc: '员工生命周期与灵魂绑定' },
    { id: 'workbench' as const, label: '创作工作台', icon: PenTool, desc: '双模式多端爆款文编译' },
    { id: 'crawler' as const, label: '高智能爬虫', icon: Globe, desc: '目标链接抓取与沉淀闭环' },
    { id: 'business' as const, label: '业务系统对接', icon: Share2, desc: '业务数据流同步与特色文' },
    { id: 'help' as const, label: '全域认知问答', icon: HelpCircle, desc: '向导答疑与参数调校专家' },
  ];

  return (
    <aside className="flex h-[calc(100vh-73px)] w-64 flex-col border-r border-gray-100 bg-[#fbfcfd] px-4 py-6 justify-between select-none shrink-0 font-sans">
      <div className="flex flex-col gap-6">
        <div className="px-3 py-2 bg-emerald-50/50 border border-emerald-100/50 rounded-xl flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-800">创作引擎运行就绪</span>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all relative ${
                  isActive
                    ? 'bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-600/10'
                    : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <div className="flex flex-col">
                  <span className="text-sm tracking-wide">{item.label}</span>
                  <span className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {item.desc}
                  </span>
                </div>
                {isActive && (
                  <span className="absolute right-3.5 h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Safety Compliance Badge */}
      <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <p className="text-xs font-bold text-gray-700">Gemini 安全防护</p>
        </div>
        <p className="text-[10px] text-gray-400 leading-normal">
          模型对接安全过滤系统已激活。所有文案生产、资料爬取及提魂碎片融合完全合规。
        </p>
      </div>
    </aside>
  );
}
