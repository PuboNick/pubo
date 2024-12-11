export interface Point2D {
  x: number;
  y: number;
}

export type Vector2D = [number, number];

// 获取两点的距离
export const getDistance = (a: Point2D, b: Point2D): number => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

// 弧度转角度
export const degrees = (rad: number) => {
  return (rad * 180) / Math.PI;
};

// 角度转弧度
export const radians = (deg: number) => {
  return (deg * Math.PI) / 180;
};

// 获取三角形角度
export const getAngle = ({ w, h }: { w: number; h: number }) => {
  return degrees(Math.atan2(h, w));
};

// 关键点过滤
export function filterKeyPoints(list: Point2D[], len = 0.5): Point2D[] {
  if (list.length < 3 || len <= 0) {
    return list;
  }

  let last;
  return list.filter((item, i) => {
    if (i > 0 && getDistance(last, item) < len) {
      return false;
    }
    last = list[i];
    return true;
  });
}

// 获取中心点坐标
export function getCenter(list: Point2D[] | [number, number][]): Point2D {
  const tmp: [number, number] = [0, 0];
  for (const item of list) {
    if (Array.isArray(item)) {
      tmp[0] += item[0];
      tmp[1] += item[1];
    } else {
      tmp[0] += item.x;
      tmp[1] += item.y;
    }
  }
  return { x: tmp[0] / list.length, y: tmp[1] / list.length };
}

// 2D旋转
export function getRotate(data: Vector2D, theta: number, isDeg?: boolean): Vector2D {
  if (isDeg) {
    theta = radians(theta);
  }
  const x = Math.cos(theta) * data[0] - Math.sin(theta) * data[1];
  const y = Math.sin(theta) * data[0] + Math.cos(theta) * data[1];
  return [x, y];
}

// 获取A点到B点的方向角
export const getPositionTheta = (a: Point2D, b: Point2D) => {
  const vector = { x: b.x - a.x, y: b.y - a.y };
  return Math.atan2(vector.y, vector.x);
};

// 获取距离和方向最佳的位置点
export const getBestPointIndex = (points: Point2D[], pose: Point2D & { theta: number }): number => {
  if (points.length < 2) {
    return 0;
  }

  const temp: any = [];
  let minDistance = Infinity;
  let index = 0;
  for (const item of points) {
    const distance = getDistance(item, pose);
    const theta = getPositionTheta(pose, item) - pose.theta;

    if (minDistance > distance) {
      minDistance = distance;
    }
    temp.push({ ...item, index, distance, theta });
    index += 1;
  }

  const results = temp
    .filter((item: any) => item.distance - minDistance < 0.1)
    .sort((a: any, b: any) => a.theta - b.theta);
  return results[0].index;
};

// 按照距离和方向排序
export const orderByDistance = (
  points: Point2D[],
  pose: Point2D & { theta: number } = { x: 0, y: 0, theta: 0 },
): Point2D[] => {
  let current = pose;
  const results: any = [];
  const arr: any = [...points];
  while (arr.length > 0) {
    const index = getBestPointIndex(arr, current);
    results.push(arr[index]);
    current = arr[index];
    arr.splice(index, 1);
  }

  return results;
};

// 获取向量a到向量b的夹角
export const getVectorTheta = (a: Point2D, b: Point2D) => {
  return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
};
