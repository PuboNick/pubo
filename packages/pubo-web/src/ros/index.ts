import { RosUtils } from './factory';
import type { RosConfigure } from './factory/configure';
import { RosViewer } from './ros3d/viewer';

export const createConfigureRos = (rosConfigure: RosConfigure) => {
  return {
    rosUtils: new RosUtils(rosConfigure),
    createRosViewer() {
      return new RosViewer(rosConfigure);
    },
  };
};
