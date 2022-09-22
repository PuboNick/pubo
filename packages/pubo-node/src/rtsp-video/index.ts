import { RTSP2Mpeg } from './rtsp2mpeg';

interface VideoConfig {
  url: string;
  input?: string[];
  output?: string[];
}

interface Props {
  app: any;
  server?: any;
  videos: VideoConfig[];
  path: string;
  expressWs?: any;
}

export const initRtspVideos = ({ app, server, videos, path, expressWs }: Props) => {
  const mpegList = videos.map(({ url, ...options }) => new RTSP2Mpeg(url, options));
  if (!app.ws) {
    expressWs(app, server);
  }

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
