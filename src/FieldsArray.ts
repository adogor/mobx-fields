import * as fastDeepEqual from "fast-deep-equal";
import { action, computed, observable } from "mobx";
import { FieldType, ResetOpts, SetValueOpts } from "./Field";
import { ValidationObj } from "./validation";

export type FieldsArrayData<TField> = TField extends FieldType<infer U>
  ? U
  : never;

export type FieldsArrayValidator<T> = (val: T[]) => ValidationObj;

export type FieldsArrayOpts<TData, TField> = {
  validate?: FieldsArrayValidator<TData | null>;
  builder?: (data: TData, opts: SetValueOpts) => TField;
};

export default class FieldsArray<
  TField extends FieldType<FieldsArrayData<TField>>,
  TData = FieldsArrayData<TField>
> implements FieldType<(TData | null)[]> {
  @observable fields: TField[];

  defaultValue: (TData | null)[];

  @observable
  initValue: (TData | null)[];

  validate?: FieldsArrayValidator<TData | null>;

  builder?: (data: TData, opts: SetValueOpts) => TField;

  constructor(
    defaultValue: TField[],
    { validate, builder }: FieldsArrayOpts<TData, TField> = {}
  ) {
    this.validate = validate;
    this.builder = builder;
    this.fields = observable.array(defaultValue, { deep: false });
    this.defaultValue = this.value;
    this.initValue = this.value;
  }

  @action("FIELD_ARRAY_RESET")
  reset({ untouched = false, defaultValue = false }: ResetOpts = {}) {
    if (defaultValue) {
      this.initValue = this.defaultValue;
    }
    this.setValue(this.initValue);
    // this.setValue(this.initValue as FieldsArrayData<TField>[]);
    if (untouched) {
      this.markAsUntouched();
    }
  }

  @action("FIELD_ARRAY_MAT")
  markAsTouched() {
    this.fields.forEach((field) => field.markAsTouched());
  }

  @action("FIELD_ARRAY_MAUT")
  markAsUntouched() {
    this.fields.forEach((field) => field.markAsUntouched());
  }

  @action("FIELD_ARRAY_SETVALUE")
  setValue(
    data: (TData | null)[],
    { interract = false, isInitValue = false }: SetValueOpts = {}
  ) {
    if (!data) {
      return;
    }

    // Set fields length to data length
    this.fields.splice(data.length, this.fields.length - data.length);

    // Set fields values to data values
    data.forEach((dataField, i) => {
      if (this.fields[i]) {
        this.fields[i].setValue(dataField as FieldsArrayData<TField>, {
          interract,
          isInitValue,
        });
      } else if (this.builder) {
        this.fields.push(
          this.builder(dataField as FieldsArrayData<TField>, {
            interract,
            isInitValue,
          })
        );
      } else {
        throw Error("No builder defined");
      }
    });

    if (isInitValue) {
      this.initValue = this.value;
    }
  }

  get(index: number) {
    return this.fields[index];
  }

  @computed
  get validation() {
    if (this.validate) {
      const validation = this.validate(this.value);
      if (!validation.valid) {
        return validation;
      }
    }

    const invalidField = this.fields.find((field) => !field.isValid);
    if (invalidField) {
      return invalidField.validation;
    }

    return {
      valid: true,
    };
  }

  @computed
  get isValid() {
    return this.validation.valid;
  }

  @computed
  get value(): (TData | null)[] {
    return this.fields.map((field) => field.value);
  }

  @computed
  get interacted(): boolean {
    return this.fields.some((field) => field.interacted);
  }

  @computed
  get pristine() {
    // FIXME how to detect pristine state
    return fastDeepEqual(this.initValue, this.value);
  }

  @computed
  get errorMessage() {
    return this.validation?.message;
  }
}
