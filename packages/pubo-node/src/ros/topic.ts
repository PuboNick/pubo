import { exec, spawn } from 'child_process';
import { Emitter, WatchDog, StringSplit } from 'pubo-utils';
import * as YAML from 'yaml';
import { SIGKILL } from '../child-process';

export class RosTopic {
  public topic: string;
  public messageType: string;
  public emitter = new Emitter();

  private subscribed = false;
  private readonly dog = new WatchDog({ limit: 60, onTimeout: this.onTimeout.bind(this) });
  private readonly strSplit = new StringSplit('---');
  private subscribeChildProcess: any;

  constructor(topic, messageType) {
    this.topic = topic;
    this.messageType = messageType;
    this.subscribed = false;
    this.emitter = new Emitter();
  }

  private onTimeout() {
    if (!this.subscribed) {
      return;
    }
    this.unsubscribe();
    this.subscribe();
  }

  private onData(data) {
    const tmp = this.strSplit.split(data.toString()).slice(-1)[0];
    if (!tmp) {
      return;
    }
    const res = YAML.parse(tmp);
    this.emitter.emit('message', res);
  }

  public subscribe() {
    if (this.subscribeChildProcess) {
      return;
    }
    this.subscribed = true;
    this.subscribeChildProcess = spawn(`rostopic`, ['echo', this.topic]);
    this.subscribeChildProcess.stdout.on('data', this.onData.bind(this));
    this.dog.init();
  }

  public unsubscribe() {
    if (this.subscribeChildProcess) {
      return;
    }
    this.dog.stop();
    this.subscribed = false;
    SIGKILL(this.subscribeChildProcess.pid);
    this.subscribeChildProcess = null;
  }

  public publish(payload) {
    const data = YAML.stringify(payload);
    return new Promise((resolve) => {
      const child = exec(`rostopic pub -1 ${this.topic} ${this.messageType} "${data}"`);
      child.stdout?.once('data', () => {
        child?.pid && SIGKILL(child?.pid);
        resolve('');
      });
      child.stderr?.once('data', (err) => {
        console.log(err.toString());
        child?.pid && SIGKILL(child?.pid);
        resolve('');
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
