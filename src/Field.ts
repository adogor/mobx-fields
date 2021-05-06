import * as fastDeepEqual from "fast-deep-equal";
import {
  action,
  autorun,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from "mobx";
import { isPromise, Nullable } from "./utils";
import {
  defaultValidationContext,
  ErrorMessage,
  ValidationContextBuilder,
  ValidationFunction,
  ValidationObj,
} from "./validation";

export interface FieldType<TValue> {
  markAsTouched: () => void;
  markAsUntouched: () => void;
  setValue: (val: TValue, opts?: SetValueOpts) => void;
  reset: (opts?: ResetOpts) => void; // reset to pristine state or to default value
  readonly value: TValue;
  readonly isValid: boolean;
  readonly interacted: boolean;
  readonly pristine: boolean;
  readonly errorMessage?: ErrorMessage;
  readonly validation: ValidationObj;
}

export interface FieldOpts<TValue, TInputValue> {
  validate?:
    | ValidationFunction<Nullable<TValue>>
    | ValidationFunction<Nullable<TValue>>[];
  debounce?: boolean;
  disabled?: boolean;
  parser?: (value: TInputValue) => Nullable<TValue>;
  formater?: (value: TValue) => Nullable<TInputValue>;
  validationContext?: ValidationContextBuilder<Nullable<TValue>>;
  label?: string;
}

export interface SetValueOpts {
  interract?: boolean;
  isInitValue?: boolean;
}

export interface ResetOpts {
  untouched?: boolean;
  defaultValue?: boolean;
}
export default class Field<TValue, TInputValue = TValue>
  implements FieldType<Nullable<TValue>> {
  @observable
  _value: Nullable<TValue> = null;
  @observable
  _interacted = false;
  @observable
  _validation: ValidationObj;
  @observable
  disabled = false;

  validationContext: ValidationContextBuilder<Nullable<TValue>>;

  label?: string;

  parser?: (value: TInputValue) => Nullable<TValue>;
  formater?: (value: Nullable<TValue>) => Nullable<TInputValue>;

  _isValidFn: ValidationFunction<Nullable<TValue>>[] = [];

  // Default value is value for a blank form
  defaultValue: Nullable<TValue>;

  // Init value is current value of a form before user touch it
  @observable
  initValue: Nullable<TValue>;

  _dispose?: IReactionDisposer;

  @action("FIELD_RESET")
  reset({ untouched = false, defaultValue = false }: ResetOpts = {}) {
    if (defaultValue) {
      this.initValue = this.defaultValue;
    }
    this._value = this.initValue;
    if (untouched) {
      this.markAsUntouched();
    }
  }

  @action("FIELD_SET_DISABLED")
  setDisabled(value: boolean) {
    this.disabled = value;
  }

  @action("FIELD_MARK_AS_TOUCH")
  markAsTouched = () => {
    if (!this._interacted) {
      this._interacted = true;
    }
  };

  @action("FIELD_MARK_AS_UNTOUCHED")
  markAsUntouched = () => {
    if (this._interacted) {
      this._interacted = false;
    }
  };

  @computed
  get value() {
    return this._value;
  }

  @action("SET_FIELD_VALUE")
  setValue = (
    val: Nullable<TValue>,
    { interract = true, isInitValue = false }: SetValueOpts = {}
  ) => {
    if (interract && !this._interacted) {
      this._interacted = true;
    }
    this._value = val;
    if (isInitValue) {
      this.initValue = this.value;
    }
  };

  onInputChange = (evt: any, value: TInputValue) => {
    if (evt && typeof value === "undefined") {
      value = (evt.target as HTMLInputElement).value as any;
    }
    const parsedValue = this.parser ? this.parser(value) : value;
    if (parsedValue !== this._value) {
      this.setValue(parsedValue as TValue, { interract: false });
    }
  };

  @computed
  get inputValue() {
    return this.formater ? this.formater(this._value) : this._value;
  }

  @action("SET_FIELD_VALIDATION")
  setValidation(validation: ValidationObj) {
    this._validation = validation;
  }

  @computed
  get errorMessage() {
    if (!this._interacted || !this._validation) {
      return undefined;
    }
    return this._validation?.message;
  }

  @computed
  get isValid() {
    return this._validation.valid;
  }

  get validation() {
    return this._validation;
  }

  get interacted() {
    return this._interacted;
  }

  @computed
  get pristine() {
    return fastDeepEqual(this.initValue, this.value);
  }

  validate = async () => {
    const validationContext = this.validationContext(this._value, this.label);
    let lastRes;

    for (let i = 0; i < this._isValidFn.length; i++) {
      const isValidFn = this._isValidFn[i];

      let res = isValidFn(validationContext);

      if (isPromise(res)) {
        res = await res;
      }

      if (!res || !(typeof res === "object")) {
        throw new Error("Invalid validator result");
      }
      lastRes = res;
      if (!res.valid || res.stop) {
        break;
      }
    }

    if (lastRes) {
      this.setValidation(lastRes);
    }
  };

  onChange(fn: (value: Nullable<TValue>) => void) {
    this._dispose = reaction(
      () => this.value,
      (value: Nullable<TValue>) => {
        fn(value);
      }
    );
  }

  destroy() {
    if (this._dispose) {
      this._dispose();
    }
  }

  constructor(
    defaultValue: Nullable<TValue>,
    {
      validate,
      debounce = false,
      disabled = false,
      validationContext = defaultValidationContext,
      formater,
      parser,
      label,
    }: FieldOpts<Nullable<TValue>, TInputValue>
  ) {
    this.disabled = disabled;
    this.formater = formater;
    this.parser = parser;
    this.validationContext = validationContext;
    this.defaultValue = defaultValue;
    this.initValue = defaultValue;
    this.setValue(defaultValue, { interract: false });
    if (label) {
      this.label = label;
    }

    if (validate) {
      if (validate instanceof Array) {
        this._isValidFn = validate;
      } else {
        this._isValidFn = [validate];
      }
    }

    if (this._isValidFn.length) {
      this._validation = { valid: false };
      autorun(this.validate, { delay: debounce ? 300 : 0 });
    } else {
      this._validation = { valid: true };
    }
  }
}
