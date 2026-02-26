import { Emitter } from 'pubo-utils';

type ConnectionStatus = 0 | 1 | 2 | 3; // 0 默认 1 已连接 2 断开连接 3 重连

export class WebsocketClient {
  private client: WebSocket | null = null;
  private _status: ConnectionStatus = 0;
  private readonly url: string;
  emitter = new Emitter();

  constructor({ url }: { url: string }) {
    this.url = url;
  }

  private reconnect(): void {
    if (this.client) {
      this.client.close();
    }
    this.client = null;
    if (this._status === 3) {
      setTimeout(() => this.connect(), 1000);
    }
  }

  private onClose = (): void => {
    if (this._status !== 2) {
      this._status = 3;
    }
    this.reconnect();
  };

  private onMessage = (e: MessageEvent): void => {
    this.emitter.emit('message', e.data);
  };

  public get status(): ConnectionStatus {
    return this._status;
  }

  connect(): void {
    if (this.client) {
      return;
    }
    this.client = new WebSocket(this.url);
    this.client.onclose = this.onClose;
    this.client.onmessage = this.onMessage;
    this.client.onopen = () => {
      this.emitter.emit('connect');
      this._status = 1;
    };
  }

  close(): void {
    this._status = 2;
    if (this.client) {
      this.client.close();
    }
    this.client = null;
  }

  send(data: unknown, isJson = false): void {
    const res = isJson ? JSON.stringify(data) : data;
    this.client?.send(res as string | ArrayBuffer | Blob);
  }
}
