/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { createServer as createViteServer } from "vite";
import { 
  KBDocument, 
  SoulFragment, 
  Soul, 
  AIEmployee, 
  ContentTask, 
  CrawlerTask, 
  BusinessFeed,
  SubKnowledgeBase
} from "./src/types";

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini client safely with standard key and user-agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI functions will run in offline mode.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// High performance JSON local state store file path
const DATA_FILE = path.join(process.cwd(), "workspace_db.json");

// Define basic mocked / fallback data
const DEFAULT_DOCS = [
  {
    id: "doc-1",
    title: "《企业微信自动化办公效率提升方案》",
    content: `企业微信自动化办公效率提升方案
一、背景与现状
在多智能体协同办公中，各部门信息流转效率低下，人工跟进周期长，审批流程常卡在手工分发阶段。智能办公能节约超过 45% 的中台调度成本。
二、精细化策略
1. AI员工接入：在知识库完成批量打标签，引入选题官、研究官和写作官。
2. 自动化规则设定：在抓取外部竞品数据后，系统自动同步入库，直接喂给创作引擎。
3. 双向闭环联动：各链路沉淀的优质产物，自动汇聚成企业的数字化‘集体大脑（Soul）’，随时支持跨周期调用。`,
    type: "doc" as const,
    category: "企业规章",
    size: "4 KB",
    tags: ["效率提升", "企业办公", "数字化"],
    createTime: "2026-06-01 10:00"
  },
  {
    id: "doc-2",
    title: "《新媒体爆款指南：如何打造高转化情感短视频脚本》",
    content: `新媒体爆款指南：如何打造高转化情感短视频脚本
【前言：爆款文案绝非偶然，而是情感经济的精确收割！】
各位创作者！今天给大家深度扒一扒，那些让你刷到停不下来的100w+赞小红书和抖音文案，到底暗藏了什么精妙的人格公式！
❤️ 1. 态度要绝对鲜明！最忌讳当和事佬、发鸡汤。在这个快节奏时代，听众只要痛点、共鸣和极具穿透力的金句。
🎯 2. 开头3秒：必须完成【痛点代入+颠覆常识】。比如：“今天告诉你一个残酷的大实话……”、“为什么越听话的员工越赚不到钱？”
🎨 3. 精准排版：善用特定 Emoji 表情 🌟✨ 🔥 提升视觉层级。字数必须控制在 150 字以内，采用气泡分段法。
快去套用这套风格，爆款就是你的！`,
    type: "doc" as const,
    category: "运营方案",
    size: "5 KB",
    tags: ["新媒体", "小红书", "爆款脚本", "排版套路"],
    createTime: "2026-06-02 14:30"
  }
];

const DEFAULT_FRAGMENTS = [
  {
    id: "frag-1",
    name: "严谨职场精英骨干",
    description: "源于企业方案文档，偏好高度结构化的论证、专业名词、行业缩写，展现十足的职场说服力。",
    sourceDocId: "doc-1",
    sourceDocTitle: "《企业微信自动化办公效率提升方案》",
    traits: ["专业理性", "数据说话", "结构清晰", "注重实践度"],
    voiceStyle: "严严肃、商务、逻辑严密的公文说明风格",
    toneDescription: "说话沉稳、爱用分点说明（一、二、三）与专有名词。",
    createTime: "2026-06-02 09:00"
  },
  {
    id: "frag-2",
    name: "爆款野生文案写手",
    description: "源于爆款指南文档，极具网感，语气饱满激昂，非常爱用叹号和情绪标签、热门网络黑话。",
    sourceDocId: "doc-2",
    sourceDocTitle: "《新媒体爆款指南：如何打造高转化情感短视频脚本》",
    traits: ["网感拉满", "激情洋溢", "语出惊人", "表情符号狂热者"],
    voiceStyle: "富含张力、擅长煽动共鸣的社交媒体博主语气",
    toneDescription: "语气活泼、善于使用丰富表情符号（✨🔥❤️）和直接对话拉近距离感。",
    createTime: "2026-06-02 15:00"
  }
];

const DEFAULT_SOULS = [
  {
    id: "soul-1",
    name: "职场效率高知专家",
    description: "融合了《自动化方案》与《新媒体爆款》，既讲逻辑与具体实现细节，也能用当下流行的爆款网络文法吸引大众眼球。",
    fragmentIds: ["frag-1", "frag-2"],
    combinedTraits: ["理性专业", "网感拔尖", "逻辑清晰", "言简意赅"],
    creativeStyle: "多层次混合风（既有坚实的技术原理，又透出极佳的社交媒体网感排版）",
    toneDescription: "开场一针见血指明利弊，内容采用数字框架式逻辑，但用词有趣接地气，穿插少许精致Emoji包装。",
    createTime: "2026-06-03 11:00"
  }
];

const DEFAULT_EMPLOYEES = [
  {
    id: "emp-1",
    name: "AI 智算选题官",
    avatar: "🎯",
    role: "选题官" as const,
    soulId: "soul-1",
    bio: "系统默认选题官。擅长在混沌的信息堆中一剑封喉，精准提出最具讨论度、最有转化潜力的创意切入角和吸睛标题。",
    tags: ["选题头脑风暴", "爆款标题党", "Hook大师", "趋势洞察"],
    speed: 95,
    creativity: 98,
    reasoning: 85,
    isDefault: true
  },
  {
    id: "emp-2",
    name: "AI 深度研究官",
    avatar: "🕵️‍♂️",
    role: "研究官" as const,
    soulId: "soul-1",
    bio: "系统默认研究官。专注深挖长文干货、寻找数据支撑并进行全网事实求证，提供立论扎实的背景深度报告。",
    tags: ["事实核查", "长内容脱水", "数据挖掘", "观点归档"],
    speed: 85,
    creativity: 70,
    reasoning: 96,
    isDefault: true
  },
  {
    id: "emp-3",
    name: "AI 跨平台精修写作官",
    avatar: "✍️",
    role: "写作官" as const,
    soulId: "soul-1",
    bio: "系统默认写作官。可以自如穿梭在传统的微信推文、快节奏的小红书图文、高度浓缩的微博短讯及抖音极富视听体验的脚本语境中。",
    tags: ["新媒体全能", "多平台转译", "人格化表达", "排版极客"],
    speed: 90,
    creativity: 92,
    reasoning: 88,
    isDefault: true
  }
];

const INITIAL_BUSINESS_FEEDS = [
  {
    id: "feed-1",
    title: "【ERP发布】2026年度智能办公效率大师全新硬件配置清单公开",
    source: "智能硬件销售管理ERP",
    category: "ERP业务清单",
    content: `【智能办公套件V3规格升级说明】
本期新增硬件连接线及全向音频矩阵麦克风，支持通过中继网关绑定CRM大盘：
1. 阵列麦克风拾音半径提升至7.5米，自带AI降噪深度过滤回声。
2. 附带本地独立内存卡并支持自动一键分词转录成结构化文字，直接对接办公知识库。
3. 渠道进货价仅需 ¥599/套，销售部推荐作为Q3面向中小企业客户打包推荐的增值礼品包。`,
    date: "2026-06-04 09:12",
    syncToKbStatus: "unsynced" as const
  },
  {
    id: "feed-2",
    title: "【CRM警报】高并发社交媒体咨询流转响应效率异常下滑预警",
    source: "智能客服CRM大盘",
    category: "CRM客户反馈",
    content: `【高频客诉警告：全链路文案产出不及竞品、反馈敷衍】
据最近一周CRM客诉明细：
1. 30%客户提及售后应答中，AI自动排版内容排版杂乱，缺乏人情味且专业术语堆砌。
2. 54%新媒体渠道引流留线受挫，原因在于选题严重过时、对当下热点毫不敏感。
结论：急需升级新一代多智能体AI员工系统，特别是选题、校对和微信、小红书一键排版，重塑高价值企业灵魂画像！`,
    date: "2026-06-04 11:45",
    syncToKbStatus: "unsynced" as const
  }
];

const DEFAULT_CRAWLERS = [
  {
    id: "crawl-1",
    name: "小红书科技大V爆款动态采集手",
    platform: "小红书" as const,
    link: "https://www.xiaohongshu.com/celebrity/tech_efficiency",
    status: "idle" as const,
    logs: ["任务就绪。随时可执行采集。"],
    scrapedDocsCount: 0,
    syncStatus: "pending" as const,
    createTime: "2026-06-03 16:00"
  },
  {
    id: "crawl-2",
    name: "微信高热度AI自媒体深度专题更新",
    platform: "微信公众号" as const,
    link: "https://mp.weixin.qq.com/s/ai_agents_productivity_future",
    status: "idle" as const,
    logs: ["任务就绪。随时可执行采集。"],
    scrapedDocsCount: 0,
    syncStatus: "pending" as const,
    createTime: "2026-06-03 16:00"
  }
];

// -----------------------------------------------------
// DATABASE SYSTEM STATE INITIALIZATION & COGNITIVE RETRIEVAL
// -----------------------------------------------------

interface DatabaseSchema {
  docs: KBDocument[];
  fragments: SoulFragment[];
  souls: Soul[];
  employees: AIEmployee[];
  tasks: ContentTask[];
  crawlers: CrawlerTask[];
  feeds: BusinessFeed[];
  subKbs: SubKnowledgeBase[];
  stepDefaults: {
    topicOfficerId: string;
    topicOfficerName?: string;
    researchOfficerId: string;
    researchOfficerName?: string;
    writerOfficerId: string;
    writerOfficerName?: string;
  };
}

let db: DatabaseSchema = {
  docs: DEFAULT_DOCS as any,
  fragments: DEFAULT_FRAGMENTS as any,
  souls: DEFAULT_SOULS as any,
  employees: DEFAULT_EMPLOYEES as any,
  tasks: [],
  crawlers: DEFAULT_CRAWLERS as any,
  feeds: INITIAL_BUSINESS_FEEDS as any,
  subKbs: [
    {
      id: "kb-default",
      name: "⭐ 主融合知识库",
      description: "系统默认的主要业务底座数据库，用于储存通用的技术文档、文章摘要及核心策略方案。",
      createTime: "2026-06-01 12:00"
    }
  ],
  stepDefaults: {
    topicOfficerId: "emp-1",
    researchOfficerId: "emp-2",
    writerOfficerId: "emp-3"
  }
};

function saveDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to save database:", error);
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf8");
      db = JSON.parse(fileData);
      
      // Ensure all necessary arrays are present safely
      if (!db.docs) db.docs = DEFAULT_DOCS as any;
      if (!db.fragments) db.fragments = DEFAULT_FRAGMENTS as any;
      if (!db.souls) db.souls = DEFAULT_SOULS as any;
      if (!db.employees) db.employees = DEFAULT_EMPLOYEES as any;
      if (!db.tasks) db.tasks = [];
      if (!db.crawlers) db.crawlers = DEFAULT_CRAWLERS as any;
      if (!db.feeds) db.feeds = INITIAL_BUSINESS_FEEDS as any;
      if (!db.subKbs || db.subKbs.length === 0) {
        db.subKbs = [
          {
            id: "kb-default",
            name: "⭐ 主融合知识库",
            description: "系统默认的主要业务底座数据库，用于储存通用的技术文档、文章摘要及核心策略方案。",
            createTime: "2026-06-01 12:00"
          }
        ];
      }
      if (!db.stepDefaults) {
        db.stepDefaults = {
          topicOfficerId: "emp-1",
          researchOfficerId: "emp-2",
          writerOfficerId: "emp-3"
        };
      }
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to load existing database store. Defaulting:", error);
  }
}

// Fire Database hydration first
loadDatabase();

// Complete system state
app.get("/api/initial-state", (req, res) => {
  res.json(db);
});

app.post("/api/kb/upload", async (req, res) => {
  const { title, content: manualContent, type = "doc", subKbId = "kb-default", fileBase64, fileType } = req.body;
  if (!title) {
    return res.status(400).json({ error: "标题或文件名不能为空" });
  }

  let finalContent = manualContent || "";
  let category = "日常记录";
  let tags: string[] = ["AI自动提炼", "知识库库入库"];
  let calculatedSize = "0 B";

  if (fileBase64) {
    // We have a base64 encoded file!
    try {
      const buffer = Buffer.from(fileBase64, "base64");
      const fileSizeBytes = buffer.length;
      calculatedSize = fileSizeBytes > 1024 * 1024
        ? (fileSizeBytes / (1024 * 1024)).toFixed(1) + " MB"
        : fileSizeBytes > 1024
          ? (fileSizeBytes / 1024).toFixed(1) + " KB"
          : fileSizeBytes + " B";

      // Detect format
      const isDocx = fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || title.toLowerCase().endsWith(".docx");
      const isPdf = fileType === "application/pdf" || title.toLowerCase().endsWith(".pdf");
      const isImage = fileType?.startsWith("image/") || title.toLowerCase().endsWith(".jpg") || title.toLowerCase().endsWith(".jpeg") || title.toLowerCase().endsWith(".png") || title.toLowerCase().endsWith(".webp") || title.toLowerCase().endsWith(".gif");

      if (isDocx) {
        // Parse .docx
        try {
          const mammothResult = await mammoth.extractRawText({ buffer });
          finalContent = mammothResult.value || "Word文档无文本内容。";
        } catch (err: any) {
          console.error("Mammoth docx parsing failed:", err);
          return res.status(500).json({ error: "Word文档（.docx）解析失败: " + err.message });
        }
      } else if ((isPdf || isImage) && ai) {
        // Use Gemini native multi-modal extraction for PDF and image!
        try {
          // Double check or set proper mimeType
          let gMimeType = fileType || "image/jpeg";
          if (isPdf) gMimeType = "application/pdf";
          if (title.toLowerCase().endsWith(".png")) gMimeType = "image/png";
          if (title.toLowerCase().endsWith(".webp")) gMimeType = "image/webp";

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  mimeType: gMimeType,
                  data: fileBase64
                }
              },
              {
                text: `你是一个智能多模态知识库解析大师。上传的文件是一个多模态文档（PDF或图像格式）。
                请完全阅读其展示的所有文字、文本、大纲排版、统计图表或文风记录，将其纯文本和结构化核心内容汇整提取出来，精炼为易读、重点突出的 Markdown 文本。

                另外，请执行以下工作：
                1. 给出最适切的一个分类名称（一般为2-4字，比如 '市场分析', '教程文档', '运营方案', '图片识别', '日常记录', '企业规章' 等之一）。
                2. 提取 3-4 个相关的核心高频专名词标签。

                请严格以下方格式返回 JSON 信息（不要包裹任何 \`\`\` 以外的标记）：
                {
                  "extractedContent": "提取出来的完整 Markdown 格式文章、文字或说明内容",
                  "category": "分类名称",
                  "tags": ["标签1", "标签2", "标签3"]
                }`
              }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  extractedContent: { type: Type.STRING },
                  category: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["extractedContent", "category", "tags"]
              }
            }
          });

          const dataText = response.text?.trim() || "";
          const resultObj = JSON.parse(dataText);
          finalContent = resultObj.extractedContent || "PDF/图片解析结果为空";
          category = resultObj.category || "智能识别";
          tags = resultObj.tags || ["多模态分析"];
        } catch (err: any) {
          console.error("Gemini Multi-modal parsing error:", err);
          return res.status(500).json({ error: "Gemini 多模态（PDF/图片）解析失败: " + err.message });
        }
      } else if (isPdf || isImage) {
        // PDF or Image but Offline
        category = "日常记录(离线模式)";
        tags = ["多模态", "无AI连线"];
        finalContent = `[离线入库提示] 由于缺少 GEMINI_API_KEY，系统无法对多模态文档（${title}）进行视觉文字识别(OCR)和内容理解。请在「设置->密钥管理」中注入有效的 GEMINI_API_KEY。`;
      } else {
        // Regular text file decoding
        try {
          finalContent = buffer.toString("utf8");
        } catch (err) {
          finalContent = "[解析失败] 无法将该文件解码为纯文本数据。";
        }
      }
    } catch (err: any) {
      console.error("File loading error:", err);
      return res.status(500).json({ error: "文件读取失败: " + err.message });
    }
  } else {
    // Manual text form submission
    finalContent = manualContent || "";
    const fileSizeBytes = Buffer.byteLength(finalContent, "utf8");
    calculatedSize = fileSizeBytes > 1024 
      ? (fileSizeBytes / 1024).toFixed(1) + " KB" 
      : fileSizeBytes + " B";
  }

  // If we processed a text or word file and ai is online, we classify its text
  const isMultimodal = title.toLowerCase().endsWith(".pdf") || title.toLowerCase().includes(".jpg") || title.toLowerCase().includes(".jpeg") || title.toLowerCase().includes(".png") || title.toLowerCase().includes(".gif");
  if ((!fileBase64 || !isMultimodal) && ai && finalContent && finalContent.length > 5) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `你是一个智能知识库整理大师。请阅读以下文档并做两件事：
1. 给出最适切的一个分类名称（一般为2-4字，比如 '市场分析', '教程文档', '运营方案', '日常记录', '企业规章', '行业报告' 等之一，也可自行设计最优的分类名称）。
2. 提取 3-4 个相关的核心高频专有名词、属性或技术作为标签标签数组。

请输出规范的JSON格式：
{
  "category": "分类名称",
  "tags": ["标签1", "标签2", "标签3"]
}

对于以下文档：
标题：${title}
内容（截取部分）：${finalContent.substring(0, 1500)}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["category", "tags"]
          }
        }
      });

      const dataText = response.text?.trim() || "";
      const resultObj = JSON.parse(dataText);
      if (resultObj.category) category = resultObj.category;
      if (resultObj.tags) tags = resultObj.tags;
    } catch (err) {
      console.error("Gemini text classification failed:", err);
    }
  }

  const newDoc = {
    id: "doc-" + Date.now(),
    title,
    content: finalContent,
    type,
    category,
    size: calculatedSize,
    tags,
    subKbId,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.docs.unshift(newDoc);
  saveDatabase();
  res.json({ success: true, doc: newDoc });
});

// Create sub KB
app.post("/api/kb/subkbs/create", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "知识库名称不能为空" });
  }
  const newSubKb = {
    id: "kb-" + Date.now(),
    name,
    description: description || "自定义分类库",
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  db.subKbs.push(newSubKb);
  saveDatabase();
  res.json({ success: true, subKb: newSubKb });
});

// Delete sub KB
app.post("/api/kb/subkbs/delete", (req, res) => {
  const { id } = req.body;
  if (id === "kb-default") {
    return res.status(400).json({ error: "系统默认知识库不能删除" });
  }
  db.subKbs = db.subKbs.filter(k => k.id !== id);
  // Safely move docs to the default kb-default to avoid losing data
  db.docs = db.docs.map(d => d.subKbId === id ? { ...d, subKbId: "kb-default" } : d);
  saveDatabase();
  res.json({ success: true });
});

// Delete document
app.post("/api/kb/delete", (req, res) => {
  const { id } = req.body;
  const initialLen = db.docs.length;
  db.docs = db.docs.filter(d => d.id !== id);
  if (db.docs.length !== initialLen) {
    saveDatabase();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Document not found" });
  }
});

// Move document to another sub KB
app.post("/api/kb/move", (req, res) => {
  const { id, subKbId } = req.body;
  const doc = db.docs.find(d => d.id === id);
  if (doc) {
    doc.subKbId = subKbId || "kb-default";
    saveDatabase();
    res.json({ success: true, doc });
  } else {
    res.status(404).json({ error: "Document not found" });
  }
});

// Synthesize multiple documents or an entire sub-KB directory into a single combined Soul
app.post("/api/kb/synthesize-soul", async (req, res) => {
  const { docIds, subKbId, soulName, soulDescription } = req.body;
  
  let selectedDocs = [];
  if (docIds && docIds.length > 0) {
    selectedDocs = db.docs.filter(d => docIds.includes(d.id));
  } else if (subKbId && subKbId !== 'all') {
    selectedDocs = db.docs.filter(d => (d.subKbId || 'kb-default') === subKbId);
  } else {
    selectedDocs = db.docs;
  }

  if (selectedDocs.length === 0) {
    return res.status(400).json({ error: "选择的范围内无任何业务文档，无法炼化灵魂。" });
  }

  const combinedName = soulName || `${selectedDocs[0].title.replace(/[《》]/g, '').substring(0, 5)}...的文脉灵魂`;
  const defaultDesc = soulDescription || `融合淬炼自: ${selectedDocs.slice(0, 3).map(d => d.title).join("、")}${selectedDocs.length > 3 ? "等" : ""}的高价值业务文献特质。`;

  let combinedTraits = ["专业严谨", "表达幽默", "洞察非凡"];
  let creativeStyle = "多层次混合风";
  let toneDescription = "基于选定文档整合出的深度AI调性。";

  if (ai) {
    try {
      const summaryOfInputs = selectedDocs.map((doc, i) => 
        `文档[${i+1}]: 标题: ${doc.title}. 智能分类: ${doc.category}. 核心标签: ${doc.tags.join(",")}. 内容摘要: ${doc.content.substring(0, 500).replace(/\n/g, ' ')}...`
      ).join("\n\n");

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `你是一个顶级的灵魂合成融合大师。现在的目标是深度淬火分析并提取以下多份企业业务/写作文档的语气特征、行文习惯和专业特质，从而融合成一个完整的深度AI雇员角色语调/最终灵魂 (Soul Persona)。

输入的文档摘要组包如下：
${summaryOfInputs}

预计融合大名称：${combinedName}

请提炼出一个有机平衡、多才多艺的大模型角色风格（特别需要平衡严谨干货与网感爆款特性）。
请直接输出以下JSON格式配置，千万不可包含任何markdown的反引号或包裹符：
{
  "combinedTraits": ["提炼词特质1", "特质2", "特质3", "特质4"],
  "creativeStyle": "新融合写作风格叙述(15字内)",
  "toneDescription": "口吻语调与发帖排架习惯描述（45字内）"
}

只返回纯正JSON，千万不要用Markdown格式包裹！不要任何干扰字符。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              combinedTraits: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              creativeStyle: { type: Type.STRING },
              toneDescription: { type: Type.STRING }
            },
            required: ["combinedTraits", "creativeStyle", "toneDescription"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.combinedTraits) combinedTraits = parsed.combinedTraits;
      if (parsed.creativeStyle) creativeStyle = parsed.creativeStyle;
      if (parsed.toneDescription) toneDescription = parsed.toneDescription;
    } catch (err) {
      console.error("Gemini failed to synthesize soul directly:", err);
    }
  }

  const newSoul = {
    id: "soul-" + Date.now(),
    name: combinedName,
    description: defaultDesc,
    fragmentIds: [],
    combinedTraits,
    creativeStyle,
    toneDescription,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.souls.unshift(newSoul);
  saveDatabase();
  res.json({ success: true, soul: newSoul });
});

// Create hand-crafted Soul directly
app.post("/api/kb/create-soul", (req, res) => {
  const { name, description, combinedTraits, creativeStyle, toneDescription } = req.body;
  if (!name) {
    return res.status(400).json({ error: "灵魂名称不能为空" });
  }

  const newSoul = {
    id: "soul-" + Date.now(),
    name,
    description: description || "手动配置的灵魂人格特征",
    fragmentIds: [],
    combinedTraits: combinedTraits || [],
    creativeStyle: creativeStyle || "多重创意平衡风格",
    toneDescription: toneDescription || "稳重温和、兼听则明",
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.souls.unshift(newSoul);
  saveDatabase();
  res.json({ success: true, soul: newSoul });
});

// Delete Soul
app.post("/api/kb/delete-soul", (req, res) => {
  const { id } = req.body;
  db.souls = db.souls.filter(s => s.id !== id);
  db.fragments = db.fragments.filter(f => f.id !== id); // cleanup fragments too if matched
  saveDatabase();
  res.json({ success: true });
});


// 2. AI EMPLOYEES ENDPOINTS

app.post("/api/employees/save", (req, res) => {
  const { id, name, avatar, role, soulId, bio, tags, speed, creativity, reasoning } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "姓名和步骤岗位角色不能为空" });
  }

  if (id) {
    // Edit
    const index = db.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      db.employees[index] = {
        ...db.employees[index],
        name,
        avatar: avatar || "🧙",
        role,
        soulId: soulId || null,
        bio: bio || "",
        tags: tags || [],
        speed: Number(speed) || 80,
        creativity: Number(creativity) || 80,
        reasoning: Number(reasoning) || 80
      };
      saveDatabase();
      return res.json({ success: true, employee: db.employees[index] });
    } else {
      return res.status(404).json({ error: "未找到对应的员工档案" });
    }
  } else {
    // Add new
    const newEmp = {
      id: "emp-" + Date.now(),
      name,
      avatar: avatar || "🧙",
      role,
      soulId: soulId || null,
      bio: bio || "自主建立的企业高级AI虚拟智能助手，支持业务深度定制。",
      tags: tags || ["定制员工"],
      speed: Number(speed) || 80,
      creativity: Number(creativity) || 80,
      reasoning: Number(reasoning) || 80,
      isDefault: false
    };
    db.employees.push(newEmp);
    saveDatabase();
    res.json({ success: true, employee: newEmp });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const originalLen = db.employees.length;
  // Do not delete default ones unless forced, but let's allow it in UI with alert
  db.employees = db.employees.filter(e => e.id !== id);
  if (db.employees.length !== originalLen) {
    saveDatabase();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Employee record not found" });
  }
});


// 3. WORKSPACE / CREATIVE TASKS ENDPOINTS

// Create Task
app.post("/api/tasks/create", (req, res) => {
  const { topic, boundEmployees, sourceDocIds, enableWebSearch, platforms, mode } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "创作主题/大纲需求不能为空" });
  }

  const taskId = "task-" + Date.now();
  const newTask = {
    id: taskId,
    topic,
    boundEmployees: {
      topicOfficerId: boundEmployees?.topicOfficerId || db.stepDefaults.topicOfficerId,
      researchOfficerId: boundEmployees?.researchOfficerId || db.stepDefaults.researchOfficerId,
      writerOfficerId: boundEmployees?.writerOfficerId || db.stepDefaults.writerOfficerId
    },
    sourceDocIds: sourceDocIds || [],
    enableWebSearch: !!enableWebSearch,
    platforms: platforms && platforms.length > 0 ? platforms : ["微信公众号"],
    mode: mode || "选题",
    status: "pending" as const,
    currentStep: "idle" as const,
    logs: ["任务被成功创建！配置参数初始化完毕。准备开始执行工作流大闭环。"],
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.tasks.unshift(newTask);
  saveDatabase();
  res.json({ success: true, task: newTask });
});

// Run task workflow steps
app.post("/api/tasks/run-step", async (req, res) => {
  const { taskId, step, selectedTopic } = req.body;
  const taskIndex = db.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "创作任务不存在" });
  }

  const task = db.tasks[taskIndex];
  
  // Load files for context building
  const selectedDocs = db.docs.filter(d => task.sourceDocIds.includes(d.id));
  const textContext = selectedDocs.map(d => `文件【${d.title}】:\n${d.content}`).join("\n\n");

  // Determine current active officer configs & Soul
  const getSoulPromptDecoration = (officerId?: string) => {
    if (!officerId) return "";
    const emp = db.employees.find(e => e.id === officerId);
    if (!emp || !emp.soulId) return "";
    const soul = db.souls.find(s => s.id === emp.soulId);
    if (!soul) return "";
    return `同时，你已被赋予灵魂人格「${soul.name}」：
核心特质：${soul.combinedTraits.join(" / ")}
创作书写倾向：${soul.creativeStyle}
发声口吻限制：${soul.toneDescription}
创作发声中请务必内化这些灵魂参数。`;
  };

  // Helper logger
  const addLog = (msg: string) => {
    task.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
  };

  if (step === 'brainstorm') {
    // Generate AI topics
    task.status = "topics_generating";
    task.currentStep = "topic_brainstorm";
    addLog("【AI选题官】正在基于本地知识库文献，匹配联网趋势并孵化高阶创意候选题目...");
    saveDatabase();

    const topicOfficer = db.employees.find(e => e.id === task.boundEmployees.topicOfficerId) || db.employees[0];
    const soulDecor = getSoulPromptDecoration(topicOfficer.id);

    if (ai) {
      try {
        const prompt = `你是一名拥有极强网感、精通新媒体爆款打法的【${topicOfficer.name}】新媒体选题导师。
${soulDecor}

任务需求：针对用户创作的大调子‘${task.topic}’，结合附带的本地文献库背景，进行高热度爆款候选选题的深度头脑风暴，请产出 3 个各具特质与侧重面（例如：深度长文干货型、社交裂变痛点情感型、犀利避坑指南型）的差异化选题。

本地参考信息背景：
${textContext || "（用户无选定或未配置特定的本地知识库文档）"}

联网查阅结果补足（已自动联网模拟抓取）：
${task.enableWebSearch ? "1. 当前关于‘" + task.topic + "’在各大自媒体的搜索曝光度达到新峰值。\n2. 中小企业及个人更关注能一秒套用、低门槛落地的实践包而非务虚理念。" : "（联网爬虫补充已关闭，仅基于本地知识和内生才华）"}

请输出以下符合规范的JSON数组结构，不要包含 markdown 标记，只需要返回一个JSON数组：
[
  {
    "title": "备选标题 1 (加入吸睛数字、痛点对比、强力动词，如 【企业千万级增效：为什么普通员工要避开这3个效率深渊】)",
    "explanation": "本篇选题策划立意方案：说明为何以此角度切入，适合哪一类受众，能够直击什么样的心理预期。（字数80字内）"
  },
  {
    "title": "备选标题 2",
    "explanation": "本篇策划方案说明"
  },
  {
    "title": "备选标题 3",
    "explanation": "本篇策划方案说明"
  }
]`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["title", "explanation"]
              }
            }
          }
        });

        const candidates = JSON.parse(response.text?.trim() || "[]");
        task.candidates = candidates;
        task.status = "topics_generated";
        task.currentStep = "topic_select";
        addLog(`【AI选题官】头脑风暴完成。已向工作台推选3个多维大转轮策划标题！请创作人评估确认选题以启动后续研究。`);
      } catch (err) {
        console.error("Brainstorming failed:", err);
        task.status = "failed";
        addLog(`【AI选题官】执行异常：${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // offline fallback sandbox mock
      task.candidates = [
        {
          title: `【爆款实操】中小团队如何零成本盘活多智能体？避开“${task.topic}”里的4个效率伪命题！`,
          explanation: "突出零成本实操路径，结合具体细节论证避坑痛点，直切运营端和业务主管的效率神经！"
        },
        {
          title: `《认知进化：用20%的“炼魂合成”特质，撬动100%行业素材长效溢价》——基于「${task.topic}」落地观察`,
          explanation: "极客、高逼格干货向。适合希望通过AI极速武装团队的中高层企业人，满足其战略认知需求。"
        },
        {
          title: `别再瞎写了！自媒体爆款大揭秘：我是如何把《${task.topic}》重塑为多渠道自循环引流底牌的！`,
          explanation: "强烈自媒体爽感文风。通过自述+数字量化形式，引爆社群或自媒体平台的点击狂潮。"
        }
      ];
      task.status = "topics_generated";
      task.currentStep = "topic_select";
      addLog("【AI选题官】（本地离线模型）成功模拟孵化3组金句选题。");
    }
  } 
  else if (step === 'research') {
    // Stage 2: Research with chosen topic
    task.selectedTopic = selectedTopic || task.topic;
    task.status = "researching";
    task.currentStep = "research";
    addLog(`【系统联动】主题已锁定：《${task.selectedTopic}》。`);
    addLog(`【AI研究官】启动。正在分析本地资料、提炼核心支撑要点、核查行业数据并制定立论地图...`);
    saveDatabase();

    const researchOfficer = db.employees.find(e => e.id === task.boundEmployees.researchOfficerId) || db.employees[1];
    const soulDecor = getSoulPromptDecoration(researchOfficer.id);

    if (ai) {
      try {
        const prompt = `你是一位严谨极致的【${researchOfficer.name}】内容研究与文献查证专家。
${soulDecor}

任务：针对锁定的核心标题《${task.selectedTopic}》，结合给出的本地参考资料背景，整理出一份格式干净、论据丰满的《创作底层研究与事实查核快报》。
要求包含以下部分：
1. 本地资料梳理摘要：提取本地参考文稿里的最内核干货观点
2. 核心事实点与核心论据库（数字、趋势或案例查实说明）
3. 爆款文章排版主骨架脉络推荐（如何一层层论述吸引用户往下读）

本地参考资料：
${textContext || "（无选定本地文档）"}

联网增强事实数据库：
${task.enableWebSearch ? "已模拟搜集该领域当下关注点，大家格外重视可落地性与投入产出比" : "使用本地资料作为最高事实判定标准"}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });

        task.researchReport = response.text || "研究报告编译失败。";
        task.status = "writing";
        addLog(`【AI研究官】快报编译成功。论据已搜集夯实，核心大纲已骨折式解剖完毕，下一环流转至【AI写作官】。`);
      } catch (err) {
        console.error("Research failed:", err);
        task.status = "failed";
        addLog(`【AI研究官】发生异常：${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // Offline fallback
      task.researchReport = `### 《${task.selectedTopic}》全景研究报告 (Offline Mock)
  
一、知识地图与核心背景梳理
依据用户精选的本地知识库文档，针对“**${task.topic}**”已提取其最重要之因果机制。

二、事实论据库（查实无隐患）
1. **中台流转耗时大跌**：传统企业在沟通/选题流合魂后，中继调度摩擦可至少下降 45% 以上。 (源于 doc-1数据)
2. **情感复利引爆点击**：爆款文案的转化关键在于一针见血击穿焦虑，辅以Emoji视觉高分段阅读体验。(源于 doc-2数据)

三、推荐写作骨架路线
- 【黄金3秒开头】：通过痛点拷问直接挑出共鸣。
- 【痛点对立解析】：抛出为什么过去那一套陈旧策略全部失灵了。
- 【核心秘诀输出】：手把手喂给用户AI员工/本地沉淀/合魂实操的3个核心要点。`;
      task.status = "writing";
      addLog("【AI研究官】（离线模拟）完成背景研究及大纲分析。");
    }
  } 
  else if (step === 'write') {
    // Stage 3: Write tailored copies for target platforms
    task.currentStep = "write";
    addLog(`【AI写作官】被激活。正在精读研究官提交的《大纲快报》，同时加载已合并融合过的灵魂属性特质，开始针对四大流量平台（微博、小红书、微信号、抖音）转译不同文风笔意...`);
    saveDatabase();

    const writerOfficer = db.employees.find(e => e.id === task.boundEmployees.writerOfficerId) || db.employees[2];
    const soulDecor = getSoulPromptDecoration(writerOfficer.id);

    const platformTargetList = task.platforms.join("、");

    if (ai) {
      try {
        const prompt = `你是一位手速逆天、极其擅长一人千面分身术的【${writerOfficer.name}】爆款新媒体共鸣大文豪。
${soulDecor}

核心目标：根据研究报告提供的逻辑大树与立论干货，为用户精准要求发布的多个平台类型（${platformTargetList}）撰写成品高能文稿！
请根据各个发布平台的特性，写出最地道、最吸睛、行文完全不同的垂直专属方案：

1. 如果有【小红书】：必须充满热情、带有丰富的 emoji（🔥❤️👑🌟），善于运用“宝宝们”、“大实话”等自媒体语气，段落短小便于视觉呼吸。重点列出热搜 Hashtag。
2. 如果有【微信公众号】：讲究长文逻辑深度、层次分明（一、二、三...）、有段落首尾呼应、客观睿智，充满深度干货，格式精美工整。
3. 如果有【微博】：极度言简意赅，140字内一针见血，带话题如 #今日高热度AI话题# 转发和锐评属性并存，语出惊人瞬间引起转发欲。
4. 如果有【抖音】：必须是一个“3-5秒强拉留存+高潮台词分镜+画外音配乐提示”的专业爆款短视频说书脚本！

锁定研究大纲报告：
${task.researchReport}

请只输出以下规范、无任何markdown代码块包装的严格 JSON 键值对，对应平台产生的值请务必使用中文 Markdown 撰写对应的精彩成品全文：
{
  "微信公众号": "微信公众号排版排版精美文章...",
  "小红书": "小红书爆款图文笔记...",
  "微博": "高传播度微博微文...",
  "抖音": "视觉感爆棚的短视频拍摄脚本..."
}

注：非勾选包含的平台，在对应的 JSON 中不需要返回，或为空。请极度精耕细作！`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                "微信公众号": { type: Type.STRING },
                "小红书": { type: Type.STRING },
                "微博": { type: Type.STRING },
                "抖音": { type: Type.STRING }
              }
            }
          }
        });

        const drafts = JSON.parse(response.text?.trim() || "{}");
        
        // Save drafts
        task.finalDrafts = drafts;
        task.status = "completed";
        task.currentStep = "done";
        addLog(`【AI写作官】恭喜！${platformTargetList} 平台高定制化文稿已全部完稿。已生成对应的段落呼吸包装。可以一键查收或同步知识库沉淀！`);
      } catch (err) {
        console.error("Writing copy failed:", err);
        task.status = "failed";
        addLog(`【AI写作官】发生异常：${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      // Fallback
      const genericDrafts: Record<string, string> = {};
      if (task.platforms.includes("微信公众号")) {
        genericDrafts["微信公众号"] = `## 智能化转型阵痛：如何通过“${task.selectedTopic}”打破多岗沟通死锁

### 引言：看不见的水面之下
许多业务管理者常说，“我们的沟通很畅通，文档也建了，为什么效率就是上不来？”其实，这叫【伪数字生态】。

#### 一、 破局第一步：建立多智能体协同机制
摒弃传统一劳永逸式的硬灌输。使用AI选题、AI研究和AI写作三位一体并行。
1. **选题智能化**：一键生成3套候选方案。
2. **研究结构化**：不让假数据和陈词滥调玷污方案。
3. **写作差异化**：多角色协同配合。

#### 二、 从灵魂到现实：如何真正让AI写出人情味
核心不仅是冷冰冰的模型，而是将经过企业历史资料提炼淬火后的“人格碎片（Soul）”注入生产流程，从而拥有和你的客服、你的高管同频的表达能量。

*本文完，未经允许严禁商业转载。*`;
      }
      if (task.platforms.includes("小红书")) {
        genericDrafts["小红书"] = `✨姐妹们大实话！别再用那些废话模板写文案了！😭

今天手把手教你一招：如何借助【${task.selectedTopic}】直接引爆小红书流量！🔥

💡 核心秘密拿走不谢：
1️⃣ **开头抓人**：前3秒必须颠覆常识！“普通人越勤奋越累？因为你没装这套中台！”
2️⃣ **用情绪讲逻辑**：别像公文！多一分撒娇，多十分坚定！
3️⃣ **Emoji狂热排版**：视觉呼吸感拉满！

🌟 宝宝们！赶紧把这套工作流锁死！一键三连，评论区留下你的效率痛点，AI写作官立刻帮你改写哦～

#小红书爆款 #AI高效办公 #内容创业 #干货分享 #生产力工具`;
      }
      if (task.platforms.includes("微博")) {
        genericDrafts["微博"] = `不要盲目自嗨了！快来看如何用真正的多智能体降维暴击传统新媒体创作者。针对《${task.selectedTopic}》，AI自动分类+人格炼魂只需一键。效率提升超过45%，新老自媒体人全部建议闭眼套用！#AI写作大变局# #智能化提效避坑指南#`;
      }
      if (task.platforms.includes("抖音")) {
        genericDrafts["抖音"] = `# 【剧场级短视频脚本】《打破自嗨，真正的效率大师都在怎么玩？》

**时长**：45秒  | **基调**：快节奏、高爽感、解密性质

---

### 一、 黄金开头 (0-5秒)
* **画面**：深夜办公室，一个满脸疲惫的年轻人疯狂敲击键盘，背景是一堆杂乱报表和闪烁的报警红光。
* **音效**：急促、压抑的倒计时嘀嗒声。
* **台词 (画外音/急促语气)**：
  > “你是不是也这样？加班到十二点，选题改了八遍，发出去却只有两位数的阅读？！”

---

### 二、 冲突引入 (5-15秒)
* **画面**：年轻人愤怒合上电脑，镜头快速推进（推拉镜头）。
* **音效**：震动低音。
* **台词**：
  > “今天教你一个颠覆认知的残酷实话：你的努力，全是在瞎自嗨！真正通关的高手，早就用「${task.selectedTopic}」实现全自动化同步了！”

---

### 三、 干货手把手 (15-35秒)
* **画面**：屏幕上极速展现AI多智能体：选题、研究、合成灵魂碎片全流程，一排排漂亮文案自动生成蹦出。
* **音效**：愉悦欢快的打字声+极具冲击感的轻快鼓点。
* **台词**：
  > “第一步，提取知识库，把你的存量优秀文稿，AI‘合魂’成爆款写作人格！
  > 第二步，选题、研究全并行！模拟爬虫同步抓取外部链接！
  > 哪怕是同一套料，也能秒变微信长文、小红书气泡、微博爆论！”

---

### 四、 结尾收尾 (35-45秒)
* **画面**：年轻人舒适靠在办公椅上喝咖啡，画面切回极简而具有科技感的主设计大盘。
* **音效**：清脆的叮当一声。
* **台词**：
  > “快在主页测试你的首个AI员工，点击下方链接，彻底告别打工牛马，拥抱超级效率大闭环！”`;
      }

      task.finalDrafts = genericDrafts;
      task.status = "completed";
      task.currentStep = "done";
      addLog("【AI写作官】（离线模拟）已针对您选取的平台完成全部拟真成品渲染！");
    }
  }

  saveDatabase();
  res.json({ success: true, task });
});

// Directly run direct mode creative task (一键直接创作流程)
app.post("/api/tasks/run-direct", async (req, res) => {
  const { topic, boundEmployees, sourceDocIds, enableWebSearch, platforms } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "创作主题不能为空" });
  }

  const taskId = "task-" + Date.now();
  const task = {
    id: taskId,
    topic,
    boundEmployees: {
      topicOfficerId: boundEmployees?.topicOfficerId || db.stepDefaults.topicOfficerId,
      researchOfficerId: boundEmployees?.researchOfficerId || db.stepDefaults.researchOfficerId,
      writerOfficerId: boundEmployees?.writerOfficerId || db.stepDefaults.writerOfficerId
    },
    sourceDocIds: sourceDocIds || [],
    enableWebSearch: !!enableWebSearch,
    platforms: platforms && platforms.length > 0 ? platforms : ["微信公众号"],
    mode: "直接" as const,
    status: "researching" as const, // direct skips brainstorming
    currentStep: "research" as const,
    selectedTopic: topic, // topic itself is the selected title
    logs: ["【直接创作工作流】启动。跳过选题确认，直接进入文献与主题背景研究。"],
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.tasks.unshift(task);
  saveDatabase();

  res.json({ success: true, taskId });
});

// Sync Generated Post/Draft back into KB (自动沉淀入知识库)
app.post("/api/tasks/save-to-kb", (req, res) => {
  const { taskId, platform, title } = req.body;
  const task = db.tasks.find(t => t.id === taskId);
  if (!task || !task.finalDrafts || !task.finalDrafts[platform]) {
    return res.status(404).json({ error: "生成的文稿草稿不存在" });
  }

  const content = task.finalDrafts[platform];
  const kbTitle = title || `《由任务(${task.topic.substring(0, 10)})生成的${platform}成品》`;

  const newDoc = {
    id: "doc-" + Date.now(),
    title: kbTitle,
    content,
    type: "doc" as const,
    category: "成品沉淀",
    size: ((Buffer.byteLength(content, 'utf8')) / 1024).toFixed(1) + " KB",
    tags: ["成品文稿", platform, "自动沉淀"],
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.docs.unshift(newDoc);
  saveDatabase();
  res.json({ success: true, doc: newDoc });
});


// 4. CRAWLER ENDPOINTS (爬虫同步)

// Create Crawl Task
app.post("/api/crawlers/create", (req, res) => {
  const { name, platform, link } = req.body;
  if (!name || !link) {
    return res.status(400).json({ error: "任务名称和目标爬取链接不能为空" });
  }

  const newCrawl = {
    id: "crawl-" + Date.now(),
    name,
    platform: platform || "其他",
    link,
    status: "idle" as const,
    logs: ["配置初始化完成。"],
    scrapedDocsCount: 0,
    syncStatus: "pending" as const,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  db.crawlers.unshift(newCrawl);
  saveDatabase();
  res.json({ success: true, crawler: newCrawl });
});

// Run Crawl Task
app.post("/api/crawlers/run", async (req, res) => {
  const { id } = req.body;
  const index = db.crawlers.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Simulated crawler job was not found." });
  }

  const crawl = db.crawlers[index];
  crawl.status = "running";
  crawl.logs.push(`[${new Date().toLocaleTimeString()}] 建立通道，连接目标平台: ${crawl.platform}`);
  crawl.logs.push(`[${new Date().toLocaleTimeString()}] 解析爬虫链接: ${crawl.link}`);
  saveDatabase();

  // Create real semantic scraper using Gemini to synthesize some dummy/web-parsed content 
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `你是一个智能网页与自媒体链接解析爬虫。现在请根据下面的输入链接，模拟并提炼出：
1. 1篇具有该平台特色的深度干货图文、资讯或产品说明（含精美标题和1000字以内的详尽文本）。
链接是：${crawl.link}
平台特色：${crawl.platform}。

请直接输出模拟抓取到的完整文字内容，顶部写明抓取的【标题：xxx】。确保内容质量高、充实，富含行业有价值数据与实践干货。请尽量贴合链接的场景。`
      });

      const fullOutput = response.text || "";
      let title = `【智能爬虫抓取】来自${crawl.platform}的推荐资讯`;
      let content = fullOutput;

      const titleMatch = fullOutput.match(/【?标题：?([^】\n]+)】?/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }

      // Create doc in DB
      const resultDoc = {
        id: "doc-scraped-" + Date.now(),
        title,
        content,
        type: "crawler" as const,
        category: "爬虫数据自动归档",
        size: ((Buffer.byteLength(content, 'utf8')) / 1024).toFixed(1) + " KB",
        tags: ["网络公开素材", crawl.platform, "爬虫自动归档"],
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        crawlerId: crawl.id
      };

      db.docs.unshift(resultDoc);
      crawl.scrapedDocsCount = 1;
      crawl.status = "completed";
      crawl.syncStatus = "synced";
      crawl.logs.push(`[${new Date().toLocaleTimeString()}] 获取正文成功，发现1篇行业深度图文，标题为: 《${title}》`);
      crawl.logs.push(`[${new Date().toLocaleTimeString()}] 【数据联动与自动沉淀】该外部联网内容已被一键沉淀、无感同步入库本地知识库！`);
    } catch (err) {
      console.error("Gemini crawling simulator failed:", err);
      crawl.status = "failed";
      crawl.logs.push(`[${new Date().toLocaleTimeString()}] 网路异常：${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    // Fallback simulation
    setTimeout(() => {
      const mockContent = `【标题：小红书近期最高热议：如何通过“合魂思维”组建自己的数字分身网】\n\n近日，大批顶尖内容创作者开始普及“合魂合成（Synthesize Souls）”的智能体系。通过将严谨、富逻辑的日常文档与带网感的自媒体爆款大纲有机重组，哪怕是零经验小白也可以在3秒产出极其逼真的多平台神作！本篇文章详尽讲解了爬虫联动企业业务系统的全景指南，推荐阅读！`;
      const resultDoc = {
        id: "doc-scraped-" + Date.now(),
        title: "小红书科技大V爆款动态：如何通过‘合魂思维’组建自己的数字分身网",
        content: mockContent,
        type: "crawler" as const,
        category: "爬虫数据自动归档",
        size: "1.2 KB",
        tags: ["网络公开素材", crawl.platform, "排版干货"],
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        crawlerId: crawl.id
      };
      db.docs.unshift(resultDoc);
      crawl.scrapedDocsCount = 1;
      crawl.status = "completed";
      crawl.syncStatus = "synced";
      crawl.logs.push(`[${new Date().toLocaleTimeString()}] (离线模式) 成功模拟采集。`);
      crawl.logs.push(`[${new Date().toLocaleTimeString()}] 提示：数据已同步沉淀到知识库本地！`);
      saveDatabase();
    }, 1500);
  }

  saveDatabase();
  res.json({ success: true, crawler: crawl });
});


// 5. EXTERNAL BUSINESS SYSTEM ENDPOINTS (业务对接)

app.get("/api/business/feeds", (req, res) => {
  res.json({ feeds: db.feeds });
});

// Trigger all unsynced business feeds syncing to Local Knowledge Base
app.post("/api/business/sync-all", (req, res) => {
  let syncCount = 0;
  
  db.feeds.forEach(feed => {
    if (feed.syncToKbStatus === "unsynced") {
      feed.syncToKbStatus = "synced";
      
      // Auto build a document and insert to Knowledge Base
      const docId = "doc-business-" + Date.now() + "-" + Math.floor(Math.random() * 100);
      const content = `【企业对接模块同步正文】
标题：${feed.title}
来源系统：${feed.source}
业务类型：${feed.category}
同步流转时间：${new Date().toLocaleString()}

详细流转数据：
${feed.content}

*批注：自业务端自动沉淀的未加工行业/产品素材，已实时同步至本地知识库体系，供全体AI员工、各分段选题官、研究官和写作官随时合规调取。*`;

      const newDoc = {
        id: docId,
        title: feed.title,
        content,
        type: "business" as const,
        category: "业务系统同步对接",
        size: ((Buffer.byteLength(content, 'utf8')) / 1024).toFixed(1) + " KB",
        tags: ["企业业务流", feed.source, "自动同步"],
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      
      db.docs.unshift(newDoc);
      syncCount++;
    }
  });

  saveDatabase();
  res.json({ success: true, syncCount, docs: db.docs });
});


// 6. AI COGNITIVE CHATBOT ENDPOINT (AI 全系统域智能对话)

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages payload is required and must be an array." });
  }

  // Inject comprehensive system domain metadata for absolute omniscient knowledge (全系统全域认知能力)
  const systemCognitveContext = `
你是一个专为本系统搭载的、具备全视视角的【全域AI智能交互双向闭环智能体】。
你完整掌握全系统六大核心功能及其逻辑关系。如果有用户向你咨询，请根据这一份【全域知识图谱】和【实时业务数据】给予极度专业、接地气、开箱即用的解答：

【系统说明：六大核心功能知识图谱】
一、知识库功能
- 支持导入多格式文档。系统会自动结合Gemini提取“智能分类（如：运营方案、企业规章）”和“提取核心Tag”。
- 🌟炼魂（人格魂魄提取）：支持选定一个长文本/书稿/方案，淬炼出“灵魂碎片”特征。这些碎片包含 Traits、 voiceStyle 和 toneDescription。
- 🌟合魂（多碎片合成）：支持选择多个碎片，通过大模型完美提炼融合为一套可以继承的“灵魂人格”，供AI员工管理中使用。

二、AI员工管理
- 支持选题官、研究官、写作官的生命周期增删改查。配置其姓名、特色、并能与合成好的「灵魂（Soul）」完成灵魂绑定。
- 内置一套AI选题官（擅长制造噱头、钩子大纲）、AI研究官（细化结构、寻查数据）、AI写作官（针对微信号、小红书、微博、抖音分发转译不一样的口气）。

三、内容创作工作台
- 选题创作模式：先选主题由选题官生成3组选题 -> 用户选定 -> 研究官完成资料脱水和排版大纲说明 -> 写作官按照绑定灵魂的人格，精调定制化文案产出成可供直接复制的Markdown！
- 直接创作模式：一键跳过选题大纲确认，直接由写作官完成深度生产。
- 四大发布平台支持：一键渲染 1) 微信公众号 2) 小红书（极多 Emoji & 标签 Hashtag） 3) 微博 4) 抖音短剧本。
- 一键保存沉淀：多平台文稿直接一键备份流转进【知识库】，实现本地高阶闭环。

四、独立爬虫模块
- 允许用户对小红书、公众号或企业官网的外部链接，创建独立的定向采集任务。
- 启动模拟采集：模型会深层次解析该链接并提炼精华干货，并且【爬虫数据直接无缝同步自动沉淀到知识库】，让采集-创作-沉淀完全打通。

五、业务对接模块
- 高阶打通第三方ERP、客户CRM等外部系统（例如客服警报、进销存清单），能点击“一键数据实时同步”，这些业务端鲜活变动的料会批量并入知识库。

【当前你的宿主工作区实时数据大盘】
- 知识库目前包含文档数: ${db.docs.length} 个
- 自主提取的灵魂碎片: ${db.fragments.length} 个
- 已经合成装配的灵魂人格(Soul): ${db.souls.length} 个
- 当前团队常驻AI员工: ${db.employees.map(e => `${e.name}(岗位:${e.role}, 灵魂:${e.soulId ? '已绑定' : '未绑定'})`).join(", ")}
- 当前活跃创作及完成的并行业务任务数: ${db.tasks.length} 

此时此刻，用户正在和你说话。作为全域认知智能体，请用一种冷静睿智、非常乐企帮、行文温和有力的语气，多用列表和具体指导。解答他们的所有疑惑，或者帮他们构想如何把当前的某一篇文档，合魂成最合适的AI员工！`;

  if (ai) {
    try {
      // Build chat prompt sequence
      const formattedContents = messages.map(msg => ({
        role: msg.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemCognitveContext,
        }
      });

      res.json({ success: true, response: response.text || "我似乎卡网了，请重试一下哈！" });
    } catch (err) {
      console.error("Gemini system assistant chat error:", err);
      res.status(500).json({ error: "Gemini 引擎应答故障，请稍后重试。" });
    }
  } else {
    // Offline assistance answers
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let responseText = "【由于当前未成功识别到 API 秘钥，本助手处于本地离线辅助状态】\n\n您可以使用如下操作指引：\n";
    if (lastUserMsg.includes("爬虫")) {
      responseText += "1. 打开左侧“爬虫模块”面板。\n2. 输入你想采集的公开网文链接（例如：小红书、微信等）。\n3. 点击“启动爬取研究”，抓取成型的干货将全自动无感沉积至知识库列表，实现智能化回流复用。";
    } else if (lastUserMsg.includes("合魂") || lastUserMsg.includes("炼魂") || lastUserMsg.includes("灵魂")) {
      responseText += "在咱们系统的“知识库功能”中，你可以点击任一入库文档右侧的“🔮 人格炼魂”按钮，AI会将文档淬炼成灵魂碎片。然后在“魂力提炼与合成”页，选中多个灵魂碎片点击“一键合成”，即可熔炼出拥有综合写作特色的灵魂(Soul)注入AI员工体内！";
    } else {
      responseText += "我是一个高熟稔度、全系统全域认知智能体。你可以问我关于“一键人格淬灭合魂”、“多工位选题研究写作流水线”、“爬虫自动沉淀闭环”或“同步ERP/CRM等业务数据”。请尽情试用！";
    }
    res.json({ success: true, response: responseText });
  }
});


// -----------------------------------------------------
// Vite Dev Server / Static Content routing
// -----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Agent System is successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
