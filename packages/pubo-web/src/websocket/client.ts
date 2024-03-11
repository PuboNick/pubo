import { Emitter } from 'pubo-utils';

export class WebsocketClient {
  private client: WebSocket | null = null;
  private _status = 0; // 0 默认 1 已连接 2 断开连接 3 重连
  private readonly url: string;
  emitter = new Emitter();

  constructor({ url }: { url: string }) {
    this.url = url;
  }

  private reconnect() {
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    if (this._status === 3) {
      setTimeout(() => this.connect(), 1000);
    }
  }

  private onClose() {
    if (this._status !== 2) {
      this._status = 3;
    }
    this.reconnect();
  }

  private onMessage(e: any) {
    this.emitter.emit('message', e.data);
  }

  public get status() {
    return this._status;
  }

  connect() {
    if (this.client) {
      return;
    }
    this.client = new WebSocket(this.url);
    this.client.onclose = this.onClose.bind(this);
    this.client.onmessage = this.onMessage.bind(this);
    this.client.onopen = () => {
      this.emitter.emit('connect');
      this._status = 1;
    };
  }

  close() {
    if (this.client) {
      this.client.close();
      this.client = null;
      this._status = 2;
    }
  }

  send(data: any, isJson = false) {
    let res = data;
    if (isJson) {
      res = JSON.stringify(data);
    }
    this.client?.send(res);
  }
}
