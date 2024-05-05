export type Product = {
    id: string,
    name: string,
    options: Option[],
    variants: ProductVariant[],
};

export type Option = {
    id: string,
    name: string,
    values: OptionValue[],
    valueText: string,
}

export type OptionValue = {
    id: string,
    optionId: string,
    name: string,
}

export type ProductVariant = {
    id: string,
    optionIds: string[],
    optionValueIds: string[],
    name: string,
    sku: string,
    mrp: number,
    price: number,
    stock: number,
}