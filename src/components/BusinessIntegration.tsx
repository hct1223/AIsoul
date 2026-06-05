/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Trash2, 
  Link, 
  RefreshCw, 
  Check, 
  Sparkles, 
  BookOpen, 
  Info,
  Server,
  TrendingUp,
  Cpu,
  CornerDownRight,
  Database,
  Loader2
} from 'lucide-react';
import { BusinessConnection, BusinessFeed, AIEmployee } from '../types';

interface BusinessIntegrationProps {
  connections: BusinessConnection[];
  feeds: BusinessFeed[];
  onSyncAllFeeds: () => Promise<void>;
  employees: AIEmployee[];
  docs: any[]; // Knowledge base doc references list
  onUploadDoc: (title: string, content: string, subKbId?: string, fileBase64?: string, fileType?: string) => Promise<any>;
}

export default function BusinessIntegration({
  connections,
  feeds,
  onSyncAllFeeds,
  employees,
  docs,
  onUploadDoc
}: BusinessIntegrationProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  // Custom business copy creator states
  const [selectedFeedId, setSelectedFeedId] = useState<string>('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await onSyncAllFeeds();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateBusinessCopy = async () => {
    if (!selectedFeedId || !selectedEmpId) return;
    setIsGenerating(true);
    try {
      const feed = feeds.find(f => f.id === selectedFeedId);
      const emp = employees.find(e => e.id === selectedEmpId);
      if (!feed || !emp) return;

      // Make a call to Gemini directly proxies via backend upload simulator or dummy state
      const targetTitle = `《[定制业务文]基于${feed.source}的${emp.name}专业转化方案》`;
      const draftContent = `【AI商业深度转化方案】
依据《${feed.title}》业务端最新数据研判：

1. 核心改进策略 (基于 ${emp.name} 人格主脑建议):
配合我们当前的智能中台调度及合魂人格特征。鉴于客诉数据提到的‘AI冷冰冰不够专业且缺乏排版’。我们将正式上线全流程微信公众号精读版排版及小红书富Emo情感引流文法，保证行文更有温度。

2. 定制文案核心立论骨架建议：
- 【黄金开头引发共鸣】：“你绝对不知道！你的智能助手冷言冷语已经赶跑了50%的客户！”
- 【数据对比强力论证】：通过阵列降噪麦克风提升7.5米拾音，ERP清单极速接入CRM。
- 【行动指令】：点击左下方链接，领取企业级AI合魂定制特惠包。

3. 四大新媒体一键分发推荐：
- 微信公众号：重深度，分多点层级，写透V3版硬件带来的音视频质变。
- 小红书：注重情感代入，多用🔥麦克风、🎙️音响等表情包包装，主打“姐妹们避坑！”

本定制报告已被一键流转同步沉积入系统知识库！`;

      await onUploadDoc(targetTitle, draftContent);
      setGeneratedOutput(draftContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const unsyncedCount = feeds.filter(f => f.syncToKbStatus === 'unsynced').length;

  return (
    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)] space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            企业业务数据对接流转中枢
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            将企业的 ERP、CRM 及工单系统无缝打通。业务原料、实时警报动态支持一键同步沉淀入系统资料库，进行人格化定制产出。
          </p>
        </div>

        <button
          onClick={handleSyncClick}
          disabled={isSyncing || unsyncedCount === 0}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center disabled:opacity-50"
        >
          {isSyncing ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>一键外部数据同步流转 ({unsyncedCount} 条就绪)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Aspect: Connected CRM/ERP systems listing and current dynamic feeds */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Active integrations cards */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
              当前活跃的企业级对接端 (Enterprise Sockets)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/5 flex items-start justify-between relative overflow-hidden">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                    <span className="text-xs font-bold text-gray-900">智能销售进销存 ERP</span>
                  </div>
                  <p className="text-[10px] text-gray-400">已打通接口：ERP-API_V26_SYNC_PORT</p>
                  <p className="text-xs text-gray-550 pt-1">全自动监测商品价格、配置规格、库存警告数据。</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">ACTIVE</span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/5 flex items-start justify-between relative overflow-hidden">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                    <span className="text-xs font-bold text-gray-900">智能客诉 CRM 大盘</span>
                  </div>
                  <p className="text-[10px] text-gray-400">已打通接口：CRM-SOCKET_PROD_POOL</p>
                  <p className="text-xs text-gray-550 pt-1">实时监听用户退换货、差评、响应超时及竞品分析警报。</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Incoming Real feeds console */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-indigo-600" />
              企业业务变动直播流 (Active Feeds)
            </h3>

            <div className="space-y-4">
              {feeds.map((feed) => {
                const isSynced = feed.syncToKbStatus === 'synced';
                return (
                  <div 
                    key={feed.id} 
                    className={`p-4 rounded-xl border text-left transition-all relative flex flex-col gap-2.5 ${
                      isSynced 
                        ? 'border-gray-150 bg-gray-50/50' 
                        : 'border-orange-100 bg-orange-50/5 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 border rounded ${
                          isSynced 
                            ? 'bg-gray-100 border-gray-200 text-gray-400' 
                            : 'bg-orange-100 border-orange-200 text-orange-800'
                        }`}>
                          {feed.source}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900">{feed.title}</h4>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isSynced
                          ? 'bg-gray-100 text-gray-400 border-gray-200'
                          : 'bg-orange-500 text-white border-orange-550 animate-pulse'
                      }`}>
                        {isSynced ? '已沉淀入库' : '等待同步'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-mono bg-white/70 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
                      {feed.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>流转业务类型: {feed.category}</span>
                      <span>发生时间: {feed.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Aspect: Customized synthesis action card */}
        <div className="space-y-8">
          
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-450 text-white">
                👑
              </span>
              <h4 className="text-sm font-bold tracking-wider uppercase">业务定制化内容一键速产</h4>
            </div>

            <p className="text-xs text-indigo-250 leading-relaxed">
              根据外部同步进来的某种商品规格书或CRM预警客诉，配合绑定了专属合魂人格的AI员工，一键产出针对性强的行业破局PR文、客服高转高排版文案方案！
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1">选择对应的业务源</label>
                <select
                  value={selectedFeedId}
                  onChange={(e) => setSelectedFeedId(e.target.value)}
                  className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-3 py-2 text-indigo-105 focus:outline-none"
                >
                  <option value="" className="text-indigo-950">-- 请选取已同步的系统变动 --</option>
                  {feeds.map(f => (
                    <option key={f.id} value={f.id} className="text-indigo-950">{f.title.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-indigo-300 mb-1">指派专属 AI 员工</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full text-xs bg-indigo-950/70 border border-indigo-700/50 rounded-xl px-3 py-2 text-indigo-105 focus:outline-none"
                >
                  <option value="" className="text-indigo-950">-- 选择常驻员工 --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id} className="text-indigo-950">{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              {selectedFeedId && selectedEmpId && (
                <button
                  type="button"
                  onClick={handleCreateBusinessCopy}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-orange-550 hover:bg-orange-600 text-white font-bold py-2.5 text-xs transition-transform transform active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Cpu className="h-3.5 w-3.5 animate-spin" />
                      <span>正在撰写企业高能PR文书...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-scaleOpen" />
                      <span>一键编译定制运营分发文草稿</span>
                    </>
                  )}
                </button>
              )}

              {/* Show Generated Preview */}
              {generatedOutput && (
                <div className="space-y-2 border-t border-indigo-800/60 pt-4 animate-fadeIn">
                  <span className="text-[10px] text-gray-300 uppercase font-mono block">定制文案效果预览（已自动同步至本地库）：</span>
                  <div className="rounded-lg bg-indigo-950 text-indigo-200 border border-indigo-800/40 p-3 h-40 overflow-y-auto text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                    {generatedOutput}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
