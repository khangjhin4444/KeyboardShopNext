export type ConvertResponseModelToEntityFieldsFunc<TResModel, TEntity> = (
  res: TResModel,
) => TEntity;
