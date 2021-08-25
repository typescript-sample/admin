export const getFileName = (url: string): string => {
  const arr = url.split('/');
  const fileName = arr[arr.length-1];
  return fileName;
};