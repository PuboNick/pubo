export const pickFiles = (): Promise<File[]> => {
  return new Promise((resolve) => {
    const el = document.createElement('input');
    el.type = 'file';
    el.style.visibility = 'hidden';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.zIndex = '-1';
    el.onchange = (e: any) => {
      resolve(e.target.files);
      document.body.removeChild(el);
    };
    document.body.appendChild(el);
    el.click();
  });
};
