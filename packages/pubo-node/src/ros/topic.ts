import { exec, spawn, ChildProcess } from 'child_process';
import { Emitter, WatchDog, StringSplit, sleep } from 'pubo-utils';
import * as YAML from 'yaml';

import { SIGKILL } from '../child-process';

export class RosTopic {
  public readonly topic: string;
  public readonly messageType: string;
  public readonly emitter = new Emitter();

  private subscribed = false;
  private readonly dog = new WatchDog({ limit: 10, onTimeout: this.onTimeout.bind(this) });
  private readonly strSplit = new StringSplit('---');
  private subscribeChildProcess: ChildProcess | null = null;

  constructor(topic: string, messageType: string) {
    this.topic = topic;
    this.messageType = messageType;
    this.subscribed = false;
    this.emitter = new Emitter();
  }

  get isSubscribed(): boolean {
    return this.subscribed;
  }

  private async onTimeout(): Promise<void> {
    await this.unsubscribe();
    await sleep(1000);
    await this.subscribe();
  }

  private onData(data: Buffer): void {
    const tmp = this.strSplit.split(data.toString()).slice(-1)[0];
    if (!tmp) {
      return;
    }
    this.dog.feed();
    const res = YAML.parse(tmp);
    this.emitter.emit('message', res);
  }

  public async subscribe(): Promise<void> {
    if (this.subscribeChildProcess) {
      return;
    }
    this.subscribed = true;
    this.dog.init();
    this.subscribeChildProcess = spawn('rostopic', ['echo', this.topic]);
    this.subscribeChildProcess.stdout?.on('data', this.onData.bind(this));
    this.subscribeChildProcess.stderr?.on('data', (buf: Buffer) => console.log(buf.toString()));
  }

  public async unsubscribe(): Promise<void> {
    if (!this.subscribeChildProcess) {
      return;
    }
    this.dog.stop();
    this.subscribed = false;
    await SIGKILL(this.subscribeChildProcess.pid!);
    this.subscribeChildProcess = null;
  }

  public publish(payload: unknown): Promise<string> {
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

export interface RosTopicManagerType {
  cache: RosTopic[];
  getTopic(topic: string, messageType: string): RosTopic;
}

export const RosTopicManager: RosTopicManagerType = {
  cache: [],
  getTopic(topic: string, messageType: string): RosTopic {
    const tmp = this.cache.find((item) => item.topic === topic);
    if (tmp) {
      return tmp;
    }
    const instance = new RosTopic(topic, messageType);
    this.cache.push(instance);
    return instance;
  },
};
