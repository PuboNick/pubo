export const getCookieValue = (key: string): string => {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`);
  const res = reg.exec(document.cookie);
  return res ? res[2] : '';
};

export const getCookie = () => {
  const res: any = {};
  if (!document.cookie) {
    return res;
  }
  const tmp = document.cookie.split(';');
  tmp.forEach((item) => {
    const [key, value] = item.split('=');
    res[key] = value;
  });

  return res;
};

export const setCookieItem = (key: string, value: string) => {
  document.cookie = `${key}=${value}`;
};
