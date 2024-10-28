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
  mkdir: (path: fs.PathLike, options?: fs.MakeDirectoryOptions) => Promise<void>;
  rm: (path: fs.PathLike) => Promise<void>;

  write: <TBuffer extends NodeJS.ArrayBufferView>(
    fd: number,
    buffer: TBuffer,
    offset?: number | null,
    length?: number | null,
    position?: number | null,
  ) => Promise<void>;
}

const callback2promise = (fn): any => {
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
  read: callback2promise(fs.read),
  readFile: callback2promise(fs.readFile),
  writeFile: callback2promise(fs.writeFile),
  readdir: callback2promise(fs.readdir),
  open: callback2promise(fs.open),
  close: callback2promise(fs.close),
  write: callback2promise(fs.write),
  stat: callback2promise(fs.stat),
  mkdir: callback2promise(fs.mkdir),
  rm: callback2promise(fs.rm),
};
