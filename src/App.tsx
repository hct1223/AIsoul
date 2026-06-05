/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar, { SidebarTab } from './components/Sidebar';
import WorkspaceHome from './components/WorkspaceHome';
import KnowledgeBase from './components/KnowledgeBase';
import EmployeeManager from './components/EmployeeManager';
import ContentWorkbench from './components/ContentWorkbench';
import CrawlerModule from './components/CrawlerModule';
import BusinessIntegration from './components/BusinessIntegration';
import SystemChatbot from './components/SystemChatbot';
import { 
  KBDocument, 
  SoulFragment, 
  Soul, 
  AIEmployee, 
  ContentTask, 
  CrawlerTask, 
  BusinessFeed, 
  ChatMessage,
  SubKnowledgeBase
} from './types';

export default function App() {
  const [activeTab, setActiveTab ] = useState<SidebarTab>('kb');
  
  // Floating AI chatbot drawer toggle state (open from Header)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Core application database states
  const [docs, setDocs] = useState<KBDocument[]>([]);
  const [fragments, setFragments] = useState<SoulFragment[]>([]);
  const [souls, setSouls] = useState<Soul[]>([]);
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [tasks, setTasks] = useState<ContentTask[]>([]);
  const [crawlers, setCrawlers] = useState<CrawlerTask[]>([]);
  const [feeds, setFeeds] = useState<BusinessFeed[]>([]);
  const [subKbs, setSubKbs] = useState<SubKnowledgeBase[]>([]);
  const [stepDefaults, setStepDefaults] = useState({
    topicOfficerId: 'emp-1',
    researchOfficerId: 'emp-2',
    writerOfficerId: 'emp-3'
  });

  // Comprehensive AI chatbot assistant threads
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Hydrate full system values on mount
  const loadWorkspaceState = async () => {
    try {
      const res = await fetch('/api/initial-state');
      if (res.ok) {
        const db = await res.json();
        setDocs(db.docs || []);
        setFragments(db.fragments || []);
        setSouls(db.souls || []);
        setEmployees(db.employees || []);
        setTasks(db.tasks || []);
        setCrawlers(db.crawlers || []);
        setFeeds(db.feeds || []);
        setSubKbs(db.subKbs || []);
        if (db.stepDefaults) {
          setStepDefaults(db.stepDefaults);
        }
      }
    } catch (err) {
      console.error("Failed to fetch initial workspace state:", err);
    }
  };

  useEffect(() => {
    loadWorkspaceState();
  }, []);

  // 1. KNOWLEDGE BASE HANDLERS

  const handleUploadDoc = async (title: string, content: string, subKbId?: string, fileBase64?: string, fileType?: string) => {
    try {
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, subKbId, fileBase64, fileType })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.doc) {
          setDocs(prev => [data.doc, ...prev]);
          return { success: true, doc: data.doc };
        } else {
          return { success: false, error: data.error || '上传解析失败' };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || '服务器请求失败' };
      }
    } catch (err: any) {
      console.error("Error uploading doc:", err);
      return { success: false, error: err.message || '网络连接失败' };
    }
  };

  const handleCreateSubKb = async (name: string, description?: string) => {
    try {
      const res = await fetch('/api/kb/subkbs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subKb) {
          setSubKbs(prev => [...prev, data.subKb]);
        }
      }
    } catch (err) {
      console.error("Error creating subkb:", err);
    }
  };

  const handleDeleteSubKb = async (id: string) => {
    try {
      const res = await fetch('/api/kb/subkbs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          await loadWorkspaceState();
        }
      }
    } catch (err) {
      console.error("Error deleting subkb:", err);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch('/api/kb/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting doc:", err);
    }
  };

  const handleMoveDoc = async (id: string, subKbId: string) => {
    try {
      const res = await fetch('/api/kb/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, subKbId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.doc) {
          setDocs(prev => prev.map(d => d.id === id ? { ...d, subKbId: data.doc.subKbId } : d));
        }
      }
    } catch (err) {
      console.error("Error moving doc:", err);
    }
  };

  const handleExtractFragment = async (docId: string, fragmentName: string) => {
    try {
      const res = await fetch('/api/kb/extract-soul-fragment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, fragmentName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fragment) {
          setFragments(prev => [data.fragment, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error extracting fragment:", err);
    }
  };

  const handleSynthesizeSoul = async (docIds: string[], subKbId: string, soulName: string, soulDescription: string) => {
    try {
      const res = await fetch('/api/kb/synthesize-soul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIds, subKbId, soulName, soulDescription })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.soul) {
          setSouls(prev => [data.soul, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error synthesizing soul:", err);
    }
  };

  const handleDeleteSoul = async (id: string) => {
    try {
      const res = await fetch('/api/kb/delete-soul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSouls(prev => prev.filter(s => s.id !== id));
        setFragments(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error("Error deleting soul:", err);
    }
  };


  // 2. AI EMPLOYEES MANAGEMENTS

  const handleSaveEmployee = async (employeeData: Partial<AIEmployee>) => {
    try {
      const res = await fetch('/api/employees/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.employee) {
          setEmployees(prev => {
            const index = prev.findIndex(e => e.id === data.employee.id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = data.employee;
              return updated;
            } else {
              return [...prev, data.employee];
            }
          });
        }
      }
    } catch (err) {
      console.error("Error saving employee:", err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEmployees(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };


  // 3. UNIVERSAL STEP PRESETS WRITE

  const handleSavePresets = async (topicId: string, researchId: string, writerId: string) => {
    try {
      const res = await fetch('/api/settings/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOfficerId: topicId,
          researchOfficerId: researchId,
          writerOfficerId: writerId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStepDefaults(data.presets);
        }
      }
    } catch (err) {
      console.error("Error saving step defaults presets:", err);
    }
  };


  // 4. CREATOR WORKBENCH SCHEDULER HANDLERS

  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          setTasks(prev => [data.task, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error creating creative task:", err);
    }
  };

  const handleRunTaskStep = async (taskId: string, step: string, selectedTopic?: string) => {
    try {
      const res = await fetch('/api/tasks/run-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, step, selectedTopic })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          setTasks(prev => {
            const index = prev.findIndex(t => t.id === taskId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = data.task;
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("Error running task step workflow:", err);
    }
  };

  const handleSaveToKB = async (taskId: string, platform: string, title?: string) => {
    try {
      const res = await fetch('/api/tasks/save-to-kb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, platform, title })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.doc) {
          setDocs(prev => [data.doc, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error sinking to knowledge base:", err);
    }
  };


  // 5. CRAWLERS TRIGGER CHANNELS

  const handleCreateCrawler = async (name: string, platform: string, link: string) => {
    try {
      const res = await fetch('/api/crawlers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, link })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.crawler) {
          setCrawlers(prev => [data.crawler, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error saving crawler rule:", err);
    }
  };

  const handleRunCrawler = async (id: string) => {
    try {
      const res = await fetch('/api/crawlers/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.crawler) {
          setCrawlers(prev => {
            const index = prev.findIndex(c => c.id === id);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = data.crawler;
              return updated;
            }
            return prev;
          });
          // Refresh docs because crawled items are synced to Kb doc automatic 
          await loadWorkspaceState();
        }
      }
    } catch (err) {
      console.error("Error running crawling job:", err);
    }
  };


  // 6. BUSINESS INTERNALS SPEC SYNCING 

  const handleSyncAllFeeds = async () => {
    try {
      const res = await fetch('/api/business/sync-all', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Re-inflate feeds & docs state
          await loadWorkspaceState();
        }
      }
    } catch (err) {
      console.error("Error syncing ERP CRM feeds:", err);
    }
  };


  // 7. OMNISCIENT CHATBOT DISPATCHER

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: "msg-user-" + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.response) {
          const modelMessage: ChatMessage = {
            id: "msg-model-" + Date.now(),
            role: 'model',
            content: data.response,
            timestamp: new Date().toLocaleTimeString()
          };
          setChatHistory(prev => [...prev, modelMessage]);
        }
      }
    } catch (err) {
      console.error("Error messaging assistant chatbot:", err);
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
  };


  // Conditionally render main active tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workspace':
        return (
          <WorkspaceHome
            docsCount={docs.length}
            subKbsCount={subKbs.length}
            soulsCount={souls.length}
            employeesCount={employees.length}
            tasksCount={tasks.length}
            crawlersCount={crawlers.length}
            feedsCount={feeds.length}
            setActiveTab={setActiveTab}
          />
        );
      case 'kb':
        return (
          <KnowledgeBase
            docs={docs}
            souls={souls}
            subKbs={subKbs}
            onUploadDoc={handleUploadDoc}
            onDeleteDoc={handleDeleteDoc}
            onSynthesizeSoul={handleSynthesizeSoul}
            onDeleteSoul={handleDeleteSoul}
            onCreateSubKb={handleCreateSubKb}
            onDeleteSubKb={handleDeleteSubKb}
            onMoveDoc={handleMoveDoc}
          />
        );
      case 'employees':
        return (
          <EmployeeManager
            employees={employees}
            souls={souls}
            onSaveEmployee={handleSaveEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'workbench':
        return (
          <ContentWorkbench
            tasks={tasks}
            docs={docs}
            employees={employees}
            stepDefaults={stepDefaults}
            onSavePresets={handleSavePresets}
            onCreateTask={handleCreateTask}
            onRunTaskStep={handleRunTaskStep}
            onSaveToKB={handleSaveToKB}
          />
        );
      case 'crawler':
        return (
          <CrawlerModule
            crawlers={crawlers}
            docs={docs}
            onCreateCrawler={handleCreateCrawler}
            onRunCrawler={handleRunCrawler}
          />
        );
      case 'business':
        return (
          <BusinessIntegration
            connections={[]} // Handled with fixed mock statuses directly in module design
            feeds={feeds}
            onSyncAllFeeds={handleSyncAllFeeds}
            employees={employees}
            docs={docs}
            onUploadDoc={handleUploadDoc}
          />
        );
      case 'help':
        return (
          <div className="flex-1 flex overflow-hidden">
            <SystemChatbot
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearHistory={handleClearHistory}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50/5 select-none font-sans antialiased text-gray-800">
      
      {/* Global Header */}
      <Header 
        docs={docs} 
        employees={employees} 
        tasks={tasks} 
        onOpenAssistant={() => setIsAssistantOpen(!isAssistantOpen)} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar panels */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            // Auto minimizeassistant overlay if they select full assistance tab
            if (tab === 'help') {
              setIsAssistantOpen(false);
            }
          }} 
          openaiOk={true} 
        />

        {/* Main Tab area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {renderTabContent()}

          {/* Collapsible Overlaid Assistant slide-out drawer (open from any tab) */}
          {isAssistantOpen && (
            <>
              {/* Backing glass scrim to click close */}
              <div 
                onClick={() => setIsAssistantOpen(false)}
                className="fixed inset-0 bg-gray-950/20 backdrop-blur-xs z-39"
              />
              
              <SystemChatbot 
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                onClearHistory={handleClearHistory}
                isFloatingDrawer={true}
                onCloseDrawer={() => setIsAssistantOpen(false)}
              />
            </>
          )}
        </main>
      </div>

    </div>
  );
}
