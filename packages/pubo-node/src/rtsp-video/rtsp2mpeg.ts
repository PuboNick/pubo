import { spawn } from 'child_process';
import { Emitter, WatchDog } from 'pubo-utils';

export class RTSP2Mpeg {
  private readonly eventEmitter = new Emitter();
  private readonly dog = new WatchDog({ limit: 10, onTimeout: () => this.connect() });
  private readonly url: string;
  private s: any;
  private readonly options: any;

  constructor(url: string, options: any) {
    this.url = url;
    this.options = { ...options };
    if (!this.options.input) {
      this.options.input = ['-rtsp_transport', 'tcp', '-i'];
    }
    if (!this.options.output) {
      this.options.output = ['-f', 'mpegts', '-codec:v', 'mpeg1video'];
    }
    this.connect();
    this.dog.init();
  }

  private onMessage(msg) {
    this.dog.feed();
    this.eventEmitter.emit('message', msg.toString());
  }

  private closeOld() {
    if (this.s) {
      console.log(`LOG Video-Server: ${this.url} try to reconnect;`);
      this.s.kill();
      this.s = null;
    }
  }

  private connect() {
    this.closeOld();
    const options = [...this.options.input, this.url, ...this.options.output, '-'];
    this.s = spawn('ffmpeg', options, { detached: false });

    this.s.stderr.on('data', (buffer) => this.onMessage(buffer));
    this.s.stdout.on('data', (buffer) => this.eventEmitter.emit('data', buffer));
  }

  public on(event: string, cb: (data: any) => void) {
    return this.eventEmitter.on(event, cb);
  }

  public cancel(id) {
    this.eventEmitter.cancel(id);
  }
}
