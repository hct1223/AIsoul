/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Users, 
  FileCheck,
  RefreshCw,
  Sparkles,
  Award
} from 'lucide-react';
import { ContentTask, AIEmployee } from '../types';

interface ContentDashboardProps {
  tasks: ContentTask[];
  employees: AIEmployee[];
}

// 7-day realistic historical background tasks to merge with live actions
const HISTORICAL_TASKS: ContentTask[] = [
  {
    id: "hist-1",
    topic: "AI Agent 在现代新媒体营销中的落地闭环与实操趋势",
    createTime: "2026-05-29 10:24",
    status: "completed",
    platforms: ["微信公众号", "微博"],
    mode: "选题",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "微信公众号": "a".repeat(1850), "微博": "a".repeat(300) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-2",
    topic: "企业私有化部署深度学习知识库与自沉淀机制实装",
    createTime: "2026-05-30 14:15",
    status: "completed",
    platforms: ["小红书", "微信公众号"],
    mode: "直接",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "小红书": "b".repeat(950), "微信公众号": "b".repeat(2100) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-3",
    topic: "多模态大语言模型创意风格微调测评",
    createTime: "2026-05-31 09:12",
    status: "failed",
    platforms: ["微博"],
    mode: "选题",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-4",
    topic: "『灵魂装配 (Soul Assembly)』前沿技术与产品设计概念探讨",
    createTime: "2026-06-01 16:40",
    status: "completed",
    platforms: ["小红书", "抖音"],
    mode: "选题",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "小红书": "c".repeat(1200), "抖音": "c".repeat(800) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-5",
    topic: "端到端自动化业务流在多端内容发布的应用实践",
    createTime: "2026-06-02 11:05",
    status: "completed",
    platforms: ["微信公众号"],
    mode: "直接",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "微信公众号": "d".repeat(2450) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-6",
    topic: "多端智能体联邦网络：让 AI 员工拥有组织协同意识",
    createTime: "2026-06-03 15:30",
    status: "completed",
    platforms: ["微博", "小红书", "抖音"],
    mode: "选题",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "微博": "e".repeat(240), "小红书": "e".repeat(880), "抖音": "e".repeat(500) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  },
  {
    id: "hist-7",
    topic: "爆款短视频文案的节奏学：前3秒黄金Hook design法则与实操",
    createTime: "2026-06-04 08:22",
    status: "completed",
    platforms: ["抖音", "小红书"],
    mode: "直接",
    currentStep: "done",
    boundEmployees: { topicOfficerId: "emp-1", researchOfficerId: "emp-2", writerOfficerId: "emp-3" },
    finalDrafts: { "抖音": "f".repeat(450), "小红书": "f".repeat(1100) },
    logs: [],
    sourceDocIds: [],
    enableWebSearch: true
  }
];

export default function ContentDashboard({ tasks, employees }: ContentDashboardProps) {
  // Option to see Live Tasks only or Include Historical Baseline data
  const [dataSource, setDataSource] = useState<'mixed' | 'live'>('mixed');

  // Unified task array based on switcher choice
  const unifiedTasks = useMemo(() => {
    if (dataSource === 'live') {
      return tasks;
    }
    // Filter duplicates just in case some real IDs clash (unlikely for random IDs)
    const taskIds = new Set(tasks.map(t => t.id));
    const cleanHist = HISTORICAL_TASKS.filter(ht => !taskIds.has(ht.id));
    return [...tasks, ...cleanHist];
  }, [tasks, dataSource]);

  // COLOR CONSTANTS for consistent design
  const COLORS = {
    completed: '#10b981', // emerald-500
    active: '#6366f1',    // indigo-500
    pending: '#f59e0b',   // amber-500
    failed: '#ef4444',    // red-500
    neutralGray: '#94a3b8' // slate-400
  };

  // ----------------------------------------------------
  // METRICS & SCORECARD CALCULATIONS
  // ----------------------------------------------------
  const scorecards = useMemo(() => {
    const total = unifiedTasks.length;
    const completed = unifiedTasks.filter(t => t.status === 'completed').length;
    const failed = unifiedTasks.filter(t => t.status === 'failed').length;
    const pending = unifiedTasks.filter(t => t.status === 'pending').length;
    const active = total - completed - failed - pending;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate total character count generated
    let totalChars = 0;
    let distributedPosts = 0;
    unifiedTasks.forEach(task => {
      if (task.finalDrafts) {
        Object.entries(task.finalDrafts).forEach(([_, draftText]) => {
          if (draftText && typeof draftText === 'string') {
            totalChars += draftText.length;
            distributedPosts += 1;
          }
        });
      }
    });

    return {
      total,
      completed,
      active,
      failed,
      pending,
      completionRate,
      totalChars,
      distributedPosts
    };
  }, [unifiedTasks]);


  // ----------------------------------------------------
  // CHART 1: TASK COMPLETION RATES (Status Donut)
  // ----------------------------------------------------
  const taskStatusPieData = useMemo(() => {
    const { completed, active, pending, failed } = scorecards;
    return [
      { name: '已完成 (Completed)', value: completed, color: COLORS.completed },
      { name: '执行中 (Active)', value: active, color: COLORS.active },
      { name: '等待中 (Pending)', value: pending, color: COLORS.pending },
      { name: '已中断 (Failed)', value: failed, color: COLORS.failed }
    ].filter(item => item.value > 0);
  }, [scorecards]);


  // ----------------------------------------------------
  // CHART 2: CONTENT VOLUME & POSTS OVER TIME (7-Day Composed Chart)
  // ----------------------------------------------------
  const contentVolumeTimeData = useMemo(() => {
    // We group by day. We will plot the last 7 days: e.g. 05-29 through 06-04 based on UTC
    const dates = ['05-29', '05-30', '05-31', '06-01', '06-02', '06-03', '06-04'];
    
    // Map of day index or simplified day string to counts
    const dataByDay = dates.reduce<Record<string, { characters: number; posts: number; totalTasks: number }>>((acc, d) => {
      acc[d] = { characters: 0, posts: 0, totalTasks: 0 };
      return acc;
    }, {});

    unifiedTasks.forEach(task => {
      // Parse day from formatted string like "2026-06-04 08:22" or "2026-06-04T08:22..."
      const datePart = task.createTime ? task.createTime.substring(0, 10) : '';
      if (datePart) {
        // match datePart's month-day like "06-04" 
        const mdKey = datePart.substring(5, 10); // "06-04"
        if (dataByDay[mdKey]) {
          dataByDay[mdKey].totalTasks += 1;
          if (task.finalDrafts) {
            Object.entries(task.finalDrafts).forEach(([_, dText]) => {
              if (dText && typeof dText === 'string') {
                dataByDay[mdKey].characters += dText.length;
                dataByDay[mdKey].posts += 1;
              }
            });
          }
        } else {
          // If the task date is outside last 7 days range, fall back to adding it to closest day or skip
          // For safe dynamic rendering since users will click "Run Step" inside the workbench today 2026-06-04:
          // map any date containing '06-04' to the latest block
          const fallbackKey = mdKey;
          if (fallbackKey.includes('06-04') || fallbackKey.startsWith('06')) {
            const index = '06-04';
            dataByDay[index].totalTasks += 1;
            if (task.finalDrafts) {
              Object.entries(task.finalDrafts).forEach(([_, dText]) => {
                if (dText && typeof dText === 'string') {
                  dataByDay[index].characters += dText.length;
                  dataByDay[index].posts += 1;
                }
              });
            }
          }
        }
      }
    });

    return dates.map(dKey => ({
      date: dKey,
      '生成字数 (Volume)': dataByDay[dKey].characters,
      '发布篇数 (Posts)': dataByDay[dKey].posts,
      '工单数 (Tasks)': dataByDay[dKey].totalTasks
    }));
  }, [unifiedTasks]);


  // ----------------------------------------------------
  // CHART 3: EMPLOYEE PRODUCTIVITY (Stacked Contribution Bar)
  // ----------------------------------------------------
  const employeeProductivityData = useMemo(() => {
    // Count active participations for each employee
    return employees.map(emp => {
      let topicCount = 0;
      let researchCount = 0;
      let writerCount = 0;

      unifiedTasks.forEach(task => {
        const bound = task.boundEmployees || {};
        if (bound.topicOfficerId === emp.id) {
          topicCount += 1;
        }
        if (bound.researchOfficerId === emp.id) {
          researchCount += 1;
        }
        if (bound.writerOfficerId === emp.id) {
          writerCount += 1;
        }
      });

      const totalInvolved = topicCount + researchCount + writerCount;

      return {
        name: emp.name,
        role: emp.role,
        '选题策划 (Topic)': topicCount,
        '事实求证 (Research)': researchCount,
        '文笔撰写 (Writing)': writerCount,
        efficiencyScore: emp.speed,
        totalInvolved
      };
    }).sort((a,b) => b.totalInvolved - a.totalInvolved);
  }, [unifiedTasks, employees]);

  return (
    <div className="space-y-6">
      
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-gray-700">统计源：</span>
          <span className="text-xs text-gray-500">
            {unifiedTasks.length} 项内容工单活动量汇总（共含 {employees.length} 位核心 AI 员工运营实绩）
          </span>
        </div>

        {/* Data Source Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-50 border rounded-xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setDataSource('mixed')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              dataSource === 'mixed'
                ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            📊 实操 + 历史基准聚合
          </button>
          <button
            onClick={() => setDataSource('live')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              dataSource === 'live'
                ? 'bg-emerald-600 text-white shadow-sm border border-emerald-700'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>仅实打实运行中任务 ({tasks.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Cumulative Character Count */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 hover:border-gray-200 transition-all hover:translate-y-[-2px]">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">首创总孵化字数 (Chars)</span>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {scorecards.totalChars.toLocaleString()} <span className="text-xs font-medium text-gray-450">字符</span>
            </h3>
            <p className="text-[9px] text-gray-500 mt-0.5">多岗位AI协同文笔结晶字数</p>
          </div>
        </div>

        {/* Card 2: Cumulative Distribution Pieces */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 hover:border-gray-200 transition-all hover:translate-y-[-2px]">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">分发矩阵汇编数 (Posts)</span>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {scorecards.distributedPosts} <span className="text-xs font-medium text-gray-450">篇稿件</span>
            </h3>
            <p className="text-[9px] text-gray-500 mt-0.5">跨微信、小红书、微博、抖音等端</p>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 hover:border-gray-200 transition-all hover:translate-y-[-2px]">
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">多级任务主产率 (Rate)</span>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {scorecards.completionRate}%
            </h3>
            <div className="w-16 bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${scorecards.completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Team Speed average */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex items-center gap-4 hover:border-gray-200 transition-all hover:translate-y-[-2px]">
          <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">雇员总体活跃指数 (Involved)</span>
            <h3 className="text-xl font-black text-gray-900 mt-1">
              {employees.length} <span className="text-xs font-medium text-gray-450">名高活跃官</span>
            </h3>
            <p className="text-[9px] text-gray-500 mt-0.5">自动匹配工序与人设</p>
          </div>
        </div>

      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1 Box: Content Volume over time (Area/Line) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                内容生产体量趋势（Content Volume / Platforms Over Time）
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                最近7天内孵化的总字数统计（Area，左坐标）与产出适配的新媒体平台成文篇目（Line，右坐标）
              </p>
            </div>
          </div>

          <div className="w-full min-h-[260px] h-[260px]">
            {unifiedTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                暂无实操内容任务数据记录，请在上方切换“实操+历史基准聚合”查看演示大盘
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={contentVolumeTimeData}
                  margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCharacters" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      color: '#f8fafc', 
                      fontSize: '11px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                    labelClassName="font-extrabold pb-1 text-slate-400 text-[10px]"
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="生成字数 (Volume)" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCharacters)" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="发布篇数 (Posts)" 
                    stroke="#f59e0b" 
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2 Box: Task Completion Rates Donut */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
              工双流成功占比（Task Completion & Rates）
            </h4>
            <p className="text-xs text-gray-500">
              全状态比例概览，展示引擎健康和中断占比额度
            </p>
          </div>

          <div className="relative w-full h-[180px] flex items-center justify-center my-4">
            {taskStatusPieData.length === 0 ? (
              <div className="text-xs text-gray-450">暂无可归类统计状态</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskStatusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      color: '#f8fafc', 
                      fontSize: '11px',
                      border: 'none'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Center score label inside donut */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">主流成篇率</span>
              <span className="text-2xl font-black text-gray-800">{scorecards.completionRate}%</span>
            </div>
          </div>

          {/* Bullet indicators and legend below donut chart */}
          <div className="space-y-2 border-t pt-3.5 mt-2">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full block" style={{ backgroundColor: COLORS.completed }} />
                <span className="text-gray-500 truncate">已成篇字稿: {scorecards.completed}件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full block" style={{ backgroundColor: COLORS.active }} />
                <span className="text-gray-500 truncate">调度编制中: {scorecards.active}件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full block" style={{ backgroundColor: COLORS.pending }} />
                <span className="text-gray-500 truncate">等待审核中: {scorecards.pending}件</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full block" style={{ backgroundColor: COLORS.failed }} />
                <span className="text-gray-500 truncate">意外中断: {scorecards.failed}件</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Chart 3 & AI Staff insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Stacked Bar Chart for Employee Productivity (70% space) */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider text-left">
                核心 AI 员工协同服务产出力（Employee Workload & Productivity）
              </h4>
              <p className="text-xs text-gray-500 mt-1 text-left">
                展示具体某位 AI 员工在选题官、研究官、以及写作官不同工种层面的关联工作单频次
              </p>
            </div>
          </div>

          <div className="w-full min-h-[260px] h-[260px]">
            {unifiedTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                暂无实操员工产出统计，启用上方历史关联大盘即可看预加载效能
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeeProductivityData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '12px', 
                      color: '#f8fafc',
                      fontSize: '11px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                  <Bar dataKey="选题策划 (Topic)" stackId="a" fill="#10b981" barSize={32} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="事实求证 (Research)" stackId="a" fill="#3b82f6" barSize={32} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="文笔撰写 (Writing)" stackId="a" fill="#a855f7" barSize={32} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Column 2: AI Staff Speed Rating & Efficiency Leaderboard (30% space) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
              自动匹配 AI 效率大比拼（AI Efficiency Leaderboard）
            </h4>
            <p className="text-xs text-gray-500">
              各 AI 雇员内置基准效率指标，及实际工作流响应速度评估
            </p>
          </div>

          <div className="divide-y divide-gray-50 my-4 flex-1 flex flex-col justify-center">
            {employeeProductivityData.map((emp, idx) => {
              // Select emblem award styles for top employees
              const medalStyles = [
                { text: '🥇', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                { text: '🥈', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
                { text: '🥉', bg: 'bg-orange-50 text-orange-850 border-orange-200' }
              ];
              const medal = idx < 3 ? medalStyles[idx] : { text: `${idx + 1}位`, bg: 'bg-gray-50 text-gray-400 border-gray-100' };

              return (
                <div key={emp.name} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-6 w-8 text-[10px] font-bold rounded-lg border flex items-center justify-center shrink-0 shadow-inner ${medal.bg}`}>
                      {medal.text}
                    </span>
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-800 truncate">{emp.name}</h5>
                      <span className="text-[9px] text-gray-400 font-medium">基准效率：{emp.efficiencyScore}%</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-indigo-600 block">
                      {emp.totalInvolved} <span className="text-[10px] font-medium text-gray-450">件指派</span>
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold">活跃</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-xl border border-indigo-100/50 flex items-center gap-2.5">
            <Award className="h-5 w-5 text-indigo-500 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed text-left">
              <b>系统评星: </b> 选题官 {employees.find(e => e.role === '选题官')?.name || '默认官'} 协同速度敏捷，目前负载合理！
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
