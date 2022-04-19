import ROSLIB from 'roslib';
import { RosConfigure } from './configure';

import type { CreateFactory } from './super';
import { superFactory } from './super';

interface RosActionConfig {
  serverName: string;
  actionName: string;
}

interface TopicType {
  name: string;
  messageType: string;
}

interface RosAction extends RosActionConfig {
  goalMessage: any;
}

interface RoseServiceConfig {
  name: string;
  serviceType: string;
}

interface RoseService extends RoseServiceConfig {
  payload: any;
}

type RoseServiceFunc = (payload: any) => Promise<any>;

type RoseActionFunc = (goalMessage: any) => Promise<any>;

interface RosTopic extends ROSLIB.Topic {
  publishMessage: (payload: any) => void;
}

type RosTopicFunc = () => RosTopic;

export class RosUtils {
  private readonly configure: RosConfigure | any = null;

  constructor(configure: RosConfigure) {
    this.configure = configure;
  }

  private readonly publishService = ({ name, serviceType, payload }: RoseService): Promise<any> => {
    return new Promise((resolve, reject) => {
      const service = new ROSLIB.Service({ ros: this.configure.ros, name, serviceType });
      const request = new ROSLIB.ServiceRequest(payload);
      service.callService(request, resolve, reject);
    });
  };

  private readonly publishAction = ({ serverName, actionName, goalMessage }: RosAction) => {
    return new Promise((resolve, reject) => {
      const actionClient = new ROSLIB.ActionClient({ ros: this.configure.ros, serverName, actionName, timeout: 0 });
      const goal = new ROSLIB.Goal({ actionClient, goalMessage });
      goal.on('result', (result: any) => resolve(result));
      goal.on('error', (err: any) => reject(err));
      goal.send();
    });
  };

  private readonly rosTopic = (props: TopicType): RosTopic => {
    const topic: any = new ROSLIB.Topic({
      ros: this.configure.ros,
      ...props,
    });
    topic.publishMessage = (payload: any) => {
      if (typeof topic.publish === 'function') {
        topic.publish(new ROSLIB.Message(payload));
      }
    };
    return topic;
  };

  public createRosService: CreateFactory<RoseServiceConfig, RoseServiceFunc> = (services) => {
    return superFactory<RoseServiceConfig, RoseServiceFunc>((options: any) => {
      return (payload: any) => this.publishService({ ...options, payload });
    })(services);
  };

  public createRosAction: CreateFactory<RosActionConfig, RoseActionFunc> = (actions) => {
    return superFactory<RosActionConfig, RoseActionFunc>((options) => {
      return (goalMessage: any) => this.publishAction({ ...options, goalMessage });
    })(actions);
  };

  public createRosTopic: CreateFactory<TopicType, RosTopicFunc> = (topic) => {
    return superFactory<TopicType, RosTopicFunc>((options) => {
      return () => this.rosTopic(options);
    })(topic);
  };
}
