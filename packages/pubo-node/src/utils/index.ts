export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const net = require('net') as typeof import('net');
    const server = net.createServer();
    server.listen(port, () => {
      resolve(true);
      server.close();
    });

    server.on('error', () => {
      resolve(false);
      server.close();
    });
  });
};
