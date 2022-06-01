import { Emitter } from 'pubo-utils';

export default class WebsocketClient {
  private client: WebSocket | null;
  private _status = 0;
  private readonly url = '';
  emitter = new Emitter();

  constructor({ url }) {
    this.url = url;
    this.connect();
  }

  private reconnect() {
    if (this._status === 3) {
      setTimeout(() => {
        this.connect();
      }, 1000);
    }
  }

  private onClose() {
    if (this._status !== 2) {
      this._status = 3;
    }
    this.reconnect();
  }

  private onMessage(e) {
    this.emitter.emit('message', e.data);
  }

  connect() {
    this.client = new WebSocket(this.url);
    this.client.onclose = this.onClose.bind(this);
    this.client.onmessage = this.onMessage.bind(this);
    this.client.onopen = () => {
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
}
