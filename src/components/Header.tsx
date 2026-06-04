/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, Users, Sparkles, BookOpen, Clock, Bot } from 'lucide-react';
import { KBDocument, AIEmployee, ContentTask } from '../types';

interface HeaderProps {
  docs: KBDocument[];
  employees: AIEmployee[];
  tasks: ContentTask[];
  onOpenAssistant: () => void;
}

export default function Header({ docs, employees, tasks, onOpenAssistant }: HeaderProps) {
  const activeTasksCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'failed' && t.status !== 'pending').length;
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-8 py-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-400 border border-white" />
        </div>
        <div>
          <h1 className="font-sans text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
            AI 智能创作与知识库管理系统
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
              多智能体协作 V2.0
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            全闭环多岗位协同・人格提炼（合魂）・多端同步与沉淀系统
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Statistics Widgets */}
        <div className="hidden lg:flex items-center gap-6 border-r border-gray-100 pr-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">知识库文档</p>
              <p className="text-xs font-bold font-mono text-gray-800">{docs.length} 篇</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">虚拟员工</p>
              <p className="text-xs font-bold font-mono text-gray-800">{employees.length} 位</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-gray-50 p-2 text-gray-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">并行任务</p>
              <p className="text-xs font-bold font-mono text-gray-800">
                {activeTasksCount} 运行 / {totalCompleted} 完工
              </p>
            </div>
          </div>
        </div>

        {/* Global Floating Cognitive AI Assistant Toggle */}
        <button
          onClick={onOpenAssistant}
          className="group relative flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95"
        >
          <Bot className="h-4.5 w-4.5 group-hover:rotate-12 transition-transform" />
          <span>全域智能向导</span>
          <span className="absolute -top-1.5 -right-1 box-content flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
          </span>
        </button>
      </div>
    </header>
  );
}
