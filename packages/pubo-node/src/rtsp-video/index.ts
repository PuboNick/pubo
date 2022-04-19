import * as expressWs from 'express-ws';

import { RTSP2Mpeg } from './rtsp2mpeg';

export const initRtspVideos = ({ app, server, videos, path }) => {
  const mpegList = videos.map((url) => new RTSP2Mpeg(url));
  expressWs(app, server);

  app.ws(path, (ws, req) => {
    const { channel = 0 } = req.query;
    let listener: any = null;
    if (mpegList[channel]) {
      listener = mpegList[channel].on('data', (chunk) => {
        ws.send(chunk);
      });
    }
    ws.on('close', () => {
      if (listener) {
        mpegList[channel].cancel(listener);
      }
    });
  });

  return mpegList;
};
