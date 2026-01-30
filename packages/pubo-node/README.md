# pubo-node

Node.js 工具库，提供文件存储、FTP 客户端、gRPC 客户端、进程管理、网络工具、ROS 主题管理和文件系统操作等功能。

## 安装

```bash
npm install pubo-node
```

## API 文档

### JsonStorage

基于 JSON 的文件存储类，支持多进程同步。

**构造函数**
```typescript
constructor(path: string, options: JsonStorageOptions = {})
```
- `path`: 存储文件路径
- `options`: 可选配置
  - `initialState`: 初始状态，程序运行时会重置为初始值
  - `defaultState`: 默认状态

**方法**
- `async get(key?: string): Promise<any>`
  - 获取指定键的值，不传键则返回整个状态
- `async set(key: string, values: any): Promise<void>`
  - 设置指定键的值
- `async merge(values: any): Promise<void>`
  - 合并多个键值到状态
- `async remove(key: string): Promise<void>`
  - 删除指定键

### FtpClient

FTP 客户端类，支持连接池和异步操作。

**构造函数**
```typescript
constructor(options: FtpConnectOptions)
```
- `options`: 连接选项
  - `user`: 用户名
  - `host`: 主机地址
  - `password`: 密码
  - `driver`: FTP 驱动

**方法**
- `async get(path: string): Promise<Buffer>`
  - 下载文件
- `async put(input: string | Buffer | Stream, path: string): Promise<string>`
  - 上传文件
- `async delete(path: string): Promise<string>`
  - 删除文件
- `async list(path: string): Promise<FtpFile[]>`
  - 列出目录文件
- `async rename(path: string, old: string): Promise<string>`
  - 重命名文件

### FtpClientPool

FTP 客户端连接池，管理多个 FTP 连接。

**构造函数**
```typescript
constructor({ maxConnection = 5, ...options }: { maxConnection?: number } & FtpConnectOptions)
```
- `maxConnection`: 最大连接数，默认 5
- `options`: 同 FtpClient 连接选项

**方法**
同 FtpClient 接口。

### createRpcClient

创建 gRPC 客户端。

**函数签名**
```typescript
function createRpcClient<T>({ url, options = {}, ServiceImp, Grpc, cert }: CreateClientProps): T
```
- `url`: gRPC 服务地址
- `options`: 连接选项
- `ServiceImp`: 服务实现类
- `Grpc`: gRPC 模块
- `cert`: TLS 证书缓冲区

### GrpcList

全局 gRPC 客户端列表，用于管理所有创建的 gRPC 客户端。

### isPortAvailable

检查端口是否可用。

**函数签名**
```typescript
function isPortAvailable(port: number): Promise<boolean>
```

### 进程管理函数

以下函数由 `PProcess` 接口提供，具体实现根据操作系统（Linux/Windows）不同。

#### getProcessName
```typescript
function getProcessName(pid: number): Promise<string>
```
获取进程名称。

#### getPidByPort
```typescript
function getPidByPort(port: number): Promise<number>
```
根据端口号获取进程 PID。

#### getProcessCpuUseByPid
```typescript
function getProcessCpuUseByPid(pid: number): Promise<number>
```
获取进程 CPU 使用率（百分比）。

#### getProcessCommandByPid
```typescript
function getProcessCommandByPid(pid: number): Promise<string>
```
获取进程命令行。

#### isProcessDied
```typescript
function isProcessDied(pid: number): Promise<boolean>
```
判断进程是否已死亡。

#### getProcessByPpid
```typescript
function getProcessByPpid(ppid: number): Promise<number[]>
```
获取指定父进程的所有子进程 PID 列表。

#### getProcessTree
```typescript
function getProcessTree(pid: number, tree?: any): Promise<any>
```
获取进程树结构。

#### getProcessList
```typescript
function getProcessList(pid: number): Promise<number[]>
```
获取从叶子到根的所有进程 PID 列表。

#### SIGKILL
```typescript
function SIGKILL(pid: number, signal = 2, times = 1): Promise<{ success: boolean; error: string }>
```
杀死进程及其子进程。

#### heartbeat
```typescript
function heartbeat(): void
```
子进程心跳包，每6秒发送一次。

#### getAudioCards
```typescript
function getAudioCards(filter?: string): Promise<{ text: string; index: string }[]>
```
获取音频设备列表（仅 Linux）。

#### getDiskUsage
```typescript
function getDiskUsage(): Promise<DiskInfo[]>
```
获取磁盘使用情况。

### 网络工具

#### getNetworks
```typescript
function getNetworks(): Promise<any[]>
```
获取网络接口信息（通过 lshw 命令）。

#### getWifiName
```typescript
function getWifiName(): Promise<string>
```
获取无线网络接口名称。

### RosTopicManager

ROS 主题管理器，用于创建和管理 ROS 主题。

**方法**
- `getTopic(topic: string, messageType: string): RosTopic`
  - 获取或创建 ROS 主题实例

### RosTopic

ROS 主题类，支持订阅、取消订阅和发布消息。

**构造函数**
```typescript
constructor(topic: string, messageType: string)
```

**方法**
- `async subscribe(): Promise<void>`
  - 订阅主题
- `async unsubscribe(): Promise<void>`
  - 取消订阅
- `async publish(payload: any): Promise<void>`
  - 发布消息到主题

### PuboFileSystem

文件系统操作接口，提供 Promise 化的 fs 方法。

**方法**
- `read<TBuffer extends NodeJS.ArrayBufferView>(fd: number, buffer?: TBuffer, offset?: number, length?: number, position?: fs.ReadPosition | null): Promise<[number, TBuffer]>`
  - 从文件描述符读取数据
- `stat(path: fs.PathLike): Promise<fs.Stats>`
  - 获取文件状态
- `readFile(path: fs.PathOrFileDescriptor, options?: { encoding?: null; flag?: string } & EventEmitter.Abortable | null): Promise<Buffer>`
  - 读取文件内容
- `writeFile(file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): Promise<void>`
  - 写入文件
- `readdir(path: fs.PathLike, options?: BufferEncoding | { encoding: BufferEncoding | null; withFileTypes: false } | null): Promise<string[]>`
  - 读取目录内容
- `open(path: fs.PathLike, flags?: fs.OpenMode, mode?: fs.Mode | null): Promise<number>`
  - 打开文件
- `close(fd: number): Promise<void>`
  - 关闭文件描述符
- `mkdir(path: fs.PathLike, options?: fs.MakeDirectoryOptions): Promise<void>`
  - 创建目录
- `rm(path: fs.PathLike): Promise<void>`
  - 删除文件或目录
- `write<TBuffer extends NodeJS.ArrayBufferView>(fd: number, buffer: TBuffer, offset?: number | null, length?: number | null, position?: number | null): Promise<void>`
  - 写入数据到文件描述符

### PProcess

进程管理接口，定义了跨平台的进程操作方法。由 `PProcessLinux` 和 `PProcessWin32` 实现。

**方法**
参见上述进程管理函数。

## 类型定义

### FtpConnectOptions
```typescript
interface FtpConnectOptions {
  user: string;
  host: string;
  password: string;
  driver: any;
}
```

### FtpFile
```typescript
interface FtpFile {
  name: string;
  owner: string;
  group: string;
  size: number;
  date: Date;
  type: string;
}
```

### DiskInfo
```typescript
interface DiskInfo {
  fileSystem: string;
  size: number;
  used: number;
  avail: number;
  usedPercent: number;
  mounted: number;
}
```

### JsonStorageOptions
```typescript
interface JsonStorageOptions {
  initialState?: any;
  defaultState?: any;
}
```

## 示例

```javascript
const { JsonStorage, FtpClient, isPortAvailable } = require('pubo-node');

// 使用 JsonStorage
const storage = new JsonStorage('./data.json', { initialState: { count: 0 } });
await storage.set('count', 1);
const value = await storage.get('count');

// 使用 FTP 客户端
const ftp = new FtpClient({
  user: 'user',
  host: 'localhost',
  password: 'pass',
  driver: require('ftp')
});
const files = await ftp.list('/');

// 检查端口
const available = await isPortAvailable(8080);
```

## 许可证

MIT
