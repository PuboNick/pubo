import { waitFor } from 'pubo-utils';

export interface ResourceHandlerParams {
  service: string;
  payload: unknown;
}

export enum ResourceHandlerState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  DISPOSING,
  DISPOSED,
}

/** 资源处理器接口定义 */
export interface ResourceHandler {
  dispose(): void;
  getState(): ResourceHandlerState;
  run(request: ResourceHandlerParams): Promise<unknown>;
}

/** 资源管理器 - 管理资源处理器的生命周期 */
export class ResourceManager {
  private readonly options: unknown;
  private readonly handler: new (options: unknown) => ResourceHandler;
  private handlerInstance: ResourceHandler | null = null;
  private connections = 0;
  private disposeTimer: NodeJS.Timeout | null = null;

  private static readonly WAIT_CONFIG = { checkTime: 500, timeout: 30000 };
  private static readonly DISPOSE_DELAY = 60000;

  constructor(handler: any, options: unknown) {
    this.handler = handler;
    this.options = options;
  }

  /**
   * 执行请求
   * @param params - 请求参数
   * @returns 执行结果
   * @throws 连接超时或执行错误
   */
  async run(params: ResourceHandlerParams): Promise<unknown> {
    this.clearDisposeTimer();
    this.connections++;

    try {
      await this.ensureConnected();
      return await this.handlerInstance!.run(params);
    } finally {
      this.handleConnectionEnd();
    }
  }

  /** 确保资源处理器实例已连接 */
  private async ensureConnected(): Promise<void> {
    if (this.handlerInstance?.getState() === ResourceHandlerState.DISPOSED) {
      this.handlerInstance = null;
    }

    if (!this.handlerInstance) {
      this.handlerInstance = new this.handler(this.options);
    } else {
      await waitFor(
        () => this.handlerInstance!.getState() !== ResourceHandlerState.DISPOSING,
        ResourceManager.WAIT_CONFIG,
      );
    }

    await waitFor(
      () => this.handlerInstance!.getState() === ResourceHandlerState.CONNECTED,
      ResourceManager.WAIT_CONFIG,
    );
  }

  /** 清理释放定时器 */
  private clearDisposeTimer(): void {
    if (this.disposeTimer) {
      clearTimeout(this.disposeTimer);
      this.disposeTimer = null;
    }
  }

  /** 处理连接结束 */
  private handleConnectionEnd(): void {
    this.connections = Math.max(0, this.connections - 1);

    if (this.connections === 0) {
      this.clearDisposeTimer();
      this.disposeTimer = setTimeout(() => this.dispose(), ResourceManager.DISPOSE_DELAY);
    }
  }

  /** 释放资源处理器实例 */
  dispose(): void {
    if (this.handlerInstance) {
      this.handlerInstance.dispose();
      this.handlerInstance = null;
    }
    this.disposeTimer = null;
  }
}
