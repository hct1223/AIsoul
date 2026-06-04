/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  HelpCircle, 
  Cpu, 
  Trash2, 
  Minimize2,
  Sparkles,
  RefreshCw,
  CornerDownRight
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from '../types';

interface SystemChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => void;
  isFloatingDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export default function SystemChatbot({
  chatHistory,
  onSendMessage,
  onClearHistory,
  isFloatingDrawer = false,
  onCloseDrawer
}: SystemChatbotProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestionPrompts = [
    { text: "炼魂与合魂的工作逻辑是什么？", icon: "🔮" },
    { text: "自动爬虫如何一键沉淀、双向回流？", icon: "🌐" },
    { text: "告诉我大闭环文案生产的两种创作区别？", icon: "⚡" },
    { text: "教我如何将 CRM 业务警告转为小红书吐槽文", icon: "💎" }
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const textToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      await onSendMessage(textToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (promptText: string) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onSendMessage(promptText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white font-sans ${
      isFloatingDrawer 
        ? 'w-96 border-l border-gray-150 shadow-2xl animate-slideLeft z-40 fixed right-0 top-0 bottom-0 h-screen' 
        : 'flex-1'
    }`}>
      
      {/* Top Banner / Chat Info bar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              全域人工智能向导
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-gray-500">掌握知识库、AI员工、爬虫、ERP大闭环全域逻辑</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearHistory}
            className="text-gray-400 hover:text-red-500 hover:bg-gray-100 p-1.8 rounded-lg transition-colors cursor-pointer"
            title="清空聊天记录记录"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {isFloatingDrawer && onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.8 rounded-lg transition-colors cursor-pointer"
              title="收起栏目"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream list container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50/20">
        
        {/* Welcome greeting card if empty */}
        {chatHistory.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 animate-scaleOpen">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-bounce" />
              <h4 className="text-xs font-bold text-gray-800">您好！我是本管理系统的全域认知助理</h4>
            </div>
            
            <p className="text-xs text-gray-500 leading-normal">
              我深度内置了对当前系统中<b>“自动文档智能分类”</b>、<b>“🔮 人格炼魂与合魂合成”</b>、<b>“多岗位并行任务选题官/研究官/写作官调度”</b>以及<b>“ERP销售、CRM客诉数据同步与爬虫沉淀回流大闭环”</b>的全部业务常识。
            </p>
            
            <p className="text-xs font-semibold text-gray-700">您可以直接询问我以下推荐的高频调优痛点：</p>

            <div className="grid grid-cols-1 gap-2 pt-1.5">
              {suggestionPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(p.text)}
                  className="flex items-center gap-2 text-left text-xs bg-gray-50 hover:bg-indigo-50 hover:text-indigo-900 border border-gray-100 p-3 rounded-xl transition-all font-medium group cursor-pointer"
                >
                  <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">{p.icon}</span>
                  <span className="flex-1 min-w-0 truncate">{p.text}</span>
                  <CornerDownRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Existing thread cards rendering */}
        {chatHistory.map((msg) => {
          const isModel = msg.role === 'model';
          return (
            <div 
              key={msg.id} 
              className={`flex gap-3.5 max-w-[85%] ${
                isModel ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'
              }`}
            >
              {/* Bubble Avatar indicator */}
              <div className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center shrink-0 border shadow-xs ${
                isModel ? 'bg-indigo-600 text-white border-indigo-650' : 'bg-gray-100 text-gray-700'
              }`}>
                {isModel ? <Bot className="h-4.5 w-4.5" /> : 'User'}
              </div>

              {/* Message Bubble content text */}
              <div className={`rounded-2xl px-4 py-3 border text-xs shadow-xs leading-relaxed space-y-2 relative overflow-hidden ${
                isModel 
                  ? 'bg-white border-gray-100 text-gray-800' 
                  : 'bg-indigo-600 border-indigo-650 text-white font-medium'
              }`}>
                {isModel ? (
                  <div className="markdown-body">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                
                <span className={`text-[8px] font-mono block text-right mt-1.5 ${
                  isModel ? 'text-gray-400' : 'text-indigo-200'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Floating loading spinner */}
        {isLoading && (
          <div className="flex gap-3.5 max-w-[85%] self-start mr-auto animate-pulse">
            <div className="h-8.5 w-8.5 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 animate-spin">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white border border-gray-100 shadow-xs flex items-center gap-1 text-xs text-gray-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1">向导脑力风暴加载全域常识中...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input container footer */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex items-center gap-2">
        <input
          type="text"
          placeholder="问些什么...（如：怎么提取灵魂？）"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 w-full text-xs border border-gray-150 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550/10"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-550/10 transition-all font-bold shrink-0 cursor-pointer disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
