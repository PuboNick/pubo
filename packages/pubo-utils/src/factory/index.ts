type OptionsObject<T, C> = {
  [key in keyof T]: C;
};

type ProductsObject<T, F> = {
  [key in keyof T]: F;
};

type Factory<C> = (config: C, key: string) => any;

export type CreateFactory<C, F> = <T>(apis: OptionsObject<T, C>) => ProductsObject<T, F>;

export type SuperFactory = <C, F>(factory: Factory<C>) => CreateFactory<C, F>;

export const superFactory: SuperFactory = (factory) => {
  return (options: any) => {
    const product: any = {};
    for (const key of Object.keys(options)) {
      product[key] = factory(options[key], key);
    }
    return product;
  };
};
