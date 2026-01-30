# Pubo 项目

Pubo 是一个模块化的 TypeScript/JavaScript 工具库集合，提供跨平台（Node.js、浏览器）的实用工具、文件操作、网络通信等功能。项目采用 monorepo 结构，包含三个独立发布的包。

## 主要模块

| 模块 | 描述 | 文档链接 |
|------|------|----------|
| **pubo-utils** | 通用工具库，提供函数式编程、异步控制、数据转换、几何计算等纯函数工具 | [详细文档](./packages/pubo-utils/README.md) |
| **pubo-web** | 浏览器端工具库，提供脚本加载、文件操作、Web存储、WebSocket、DOM操作等前端专用工具 | [详细文档](./packages/pubo-web/README.md) |
| **pubo-node** | Node.js 端工具库，提供文件存储、FTP客户端、gRPC客户端、进程管理、网络工具、ROS主题管理等后端功能 | [详细文档](./packages/pubo-node/README.md) |

## 安装

每个包都可以独立安装：

```bash
# 安装通用工具库
npm install --save pubo-utils

# 安装浏览器端工具库
npm install --save pubo-web

# 安装 Node.js 端工具库
npm install --save pubo-node
```

## 快速开始

### 使用 pubo-utils

```javascript
import { sleep, debounce, cloneDeep } from 'pubo-utils';

// 延迟执行
await sleep(1000);

// 防抖函数
const debouncedFn = debounce(() => console.log('debounced'), 300);

// 深拷贝对象
const copied = cloneDeep({ a: 1, b: { c: 2 } });
```

### 使用 pubo-web

```javascript
import { loadScript, WebStorage } from 'pubo-web';

// 动态加载脚本
await loadScript('https://example.com/library.js');

// 使用本地存储
const storage = new WebStorage('my-app');
storage.set('key', 'value');
```

### 使用 pubo-node

```javascript
import { JsonStorage, createRpcClient } from 'pubo-node';

// JSON 文件存储
const storage = new JsonStorage('./data.json');
await storage.set('user', { id: 1, name: 'John' });

// gRPC 客户端
const client = createRpcClient('localhost:50051', './proto/service.proto');
```

## 项目结构

```
pubo/
├── packages/
│   ├── pubo-utils/     # 通用工具库
│   ├── pubo-web/       # 浏览器端工具库
│   └── pubo-node/      # Node.js 端工具库
├── package.json        # 根项目配置
├── lerna.json          # Monorepo 管理配置
└── README.md           # 本项目文档
```

## 开发与贡献

本项目使用 [Lerna](https://lerna.js.org/) 管理 monorepo，[TypeScript](https://www.typescriptlang.org/) 编写代码，[Jest](https://jestjs.io/) 进行测试。

1. 克隆项目：
   ```bash
   git clone <repository-url>
   cd pubo
   ```

2. 安装依赖：
   ```bash
   yarn install
   ```

3. 构建所有包：
   ```bash
   yarn build
   ```

4. 运行测试：
   ```bash
   yarn test
   ```

## 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)