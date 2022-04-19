import ROSLIB from 'roslib';

interface RosConfig {
  ros_bridge_url: string;
  ros3d_lib_url?: string;
}

export class RosConfigure {
  private _conf: RosConfig | null = null;
  private readonly getConfig: () => Promise<RosConfig>;

  private _ros: ROSLIB.Ros | null = null;

  constructor(getConfig: () => Promise<RosConfig>) {
    this.getConfig = getConfig;
  }

  get conf(): RosConfig {
    const initialValues: any = {};
    if (!this._conf) {
      return initialValues;
    }
    return { ...this._conf };
  }

  get ros() {
    if (!this._ros) {
      throw Error('please init first!');
    }
    return this._ros;
  }

  async init(): Promise<void> {
    if (this._conf) {
      return;
    }
    this._conf = await this.getConfig();
    this._ros = new ROSLIB.Ros({ url: this._conf.ros_bridge_url });
  }
}
