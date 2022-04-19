export const downloadFile = (uri: string, name: string): void => {
  const a = document.createElement('a');
  a.href = uri;
  if (name) {
    a.download = name;
  }
  a.style.position = 'fixed';
  a.style.visibility = 'hidden';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
