export const sleep = async (time: number) => {
  await new Promise((resolve: any) => setTimeout(() => resolve(), time));
};
