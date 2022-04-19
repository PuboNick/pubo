import { spawn } from 'child_process';
import { Emitter, WatchDog } from 'pubo-utils';

export class RTSP2Mpeg {
  private readonly eventEmitter = new Emitter();
  private readonly dog = new WatchDog({ limit: 10, onTimeout: () => this.connect() });
  private readonly url: string;
  private s: any;

  constructor(url: string) {
    this.url = url;
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
    const options = ['-rtsp_transport', 'tcp', '-i', this.url, '-f', 'mpegts', '-codec:v', 'mpeg1video', '-'];
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
