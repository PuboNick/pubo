export const pickFiles = (): Promise<File[] | null> => {
  return new Promise((resolve) => {
    const el = document.createElement('input');
    const destroy = () => {
      document.body.removeChild(el);
    };
    const onFocus = () => {
      resolve(null);
      destroy();
      window.removeEventListener('focus', onFocus);
    };
    el.type = 'file';
    el.style.visibility = 'hidden';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.zIndex = '-1';
    window.addEventListener('focus', onFocus);

    el.onchange = (e: any) => {
      resolve(e.target.files);
      window.removeEventListener('focus', onFocus);
      destroy();
    };

    document.body.appendChild(el);
    el.click();
  });
};
