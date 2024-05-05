import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { MdClose, MdOutlineDelete } from "react-icons/md";
import {
  Option,
  OptionValue,
  Product,
  ProductVariant,
} from "~/models/product-model";

export const loader = async () => {
  const product: Product = {
    id: crypto.randomUUID().toString(),
    name: "",
    options: [],
    variants: [],
  };

  return product;
};

export default function ProductCreate() {
  const freshProduct = useLoaderData<typeof loader>();

  const [product, setProduct] = useState<Product>(freshProduct);
  const [options, setOptions] = useState<Option[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isNewOptionAdded, setIsNewOptionAdded] = useState(false);

  useEffect(() => {
    setVariants(
      variants.filter(
        (v) =>
          v.sku !== "" ||
          v.mrp > 0.0 ||
          v.price > 0.0 ||
          v.sku.length > 0 ||
          v.stock > 0,
      ),
    );
    if (options.length === 0 || options.every((e) => e.values.length === 0)) {
      return;
    }
    generateVariations("", options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const onAddOption = () => {
    const newOption = {
      id: crypto.randomUUID().toString(),
      productId: product.id,
      name: "",
      values: [],
      valueText: "",
    };
    setOptions((prevOptions) => [...prevOptions, newOption]);
  };

  const onDeleteOption = (option: Option) => {
    setVariants(() =>
      variants.filter((e) => e.optionIds.every((oi) => oi !== option.id)),
    );
    setOptions(() => options.filter((e) => e.id != option.id));
  };

  const onOptionNameChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    option: Option,
  ) => {
    const newOptions = options.map((o) => {
      if (o.id != option.id) return o;
      return { ...o, name: event.target.value };
    });
    setOptions(() => newOptions);
  };

  const onOptionValueChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    option: Option,
  ) => {
    const newList = event.target.value.split(" ");
    const isTwoCells = newList.length > 1;
    setIsNewOptionAdded(isTwoCells && option.values.length == 0);

    const newOptions = options.map((o) => {
      if (o.id != option.id) return o;
      return {
        ...o,
        valueText: isTwoCells
          ? newList[newList.length - 1]
          : event.target.value,
        values: isTwoCells
          ? [
              ...o.values,
              {
                id: crypto.randomUUID().toString(),
                optionId: o.id,
                name: newList[newList.length - 2],
              },
            ]
          : o.values,
      };
    });
    setOptions(() => newOptions);
  };

  const onOptionValueDelete = (
    option: Option,
    optionValueToDelete: OptionValue,
  ) => {
    setVariants((prev) =>
      prev.filter((variant) =>
        variant.optionValueIds.every(
          (optionId) => optionId !== optionValueToDelete.id,
        ),
      ),
    );
    const newOptions = options.map((o) => {
      if (o.id != option.id) return o;

      return {
        ...o,
        values: o.values.filter((e) => e.id != optionValueToDelete.id),
      };
    });
    setOptions(() => newOptions);
  };

  const onSKUChanged = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantToUpdate: ProductVariant,
  ) => {
    const newVariants = variants.map((variant) => {
      if (variantToUpdate.id != variant.id) return variant;

      return { ...variant, sku: e.target.value };
    });

    setVariants(() => newVariants);
  };

  const onMRPChanged = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantToUpdate: ProductVariant,
  ) => {
    const newVariants = variants.map((variant) => {
      if (variantToUpdate.id != variant.id) return variant;

      return { ...variant, mrp: parseFloat(e.target.value ?? "0.0") };
    });

    setVariants(() => newVariants);
  };

  const onPriceChanged = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantToUpdate: ProductVariant,
  ) => {
    const newVariants = variants.map((variant) => {
      if (variantToUpdate.id != variant.id) return variant;

      return { ...variant, price: parseFloat(e.target.value ?? "0.0") };
    });

    setVariants(() => newVariants);
  };

  const onStockChanged = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantToUpdate: ProductVariant,
  ) => {
    const newVariants = variants.map((variant) => {
      if (variantToUpdate.id != variant.id) return variant;

      return { ...variant, stock: parseInt(e.target.value ?? "0") };
    });

    setVariants(() => newVariants);
  };

  // generate variants
  function generateVariations(
    variantName: string,
    remainingOptions: Option[],
    optionIds: string[] = [],
    optionValueIds: string[] = [],
  ): void {
    if (
      remainingOptions.length === 0 ||
      remainingOptions.every((option) => option.values.length === 0)
    ) {
      if (isNewOptionAdded && options.length > 1) {
        const poppedOptionIds = [...optionIds];
        const poppedOptionValueIds = [...optionValueIds];
        poppedOptionIds.pop();
        poppedOptionValueIds.pop();

        const previousModifiedVariant = variants.find(
          (variant) =>
            (variant.sku !== "" ||
              variant.mrp !== 0.0 ||
              variant.price !== 0.0 ||
              variant.stock !== 0) &&
            variant.optionIds.join(",") === poppedOptionIds.join(",") &&
            variant.optionValueIds.join(",") === poppedOptionValueIds.join(","),
        );
        console.log(`${variantName}, ${optionIds}`);

        if (previousModifiedVariant) {
          setVariants((old) => [
            ...old.filter(
              (oldVariant) => oldVariant.id != previousModifiedVariant.id,
            ),
            {
              ...previousModifiedVariant,
              id: crypto.randomUUID().toString(),
              optionIds: [...optionIds],
              optionValueIds: [...optionValueIds],
              name: variantName.trim(),
            },
          ]);
          return;
        }
        setIsNewOptionAdded(false);
      }

      // Prevent create new variant when existing option value change
      if (
        variants.find(
          (e) =>
            e.name == variantName &&
            (e.sku !== "" || e.mrp !== 0.0 || e.price !== 0.0 || e.stock !== 0),
        )
      ) {
        return;
      }

      setVariants((old) => [
        ...old,
        {
          id: crypto.randomUUID().toString(),
          optionIds: [...optionIds],
          optionValueIds: [...optionValueIds],
          name: variantName.trim(),
          mrp: 0.0,
          price: 0.0,
          sku: "",
          stock: 0,
        },
      ]);
      return;
    }

    const currentOption = remainingOptions[0];
    const nextRemainingOptions = remainingOptions.slice(1);

    for (const value of currentOption.values) {
      const newVariantName = `${variantName} ${value.name}`;
      const newOptionIds = [...optionIds, currentOption.id];
      const newOptionValueIds = [...optionValueIds, value.id];
      generateVariations(
        newVariantName.trim(),
        nextRemainingOptions,
        newOptionIds,
        newOptionValueIds,
      );
    }
  }

  return (
    <div>
      <div className="mx-auto flex max-w-4xl flex-col p-6 shadow-lg">
        <h1 className="text-lg font-semibold">Create product</h1>
        <input
          type="text"
          name="product_name"
          id="product_name"
          autoComplete="name"
          className="mt-6 block flex-1 border bg-transparent px-4 py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
          placeholder="Product name"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
        />
        <div className="h-10" />

        {/* Options */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">Options</h1>
          <div className="mt-4 flex flex-col gap-2">
            {/* Option List */}
            {options.map((option) => {
              return (
                <div
                  key={option.id}
                  className="flex flex-row items-center gap-6"
                >
                  {/* Option Name */}
                  <div className="rounded-md border-2 border-blue-500 p-1">
                    <input
                      type="text"
                      name="option_name"
                      autoComplete="name"
                      className="block bg-transparent p-1.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="E.g Color"
                      value={option.name}
                      onChange={(e) => onOptionNameChanged(e, option)}
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-scroll rounded-md border-2 border-blue-500 p-1">
                    <div className="flex items-center gap-1">
                      {/* Option Value List */}
                      {option.values.map((optionValue) => {
                        return (
                          <div
                            key={optionValue.id}
                            className="flex items-center gap-2 rounded-sm bg-gray-200 px-2 py-1"
                          >
                            <p>{optionValue.name}</p>
                            <button
                              onClick={() =>
                                onOptionValueDelete(option, optionValue)
                              }
                            >
                              <MdClose />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      name="option_values"
                      autoComplete="name"
                      className="block w-screen flex-grow bg-transparent py-1.5 text-gray-900 ring-0 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Option values (separated by space) E.g Red Black"
                      value={option.valueText}
                      onChange={(e) => onOptionValueChanged(e, option)}
                    />
                  </div>
                  <button
                    className="rounded-full p-4 hover:bg-red-500 hover:text-white"
                    onClick={() => onDeleteOption(option)}
                  >
                    <MdOutlineDelete />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add option button */}
          <div className="my-4 border-t border-gray-300"></div>
          <button
            className="flex cursor-pointer items-center gap-1"
            onClick={onAddOption}
          >
            <FiPlus className="text-blue-500" />
            <p className="text-blue-500">Add another option</p>
          </button>
          <div className="my-4 border-t border-gray-300"></div>
        </div>

        <div className="h-4" />

        {/* Variants */}
        <table className="table-auto">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left">SKU</th>
              <th className="px-4 py-4 text-left">MRP</th>
              <th className="px-4 py-4 text-left">Price</th>
              <th className="px-4 py-4 text-left">Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => {
              return (
                <tr key={variant.id}>
                  <td className="px-4 py-4">{variant.name}</td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      name="variant_sku"
                      className="border p-2"
                      placeholder="SUN-G, JK1234..."
                      value={variant.sku}
                      onChange={(e) => onSKUChanged(e, variant)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="variant_mrp"
                        className="max-w-28 border p-2 pl-6"
                        placeholder="0.0"
                        value={variant.mrp}
                        onChange={(e) => onMRPChanged(e, variant)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="variant_price"
                        className="max-w-28 border p-2 pl-6"
                        placeholder="0.0"
                        value={variant.price}
                        onChange={(e) => onPriceChanged(e, variant)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="number"
                      name="variant_stock"
                      className="max-w-24 border p-2"
                      placeholder="0"
                      value={variant.stock}
                      onChange={(e) => onStockChanged(e, variant)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="h-4" />

        {/* Divider */}
        <div className="my-4 border-t border-gray-300"></div>

        {/* Raw Json */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold">Raw JSON</h1>

          <div className="mt-4 rounded border border-gray-200 p-4 shadow-md">
            <pre>
              <code>
                {JSON.stringify({ ...product, options, variants }, null, 2)}
              </code>
            </pre>
          </div>
        </div>
        <p></p>
      </div>
    </div>
  );
}
