import { z } from "zod";

export const ProductSchema = z
  .object({
    ProductID: z.number(),
    Name: z.string(),
    Description: z.string(),
    ProductType: z.string(),
    SubType: z.string(),
    MainImage: z.string(),
    Price: z.number(),
    variants: z.array(
      z.object({
        colorText: z.string(),
        image: z.string(),
        price: z.number(),
      }),
    ),
    NextCursor: z.string(),
  })
  .transform((product) => {
    return {
      ProductID: product.ProductID,
      Name: product.Name,
      Description: product.Description,
      ProductType: product.ProductType,
      SubType: product.SubType,
      MainImage: product.MainImage,
      Price: product.Price,
      variants: product.variants,
      NextCursor: product.NextCursor,
    };
  });

export type SimpleVariant = {
  colorText: string;
  image: string;
  price: number;
};

export const VariantSchema = z.object({
  VariantID: z.number(),
  Color: z.string(),
  Price: z.number(),
  Stock: z.number(),
  MainImage: z.string(),
});

export const ProductDetailSchema = z
  .object({
    ProductID: z.number(),
    Name: z.string(),
    ProductType: z.string(),
    Description: z.string(),
    SubType: z.string(),
    images: z.array(z.string()),
    variants: z.array(VariantSchema),
  })
  .transform((productDetail) => {
    return {
      ProductID: productDetail.ProductID,
      Name: productDetail.Name,
      ProductType: productDetail.ProductType,
      Description: productDetail.Description,
      SubType: productDetail.SubType,
      images: productDetail.images,
      variants: productDetail.variants,
    };
  });

export type ProductDetailEntity = z.infer<typeof ProductDetailSchema>;
export type ProductEntity = z.infer<typeof ProductSchema>;
export type Variant = z.infer<typeof VariantSchema>;
