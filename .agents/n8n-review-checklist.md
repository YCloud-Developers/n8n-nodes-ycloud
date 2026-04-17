# n8n community node review checklist

本节点曾被 n8n Cloud 审核打回，以下是审核员实际指出的问题和修复要点。**每次
发版前对照此清单自检**，避免同类问题再次被退回。

## Codex 分类必须来自官方白名单
`nodes/<Node>/<Node>.node.json` 里的 `categories` 只能使用以下值：

- Analytics
- Communication
- Data & Storage
- Development
- Finance & Accounting
- **Marketing & Content**（注意：不是 "Marketing & Growth"）
- Miscellaneous
- Productivity
- Sales
- Utility

参考：<https://docs.n8n.io/integrations/creating-nodes/build/reference/node-codex-files/>

## 代码注释与文档必须是英文
审核会扫描源码，**任何非英文注释都会被标为 MEDIUM 级问题**。包括但不限于：

- `// ...` 行内注释
- `/* ... */` 块注释
- JSDoc
- 字符串字面量中作为说明性文本的内容

中文仅允许出现在：用户可见的 `displayName`/`description` 且确实面向中文用户时
（本项目目前全部面向英文用户，所以不允许）。

## 不允许"吞错误"的 catch 块
下面的写法会被判 MEDIUM：

```ts
try {
  await doSomething();
} catch {
  return { fields: [] };    // ❌ 用户无法诊断失败原因
}
```

正确做法——把错误转成 `NodeApiError` 抛出，UI 会显示详细信息：

```ts
import { NodeApiError, type JsonObject } from 'n8n-workflow';

try {
  await doSomething();
} catch (error) {
  throw new NodeApiError(this.getNode(), error as JsonObject, {
    message: 'Failed to load X',
    description: '说明可能的原因和排查方向',
  });
}
```

适用场景：`loadOptions`、`resourceMapping`、`webhook` 等回调方法里的外部请求。

## Get Many / list 操作必须支持 returnAll + 分页
只给一个 `limit`（最多 100）且无"获取全部"开关的 `getAll` 会被判 LOW。必须按
n8n 标准 UI 模式实现：

```
┌─ Return All  [toggle]       ← 标准名/位置
├─ Limit       [1..100] (仅 returnAll=false 时显示)
└─ Filters     [collection]
```

**UI 对用户是标准的 returnAll/limit**，底层请求按实际 API 要求发送。YCloud API
使用 `page`（1-based）+ `limit` 分页，所以 routing 这么写：

```ts
{
  displayName: 'Return All',
  name: 'returnAll',
  type: 'boolean',
  default: false,
  routing: {
    send: { paginate: '={{ $value }}' },
    operations: {
      pagination: {
        type: 'generic',
        properties: {
          continue: '={{ ($response.body.items || []).length >= 100 }}',
          request: {
            qs: {
              page: '={{ $pageCount + 1 }}',    // 1-based
              limit: 100,                        // YCloud 单页上限
            },
          },
        },
      },
    },
  },
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  typeOptions: { minValue: 1, maxValue: 100 },
  default: 50,
  displayOptions: { show: { returnAll: [false] } },
  routing: {
    send: { type: 'query', property: 'limit' },
    output: { maxResults: '={{ $value }}' },
  },
},
```

**参数模式对照**：

| API 分页模式 | pagination 配置 |
|---|---|
| `?page=N&limit=M`（本项目 YCloud） | `type: 'generic'` + `qs.page = {{ $pageCount + 1 }}` |
| `?offset=N&limit=M` | `type: 'offset'` + `offsetParameter: 'offset'` |
| 下一页 URL 在响应里 | `type: 'generic'` + `continue` 从 `$response` 取 |

参考：<https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/#list-of-resources>

## 其它常见审核点（历史已踩过）
- `displayName`/`name` 必须匹配类名（例如文件名 `Ycloud.node.ts` → 类名 `Ycloud`）
- `required: false` 不要显式写，省略即可（n8n-node lint 会报）
- credentials 里涉及密钥的字段必须加 `typeOptions: { password: true }`
- 节点图标要是 SVG 且带 `file:` 前缀

## 发版前自检命令
```bash
pnpm lint && pnpm build
rg -n '[\p{Han}]' nodes credentials   # 查残留中文
rg -n 'catch\s*\{' nodes              # 查空 catch
```
