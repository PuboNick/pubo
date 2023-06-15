export const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
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
