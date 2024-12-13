import { exec, spawn } from 'child_process';
import { Emitter, WatchDog, StringSplit, sleep } from 'pubo-utils';
import * as YAML from 'yaml';

import { SIGKILL } from '../child-process';

export class RosTopic {
  public topic: string;
  public messageType: string;
  public emitter = new Emitter();

  private subscribed = false;
  private readonly dog = new WatchDog({ limit: 10, onTimeout: this.onTimeout.bind(this) });
  private readonly strSplit = new StringSplit('---');
  private subscribeChildProcess: any;

  constructor(topic, messageType) {
    this.topic = topic;
    this.messageType = messageType;
    this.subscribed = false;
    this.emitter = new Emitter();
  }

  private async onTimeout() {
    await this.unsubscribe();
    await sleep(1000);
    await this.subscribe();
  }

  private onData(data) {
    const tmp = this.strSplit.split(data.toString()).slice(-1)[0];
    if (!tmp) {
      return;
    }
    this.dog.feed();
    const res = YAML.parse(tmp);
    this.emitter.emit('message', res);
  }

  public async subscribe() {
    if (this.subscribeChildProcess) {
      return;
    }
    this.subscribed = true;
    this.dog.init();
    this.subscribeChildProcess = spawn(`rostopic`, ['echo', this.topic]);
    this.subscribeChildProcess.stdout.on('data', this.onData.bind(this));
    this.subscribeChildProcess.stderr.on('data', (buf) => console.log(buf.toString()));
  }

  public async unsubscribe() {
    if (!this.subscribeChildProcess) {
      return;
    }
    this.dog.stop();
    this.subscribed = false;
    await SIGKILL(this.subscribeChildProcess.pid);
    this.subscribeChildProcess = null;
  }

  public publish(payload) {
    const data = YAML.stringify(payload);
    return new Promise((resolve, reject) => {
      exec(`rostopic pub -1 ${this.topic} ${this.messageType} "${data}"`, (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

export const RosTopicManager = {
  cache: [],
  getTopic: function (topic, messageType): RosTopic {
    const tmp = this.cache.find((item) => item.topic === topic);
    if (tmp) {
      return tmp;
    }
    const instance = new RosTopic(topic, messageType);
    this.cache.push(instance);
    return instance;
  },
};
