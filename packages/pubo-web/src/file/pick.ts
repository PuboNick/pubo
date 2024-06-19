export const pickFiles = (): Promise<FileList> => {
  return new Promise((resolve, reject) => {
    const el = document.createElement('input');
    let picked = false;

    const onFocus = () => {
      document.body.removeChild(el);
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!picked) {
          reject('no files picked');
        }
      }, 1000);
    };
    el.type = 'file';
    el.style.visibility = 'hidden';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.zIndex = '-1';
    window.addEventListener('focus', onFocus);

    el.onchange = (e: any) => {
      picked = e.target.files.length > 0;
      resolve(e.target.files);
    };

    document.body.appendChild(el);
    el.click();
  });
};
