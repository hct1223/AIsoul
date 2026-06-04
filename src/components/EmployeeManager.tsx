/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  UserPlus, 
  ShieldCheck, 
  Cpu,
  Bookmark,
  Zap,
  BarChart2
} from 'lucide-react';
import { AIEmployee, Soul } from '../types';

interface EmployeeManagerProps {
  employees: AIEmployee[];
  souls: Soul[];
  onSaveEmployee: (employeeData: Partial<AIEmployee>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
}

export default function EmployeeManager({
  employees,
  souls,
  onSaveEmployee,
  onDeleteEmployee
}: EmployeeManagerProps) {
  // Opening form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧙');
  const [role, setRole] = useState<'选题官' | '研究官' | '写作官' | 'custom'>('custom');
  const [soulId, setSoulId] = useState<string>('');
  const [bio, setBio] = useState('');
  const [customTagsText, setCustomTagsText] = useState('');
  const [speed, setSpeed] = useState(80);
  const [creativity, setCreativity] = useState(80);
  const [reasoning, setReasoning] = useState(80);

  const handleOpenAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setAvatar('🧙');
    setRole('custom');
    setSoulId('');
    setBio('');
    setCustomTagsText('');
    setSpeed(80);
    setCreativity(80);
    setReasoning(80);
  };

  const handleOpenEdit = (emp: AIEmployee) => {
    setIsEditing(true);
    setEditingId(emp.id);
    setName(emp.name);
    setAvatar(emp.avatar);
    setRole(emp.role);
    setSoulId(emp.soulId || '');
    setBio(emp.bio);
    setCustomTagsText(emp.tags.join(', '));
    setSpeed(emp.speed);
    setCreativity(emp.creativity);
    setReasoning(emp.reasoning);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = customTagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload: Partial<AIEmployee> = {
      name,
      avatar,
      role,
      soulId: soulId || null,
      bio,
      tags,
      speed,
      creativity,
      reasoning
    };

    if (editingId) {
      payload.id = editingId;
    }

    await onSaveEmployee(payload);
    setIsEditing(false);
    setEditingId(null);
  };

  const getSoulName = (id: string | null) => {
    if (!id) return null;
    const soul = souls.find(s => s.id === id);
    return soul ? soul.name : '未知灵魂卡';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans">
      
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            AI 智能虚拟员工管理处
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            为虚拟的选题、研究和写作岗位管理AI员工的生命周期，并可将其与炼制的「Souls 人格」绑定以激发新创作能力
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-700 transition-all flex items-center gap-1 w-fit shrink-0 self-start sm:self-center"
        >
          <UserPlus className="h-4 w-4" />
          <span>自主孵化AI新雇员</span>
        </button>
      </div>

      {/* Grid of employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => {
          const associatedSoul = getSoulName(emp.soulId);
          return (
            <div 
              key={emp.id} 
              className={`bg-white rounded-2xl border ${
                emp.isDefault ? 'border-emerald-100 bg-emerald-50/5' : 'border-gray-100'
              } p-6 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md`}
            >
              {/* Top Row: Avatar & Metadata */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  {/* Emoji Avatar Bubble */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-2xl border shadow-inner shrink-0 leading-none">
                    {emp.avatar}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {emp.isDefault && (
                      <span className="text-[10px] uppercase font-mono bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded shrink-0">
                        内置核心岗
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border shrink-0">
                      步骤流角色: {emp.role}
                    </span>
                  </div>
                </div>

                {/* Name & Bio */}
                <div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                    {emp.name}
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {emp.id}</p>
                  <p className="text-xs font-medium text-gray-550 leading-relaxed mt-2.5 min-h-[50px]">
                    {emp.bio}
                  </p>
                </div>

                {/* Bound Soul Card representation */}
                <div className="pt-3 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-450 uppercase flex items-center gap-1">
                    <Bookmark className="h-3 w-3 text-indigo-500" />
                    已绑定的合魂主脑
                  </span>
                  
                  {associatedSoul ? (
                    <div className="mt-1.5 flex items-center justify-between rounded-xl bg-indigo-50/70 border border-indigo-100/50 px-3.5 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-indigo-950 truncate">{associatedSoul}</p>
                        <p className="text-[8px] text-indigo-600 font-medium">Soul-Link Active</p>
                      </div>
                      <span className="text-xs text-indigo-500 animate-pulse">🔮</span>
                    </div>
                  ) : (
                    <div className="mt-1.5 rounded-xl bg-orange-50 border border-orange-100/30 px-3.5 py-2 text-center">
                      <p className="text-xs text-orange-950 font-bold">空虚的灵魂本底</p>
                      <button 
                        onClick={() => handleOpenEdit(emp)}
                        className="text-[10px] text-orange-700 hover:underline font-semibold mt-0.5 inline-block"
                      >
                        去配置绑定灵魂 ➜
                      </button>
                    </div>
                  )}
                </div>

                {/* Core Stats Progress Bars */}
                <div className="space-y-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-505 mb-1">
                      <span>效率 (Speed)</span>
                      <span className="font-mono">{emp.speed}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${emp.speed}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-505 mb-1">
                      <span>创意 (Creativity)</span>
                      <span className="font-mono">{emp.creativity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${emp.creativity}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-505 mb-1">
                      <span>逻辑逻辑严密性 (Logic)</span>
                      <span className="font-mono">{emp.reasoning}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${emp.reasoning}%` }} />
                    </div>
                  </div>
                </div>

                {/* Tags mapping */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {emp.tags.map((tag, i) => (
                    <span key={i} className="text-[9px] font-mono bg-gray-100/60 text-gray-500 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Edit & Delete buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-4">
                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 py-1.8 rounded-lg border border-gray-100 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>修改配置</span>
                </button>
                <button
                  onClick={() => onDeleteEmployee(emp.id)}
                  className="p-1.8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over or Popup Edit Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full overflow-hidden shadow-2xl relative block">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm tracking-wide">
                {editingId ? "修改现役 AI 员工档案" : "新建虚拟智能 AI 雇员"}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-white border rounded-lg px-2.5 py-1.5"
              >
                关闭
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Name and Avatar Selection */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">员工全名 (例如: AI选题官-灵犀)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入姓名"
                    className="w-full text-sm border border-gray-150 rounded-xl px-3.5 py-2 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">头像</label>
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full text-sm border border-gray-150 rounded-xl px-3.5 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="🧙">🧙</option>
                    <option value="🎯">🎯</option>
                    <option value="🕵️‍♂️">🕵️‍♂️</option>
                    <option value="✍️">✍️</option>
                    <option value="🤖">🤖</option>
                    <option value="🚀">🚀</option>
                    <option value="🦄">🦄</option>
                    <option value="🧐">🧐</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Role and Soul Bind */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">工位岗位职责</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full text-sm border border-gray-150 rounded-xl px-3.5 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="选题官">AI 选题官</option>
                    <option value="研究官">AI 研究官</option>
                    <option value="写作官">AI 写作官</option>
                    <option value="custom">高级定制智能员工</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    注入绑定「灵魂」🔮
                  </label>
                  <select
                    value={soulId}
                    onChange={(e) => setSoulId(e.target.value)}
                    className="w-full text-sm border border-gray-150 rounded-xl px-3.5 py-2 focus:border-emerald-505 focus:outline-none font-semibold text-indigo-700 bg-indigo-50/50"
                  >
                    <option value="" className="text-gray-600">-- 不注入(使用空白人设) --</option>
                    {souls.map(s => (
                      <option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio description */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">员工背景介绍与座右铭 (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="如：专注爆款社交博学、行文泼辣有力。一键将复杂的硬核知识软化成高共鸣的朋友圈和微博推文文风。"
                  className="w-full text-xs border border-gray-150 rounded-xl px-3.5 py-2 h-16 focus:border-emerald-505 focus:outline-none"
                />
              </div>

              {/* Tags split by commas */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">技能标签簿 (用英文逗号隔开)</label>
                <input
                  type="text"
                  value={customTagsText}
                  onChange={(e) => setCustomTagsText(e.target.value)}
                  placeholder="如: 文风活泼, 金句连连, 洞察深厚"
                  className="w-full text-xs border border-gray-150 rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Stats Range Sliders */}
              <div className="space-y-3 pt-2 bg-gray-50 p-4 rounded-xl border">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  智能效率及三大硬核属性面板
                </p>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 pb-1">
                    <span>生产效率 (Speed)</span>
                    <span>{speed}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 pb-1">
                    <span>脑洞创意 (Creativity)</span>
                    <span>{creativity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={creativity}
                    onChange={(e) => setCreativity(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 pb-1">
                    <span>严密逻辑 (Logic)</span>
                    <span>{reasoning}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={reasoning}
                    onChange={(e) => setReasoning(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  保存员工档案并进行神经链路映射 ➜
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
