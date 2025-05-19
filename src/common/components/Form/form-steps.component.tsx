import { useContext } from "react";
import { AppContext } from "../../contexts/app.context";
import { ButtonComponent } from "./button.component";
import {
  FieldValues,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { FormStebs } from "../../interfaces/tabs-menu.interface";
import { NavigateFunction, NavigateOptions, To } from "react-router-dom";

interface IFormStepsProp {
  titleForm: string;
  stebs: FormStebs[];
  classFormSteb?: string;
  handleSubmit: UseFormHandleSubmit<FieldValues, undefined>;
  validForm: boolean;
  handleNextStep: () => Promise<void>;
  handleBackStep: () => Promise<void>;
  stepsAmount: number;
  register: UseFormRegister<any>;
  actionSubmit: any;
  action: string;
  watch: any;
  navigate: NavigateFunction;
  control: any;
}

const FormSteps = ({
  titleForm,
  stebs,
  classFormSteb,
  handleSubmit,
  validForm,
  handleNextStep,
  handleBackStep,
  stepsAmount,
  actionSubmit,
  register,
  action,
  watch,
  navigate,
}: // control,
// watch,
IFormStepsProp) => {
  const { step } = useContext(AppContext);

  const onSubmit = handleSubmit(async (values) => {
    await actionSubmit(values);
  });

  return (
    <form
      className={`form-steps ${classFormSteb}`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="title-area">
        <div className="text-black extra-large bold">{titleForm}</div>
      </div>
      <div className="stebs-selection">
        {stebs.map((infoSteb: FormStebs) => {
          return (
            <div key={infoSteb.position}>
              <div
                className={`steb-option ${
                  infoSteb.position === step ? "active" : ""
                }`}
              >
                {infoSteb.titleSteb}
              </div>
            </div>
          );
        })}
      </div>
      <div>
        {stebs.map((infoStep: FormStebs) => {
          if (infoStep.position === step) {
            return (
              <div
                className={infoStep.classContainerStep}
                key={infoStep.position}
                {...register(`step-$${step}`, {
                  shouldUnregister: true,
                })}
              >
                {step === infoStep.position && infoStep.contentStep}

                <div className="container-actions_formTabs">
                  {step == 0 && action === "new" ? (
                    <></>
                  ) : (
                    <ButtonComponent
                      value={
                        step == 0 && action != "new" ? "Regresar" : "Anterior"
                      }
                      className={`${"button-save big"}`}
                      action={() => {
                        if (step == 0) {
                          navigate("/");
                        } else {
                          handleBackStep();
                        }
                      }}
                      type="button"
                    />
                  )}

                  {action === "view" && step === stepsAmount ? (
                    <></>
                  ) : (
                    <ButtonComponent
                      value={step === stepsAmount ? "Guardar" : "Siguiente"}
                      className={`${
                        validForm
                          ? "button-save big"
                          : "button-save  invalid big"
                      } ${
                        step === stepsAmount && action === "view"
                          ? "disabled"
                          : ""
                      }`}
                      type={step === stepsAmount ? "submit" : "button"}
                      action={handleNextStep}
                    />
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* <DevTool control={control} /> */}

      {/* <p>{validForm ? "Valid" : "Invalid"}</p>
      <p>{JSON.stringify(watch())}</p> */}
    </form>
  );
};

export default FormSteps;
