interface Success<T> {
  type: 'Success';
  value: T;
}

interface Failure {
  type: 'Failure';
  error: unknown;
}

interface Command<T> {
  type: 'Command';
  cmd: () => Promise<T>;
  next: (result: T) => Effect<unknown>;
}

type Effect<T> = Success<T> | Failure | Command<unknown>;

export const Success = <T>(value: T): Success<T> => ({ type: 'Success', value });
export const Failure = (error: unknown): Failure => ({ type: 'Failure', error });
export const Command = <T>(cmd: () => Promise<T>, next: (result: T) => Effect<unknown>): Command<T> => ({
  type: 'Command',
  cmd,
  next,
});

const chain = <T>(effect: Effect<T>, fn: (value: T) => Effect<unknown>): Effect<unknown> => {
  switch (effect.type) {
    case 'Success':
      return fn(effect.value);
    case 'Failure':
      return effect;
    case 'Command':
      const next = (result: unknown) => chain((effect as Command<unknown>).next(result), fn);
      return Command(effect.cmd, next);
  }
};

export const effectPipe = (...fns: Array<(value: unknown) => Effect<unknown>>) => {
  return <T>(start: T): Effect<unknown> => fns.reduce((effect, fn) => chain(effect, fn), Success(start));
};

export async function runEffect<T>(effect: Effect<T>): Promise<Effect<T>> {
  let current = effect;
  while (current.type === 'Command') {
    try {
      const result = await current.cmd();
      current = current.next(result) as Effect<T>;
    } catch (e) {
      return Failure(e);
    }
  }
  return current;
}
