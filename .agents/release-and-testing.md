# Release & local testing

## Release 流程（发到 npm）
本项目已接入 GitHub Actions 自动发版。**本地不要 `npm publish`**——那样发的包
没有 npm provenance，不符合 n8n Cloud 2026 年 5 月后的要求。

### 凭证
GitHub 仓库 Settings → Secrets → `NPM_TOKEN` 已配置（npm Automation Token，
scoped to `@ycloud-ai/n8n-nodes-ycloud`，read+write 权限）。
`publish.yml` 会自动用它登录 npm。

### 步骤
```bash
# 1. 代码改动先正常 commit/push 到 main
git add <files>
git commit -m "fix: ..."
git push

# 2. 等 CI 绿（.github/workflows/ci.yml 跑 lint + build）

# 3. 触发发布——交互式
pnpm release
```

`pnpm release`（= `n8n-node release`）内部用 release-it 完成：
1. 提示选 `patch` / `minor` / `major` → **修 bug 选 patch**，审核反馈修复也是 patch
2. 更新 `package.json` version + 生成 `CHANGELOG.md`
3. 自动 commit + 打 tag（格式 `0.1.8`，**不带 v 前缀**——`publish.yml` 的触发条件就是 `*.*.*`）
4. push commit + tag

tag 推上去后 `publish.yml` 自动触发，跑 lint/build/publish，1-2 分钟后 npm 上能搜到新版本。

### 发版后
- 确认 <https://www.npmjs.com/package/@ycloud-ai/n8n-nodes-ycloud> 显示新版本号
- 如果是修审核反馈，到 n8n 审核后台重新提交

## 本地 Docker n8n 测试
改代码后不想发版就想先验，按下面做。前提：本机已有运行中的 n8n Docker 容器
（名字假设为 `n8n`，数据卷 `n8n_data` 挂到 `/home/node/.n8n`）。

### 首次安装（把本地包塞到容器里）
```bash
# 1. 本地打包
pnpm pack                                          # 生成 ycloud-ai-n8n-nodes-ycloud-<ver>.tgz

# 2. 拷进容器
docker cp ycloud-ai-*.tgz n8n:/tmp/ycloud.tgz

# 3. 容器内 install —— 注意 --ignore-scripts 跳过 isolated-vm 原生编译
docker exec -u node -w /home/node/.n8n/nodes n8n sh -c '
  npm install /tmp/ycloud.tgz --ignore-scripts --no-audit --no-fund
'

# 4. 检查 ~/.n8n/nodes/package.json —— 依赖值必须是 "0.1.8" 这种 semver，
#    不能是 "file:/tmp/ycloud.tgz"，否则 n8n 启动时会判定"已卸载"并删记录。
#    如果被改成 file: 引用，手动写回 semver：
docker exec -u node n8n sh -c 'cat > /home/node/.n8n/nodes/package.json <<EOF
{
  "name": "installed-nodes",
  "private": true,
  "dependencies": {
    "@ycloud-ai/n8n-nodes-ycloud": "0.1.8"
  }
}
EOF'

# 5. 如果 DB 里没有 installed_packages 记录，需要手动补一条（否则 UI 看不到节点）
#    停 n8n，拷 DB 到宿主机用 sqlite3 插入：
docker stop n8n
docker cp n8n:/home/node/.n8n/database.sqlite /tmp/n8n-db.sqlite
sqlite3 /tmp/n8n-db.sqlite "
  INSERT OR REPLACE INTO installed_packages
    (packageName, installedVersion, authorName, authorEmail)
  VALUES ('@ycloud-ai/n8n-nodes-ycloud', '0.1.8', 'songqijun', 'songqijun@qipeng.com');
  INSERT OR REPLACE INTO installed_nodes
    (name, type, latestVersion, package)
  VALUES ('YCloud WhatsApp', '@ycloud-ai/n8n-nodes-ycloud.ycloud', 1, '@ycloud-ai/n8n-nodes-ycloud');
"
docker cp /tmp/n8n-db.sqlite n8n:/home/node/.n8n/database.sqlite
docker start n8n
docker exec -u root n8n sh -c '
  chown node:node /home/node/.n8n/database.sqlite
  rm -f /home/node/.n8n/database.sqlite-shm /home/node/.n8n/database.sqlite-wal
'
docker restart n8n
```

访问 <http://localhost:5678> → 新建 workflow → 搜 "YCloud" → 应能看到节点。

### 日常热替换（只改了代码、不动 package 结构）
一条命令搞定——不动 `package.json` 和 DB，只替换节点文件、重启容器：

```bash
pnpm build && pnpm pack && \
docker cp ycloud-ai-n8n-nodes-ycloud-*.tgz n8n:/tmp/ycloud.tgz && \
docker exec -u node n8n sh -c '
  cd /tmp && tar xzf ycloud.tgz
  rm -rf /home/node/.n8n/nodes/node_modules/@ycloud-ai/n8n-nodes-ycloud
  mkdir -p /home/node/.n8n/nodes/node_modules/@ycloud-ai
  mv package /home/node/.n8n/nodes/node_modules/@ycloud-ai/n8n-nodes-ycloud
' && \
docker restart n8n
```

### 常见坑
- `Community package uninstalled: <pkg>` 启动日志 → `package.json` 里的依赖值
  是 `file:` 或非法 semver 被 n8n 清理了。改回 semver 再重启。
- `SQLITE_READONLY` → DB 文件权限不对，`chown node:node` 并删掉 `-shm` / `-wal` 文件。
- `isolated-vm` 编译失败 → 容器里没 Python 3 / node-gyp，装时加 `--ignore-scripts`。
- 改了代码但 UI 没更新 → n8n 把节点元信息缓存在内存里，**必须 `docker restart n8n`**。
