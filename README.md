# rad-sop-frontend

OQC 外观抽检批退日报前端看板（`welcome-oqc-frontend`）。

## 技术栈

- Vue 3 + TypeScript + Vite
- Ant Design Vue 4.2.6
- ECharts
- vxe-table
- Tailwind CSS（布局）

UI 色板与组件用法对齐 Welcome UI Design MCP（`read_design_rules` / `search_examples` / `get_example`）。

## 开发

```bash
npm install
npm run dev
```

环境变量见 `.env.example`。默认 `VITE_USE_MOCK=true`；联调后端时设为 `false` 并配置 `VITE_API_BASE_URL`。

## 验证

```bash
npm test
npm run build
```
