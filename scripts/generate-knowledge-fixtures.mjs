/**
 * One-shot fixture generator for Copilot Knowledge mock data.
 * Run: node scripts/generate-knowledge-fixtures.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../src/mock/knowledge");

const users = [
  { id: "user_001", displayName: "张三", email: "zhangsan@example.com" },
  { id: "user_002", displayName: "李四", email: "lisi@example.com" },
  { id: "user_003", displayName: "王五", email: "wangwu@example.com" },
  { id: "user_004", displayName: "赵六", email: "zhaoliu@example.com" },
  { id: "user_005", displayName: "陈七", email: "chenqi@example.com" },
];

const iso = (offsetDays = 0, hour = 10) => {
  const d = new Date("2026-07-01T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

const kbDefs = [
  {
    id: "kb_001",
    name: "销售产品知识库",
    description: "覆盖产品卖点、报价策略与竞品分析等销售资料。",
    icon: "package",
    tags: ["销售", "产品"],
    status: "active",
    visibility: "organization",
    parserStrategy: "general",
    embeddingModel: "bge-m3",
    chunkSize: 512,
  },
  {
    id: "kb_002",
    name: "财务管理制度",
    description: "费用报销、预算控制、会计核算等相关制度文档。",
    icon: "wallet",
    tags: ["财务", "制度"],
    status: "active",
    visibility: "department",
    parserStrategy: "manual",
    embeddingModel: "bge-m3",
    chunkSize: 768,
  },
  {
    id: "kb_003",
    name: "采购流程规范",
    description: "采购申请、供应商准入、招标与验收流程说明。",
    icon: "truck",
    tags: ["采购", "流程"],
    status: "active",
    visibility: "organization",
    parserStrategy: "general",
    embeddingModel: "text-embedding-3-large",
    chunkSize: 512,
  },
  {
    id: "kb_004",
    name: "合同模板库",
    description: "标准合同、补充协议与条款修订说明。",
    icon: "file-text",
    tags: ["合同", "法务"],
    status: "active",
    visibility: "department",
    parserStrategy: "manual",
    embeddingModel: "bge-m3",
    chunkSize: 1024,
  },
  {
    id: "kb_005",
    name: "产品技术资料",
    description: "产品规格、安装手册、版本发布说明。",
    icon: "cpu",
    tags: ["产品", "技术"],
    status: "syncing",
    visibility: "organization",
    parserStrategy: "qa",
    embeddingModel: "bge-m3",
    chunkSize: 512,
  },
  {
    id: "kb_006",
    name: "人力资源政策",
    description: "考勤、绩效、薪酬与员工手册。",
    icon: "users",
    tags: ["HR", "政策"],
    status: "active",
    visibility: "private",
    parserStrategy: "general",
    embeddingModel: "bge-m3",
    chunkSize: 512,
  },
  {
    id: "kb_007",
    name: "客户服务手册",
    description: "客服话术、工单处理与售后流程。",
    icon: "headset",
    tags: ["客服", "售后"],
    status: "error",
    visibility: "organization",
    parserStrategy: "general",
    embeddingModel: "text-embedding-3-large",
    chunkSize: 384,
  },
  {
    id: "kb_008",
    name: "安全合规知识库",
    description: "信息安全、权限管控与合规审查资料。",
    icon: "shield",
    tags: ["权限", "合规", "安全"],
    status: "disabled",
    visibility: "department",
    parserStrategy: "manual",
    embeddingModel: "bge-m3",
    chunkSize: 640,
  },
];

const docSpecs = [
  // kb_001 x4
  [
    "doc_001",
    "kb_001",
    "销售话术手册.pdf",
    "pdf",
    "application/pdf",
    2_450_000,
    3,
    "completed",
    "organization",
    86,
    24,
  ],
  [
    "doc_002",
    "kb_001",
    "产品报价策略.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    380_000,
    2,
    "completed",
    "organization",
    42,
    12,
  ],
  [
    "doc_003",
    "kb_001",
    "竞品分析-2026Q2.xlsx",
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    520_000,
    1,
    "completed",
    "department",
    28,
    8,
  ],
  [
    "doc_004",
    "kb_001",
    "大客户跟进指南.md",
    "md",
    "text/markdown",
    48_000,
    1,
    "parsing",
    "organization",
    0,
    null,
  ],
  // kb_002 x3
  [
    "doc_005",
    "kb_002",
    "费用报销制度.pdf",
    "pdf",
    "application/pdf",
    1_120_000,
    2,
    "completed",
    "department",
    64,
    18,
  ],
  [
    "doc_006",
    "kb_002",
    "预算管理办法.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    290_000,
    1,
    "completed",
    "department",
    35,
    10,
  ],
  [
    "doc_007",
    "kb_002",
    "会计科目说明.xlsx",
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    410_000,
    1,
    "failed",
    "private",
    0,
    null,
  ],
  // kb_003 x3
  [
    "doc_008",
    "kb_003",
    "采购申请流程.pdf",
    "pdf",
    "application/pdf",
    890_000,
    2,
    "completed",
    "organization",
    51,
    15,
  ],
  [
    "doc_009",
    "kb_003",
    "供应商准入标准.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    240_000,
    1,
    "completed",
    "organization",
    30,
    9,
  ],
  [
    "doc_010",
    "kb_003",
    "招标评分表.xlsx",
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    180_000,
    1,
    "pending",
    "department",
    0,
    null,
  ],
  // kb_004 x3
  [
    "doc_011",
    "kb_004",
    "标准销售合同.pdf",
    "pdf",
    "application/pdf",
    760_000,
    3,
    "completed",
    "department",
    72,
    20,
  ],
  [
    "doc_012",
    "kb_004",
    "保密协议模板.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    96_000,
    1,
    "completed",
    "organization",
    18,
    5,
  ],
  [
    "doc_013",
    "kb_004",
    "合同条款修订说明.md",
    "md",
    "text/markdown",
    32_000,
    1,
    "completed",
    "department",
    22,
    null,
  ],
  // kb_005 x3
  [
    "doc_014",
    "kb_005",
    "产品规格说明书.pdf",
    "pdf",
    "application/pdf",
    3_200_000,
    2,
    "completed",
    "organization",
    110,
    36,
  ],
  [
    "doc_015",
    "kb_005",
    "安装部署手册.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    540_000,
    1,
    "completed",
    "organization",
    48,
    14,
  ],
  [
    "doc_016",
    "kb_005",
    "版本发布说明-v3.2.md",
    "md",
    "text/markdown",
    28_000,
    1,
    "parsing",
    "organization",
    0,
    null,
  ],
  // kb_006 x2
  [
    "doc_017",
    "kb_006",
    "员工手册2026.pdf",
    "pdf",
    "application/pdf",
    1_560_000,
    1,
    "completed",
    "private",
    90,
    28,
  ],
  [
    "doc_018",
    "kb_006",
    "绩效考核标准.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    210_000,
    1,
    "completed",
    "private",
    26,
    7,
  ],
  // kb_007 x3
  [
    "doc_019",
    "kb_007",
    "客服话术库.pdf",
    "pdf",
    "application/pdf",
    680_000,
    1,
    "failed",
    "organization",
    0,
    null,
  ],
  [
    "doc_020",
    "kb_007",
    "工单处理流程.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    175_000,
    1,
    "completed",
    "organization",
    24,
    6,
  ],
  [
    "doc_021",
    "kb_007",
    "售后FAQ.txt",
    "txt",
    "text/plain",
    22_000,
    1,
    "completed",
    "custom",
    16,
    null,
  ],
  // kb_008 x3
  [
    "doc_022",
    "kb_008",
    "权限矩阵说明.pdf",
    "pdf",
    "application/pdf",
    430_000,
    2,
    "completed",
    "department",
    40,
    11,
  ],
  [
    "doc_023",
    "kb_008",
    "信息安全制度.docx",
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    310_000,
    1,
    "completed",
    "department",
    33,
    9,
  ],
  [
    "doc_024",
    "kb_008",
    "合规审查清单.xlsx",
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    150_000,
    1,
    "pending",
    "private",
    0,
    null,
  ],
];

const documents = docSpecs.map((spec, index) => {
  const [
    id,
    knowledgeBaseId,
    name,
    extension,
    mimeType,
    size,
    currentVersion,
    parseStatus,
    visibility,
    chunkCount,
    pageCount,
  ] = spec;
  const updater = users[index % users.length];
  return {
    id,
    knowledgeBaseId,
    name,
    extension,
    mimeType,
    size,
    currentVersion,
    parseStatus,
    visibility,
    chunkCount,
    ...(pageCount == null ? {} : { pageCount }),
    updatedBy: updater,
    createdAt: iso(index + 1, 9),
    updatedAt: iso(index + 10, 15),
  };
});

const kbDocStats = Object.fromEntries(
  kbDefs.map((kb) => {
    const docs = documents.filter((d) => d.knowledgeBaseId === kb.id);
    return [
      kb.id,
      {
        documentCount: docs.length,
        chunkCount: docs.reduce((sum, d) => sum + d.chunkCount, 0),
      },
    ];
  })
);

const knowledgeBases = kbDefs.map((kb, i) => ({
  ...kb,
  documentCount: kbDocStats[kb.id].documentCount,
  chunkCount: kbDocStats[kb.id].chunkCount,
  owner: users[i % users.length],
  createdAt: iso(i * 3, 8),
  updatedAt: iso(20 + i, 16),
}));

const knowledgeSets = [
  {
    id: "ks_001",
    name: "销售工作知识集",
    description: "面向一线销售的产品、合同与话术检索集合。",
    knowledgeBaseIds: ["kb_001", "kb_004", "kb_005"],
    weights: { kb_001: 0.45, kb_004: 0.25, kb_005: 0.3 },
    visibility: "organization",
    retrievalConfig: {
      topK: 6,
      similarityThreshold: 0.62,
      keywordWeight: 0.35,
      vectorWeight: 0.65,
      enableRerank: true,
      answerModel: "qwen2.5-72b-instruct",
    },
    createdBy: users[0],
    createdAt: iso(5, 11),
    updatedAt: iso(28, 14),
  },
  {
    id: "ks_002",
    name: "财务制度集",
    description: "财务报销、预算与核算制度问答集合。",
    knowledgeBaseIds: ["kb_002"],
    weights: { kb_002: 1 },
    visibility: "department",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.7,
      keywordWeight: 0.4,
      vectorWeight: 0.6,
      enableRerank: true,
      answerModel: "qwen2.5-72b-instruct",
    },
    createdBy: users[1],
    createdAt: iso(6, 11),
    updatedAt: iso(27, 14),
  },
  {
    id: "ks_003",
    name: "采购与合同集",
    description: "采购规范与合同条款联合检索。",
    knowledgeBaseIds: ["kb_003", "kb_004"],
    weights: { kb_003: 0.55, kb_004: 0.45 },
    visibility: "organization",
    retrievalConfig: {
      topK: 8,
      similarityThreshold: 0.6,
      keywordWeight: 0.3,
      vectorWeight: 0.7,
      enableRerank: false,
      answerModel: "deepseek-v3",
    },
    createdBy: users[2],
    createdAt: iso(7, 11),
    updatedAt: iso(26, 14),
  },
  {
    id: "ks_004",
    name: "产品资料集",
    description: "产品规格、发布说明与相关销售资料。",
    knowledgeBaseIds: ["kb_005", "kb_001"],
    weights: { kb_005: 0.6, kb_001: 0.4 },
    visibility: "organization",
    retrievalConfig: {
      topK: 5,
      similarityThreshold: 0.65,
      keywordWeight: 0.25,
      vectorWeight: 0.75,
      enableRerank: true,
      answerModel: "qwen2.5-72b-instruct",
    },
    createdBy: users[3],
    createdAt: iso(8, 11),
    updatedAt: iso(25, 14),
  },
].map((ks) => ({
  ...ks,
  documentCount: documents.filter((d) =>
    ks.knowledgeBaseIds.includes(d.knowledgeBaseId)
  ).length,
}));

const documentVersions = [];
let verSeq = 1;
for (const doc of documents) {
  for (let v = 1; v <= doc.currentVersion; v++) {
    const isCurrent = v === doc.currentVersion;
    const status = isCurrent
      ? "current"
      : v === doc.currentVersion - 1
        ? "replaced"
        : "archived";
    documentVersions.push({
      id: `ver_${String(verSeq).padStart(3, "0")}`,
      documentId: doc.id,
      version: v,
      fileName:
        v === doc.currentVersion
          ? doc.name
          : doc.name.replace(/(\.[^.]+)$/, `_v${v}$1`),
      size: Math.max(10_000, Math.round(doc.size * (0.7 + v * 0.1))),
      mimeType: doc.mimeType,
      status,
      parseStatus: isCurrent ? doc.parseStatus : "completed",
      uploadedBy: users[(verSeq + v) % users.length],
      createdAt: iso(doc.currentVersion + v, 10 + v),
    });
    verSeq += 1;
  }
}

// Ensure exactly 32 versions: pad with archived extras on multi-version docs if short
while (documentVersions.length < 32) {
  const doc = documents[documentVersions.length % documents.length];
  const extraVersion =
    Math.max(
      ...documentVersions
        .filter((x) => x.documentId === doc.id)
        .map((x) => x.version),
      0
    ) + 1;
  documentVersions.push({
    id: `ver_${String(verSeq).padStart(3, "0")}`,
    documentId: doc.id,
    version: extraVersion,
    fileName: doc.name.replace(/(\.[^.]+)$/, `_hist${extraVersion}$1`),
    size: Math.round(doc.size * 0.65),
    mimeType: doc.mimeType,
    status: "archived",
    parseStatus: "completed",
    uploadedBy: users[verSeq % users.length],
    createdAt: iso(40 + verSeq, 12),
  });
  verSeq += 1;
}

const permissions = [
  ["perm_001", "knowledge_base", "kb_001", users[0], "Owner"],
  ["perm_002", "knowledge_base", "kb_001", users[1], "Editor"],
  ["perm_003", "knowledge_base", "kb_002", users[1], "Owner"],
  ["perm_004", "knowledge_base", "kb_002", users[2], "Viewer"],
  ["perm_005", "knowledge_base", "kb_003", users[2], "Owner"],
  ["perm_006", "knowledge_base", "kb_004", users[3], "Manager"],
  ["perm_007", "knowledge_base", "kb_005", users[0], "Owner"],
  ["perm_008", "knowledge_set", "ks_001", users[0], "Owner"],
  ["perm_009", "knowledge_set", "ks_002", users[1], "Manager"],
  ["perm_010", "document", "doc_001", users[0], "Owner"],
  ["perm_011", "document", "doc_011", users[3], "Editor"],
  ["perm_012", "document", "doc_022", users[4], "Viewer"],
].map(([id, resourceType, resourceId, user, role], i) => ({
  id,
  resourceType,
  resourceId,
  user,
  role,
  createdAt: iso(12 + i, 9),
}));

const uploadJobs = [
  {
    id: "job_001",
    knowledgeBaseId: "kb_001",
    fileName: "新客攻坚案例.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 920_000,
    status: "completed",
    progress: 100,
    documentId: "doc_001",
    createdAt: iso(30, 9),
    updatedAt: iso(30, 10),
  },
  {
    id: "job_002",
    knowledgeBaseId: "kb_002",
    fileName: "差旅费标准-待审.docx",
    extension: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 140_000,
    status: "parsing",
    progress: 62,
    createdAt: iso(31, 9),
    updatedAt: iso(31, 10),
  },
  {
    id: "job_003",
    knowledgeBaseId: "kb_003",
    fileName: "供应商评分模板.xlsx",
    extension: "xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 88_000,
    status: "uploading",
    progress: 35,
    createdAt: iso(32, 9),
    updatedAt: iso(32, 9),
  },
  {
    id: "job_004",
    knowledgeBaseId: "kb_004",
    fileName: "fail_合同草稿.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 210_000,
    status: "failed",
    progress: 78,
    forceFail: true,
    errorMessage: "解析超时：Mock 固定失败案例",
    createdAt: iso(33, 9),
    updatedAt: iso(33, 11),
  },
  {
    id: "job_005",
    knowledgeBaseId: "kb_005",
    fileName: "固件升级指南.md",
    extension: "md",
    mimeType: "text/markdown",
    size: 18_000,
    status: "waiting",
    progress: 0,
    createdAt: iso(34, 9),
    updatedAt: iso(34, 9),
  },
  {
    id: "job_006",
    knowledgeBaseId: "kb_006",
    fileName: "新人入职清单.pdf",
    extension: "pdf",
    mimeType: "application/pdf",
    size: 360_000,
    status: "completed",
    progress: 100,
    documentId: "doc_017",
    createdAt: iso(29, 9),
    updatedAt: iso(29, 11),
  },
  {
    id: "job_007",
    knowledgeBaseId: "kb_007",
    fileName: "客诉升级机制.docx",
    extension: "docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 126_000,
    status: "cancelled",
    progress: 20,
    createdAt: iso(28, 9),
    updatedAt: iso(28, 10),
  },
  {
    id: "job_008",
    knowledgeBaseId: "kb_008",
    fileName: "权限审计周报.xlsx",
    extension: "xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 95_000,
    status: "completed",
    progress: 100,
    createdAt: iso(27, 9),
    updatedAt: iso(27, 11),
  },
];

const chatSessions = [
  {
    id: "session_001",
    title: "销售报价相关问题",
    knowledgeSetId: "ks_001",
    answerMode: "detailed",
    showCitations: true,
    createdAt: iso(20, 13),
    updatedAt: iso(35, 16),
  },
  {
    id: "session_002",
    title: "报销制度咨询",
    knowledgeSetId: "ks_002",
    answerMode: "concise",
    showCitations: true,
    createdAt: iso(21, 13),
    updatedAt: iso(34, 15),
  },
  {
    id: "session_003",
    title: "采购流程答疑",
    knowledgeSetId: "ks_003",
    answerMode: "structured",
    showCitations: true,
    createdAt: iso(22, 13),
    updatedAt: iso(33, 14),
  },
  {
    id: "session_004",
    title: "合同条款对比",
    knowledgeSetId: "ks_003",
    answerMode: "detailed",
    showCitations: true,
    createdAt: iso(23, 13),
    updatedAt: iso(32, 14),
  },
  {
    id: "session_005",
    title: "产品规格确认",
    knowledgeSetId: "ks_004",
    answerMode: "concise",
    showCitations: false,
    createdAt: iso(24, 13),
    updatedAt: iso(31, 14),
  },
  {
    id: "session_006",
    title: "权限开通申请",
    knowledgeSetId: "ks_001",
    answerMode: "structured",
    showCitations: true,
    createdAt: iso(25, 13),
    updatedAt: iso(30, 14),
  },
];

const messagePairs = [
  [
    "session_001",
    "我们产品的销售报价策略有哪些要点？",
    "根据销售产品知识库，报价策略重点包括分层折扣、大客户特批路径与竞品对标底线。建议优先参考《产品报价策略》与《销售话术手册》。",
  ],
  [
    "session_001",
    "大客户特批需要谁审批？",
    "大客户特批通常需要销售负责人与商务会签，超过阈值时需区域总监最终确认。具体阈值以制度版本为准。",
  ],
  [
    "session_002",
    "差旅报销的酒店上限是多少？",
    "按财务管理制度，国内差旅酒店上限按职级与城市类别区分，一线城市经理级上限更高。请以最新《费用报销制度》为准。",
  ],
  [
    "session_002",
    "预算外费用如何申请？",
    "预算外费用需先填写加签申请，经部门负责人与财务 BP 审批后方可报销。",
  ],
  [
    "session_003",
    "新供应商准入要准备什么材料？",
    "一般需要营业执照、资质证书、近三年财务报表与样品检测报告，详见《供应商准入标准》。",
  ],
  [
    "session_003",
    "采购招标评分维度有哪些？",
    "常见维度包括价格、交付周期、质量体系与售后服务，可参考《招标评分表》。",
  ],
  [
    "session_004",
    "标准销售合同违约金条款怎么写？",
    "模板建议按合同总额一定比例设置违约金，并约定宽限期。请核对《标准销售合同》现行版本。",
  ],
  [
    "session_005",
    "当前主产品的安装环境要求？",
    "建议至少满足文档中列出的操作系统、内存与网络端口要求，详见《安装部署手册》。",
  ],
  [
    "session_005",
    "v3.2 发布包含哪些变更？",
    "版本说明中列出了稳定性修复、权限控制增强与若干 API 兼容性改动。",
  ],
  [
    "session_006",
    "如何申请知识库编辑权限？",
    "可在成员与权限中由 Owner/Manager 授予 Editor 角色；组织级可见范围变更需管理员审批。",
  ],
];

const chatMessages = [];
let msgSeq = 1;
for (const [sessionId, userContent, assistantContent] of messagePairs) {
  chatMessages.push({
    id: `msg_${String(msgSeq).padStart(3, "0")}`,
    sessionId,
    role: "user",
    content: userContent,
    createdAt: iso(20 + msgSeq, 13),
  });
  msgSeq += 1;
  chatMessages.push({
    id: `msg_${String(msgSeq).padStart(3, "0")}`,
    sessionId,
    role: "assistant",
    content: assistantContent,
    citations: [
      {
        id: `cite_${msgSeq}_1`,
        documentId: "doc_001",
        documentName: "销售话术手册.pdf",
        knowledgeBaseName: "销售产品知识库",
        version: 3,
        page: 4,
        chunkText: assistantContent.slice(0, 60),
        score: 0.86,
      },
      {
        id: `cite_${msgSeq}_2`,
        documentId: "doc_002",
        documentName: "产品报价策略.docx",
        knowledgeBaseName: "销售产品知识库",
        version: 2,
        page: 2,
        chunkText: "报价策略重点包括分层折扣与大客户特批路径。",
        score: 0.81,
      },
    ],
    createdAt: iso(20 + msgSeq, 13),
  });
  msgSeq += 1;
}

const chatAnswerFixtures = [
  {
    id: "ans_001",
    keywords: ["销售"],
    answer:
      "关于销售场景，建议结合话术手册与报价策略：先明确客户层级，再匹配对应折扣与审批路径，并用竞品分析材料辅助谈判。",
    citationDocumentIds: ["doc_001", "doc_002", "doc_003"],
  },
  {
    id: "ans_002",
    keywords: ["财务", "报销"],
    answer:
      "财务相关问题请优先查阅费用报销制度与预算管理办法：提交单据前确认预算科目、发票合规与审批链路。",
    citationDocumentIds: ["doc_005", "doc_006"],
  },
  {
    id: "ans_003",
    keywords: ["采购"],
    answer:
      "采购流程通常包含申请立项、供应商准入、招标评分与验收归档。可按《采购申请流程》与《供应商准入标准》逐步准备材料。",
    citationDocumentIds: ["doc_008", "doc_009", "doc_010"],
  },
  {
    id: "ans_004",
    keywords: ["合同"],
    answer:
      "合同条款应对照标准销售合同与保密协议模板，重点核对主体信息、违约金、交付与验收、争议解决条款是否按最新修订说明更新。",
    citationDocumentIds: ["doc_011", "doc_012", "doc_013"],
  },
  {
    id: "ans_005",
    keywords: ["产品"],
    answer:
      "产品相关问题可从规格说明书、安装部署手册与版本发布说明中获取：先确认版本，再按环境要求部署，并核对变更影响。",
    citationDocumentIds: ["doc_014", "doc_015", "doc_016"],
  },
  {
    id: "ans_006",
    keywords: ["权限"],
    answer:
      "权限管理建议依据权限矩阵与信息安全制度：按角色授予最小权限，定期审计，并保留审批记录。",
    citationDocumentIds: ["doc_022", "doc_023"],
  },
  {
    id: "ans_007",
    keywords: ["报价", "折扣"],
    answer:
      "报价与折扣需遵循分层策略：标准价、框架价与特批价分别对应不同审批门槛，请结合报价策略文档执行。",
    citationDocumentIds: ["doc_002", "doc_001"],
  },
  {
    id: "ans_008",
    keywords: ["供应商", "准入"],
    answer:
      "供应商准入需提交证照与能力证明，完成资格评审后可进入短名单。详细材料清单参见准入标准文档。",
    citationDocumentIds: ["doc_009", "doc_008"],
  },
  {
    id: "ans_009",
    keywords: ["预算"],
    answer:
      "预算管理强调事前控制：申请时绑定预算科目，预算外事项走加签流程，避免事后冲销。",
    citationDocumentIds: ["doc_006", "doc_005"],
  },
  {
    id: "ans_010",
    keywords: ["默认", "通用"],
    answer:
      "我已根据当前知识集检索到相关资料。建议优先打开引用来源中的文档核对原文，如需更精确答案请补充业务场景与目标对象。",
    citationDocumentIds: ["doc_001", "doc_014"],
  },
];

const parseStatusSummary = {
  completed: documents.filter((d) => d.parseStatus === "completed").length,
  parsing: documents.filter((d) => d.parseStatus === "parsing").length,
  failed: documents.filter((d) => d.parseStatus === "failed").length,
  pending: documents.filter((d) => d.parseStatus === "pending").length,
};

const dashboard = {
  stats: {
    knowledgeBaseCount: knowledgeBases.length,
    knowledgeSetCount: knowledgeSets.length,
    documentCount: documents.length,
    weeklyQueryCount: 368,
  },
  recentKnowledgeSetIds: ["ks_001", "ks_002", "ks_004", "ks_003"],
  recentDocumentIds: [
    "doc_016",
    "doc_004",
    "doc_014",
    "doc_011",
    "doc_008",
    "doc_001",
  ],
  parseStatusSummary,
};

const files = {
  "dashboard.json": dashboard,
  "knowledge-bases.json": knowledgeBases,
  "knowledge-sets.json": knowledgeSets,
  "documents.json": documents,
  "document-versions.json": documentVersions.slice(0, 32),
  "permissions.json": permissions,
  "upload-jobs.json": uploadJobs,
  "chat-sessions.json": chatSessions,
  "chat-messages.json": chatMessages,
  "chat-answer-fixtures.json": chatAnswerFixtures,
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, data] of Object.entries(files)) {
  fs.writeFileSync(
    path.join(outDir, name),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );
}

const counts = Object.fromEntries(
  Object.entries(files).map(([k, v]) => [
    k,
    Array.isArray(v) ? v.length : "object",
  ])
);
console.log("Wrote fixtures:", counts);
console.log(
  "messages:",
  chatMessages.length,
  "versions:",
  documentVersions.slice(0, 32).length
);
