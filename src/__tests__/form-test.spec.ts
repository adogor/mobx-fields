import { Nullable, numberFormater, numberParser } from "../utils";
import { fb, getInputFieldProps, isEmail } from "../index";
import { next, stop, ValidationContext, error } from "../validation";
import { isRequired } from "../validators";

async function sleep() {}

async function waitForAsyncvalidation() {
  await sleep();
  await sleep();
}

describe("Simple field", () => {
  it("Must initialize properly", () => {
    const simpleField = fb.field("initvalue");
    expect(simpleField.value).toEqual("initvalue");
    expect(simpleField.interacted).toBeFalsy();
    expect(simpleField.errorMessage).toBeFalsy();
    expect(simpleField.isValid).toBeTruthy();
    expect(simpleField.validation).toEqual({ valid: true });
    expect(simpleField.pristine).toBeTruthy();

    simpleField.setValue("newvalue");
    expect(simpleField.value).toEqual("newvalue");
    expect(simpleField.interacted).toBeTruthy();
    expect(simpleField.errorMessage).toBeFalsy();
    expect(simpleField.isValid).toBeTruthy();
    expect(simpleField.validation).toEqual({ valid: true });
    expect(simpleField.pristine).toBeFalsy();

    simpleField.reset();
    expect(simpleField.value).toEqual("initvalue");
    expect(simpleField.interacted).toBeTruthy();
    expect(simpleField.pristine).toBeTruthy();

    simpleField.reset({ untouched: true });
    expect(simpleField.value).toEqual("initvalue");
    expect(simpleField.interacted).toBeFalsy();
  });

  it("We can provide validation", async () => {
    const simpleField = fb.field("initvalue", {
      validate: isEmail(),
    });
    expect(simpleField.value).toEqual("initvalue");
    expect(simpleField.interacted).toBeFalsy();
    expect(simpleField.errorMessage).toBeFalsy();
    expect(simpleField.isValid).toBeFalsy();
    expect(simpleField.validation).toEqual({
      valid: false,
      message: { code: "validation.wrong-email", params: {} },
    });
    expect(simpleField.errorMessage).toBeFalsy();

    simpleField.markAsTouched();
    expect(simpleField.interacted).toBeTruthy();
    expect(simpleField.errorMessage).toEqual({
      code: "validation.wrong-email",
      params: {},
    });
    expect(simpleField.isValid).toBeFalsy();

    simpleField.reset();
    expect(simpleField.value).toEqual("initvalue");
    expect(simpleField.interacted).toBeTruthy();
  });

  it("Validation can be async", async () => {
    const simpleField = fb.field<string>("adogor", {
      validate: async (context: ValidationContext<Nullable<string>>) => {
        await sleep(); // simulate async operation
        if (context.value === "adogor") {
          return error("validation.username-not-available", {
            label: context.label,
          });
        } else {
          return next();
        }
      },
    });
    await waitForAsyncvalidation();
    expect(simpleField.value).toEqual("adogor");
    expect(simpleField.interacted).toBeFalsy();
    expect(simpleField.errorMessage).toBeFalsy();
    expect(simpleField.isValid).toBeFalsy();
    expect(simpleField.validation).toEqual({
      valid: false,
      message: { code: "validation.username-not-available", params: {} },
    });
    expect(simpleField.errorMessage).toBeFalsy();

    simpleField.markAsTouched();
    expect(simpleField.interacted).toBeTruthy();

    simpleField.setValue("toto");
    await waitForAsyncvalidation();
    expect(simpleField.isValid).toBeTruthy();
  });

  it("We can provide formaters and parsers", async () => {
    const simpleField = fb.field("initvalue");
    expect(simpleField.inputValue).toEqual("initvalue");
    simpleField.onInputChange(null, "toto");
    expect(simpleField.inputValue).toEqual("toto");

    const simpleField2 = fb.field("initvalue", {
      parser: (value: number) => (value === 1 ? "toto" : "titi"),
      formater: (value: Nullable<string>) => (value === "toto" ? 1 : 2),
    });
    expect(simpleField2.inputValue).toEqual(2);
    expect(simpleField2.value).toEqual("initvalue");
    simpleField2.onInputChange(null, 1);
    expect(simpleField2.inputValue).toEqual(1);
    expect(simpleField2.value).toEqual("toto");
  });

  it("Input fields Props getter", () => {
    const simpleField = fb.field("", {
      validate: [
        (c) => (c.value === "part" ? stop() : next()),
        isRequired("Nom de l'entreprise obligatoire"),
      ],
    });
    const props = getInputFieldProps(simpleField);

    props.onChange(null, "toto");
    expect(simpleField.value).toEqual("toto");
  });

  it("We can set initValue", () => {
    const fieldA = fb.field("value1");
    expect(fieldA.value).toEqual("value1");
    expect(fieldA.defaultValue).toEqual("value1");
    expect(fieldA.initValue).toEqual("value1");

    fieldA.setValue("value2", { isInitValue: true });
    expect(fieldA.value).toEqual("value2");
    expect(fieldA.defaultValue).toEqual("value1");
    expect(fieldA.initValue).toEqual("value2");

    fieldA.setValue("value3");
    expect(fieldA.value).toEqual("value3");
    expect(fieldA.defaultValue).toEqual("value1");
    expect(fieldA.initValue).toEqual("value2");

    fieldA.reset();
    expect(fieldA.value).toEqual("value2");
    expect(fieldA.defaultValue).toEqual("value1");
    expect(fieldA.initValue).toEqual("value2");

    fieldA.reset({ untouched: true, defaultValue: true });
    expect(fieldA.value).toEqual("value1");
    expect(fieldA.defaultValue).toEqual("value1");
    expect(fieldA.initValue).toEqual("value1");
  });

  it("Using onInputChange keep interacted property as false, unlike setValue", () => {
    const simpleField = fb.field("value1");
    expect(simpleField.value).toEqual("value1");
    expect(simpleField.interacted).toBeFalsy();

    simpleField.onInputChange(null, "newValue");
    expect(simpleField.value).toEqual("newValue");
    expect(simpleField.interacted).toBeFalsy();

    simpleField.setValue("NewValue interacted");
    expect(simpleField.value).toEqual("NewValue interacted");
    expect(simpleField.interacted).toBeTruthy();
  });

  it("we can put arrays", () => {
    const simpleField = fb.field([
      { id: "react", label: "react" },
      { id: "react1", label: "react1" },
    ]);
    expect(simpleField.pristine).toBeTruthy();
    simpleField.setValue([
      { id: "react", label: "react" },
      { id: "react2", label: "react2" },
    ]);
    expect(simpleField.pristine).toBeFalsy();
    simpleField.setValue([
      { id: "react", label: "react" },
      { id: "react1", label: "react1" },
    ]);
    expect(simpleField.pristine).toBeTruthy();
  });
});

describe("FieldsArray", () => {
  it("Must initialize properly", async () => {
    const simpleField = fb.field("value1");
    const simpleArray = fb.array([simpleField]);
    expect(simpleArray.value).toEqual(["value1"]);
    expect(simpleArray.fields[0].value).toEqual("value1");

    simpleArray.setValue(["value2"]);
    expect(simpleArray.value).toEqual(["value2"]);
    expect(simpleArray.pristine).toBeFalsy();

    simpleArray.setValue(["value1"]);
    expect(simpleArray.value).toEqual(["value1"]);
    expect(simpleArray.pristine).toBeTruthy();
  });

  it("Can have complex fields types", () => {
    const simpleField = fb.field("textField");
    const objectField = fb.obj({ a: simpleField });
    const simpleArray = fb.array([objectField]);
    expect(simpleArray.fields[0].fields.a.value).toEqual("textField");
    expect(simpleArray.value).toEqual([{ a: "textField" }]);
  });

  it("Can have complex fields types with custom parsers", () => {
    const simpleField = fb.field(10, {
      parser: numberParser,
      formater: numberFormater,
    });
    const objectField = fb.obj({ a: simpleField });
    const simpleArray = fb.array([objectField]);
    expect(simpleArray.fields[0].fields.a.value).toEqual(10);
    expect(simpleArray.fields[0].fields.a.inputValue).toEqual("10");
    expect(simpleArray.value).toEqual([{ a: 10 }]);

    simpleField.onInputChange(null, "20");
    expect(simpleArray.value).toEqual([{ a: 20 }]);

    simpleArray.reset();
    expect(simpleArray.pristine).toBeTruthy();
    expect(simpleArray.interacted).toBeFalsy();

    simpleArray.reset({ untouched: true });
    expect(simpleArray.interacted).toBeFalsy();
  });

  it("we can reset array field", () => {
    const simpleField = fb.field("value1");
    const simpleArray = fb.array([simpleField]);

    expect(simpleArray.value).toEqual(["value1"]);

    simpleArray.fields.push(fb.field("value2"));

    expect(simpleArray.value).toEqual(["value1", "value2"]);

    simpleArray.reset();

    expect(simpleArray.value).toEqual(["value1"]);

    simpleArray.setValue([], { isInitValue: true });

    expect(simpleArray.value).toEqual([]);

    simpleArray.fields.push(fb.field("value3"));

    expect(simpleArray.value).toEqual(["value3"]);

    simpleArray.reset();

    expect(simpleArray.value).toEqual([]);
  });

  it("we can define builder for array", () => {
    const simpleField = fb.field("value1");
    const simpleArray = fb.array([simpleField], {
      builder: (val: string) => fb.field(val),
    });

    expect(simpleArray.value).toEqual(["value1"]);

    simpleArray.setValue(["val1", "val2"]);

    expect(simpleArray.value).toEqual(["val1", "val2"]);

    simpleArray.reset();

    expect(simpleArray.value).toEqual(["value1"]);
    expect(simpleArray.pristine).toBeTruthy();
  });
});

describe("FieldsObject", () => {
  it("Must initialize properly", () => {
    const simpleField = fb.field("textField");
    const simpleObject = fb.obj({ simpleField });
    expect(simpleObject.fields.simpleField.value).toEqual("textField");
    expect(simpleObject.fields["simpleField"].value).toEqual("textField");
    expect(simpleObject.value).toEqual({ simpleField: "textField" });
    expect(simpleObject.value.simpleField).toEqual("textField");

    expect(simpleObject.interacted).toBeFalsy();
    expect(simpleObject.errorMessage).toBeFalsy();
    expect(simpleObject.isValid).toBeTruthy();
    expect(simpleObject.validation).toEqual({ valid: true });

    simpleField.setValue("newvalue");
    expect(simpleField.interacted).toBeTruthy();
    expect(simpleField.errorMessage).toBeFalsy();
    expect(simpleField.isValid).toBeTruthy();
    expect(simpleField.validation).toEqual({ valid: true });

    simpleObject.setValue({ simpleField: "coucou" });
    expect(simpleField.value).toEqual("coucou");
    expect(simpleObject.value).toEqual({ simpleField: "coucou" });

    simpleObject.reset();
    expect(simpleObject.value).toEqual({ simpleField: "textField" });
  });

  it("We can combine object arrays and fields", () => {
    const myForm = fb.obj({
      a: fb.field("a"),
      b: fb.array([fb.field("b1")]),
      c: fb.obj({ c1: fb.field("c1"), c2: fb.field("c2") }),
    });

    expect(myForm.value).toEqual({
      a: "a",
      b: ["b1"],
      c: {
        c1: "c1",
        c2: "c2",
      },
    });

    myForm.fields.a.setValue("aa");
    myForm.fields.b.fields.push(fb.field("b2"));
    myForm.fields.b.fields[0].setValue("b1b1");
    myForm.fields.c.fields.c1.setValue("c1c1");

    expect(myForm.value).toEqual({
      a: "aa",
      b: ["b1b1", "b2"],
      c: {
        c1: "c1c1",
        c2: "c2",
      },
    });

    expect(myForm.value.a).toEqual("aa");
  });

  it("We can set init data on options", () => {
    const myForm = fb.obj(
      {
        a: fb.field("a"),
        b: fb.array([fb.field("b1")]),
        c: fb.obj({ c1: fb.field("c1"), c2: fb.field("c2") }),
      },
      { data: { a: "ia", b: ["ib1"], c: { c1: "ic1", c2: "ic2" } } }
    );

    const expectedInitData = {
      a: "ia",
      b: ["ib1"],
      c: {
        c1: "ic1",
        c2: "ic2",
      },
    };

    expect(myForm.value).toEqual(expectedInitData);
    expect(myForm.initValue).toEqual(expectedInitData);
    expect(myForm.pristine).toBeTruthy();
  });

  it("We can set init data after creation", () => {
    const myForm = fb.obj({
      a: fb.field("a"),
      b: fb.array([fb.field("b1")]),
      c: fb.obj({ c1: fb.field("c1"), c2: fb.field("c2") }),
    });

    const expectedDefaultValue = {
      a: "a",
      b: ["b1"],
      c: {
        c1: "c1",
        c2: "c2",
      },
    };

    expect(myForm.value).toEqual(expectedDefaultValue);
    myForm.reset();
    expect(myForm.value).toEqual(expectedDefaultValue);
    myForm.reset({ untouched: true, defaultValue: true });
    expect(myForm.value).toEqual(expectedDefaultValue);

    const initData = {
      a: "ia",
      b: ["ib1"],
      c: {
        c1: "ic1",
        c2: "ic2",
      },
    };

    myForm.setValue(initData, { isInitValue: true });
    expect(myForm.value).toEqual(initData);
    expect(myForm.defaultValue).toEqual(expectedDefaultValue);
    expect(myForm.initValue).toEqual(initData);
    expect(myForm.pristine).toBeTruthy();

    myForm.fields.c.fields.c1.setValue("mic1");

    expect(myForm.value).not.toEqual(initData);

    myForm.reset();
    expect(myForm.value).toEqual(initData);

    myForm.reset({ untouched: false, defaultValue: true });
    expect(myForm.value).toEqual(expectedDefaultValue);
  });

  it("Cross fields validation", async () => {
    const stepStatus = (() => {
      const status = fb.field("pro", { validate: [isRequired("Obligatoire")] });
      return fb.obj({
        status,
        isCompany: fb.field(false),
        companyName: fb.field("", {
          validate: [
            (c) => (status.value === "part" ? stop() : next()),
            isRequired("Nom de l'entreprise obligatoire"),
          ],
        }),
      });
    })();
    expect(stepStatus.value.status).toEqual("pro");
    expect(stepStatus.value.companyName).toEqual("");
    expect(stepStatus.isValid).toBeFalsy();

    stepStatus.fields.status.setValue("part");
    expect(stepStatus.value.status).toEqual("part");
    expect(stepStatus.value.companyName).toEqual("");
    expect(stepStatus.isValid).toBeTruthy();
  });
});
