# pubo-web

Web 前端工具库，提供脚本加载、文件操作、存储、WebSocket、DOM 拖拽等功能。

## 安装

```bash
npm install pubo-web
```

## API 文档

### loadScript

动态加载脚本。

**函数签名**
```typescript
export const loadScript = (url: string, options: any = {}) => Promise<any>
```
- `url`: 脚本 URL
- `options`: 附加到 script 元素的属性（如 `async`, `defer` 等）
- 返回：Promise，脚本加载完成后解析为 URL

### blob2text

Blob 转文本。

**函数签名**
```typescript
export const blob2text = (blob: any) => Promise<string>
```
- `blob`: Blob 对象
- 返回：Promise，解析为文本内容

### blob2base64

Blob 转 Base64 字符串。

**函数签名**
```typescript
export const blob2base64 = (blob: any) => Promise<string>
```
- `blob`: Blob 对象
- 返回：Promise，解析为 Base64 字符串

### blob2file

Blob 转 File 对象。

**函数签名**
```typescript
export const blob2file = (blob: any, name: string, type: string) => File
```
- `blob`: Blob 对象
- `name`: 文件名
- `type`: 文件类型
- 返回：File 对象

### downloadFile

下载文件。

**函数签名**
```typescript
export const downloadFile = (uri: string, name: string): void
```
- `uri`: 文件 URL 或 Data URL
- `name`: 下载文件名（可选）

### WebStorage

Web 存储封装，支持 localStorage 和 sessionStorage，可选压缩。

**构造函数**
```typescript
constructor(props: WebStorageProps)
```
- `props.type`: 存储类型，`'sessionStorage'` 或 `'localStorage'`，默认 `'sessionStorage'`
- `props.key`: 存储键名
- `props.zip`: 压缩对象，需包含 `deflate` 和 `inflate` 方法

**属性**
- `state: any` - 获取或设置存储状态（自动 JSON 序列化/反序列化）
- `key: string` - 存储键名

**方法**
- `merge(data: any): void` - 合并数据到当前状态
- `clear(): void` - 清除存储

### WebsocketClient

WebSocket 客户端，支持自动重连。

**构造函数**
```typescript
constructor({ url }: { url: string })
```
- `url`: WebSocket 服务器地址

**属性**
- `emitter: Emitter` - 事件发射器
- `status: number` - 连接状态（0: 默认, 1: 已连接, 2: 断开连接, 3: 重连）

**方法**
- `connect(): void` - 连接服务器
- `close(): void` - 关闭连接
- `send(data: any, isJson = false): void` - 发送数据，`isJson` 为 true 时自动 JSON 序列化

**事件**
- `'connect'` - 连接建立时触发
- `'message'` - 收到消息时触发，payload 为消息数据

### DragMethod

DOM 拖拽处理类，支持鼠标和触摸事件。

**构造函数**
```typescript
constructor({ key = '', onMove, onMoveEnd }: DragMethodProps = {})
```
- `key`: 可选标识符
- `onMove`: 拖拽移动回调
- `onMoveEnd`: 拖拽结束回调

**属性**
- `onMouseDown: (e: any) => void` - 鼠标按下事件处理函数
- `onTouchStart: (e: any) => void` - 触摸开始事件处理函数
- `onMove?: OnMove` - 移动回调（可重新赋值）
- `onMoveEnd?: OnMoveEnd` - 结束回调（可重新赋值）

**回调参数**
- `onMove` 接收对象：`{ offsetX, offsetY, pageX, pageY, startX, startY, key }`

### pickFiles

打开文件选择对话框。

**函数签名**
```typescript
export const pickFiles = (): Promise<FileList>
```
- 返回：Promise，用户选择的文件列表

### getCookieValue

获取指定 Cookie 值。

**函数签名**
```typescript
export const getCookieValue = (key: string): string
```

### getCookie

获取所有 Cookie 并解析为对象。

**函数签名**
```typescript
export const getCookie = (): Record<string, string>
```

### setCookieItem

设置 Cookie。

**函数签名**
```typescript
export const setCookieItem = (key: string, value: string) => void
```

### IndexedStorage

IndexedDB 存储封装，简化操作。

**构造函数**
```typescript
constructor({ name, version, tables }: StorageFactoryType)
```
- `name`: 数据库名称
- `version`: 数据库版本
- `tables`: 表定义数组（可选）

**方法**
- `register(tables: IndexedTable[]): void` - 注册表定义
- `connect(): Promise<void>` - 连接数据库
- `get(store: string): Storage` - 获取指定存储对象的操作接口

**Storage 接口**
- `getState(): Promise<any>` - 获取状态
- `setState(values: any): void` - 设置状态
- `merge(values: any): Promise<void>` - 合并状态

## 类型定义

### WebStorageProps
```typescript
interface WebStorageProps {
  type?: 'sessionStorage' | 'localStorage';
  key: string;
  zip?: {
    deflate: (data: string) => string;
    inflate: (data: string) => string;
  };
}
```

### DragMethodProps
```typescript
interface DragMethodProps {
  key?: string;
  onMove?: (n: {
    offsetX: number;
    offsetY: number;
    key?: string;
    pageX: number;
    pageY: number;
    startX: number;
    startY: number;
  }) => void;
  onMoveEnd?: () => void;
}
```

### StorageFactoryType
```typescript
interface StorageFactoryType {
  name: string;
  version: number;
  tables?: IndexedTable[];
}
```

## 示例

```javascript
import { loadScript, WebStorage, pickFiles } from 'pubo-web';

// 加载脚本
await loadScript('https://example.com/script.js', { async: true });

// 使用 WebStorage
const storage = new WebStorage({ type: 'localStorage', key: 'my-app' });
storage.state = { user: 'john' };
const data = storage.state;

// 选择文件
const files = await pickFiles();

// 使用 WebSocket
const ws = new WebsocketClient({ url: 'ws://localhost:8080' });
ws.emitter.on('message', (data) => console.log('received:', data));
ws.connect();

// 拖拽
const drag = new DragMethod({
  onMove: ({ offsetX, offsetY }) => console.log('dragging', offsetX, offsetY),
  onMoveEnd: () => console.log('drag ended')
});
element.addEventListener('mousedown', drag.onMouseDown);
```

## 许可证

MIT
