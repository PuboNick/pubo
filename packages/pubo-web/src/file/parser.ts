export const blob2text = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(blob);
  });
};

export const blob2base64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (!blob) {
      reject(new Error('文件为空!'));
    } else {
      reader.onload = () => resolve(reader.result as string);
      reader.onabort = () => reject(new Error('读取中断'));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }
  });
};

export const blob2file = (blob: Blob, name: string, type: string): File => {
  return new File([blob], name, { type });
};
