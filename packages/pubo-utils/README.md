# pubo-utils

通用工具库，提供函数式编程、异步控制、数据转换、几何计算等功能。

## 安装

```bash
npm install pubo-utils
```

## API 文档

### debounce

防抖函数，限制函数执行频率。

**函数签名**
```typescript
export const debounce = (cb: any, time: number, first = false) => (...args) => void
```
- `cb`: 要防抖的回调函数
- `time`: 防抖时间（毫秒）
- `first`: 是否立即执行第一次调用，默认 false
- 返回：一个防抖后的函数

### hex2rgb

十六进制颜色转 RGB 数组。

**函数签名**
```typescript
export const hex2rgb = (n: number | string): [number, number, number]
```
- `n`: 十六进制颜色值（如 `0xFF0000` 或 `"#FF0000"`）
- 返回：RGB 数组 `[r, g, b]`

### rgb2hex

RGB 数组转十六进制颜色字符串。

**函数签名**
```typescript
export const rgb2hex = (color: [number, number, number] | [number, number, number, number]): string
```
- `color`: RGB 或 RGBA 数组
- 返回：十六进制颜色字符串（如 `"#FF0000"`）

### ColorUtils

颜色工具类，支持多种颜色格式转换。

**构造函数**
```typescript
constructor(n: number | string | [number, number, number])
```

**属性**
- `int`: 颜色的整数值
- `rgb`: 返回 `"rba(r, g, b)"` 格式字符串
- `hex`: 返回十六进制字符串

**方法**
- `getRgbArray(): [number, number, number]` - 返回 RGB 数组
- `toString(type: 'hex' | 'rgb' = 'hex'): string` - 转换为指定格式字符串

### LinearColor

线性颜色生成器，根据数值生成渐变色。

**构造函数**
```typescript
constructor({ base = [255, 0, 0], intensity = 1 }: { base?: [number, number, number]; intensity?: number } = {})
```
- `base`: 基础颜色数组，默认红色 `[255, 0, 0]`
- `intensity`: 强度系数，默认 1

**方法**
- `getColor(value: number): [number, number, number]` - 根据数值返回 RGB 颜色数组

### Emitter

事件发射器，支持异步事件处理。

**方法**
- `on(event: string, func: any): string` - 注册事件监听器，返回监听器 ID
- `cancel(id?: string): void` - 取消指定 ID 的监听器
- `emit(event: string, payload?: any): void` - 触发事件（同步）
- `emitSync(event: string, payload?: any): Promise<any>` - 触发事件（异步等待）
- `clear(): void` - 清除所有监听器
- `clone(): any` - 克隆当前状态
- `restore(snapshot: any): void` - 恢复状态

### CacheEmitter

带缓存的事件发射器，继承自 `Emitter`。

**方法**
- `emit(event: string, payload?: any): void` - 触发事件并缓存 payload
- `getState(event: string): any` - 获取指定事件的缓存值

### superFactory

超级工厂函数，用于创建可配置的工厂函数。

**类型定义**
```typescript
export type SuperFactory = <C, F>(factory: Factory<C>) => CreateFactory<C, F>
```

**函数签名**
```typescript
export const superFactory: SuperFactory = (factory) => (options: any) => any
```

### loop

循环执行函数，可控制停止。

**函数签名**
```typescript
export const loop = (cb: () => Promise<void>, time: number) => () => void
```
- `cb`: 要循环执行的异步函数
- `time`: 循环间隔（毫秒）
- 返回：停止函数

### waitFor

等待条件成立，支持超时。

**函数签名**
```typescript
export const waitFor = (bool: () => boolean | Promise<boolean>, { checkTime, timeout }: { checkTime?: number; timeout?: number } = {}) => Promise<any>
```
- `bool`: 返回布尔值的函数
- `checkTime`: 检查间隔（毫秒），默认 100
- `timeout`: 超时时间（毫秒）
- 返回：Promise，条件成立时解析

### retry

重试异步操作。

**函数签名**
```typescript
export const retry = async (action: any, { times = 5, interval = 1000 }: { times: number; interval: number } = { times: 5, interval: 1000 }) => Promise<any>
```
- `action`: 要重试的异步函数
- `times`: 重试次数，默认 5
- `interval`: 重试间隔（毫秒），默认 1000

### RetryPlus

增强版重试类，支持取消和参数传递。

**构造函数**
```typescript
constructor(action, { times = 5, interval = 1000 }: { times: number; interval: number } = { times: 5, interval: 1000 })
```

**方法**
- `run(...args: any[]): Promise<any>` - 执行重试操作
- `cancel(): Promise<void>` - 取消重试

### RemoteControl

远程控制类，用于高频控制信号。

**构造函数**
```typescript
constructor({ start, stop, fps = 5 }: RemoteControlOptions)
```

**方法**
- `control(payload: any): void` - 发送控制信号
- `stop(): void` - 停止控制

### SyncQueue

同步队列，确保异步任务顺序执行。

**方法**
- `push(fn: () => Promise<any>): Promise<any>` - 添加任务到队列
- `length: number` - 当前队列长度

### runAsyncTasks

并行执行异步任务，控制并发数。

**函数签名**
```typescript
export const runAsyncTasks = async (list: (() => Promise<any>)[], j = 4) => Promise<void>
```
- `list`: 异步函数数组
- `j`: 并发数，默认 4

### random

生成随机字符串。

**函数签名**
```typescript
export const random = (n = 8) => string
```
- `n`: 字符串长度，默认 8
- 返回：随机字符串

### randomRangeNum

生成指定范围内的随机数。

**函数签名**
```typescript
export const randomRangeNum = (range: [number, number]) => number
```
- `range`: 范围数组 `[min, max]`
- 返回：范围内的随机数

### sleep

异步休眠。

**函数签名**
```typescript
export const sleep = async (time: number) => Promise<void>
```
- `time`: 休眠时间（毫秒）

### timeout

带超时的异步函数执行。

**函数签名**
```typescript
export const timeout = async (cb: () => Promise<any>, time = 10000): Promise<any>
```
- `cb`: 要执行的异步函数
- `time`: 超时时间（毫秒），默认 10000
- 返回：cb 的执行结果，超时则抛出错误

### throttle

节流函数，限制函数执行频率。

**函数签名**
```typescript
export function throttle(cb: (...args: any[]) => any, time: number) => (...args: any[]) => Promise<any>
```
- `cb`: 要节流的函数
- `time`: 节流时间（毫秒）
- 返回：节流后的函数

### ContinuousTrigger

连续触发检测器，用于检测连续操作。

**构造函数**
```typescript
constructor(props: ContinuousTriggerProps)
```
- `props.resetTime`: 重置时间（毫秒）
- `props.count`: 触发次数阈值
- `props.cb`: 达到阈值时的回调函数

**方法**
- `increment(): void` - 增加计数
- `clear(): void` - 清除计数
- `count: number` - 当前计数

### HistoryStack

历史记录栈，支持撤销/重做。

**构造函数**
```typescript
constructor(len = 10)
```
- `len`: 最大记录长度，默认 10

**方法**
- `backup(item: T): void` - 备份新项
- `undo(): T | undefined` - 撤销
- `redo(): T | undefined` - 重做
- `clear(): void` - 清空

### WatchDog

看门狗定时器，用于检测超时。

**构造函数**
```typescript
constructor({ limit = 10, onTimeout }: WatchDogProps)
```
- `limit`: 超时时间（秒），默认 10
- `onTimeout`: 超时回调

**方法**
- `feed(): void` - 喂狗，重置定时器
- `init(): void` - 初始化定时器
- `stop(): void` - 停止定时器

### Level

等级计算器，根据数值计算等级。

**构造函数**
```typescript
constructor(props: LevelProps)
```
- `props.max`: 最大值
- `props.min`: 最小值
- `props.count`: 等级数量

**方法**
- `get(value: number): number` - 计算等级（1 到 count）

### callbackToPromise

回调函数转 Promise。

**函数签名**
```typescript
export const callbackToPromise = (fn: (...args: any[], callback: (err: any, ...rest: any[]) => void) => void) => (...args: any[]) => Promise<any>
```

### 几何函数（Geometry）

#### getDistance
```typescript
export const getDistance = (a: Point2D, b: Point2D): number
```
计算两点间距离。

#### degrees
```typescript
export const degrees = (rad: number): number
```
弧度转角度。

#### radians
```typescript
export const radians = (deg: number): number
```
角度转弧度。

#### getAngle
```typescript
export const getAngle = ({ w, h }: { w: number; h: number }): number
```
根据宽高计算角度。

#### filterKeyPoints
```typescript
export function filterKeyPoints(list: Point2D[], len = 0.5): Point2D[]
```
过滤关键点，去除距离过近的点。

#### getCenter
```typescript
export function getCenter(list: Point2D[] | [number, number][]): Point2D
```
计算点集中心点。

#### getRotate
```typescript
export function getRotate(data: Vector2D, theta: number, isDeg?: boolean): Vector2D
```
2D 向量旋转。

#### getPositionTheta
```typescript
export const getPositionTheta = (a: Point2D, b: Point2D): number
```
计算 A 点到 B 点的方向角（弧度）。

#### getBestPointIndex
```typescript
export const getBestPointIndex = (points: Point2D[], pose: Point2D & { theta: number }): number
```
根据距离和方向找到最佳点索引。

#### orderByDistance
```typescript
export const orderByDistance = (points: Point2D[], pose: Point2D & { theta: number } = { x: 0, y: 0, theta: 0 }): Point2D[]
```
按照距离和方向排序点集。

#### getVectorTheta
```typescript
export const getVectorTheta = (a: Point2D, b: Point2D): number
```
计算向量 a 到向量 b 的夹角（弧度）。

### 字符串工具

#### lower2camel
```typescript
export const lower2camel = (str: string): string
```
下划线命名转驼峰命名。

#### fixNum
```typescript
export const fixNum = (num: number | string | undefined | null, n: number = 2): string
```
格式化数字，保留指定位小数，无效值返回 "N/A"。

### RegExpList

正则表达式列表，用于批量匹配。

**构造函数**
```typescript
constructor(list: string[])
```

**方法**
- `include(value: string): boolean` - 检查是否匹配任意正则

### SensorDataFilter

传感器数据过滤器，过滤跳变数据。

**构造函数**
```typescript
constructor({ size = 5, step = 5, min = -Infinity, max = Infinity }: { size?: number; step?: number; max?: number; min?: number } = {})
```
- `size`: 缓冲区大小，默认 5
- `step`: 跳变步长，默认 5
- `min`: 最小值，默认 -Infinity
- `max`: 最大值，默认 Infinity

**方法**
- `filter(n: number): number` - 过滤输入值

### StringSplit

字符串分割器，支持缓存。

**构造函数**
```typescript
constructor(splitSymbol: string)
```

**方法**
- `split(str: string): string[]` - 分割字符串

### 对象工具

#### cloneDeep
```typescript
export function cloneDeep(data: any, hash = new WeakMap()): any
```
深拷贝，支持循环引用。

#### getTreeItem
```typescript
export function getTreeItem(tree: any, indexes: number[]): any
```
根据索引路径获取树节点。

#### searchTree
```typescript
export function searchTree(tree: any, cb: (item: any) => boolean, key: string = 'children'): number[]
```
搜索树节点，返回索引路径。

#### flatTree
```typescript
export const flatTree = (tree: any, key: string = 'children', indexes: number[] = [], tmp: any[] = []): any[]
```
扁平化树结构。

#### filterTree
```typescript
export const filterTree = (tree: any, cb: (item: any) => boolean, key: string = 'children'): any[]
```
过滤树节点。

#### reflection
```typescript
export const reflection = (obj: any): any
```
创建对象的反向映射（键值互换）。

### BufferSplit

缓冲区分割器，按分隔符分割 Buffer。

**构造函数**
```typescript
constructor(buf: Buffer)
```

**方法**
- `push(buf: Buffer): Buffer[]` - 追加数据并返回分割后的 Buffer 数组

### FP（函数式编程工具）

#### Success
```typescript
export const Success = (value: any) => ({ type: 'Success', value })
```
创建成功结果。

#### Failure
```typescript
export const Failure = (error: any) => ({ type: 'Failure', error })
```
创建失败结果。

#### Command
```typescript
export const Command = (cmd: any, next: any) => ({ type: 'Command', cmd, next })
```
创建命令。

#### effectPipe
```typescript
export const effectPipe = (...fns: any[]) => (start: any) => any
```
组合多个效果函数。

#### runEffect
```typescript
export async function runEffect(effect: any): Promise<any>
```
运行效果。

### Base64Utils

Base64 工具集（命名空间导出）。

#### toUnit8Array
```typescript
export function toUnit8Array(input: string): Uint8Array
```
Base64 字符串转 Uint8Array。

### UTM（坐标转换工具）

#### toLatLon
```typescript
export function toLatLon(options: LatLonOptions): WGS84Position
```
UTM 坐标转 WGS84 经纬度。

#### fromLatLon
```typescript
export function fromLatLon({ latitude, longitude }: WGS84Position, forceZoneNum?: number): UTMPosition
```
WGS84 经纬度转 UTM 坐标。

#### latitudeToZoneLetter
```typescript
export function latitudeToZoneLetter(latitude: number): string | null
```
纬度转 UTM 区域字母。

#### latLonToZoneNumber
```typescript
export function latLonToZoneNumber({ latitude, longitude }: WGS84Position): number
```
经纬度转 UTM 区域编号。

## 类型定义

### Point2D
```typescript
interface Point2D {
  x: number;
  y: number;
}
```

### Vector2D
```typescript
type Vector2D = [number, number]
```

### WGS84Position
```typescript
interface WGS84Position {
  latitude: number;
  longitude: number;
}
```

### UTMPosition
```typescript
interface UTMPosition {
  x: number;
  y: number;
  zoneNum: number;
  zoneLetter: string | null;
}
```

### LatLonOptions
```typescript
interface LatLonOptions {
  x: number;
  y: number;
  zoneNum: number;
  zoneLetter?: string;
  northern?: boolean;
  strict?: boolean;
}
```

## 示例

```javascript
const { debounce, sleep, random, cloneDeep } = require('pubo-utils');

// 防抖
const debouncedFn = debounce(() => console.log('debounced'), 1000);
debouncedFn();

// 休眠
await sleep(1000);

// 随机字符串
const rand = random(10);

// 深拷贝
const obj = { a: 1, b: { c: 2 } };
const copied = cloneDeep(obj);
```

## 许可证

MIT
