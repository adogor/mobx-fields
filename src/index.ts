import Field, { FieldOpts, FieldType } from "./Field";
import FieldsObject, { FieldsObjectOpts } from "./FieldObject";
import FieldsArray, { FieldsArrayData, FieldsArrayOpts } from "./FieldsArray";

export const getInputFieldProps = <TValue, TInputValue>(
  field: Field<TValue, TInputValue>
) => ({
  value: field.inputValue,
  onChange: field.onInputChange,
  error: field.errorMessage,
  onBlur: field.markAsTouched,
  disabled: field.disabled,
});

export const getSwitchProps = <TValue, TInputValue>(
  field: Field<TValue, TInputValue>
) => ({
  checked: field.inputValue,
  onChange: field.onInputChange,
  onBlur: field.markAsTouched,
});

class FieldBuilder {
  field<TValue, TInputValue = TValue>(
    initValue: TValue | null,
    obj: FieldOpts<TValue | null, TInputValue> = {}
  ) {
    return new Field(initValue, obj);
  }

  obj<TFields>(fields: TFields, obj?: FieldsObjectOpts<TFields>) {
    return new FieldsObject(fields, obj);
  }

  array<
    TField extends FieldType<FieldsArrayData<TField>>,
    TData = FieldsArrayData<TField>
  >(initValue: TField[], obj?: FieldsArrayOpts<TData>) {
    return new FieldsArray(initValue, obj);
  }
}

export const fb = new FieldBuilder();

export * from "./validation";
export * from "./validators";
export { FieldsObject, Field, FieldsArray };
