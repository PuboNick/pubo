export const getCookieValue = (key: string): string => {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`);
  const res = reg.exec(document.cookie);
  return res ? res[2] : '';
};

export const getCookie = (): Record<string, string> => {
  const res: Record<string, string> = {};
  if (!document.cookie) {
    return res;
  }
  const tmp = document.cookie.split(';');
  tmp.forEach((item) => {
    const [key, ...valueParts] = item.split('=');
    if (key) {
      res[key.trim()] = valueParts.join('=');
    }
  });

  return res;
};

export const setCookieItem = (key: string, value: string, options?: { expires?: number; path?: string }): void => {
  let cookie = `${key}=${value}`;
  if (options?.expires) {
    cookie += `; expires=${new Date(Date.now() + options.expires).toUTCString()}`;
  }
  if (options?.path) {
    cookie += `; path=${options.path}`;
  }
  document.cookie = cookie;
};
