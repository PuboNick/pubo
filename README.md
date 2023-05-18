### 主要模块：
pubo-utils： 通用工具方法与平台无关，基本为纯函数；

pubo-web：浏览器端方法；

pubo-node：nodejs 端方法。

### 如何安装

`$ npm install --save pubo-utils`

`$ npm install --save pubo-web`

`$ npm install --save pubo-node`

## pubo-utils
### SyncQueue

```javascript
// SyncQueue 异步队列，可以将异步函数加入执行队列依次执行
import { SyncQueue } from 'pubo-utils';

const queue = new SyncQueue();

const run = (i) => {
  return new Promise((resolve) => setTimeout(() => resolve(`hello ${i}`), 1000));
};

const test = async (i) => {
  const res = await queue.push(() => run(i));
  console.log(res);
};

// 输出结果: 间隔 1000ms 依次输出 1 2 3 4 5 6 7 8 9 10
for (let i = 0; i < 10; i++) {
  test(i);
}
```
### sleep & loop & waitFor

loop 为一个异步的死循环，可以通过返回值 stop 方法或回调函数参数 stop 方法终止循环，它是一个安全的循环方法，会等动作执行完成后再继续执行，所以循环间隔时间不是完全准确的

sleep 是一个异步的等待函数

waitFor 接收一个回调函数和一个查询间隔时间，当回调函数返回值为 true 时等待结束。

```javascript
(async () => {
  let bool = false;
  await sleep(1000);
  loop(async () => { console.log('loop') }, 1000);
  setTimeout(() => { bool = true }, 10000);
  await waitFor(async () => bool, { checkTime: 1000, timeout: 30000 });
  console.log('done');
})()
```

### Emitter
一个简单的发布订阅器

```javascript
const emit = new Emitter();
emit.on('hello', (msg) => console.log(msg));
emit.emit('hello', 'hello world');
```

### ContinuousTrigger
一个触发器，在短时间内连续触发 n 次后执行，一般用于传感器数据监测，防止跳变导致的误触
```javascript
const trigger = new ContinuousTrigger({ cb() {console.log('done')}, resetTime: 5000, count: 10 });
for (let i = 0; i < 20; i += 1) {
  trigger.increment();
}
```

### WatchDog
一个简单的看门狗工具，如果再规定时间内没有喂狗则认为程序异常，执行回调函数,可用于数据采集，例如摄像头，如果异常可以执行重连函数
```javascript
const dog = new WatchDog({ limit: 10 /** 单位为 s*/, onTimeout() { console.log('done') } });
loop(async () => { dog.feed(); }, 9000);
```

## pubo-node
### FtpClient & FtpClientPool
ftp 连接客户端工厂，需要传入一个ftp 驱动 https://github.com/mscdex/node-ftp, 一个 FtpClient 为一个连接，一个连接同时只能执行一个方法，FtpClientPool 为连接池，可以自动根据最大连接数配置自行管理连接实现同时执行多个查询
```javascript
import * as ftp from 'ftp';

const pool = new FtpClientPool({ driver: ftp, user: '', password: '', host: '', port: '' });
pool.get(path).then(buffer => console.log(buffer.toString()));
```
