export const loadScript = (url: string, options: any = {}) => {
  const findScript = () => {
    const list: any = document.getElementsByTagName('script');
    for (const item of list) {
      if (item.src === url) {
        return item;
      }
    }
    return null;
  };

  return new Promise((resolve) => {
    const old = findScript();
    if (old) {
      return resolve(url);
    }
    const el: any = document.createElement('script');
    for (const key of Object.keys(options)) {
      el[key] = options[key];
    }
    el.src = url;
    el.onload = () => resolve(url);
    document.body.appendChild(el);
    return 'success';
  });
};
