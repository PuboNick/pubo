import type EventEmitter from 'events';
import * as fs from 'fs';

interface PuboFileSystemInterface {
  read: <TBuffer extends NodeJS.ArrayBufferView>(
    fd: number,
    buffer?: TBuffer,
    offset?: number,
    length?: number,
    position?: fs.ReadPosition | null,
  ) => Promise<[number, TBuffer]>;

  stat: (path: fs.PathLike) => Promise<fs.Stats>;

  readFile: (
    path: fs.PathOrFileDescriptor,
    options?:
      | ({
          encoding?: null;
          flag?: string;
        } & EventEmitter.Abortable)
      | null,
  ) => Promise<Buffer>;

  writeFile: (
    file: fs.PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: fs.WriteFileOptions,
  ) => Promise<void>;

  readdir: (
    path: fs.PathLike,
    options?:
      | BufferEncoding
      | {
          encoding: BufferEncoding | null;
          withFileTypes: false;
        }
      | null,
  ) => Promise<string[]>;

  open: (path: fs.PathLike, flags?: fs.OpenMode, mode?: fs.Mode | null) => Promise<number>;

  close: (fd: number) => Promise<void>;

  write: <TBuffer extends NodeJS.ArrayBufferView>(
    fd: number,
    buffer: TBuffer,
    offset?: number | null,
    length?: number | null,
    position?: number | null,
  ) => Promise<void>;
}

const callbackToPromise = (fn): any => {
  return (...args) =>
    new Promise((resolve: any, reject) => {
      fn(...args, (err, ...rest) => {
        if (err) {
          reject(err);
        }
        if (rest.length < 2) {
          resolve(rest[0]);
        } else {
          resolve([...rest]);
        }
      });
    });
};

export const PuboFileSystem: PuboFileSystemInterface = {
  read: callbackToPromise(fs.read),
  readFile: callbackToPromise(fs.readFile),
  writeFile: callbackToPromise(fs.writeFile),
  readdir: callbackToPromise(fs.readdir),
  open: callbackToPromise(fs.open),
  close: callbackToPromise(fs.close),
  write: callbackToPromise(fs.write),
  stat: callbackToPromise(fs.stat),
};
