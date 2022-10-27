import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { RTSP2Mpeg } from './rtsp2mpeg';

interface VideoConfig {
  url: string;
  input?: string[];
  output?: string[];
}

interface Props {
  app: any;
  server?: any;
  videos: VideoConfig[];
  path: string;
  expressWs?: any;
}

class VideoStorage {
  path = resolve('resources/temp/videos.json');

  async(data) {
    try {
      writeFileSync(this.path, JSON.stringify(data));
    } catch (err) {
      console.log(err);
    }
  }

  get data() {
    try {
      const buffer = readFileSync(this.path);
      console.log(buffer.toString());
      return JSON.parse(buffer.toString());
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

export class RtspVideosManager {
  private readonly _system: VideoConfig[] = [];
  private readonly _customer: VideoConfig[] = [];
  private readonly system: RTSP2Mpeg[] = [];
  private readonly customer: RTSP2Mpeg[] = [];
  private readonly storage = new VideoStorage();

  constructor(videos: VideoConfig[]) {
    this._system = videos;
    this._customer = this.storage.data || [];
    this.system = videos.map(({ url, ...options }) => new RTSP2Mpeg(url, options));
    this.customer = this._customer.map(({ url, ...options }) => new RTSP2Mpeg(url, options));
  }

  get list() {
    return [...this.system, ...this.customer];
  }

  public getVideos() {
    return [...this._system, ...this._customer];
  }

  create(conf: VideoConfig) {
    if (this._customer.some((item) => item.url === conf.url)) {
      throw new Error('该地址已存在');
    }
    const video = new RTSP2Mpeg(conf.url, conf);
    this._customer.push(conf);
    this.customer.push(video);
    this.storage.async(this._customer);
  }

  remove(index: number) {
    if (index < this.system.length) {
      throw new Error('系统配置不可删除');
    } else if (index > this.system.length + this.customer.length - 1) {
      throw new Error('超限');
    }
    this._customer.splice(index - this.system.length - 1, 1);
    const video = this.customer.splice(index - this.system.length - 1, 1);
    video[0].destroy();
    this.storage.async(this._customer);
  }
}

export const initRtspVideos = ({ app, server, videos, path, expressWs }: Props) => {
  const manager = new RtspVideosManager(videos);
  if (!app.ws) {
    expressWs(app, server);
  }

  app.ws(path, (ws, req) => {
    const { channel = 0 } = req.query;
    let listener: any = null;
    if (manager.list[channel]) {
      listener = manager.list[channel].on('data', (chunk) => {
        ws.send(chunk);
      });
    }
    ws.on('close', () => {
      if (listener) {
        manager.list[channel].cancel(listener);
      }
    });
  });

  return manager;
};
