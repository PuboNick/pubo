export const pickFiles = (): Promise<FileList> => {
  return new Promise((resolve, reject) => {
    const el = document.createElement('input');
    let picked = false;

    const onFocus = (): void => {
      document.body.removeChild(el);
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!picked) {
          reject(new Error('no files picked'));
        }
      }, 1000);
    };

    el.type = 'file';
    el.style.visibility = 'hidden';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.zIndex = '-1';
    window.addEventListener('focus', onFocus);

    el.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      picked = target.files !== null && target.files.length > 0;
      resolve(target.files!);
    };

    document.body.appendChild(el);
    el.click();
  });
};
