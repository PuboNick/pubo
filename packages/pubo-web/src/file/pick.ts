export const pickFiles = (): Promise<FileList> => {
  return new Promise((resolve) => {
    const el = document.createElement('input');

    const onFocus = () => {
      document.body.removeChild(el);
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
    };

    document.body.appendChild(el);
    el.click();
  });
};
