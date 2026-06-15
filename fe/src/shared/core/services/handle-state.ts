import { ConvertResponseModelToEntityFieldsFunc } from "../helpers/type-helper";
import { HttpStatusCode } from "./type";
type ResponseValue<TEntity, TResValue> = {
  resValue?: TResValue;
  message?: string;
};
export type HandleStateType<TEntity, TResValue> = {
  isError: boolean;
  message: string;
  value?: TEntity;
  metadata?: Record<string, unknown>;
};

export function handleSuccessFn<TEntity, TResValue>(
  { resValue, message }: ResponseValue<TEntity, TResValue>,
  convertFunc?: ConvertResponseModelToEntityFieldsFunc<TResValue, TEntity>,
): HandleStateType<TEntity, TResValue> {
  const state: HandleStateType<TEntity, TResValue> = {
    isError: false,
    message: message || "Service call successful",
  };
  if (resValue && convertFunc) {
    state.value = convertFunc(resValue);
  }
  return state;
}

export function handleFailedFn<TEntity, TResValue>({
  resValue,
  message,
}: ResponseValue<TEntity, TResValue>): HandleStateType<TEntity, TResValue> {
  const state: HandleStateType<TEntity, TResValue> = {
    isError: true,
    message: message || "Service call failed",
  };
  return state;
}

export function handleByResponseFn<TEntity, TResValue>(
  res: GatewayResponseModel<TResValue>,
  convertFunc?: ConvertResponseModelToEntityFieldsFunc<TResValue, TEntity>,
): HandleStateType<TEntity, TResValue> {
  if (res.code == HttpStatusCode.Ok || res.code == HttpStatusCode.Created) {
    const { data, message } = res;
    return handleSuccessFn({ resValue: data, message }, convertFunc);
  } else {
    const { data, message } = res;
    return handleFailedFn({ resValue: data, message });
  }
}
