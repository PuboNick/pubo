type OptionsObject<T, C> = {
  [key in keyof T]: C;
};

type ProductsObject<T, F> = {
  [key in keyof T]: F;
};

type Factory<C> = (config: C, key: string) => any;

export type CreateFactory<C, F> = <T>(apis: OptionsObject<T, C>) => ProductsObject<T, F>;

export type SuperFactory = <C, F>(factory: Factory<C>) => CreateFactory<C, F>;

/**
 * Creates a factory function that takes another factory function and returns a new function that creates a product object based on the options passed in.
 *
 * @param {SuperFactory} factory - the factory function to be used in creating the product object
 * @return {(options: any) => any} the new factory function that creates the product object
 */

export const superFactory: SuperFactory = (factory) => {
  return (options: any) => {
    const product: any = {};
    for (const key of Object.keys(options)) {
      product[key] = factory(options[key], key);
    }
    return product;
  };
};
