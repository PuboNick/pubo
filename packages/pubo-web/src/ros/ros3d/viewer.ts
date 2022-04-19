import ROSLIB from 'roslib';
import { RosConfigure } from '../factory/configure';

import { InjectUtil } from './inject';
import { basePointCloudOptions, loadLib } from './utils';

interface InitProps {
  elem: any;
  view?: any;
  tf?: any;
}

export class RosViewer {
  private readonly configure: RosConfigure;
  private elem: any;

  ROS3D: any;
  viewer: any;
  iu = new InjectUtil();

  constructor(configure: RosConfigure) {
    this.configure = configure;
  }

  async init({ elem, view = {}, tf = {} }: InitProps) {
    if (!this.configure.conf.ros3d_lib_url) {
      throw new Error('ros3djs lib not found');
    }
    this.ROS3D = await loadLib(this.configure.conf.ros3d_lib_url);
    this.elem = elem;
    this.iu.install('ros', this.configure.ros);

    this.viewer = new this.ROS3D.Viewer({
      elem,
      width: elem.clientWidth,
      height: elem.clientHeight,
      antialias: true,
      cameraPose: { x: 100, y: 100, z: 100 },
      displayPanAndZoomFrame: false,
      background: '#000000',
      ...view,
    });
    this.iu.install('rootObject', this.viewer.scene);

    const tfClient = this.iu.inject(ROSLIB.TFClient, {
      angularThres: 0.01,
      transThres: 0.01,
      fixedFrame: '/base_link',
      ...tf,
    });
    this.iu.install('tfClient', tfClient);
  }

  destroy() {
    if (this.viewer && typeof this.viewer.stop === 'function') {
      this.viewer.stop();
    }
    this.elem.innerHTML = '';
  }

  initPointClouds(optList: any[]) {
    return optList.map((opt) =>
      this.iu.inject(this.ROS3D.PointCloud2, {
        ...basePointCloudOptions,
        ...opt,
      }),
    );
  }
}
