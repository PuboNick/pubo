export const getCookieValue = (key: string): string => {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`);
  const res = reg.exec(document.cookie);
  return res ? res[2] : '';
};
