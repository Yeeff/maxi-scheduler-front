import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useForm, Controller } from "react-hook-form";
import { InputComponent } from "../../../common/components/Form";
import { ICompany } from "../../../common/interfaces/company.interfaces";

interface ICreateCompanyModalProps {
  visible: boolean;
  onHide: () => void;
  onCreate: (company: { name: string; nit: string }) => void;
  isLoading?: boolean;
}

export const CreateCompanyModal = ({
  visible,
  onHide,
  onCreate,
  isLoading = false,
}: ICreateCompanyModalProps): React.JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<{ name: string; nit: string }>({
    defaultValues: {
      name: "",
      nit: "",
    },
    mode: "all",
  });

  const onSubmit = (data: { name: string; nit: string }) => {
    onCreate(data);
  };

  const handleHide = () => {
    reset();
    onHide();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        disabled={isLoading}
      />
      <Button
        label="Crear Empresa"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={handleSubmit(onSubmit)}
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      header="Crear Nueva Empresa"
      visible={visible}
      onHide={handleHide}
      footer={footer}
      style={{ width: "500px" }}
      closable={!isLoading}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="name"
            rules={{
              required: "El nombre de la empresa es obligatorio",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            }}
            render={({ field }) => (
              <InputComponent
                idInput={field.name}
                errors={errors}
                onChange={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                label={
                  <>
                    Nombre de la empresa <span>*</span>
                  </>
                }
                className="input-basic medium"
                classNameLabel="text-black big bold"
                typeInput=""
                placeholder="Ingrese el nombre de la empresa"
              />
            )}
          />

          <Controller
            control={control}
            name="nit"
            rules={{
              required: "El NIT es obligatorio",
              pattern: {
                value: /^[0-9\-]+$/,
                message: "El NIT debe contener solo números y guiones",
              },
              minLength: {
                value: 5,
                message: "El NIT debe tener al menos 5 caracteres",
              },
            }}
            render={({ field }) => (
              <InputComponent
                idInput={field.name}
                errors={errors}
                onChange={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                label={
                  <>
                    NIT <span>*</span>
                  </>
                }
                className="input-basic medium"
                classNameLabel="text-black big bold"
                typeInput=""
                placeholder="Ingrese el NIT de la empresa"
              />
            )}
          />
        </form>
      </div>
    </Dialog>
  );
};