/**
 * Loads a script from the given URL with the provided options.
 *
 * @param {string} url - The URL of the script to load
 * @param {any} options - Additional options for loading the script
 * @return {Promise<any>} A Promise that resolves with the URL once the script is loaded
 */
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
    let el: any = old;

    if (!old) {
      el = document.createElement('script');
    } else if (old._state === 'complete') {
      return resolve(url);
    }

    for (const key of Object.keys(options)) {
      el[key] = options[key];
    }
    const onLoad = () => {
      resolve(url);
      el.removeEventListener('load', onLoad);
      el._state = 'complete';
    };
    el.src = url;
    el.addEventListener('load', onLoad);
    document.body.appendChild(el);
    return 'success';
  });
};
