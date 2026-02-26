interface ScriptElement extends HTMLScriptElement {
  _state?: string;
}

interface LoadScriptOptions {
  [key: string]: string;
}

/**
 * Loads a script from the given URL with the provided options.
 */
export const loadScript = (url: string, options: LoadScriptOptions = {}): Promise<string> => {
  const findScript = (): ScriptElement | null => {
    const list = document.getElementsByTagName('script');
    for (const item of list) {
      if (item.src === url) {
        return item as ScriptElement;
      }
    }
    return null;
  };

  return new Promise((resolve) => {
    const old = findScript();
    let el: ScriptElement;

    if (!old) {
      el = document.createElement('script');
    } else if (old._state === 'complete') {
      return resolve(url);
    } else {
      el = old;
    }

    for (const key of Object.keys(options)) {
      el[key] = options[key];
    }

    const onLoad = (): void => {
      resolve(url);
      el.removeEventListener('load', onLoad);
      el._state = 'complete';
    };

    if (!old) {
      el.src = url;
      el.addEventListener('load', onLoad);
      document.body.appendChild(el);
    }
  });
};
