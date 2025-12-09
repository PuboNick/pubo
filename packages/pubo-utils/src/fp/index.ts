export const Success = (value: any) => ({ type: 'Success', value });
export const Failure = (error: any) => ({ type: 'Failure', error });
export const Command = (cmd: any, next: any) => ({ type: 'Command', cmd, next });

const chain = (effect: any, fn: any) => {
  switch (effect.type) {
    case 'Success':
      return fn(effect.value);
    case 'Failure':
      return effect;
    case 'Command':
      const next = (result) => chain(effect.next(result), fn);
      return Command(effect.cmd, next);
  }
};

export const effectPipe = (...fns: any[]) => {
  return (start) => fns.reduce(chain, Success(start));
};

export async function runEffect(effect: any) {
  while (effect.type === 'Command') {
    try {
      effect = effect.next(await effect.cmd());
    } catch (e) {
      return Failure(e);
    }
  }
  return effect;
}
