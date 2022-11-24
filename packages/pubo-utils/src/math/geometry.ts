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
  if (w <= 0) {
    return 180 - a;
  }
  if (a > 0) {
    return a;
  }
  return 360 + a;
};
