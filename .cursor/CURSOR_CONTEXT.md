# AutoTask Context

> Agent 快速入口。详细说明见项目架构规则与 `prd/v0.1.md`。

## 当前阶段

Phase 1: Knowledge Desktop Demo (Mock 知识业务 + 真实 nodeskclaw 登录)

## 架构入口

```
src/
├── main.ts / preload.ts     Main + Preload
├── ipc/                     oRPC 路由（Native 能力）
├── actions/                 IPC 封装（Feature 调用此层）
├── routes/                  文件路由（薄层）
├── features/                业务模块
├── services/knowledge/      知识数据访问层（Repository）
├── stores/                  Zustand Persist
└── types/                   领域类型
```

## 业务模块

| 模块 | 路径 |
|------|------|
| Knowledge Home | `src/features/knowledge-home` |
| Knowledge Bases | `src/features/knowledge-bases` |
| Knowledge Sets | `src/features/knowledge-sets` |
| Documents | `src/features/documents` |
| Uploads | `src/features/uploads` |
| Knowledge Chat | `src/features/knowledge-chat` |
| Profile | `src/features/profile` |
| Preferences | `src/features/preferences` |

## 不要修改

- `components/ui/` — shadcn 基础组件
- `ipc/manager.ts`, `ipc/handler.ts` — IPC 引导
- `routes/__root.tsx` — 路由根
- `routeTree.gen.ts` — 自动生成（可由插件覆盖）

## 工作流

```
读 CURSOR_CONTEXT.md → 定位 feature → 遵守 rules → 最小修改
```

## 开发方向

```
Mock Knowledge Repository → RemoteKnowledgeRepository → nodeskclaw-knowledge
```
