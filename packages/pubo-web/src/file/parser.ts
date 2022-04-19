export const blob2text = (blob: any) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.readAsText(blob);
  });
};

export const blob2base64 = (blob: any): any => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    if (!blob) {
      reject('文件爲空!');
    } else {
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onabort = () => reject();
      reader.readAsDataURL(blob);
    }
  });
};

export const blob2file = (blob: any, name: string, type: string) => {
  return new File(blob, name, { type });
};
