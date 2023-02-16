export const getDistance = (a: any, b: any) => {
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

// 获取角度
export const getAngle = ({ w, h }: { w: number; h: number }) => {
  const a = degrees(Math.asin(h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))));
  let res;
  if (w <= 0) {
    res = 180 - a;
  } else if (a > 0) {
    res = a;
  } else {
    res = 360 + a;
  }
  if (res < -180) {
    res = res + 360;
  }
  if (res > 180) {
    res = res - 360;
  }

  return res;
};

interface Point2D {
  x: number;
  y: number;
}

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
