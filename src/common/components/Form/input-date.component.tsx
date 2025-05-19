import React, { useEffect, useState } from "react";
import { EDirection } from "../../constants/input.enum";
import { LabelComponent } from "./label.component";
import { Control, useController } from "react-hook-form";
import { Calendar } from "primereact/calendar";
import { IoCalendarOutline } from "react-icons/io5";

interface IDateProps {
  idInput: string;
  control: Control<any>;
  dateFormat: string;
  className?: string;
  placeholder?: string;
  label?: string | React.JSX.Element;
  classNameLabel?: string;
  direction?: EDirection;
  children?: React.JSX.Element | React.JSX.Element[];
  errors?: any;
  disabled?: boolean;
  disabledDays?: number[];
  disabledDates?: Date[];
  maxDate?: Date;
  minDate?: Date;
  fieldArray?: boolean;
  optionsRegister?: {};
  shouldUnregister?: boolean;
  view?: "date" | "month" | "year";
  onChange?: (e: any) => void;
}

function LabelElement({ label, idInput, classNameLabel }): React.JSX.Element {
  if (!label) return <></>;
  return (
    <LabelComponent
      htmlFor={idInput}
      className={classNameLabel}
      value={label}
    />
  );
}

export function DatePickerComponent({
  idInput,
  className = "dataPicker-basic",
  placeholder = "DD/MM/AAAA",
  label,
  classNameLabel = "text-main",
  direction = EDirection.column,
  children,
  errors = {},
  maxDate,
  minDate,
  fieldArray,
  control,
  dateFormat,
  disabled,
  disabledDates,
  disabledDays,
  optionsRegister,
  shouldUnregister,
  view = "date",
  onChange,
}: IDateProps): React.JSX.Element {
  const {
    field,
    fieldState: { error, invalid },
    formState: {},
  } = useController({
    name: idInput,
    control,
    shouldUnregister,
    rules: optionsRegister,
  });

  const [show, setShow] = useState<boolean>(false);
  const [date, setDate] = useState(null); // hacer que cuando sea edit coloque el formato que no le da ansiedad

  useEffect(() => {
    if (field.value) setDate(new Date(field.value));
  }, [field.value]);

  return (
    <div
      className={
        error?.message ? `${direction} container-icon_error` : direction
      }
    >
      <LabelElement
        label={label}
        idInput={idInput}
        classNameLabel={classNameLabel}
      />
      <div>
        <Calendar
          id={field.name}
          name={field.name}
          inputId={field.name}
          mask="99/99/9999"
          dateFormat={"dd/mm/yy"}
          placeholder={placeholder}
          className={`${className} ${error?.message ? "p-invalid" : ""}`}
          showButtonBar
          value={date} //field.value && new Date(field.value)}
          showIcon
          onHide={() => {
            setShow(false);
            if (date) field.onChange(new Date(date).toLocaleDateString('en-ZA'));
          }}
          icon={
            <span
              onClick={(e) => {
                e.preventDefault();
                setShow(true);
              }}
            >
              <IoCalendarOutline />
            </span>
          }
          onChange={(e) => {
            setDate(e.value);
            if (onChange) onChange(e);
          }}
          onBlur={(e) => {
            field.onBlur();
            if (date) field.onChange(new Date(date).toLocaleDateString('en-ZA'));
          }}
          inputStyle={{ borderRight: "none" }}
          panelStyle={show ? {} : { display: "none" }}
          minDate={minDate}
          maxDate={maxDate}
          disabledDates={disabledDates}
          disabledDays={disabledDays}
          disabled={disabled}
          view={view}
        />

        {error?.message && <span className="icon-error"></span>}
      </div>
      {error?.message && (
        <p className="error-message bold not-margin-padding">
          {error?.message}
        </p>
      )}
      {children}
    </div>
  );
}
