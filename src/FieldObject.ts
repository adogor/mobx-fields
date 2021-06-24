import { computed, observable, action } from "mobx";
import Field, { FieldType, SetValueOpts, ResetOpts } from "./Field";
import FieldsArray, { FieldsArrayData } from "./FieldsArray";
import { ValidationObj } from "./validation";
import * as fastDeepEqual from "fast-deep-equal";

export type FieldsObjectType<T> = {
  [P in keyof T]: T[P] extends Field<infer U, infer V>
    ? Field<U, V>
    : T[P] extends FieldsObject<infer U>
    ? FieldsObject<U>
    : T[P] extends FieldsArray<infer U>
    ? FieldsArray<U>
    : never;
};

export type FieldsObjectData<T> = {
  [P in keyof T]: T[P] extends Field<infer U, infer V>
    ? U
    : T[P] extends FieldsObject<infer U>
    ? FieldsObjectData<U>
    : T[P] extends FieldsArray<infer U>
    ? FieldsArrayData<U>[]
    : never;
};

export type FieldsObjectValidator<T> = (val: T) => ValidationObj;

export type FieldsObjectOpts<TFields> = {
  validate?: FieldsObjectValidator<FieldsObjectData<TFields>>;
  data?: Partial<FieldsObjectData<TFields>>;
};

export default class FieldsObject<TFields>
  implements FieldType<FieldsObjectData<TFields>>
{
  @observable fields: TFields;

  defaultValue: FieldsObjectData<TFields>;

  @observable
  initValue: Partial<FieldsObjectData<TFields>>;

  validate?: FieldsObjectValidator<FieldsObjectData<TFields>>;

  constructor(
    fields: TFields,
    { validate, data }: FieldsObjectOpts<TFields> = {}
  ) {
    this.validate = validate;
    this.fields = observable.object(fields, {}, { deep: false });
    if (data) {
      this.setValue(data, { interract: false });
    }
    this.defaultValue = this.value;
    this.initValue = this.value;
  }

  @action("FIELD_OBJECT_RESET")
  reset({ untouched = false, defaultValue = false }: ResetOpts = {}) {
    if (defaultValue) {
      this.initValue = this.defaultValue;
    }
    this.setValue(this.initValue);
    if (untouched) {
      this.markAsUntouched();
    }
  }

  @action("FIELD_OBJECT_MAT")
  markAsTouched() {
    Object.values(this.fields).forEach((field: FieldType<any>) =>
      field.markAsTouched()
    );
  }

  @action("FIELD_OBJECT_MAUT")
  markAsUntouched() {
    Object.values(this.fields).forEach((field: FieldType<any>) =>
      field.markAsUntouched()
    );
  }

  @action("FIELD_OBJECT_SETVALUE")
  setValue(
    newData: Partial<FieldsObjectData<TFields>>,
    { interract = false, isInitValue = false }: SetValueOpts = {}
  ) {
    if (!newData) {
      return;
    }
    Object.keys(this.fields).forEach((fieldName) => {
      if (newData[fieldName] !== undefined) {
        this.fields[fieldName].setValue(newData[fieldName], {
          interract,
          isInitValue,
        });
      }
    });
    if (isInitValue) {
      this.initValue = this.value;
    }
  }

  @computed
  get validation() {
    if (this.validate) {
      const validation = this.validate(this.value);
      if (!validation.valid) {
        return validation;
      }
    }

    const invalidField = Object.values(this.fields).find(
      (field: FieldType<any>) => !field.isValid
    ) as FieldType<any>;
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
  get value() {
    const res = {};
    Object.keys(this.fields).forEach((fieldName) => {
      res[fieldName] = this.fields[fieldName].value;
    });

    return res as FieldsObjectData<TFields>;
  }

  @computed
  get interacted() {
    return Object.values(this.fields).some(
      (field: FieldType<any>) => field.interacted
    );
  }

  @computed
  get pristine() {
    return fastDeepEqual(this.initValue, this.value);
  }

  @computed
  get errorMessage() {
    return this.validation?.message;
  }
}
