import "./styles.css";
import { AiOutlinePaperClip, AiOutlineUpload } from "react-icons/ai";
import { FaTrash, FaRegImages, FaEye } from "react-icons/fa";

import { Tooltip } from "primereact/tooltip";
import { megasToKilobytes, unixToDateString} from "../../components/utils/helpers";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
//&import styles from "../../../features/summary-card/styles.module.scss";
import {
  FC,
  memo,
  Dispatch,
  ChangeEvent,
  SetStateAction,
  RefObject,
  useEffect,
} from "react";
import { TextAreaComponent } from "../Form/input-text-area.component";
import { useGetBucketFiles } from "../hooks/useGetBucketFiles";
import { BiLoaderCircle } from "react-icons/bi";

type MassiveFileUploaderProps = {
  files: File[];
  inputRef: RefObject<HTMLInputElement>;
  handleClick: () => void;
  handleUpload: (files: File[]) => void;
  handleAccepted: () => void;
  showAcceptModal: boolean;
  handleRemoveAll: () => void;
  handleFileSelect: (ev: ChangeEvent<HTMLInputElement>) => void;
  handleFileRemove: (file: File) => void;
  numOfFilesUploaded: number;
  setShowAcceptModal: Dispatch<SetStateAction<boolean>>;
  prevFiles: any[],
  removePrevFiles: any,
  useDescriptionField?: boolean;
  descriptionFieldRequired?: boolean;
  onChangeDescription?: any,
  defaultDescriptionValue?: string
  setFiles?: any
  onlyLecture?: boolean
};

export const MassiveFileUploaderPage: FC<MassiveFileUploaderProps> = ({
  files,
  inputRef,
  handleClick,
  handleUpload,
  handleAccepted,
  showAcceptModal,
  handleRemoveAll,
  handleFileSelect,
  handleFileRemove,
  numOfFilesUploaded,
  setShowAcceptModal,
  prevFiles,
  removePrevFiles,
  useDescriptionField,
  descriptionFieldRequired,
  onChangeDescription,
  defaultDescriptionValue,
  setFiles,
  onlyLecture,
}) => {
  const { loadingDownload, getFileByPath } = useGetBucketFiles();

  const schema1 = yup.object({
    description: yup.string().required("El campo es obligatorio").max(1000, "El campo referencia solo se permite maximo 1000 dígitos"),
  });

  const schema2 = yup.object({
    description: yup.string().required("El campo es obligatorio").max(1000, "El campo referencia solo se permite maximo 1000 dígitos"),

  });

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<{ description?: string }>({
    mode: "all",
    resolver: yupResolver(descriptionFieldRequired ? schema1 : schema2),
  });

  useEffect(() => {
    setValue('description', defaultDescriptionValue)
  }, [])

  const handleDrop = (event) => {
    if (onlyLecture == false) {
      event.preventDefault();
      const newFiles = event.dataTransfer.files;
      setFiles([...files, ...newFiles])
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <>

      {
        useDescriptionField ? (
          <div>
            <div style={{ display: "flex", flexDirection: "column", margin: "1rem", }} >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextAreaComponent
                    id="description"
                    idInput="description"
                    label="Descripcion"
                    classNameLabel={`text--black ${descriptionFieldRequired ? 'text-required' : ''} `}
                    register={register}
                    errors={errors}
                    rows={5}
                    value={`${field.value}`}
                    //characters={1000}
                    placeholder="Escribe aquí"
                    onChange={(e) => {
                      field.onChange(e);
                      if (onChangeDescription) onChangeDescription(e)
                    }}
                    disabled={onlyLecture}
                  />
                )}
              />
            </div>
          </div>
        ) : null
      }

      <div className="card-table file-container">

        <Tooltip target=".custom-choose-btn" content="Adjuntar" position="bottom" />
        <Tooltip target=".custom-upload-btn" content="Subir" position="bottom" />
        <Tooltip target=".custom-cancel-btn" content="Eliminar" position="bottom" />
        <div className="files">
          <div className="headerMassive">
            {
              onlyLecture ? null : (
                <span className="custom-choose-btn" onClick={handleClick}>
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="*"
                    ref={inputRef}
                    onChange={handleFileSelect}
                    className="input-field file-input"
                    onClick={() => setShowAcceptModal(false)}
                  />
                  <span className="clip-ico">{<AiOutlinePaperClip style={{ color: '#674bd8ff', fontSize:"20px" }} />}</span>
                </span>
              )
            }
            {
              onlyLecture ? null : (
                <>
                  <button
                    disabled={onlyLecture || files.length === 0 || (descriptionFieldRequired && watch('description') === '')}
                    onClick={() => {
                      handleAccepted()
                      setValue('description', '')
                    }}
                    className={`custom-upload-btn upload-button`}
                  >
                    {files.length === 0 || (descriptionFieldRequired && watch('description') === '') ? <AiOutlineUpload style={{ color: '#6cd84bff', fontSize:"20px" }}/>  : AiOutlineUpload}
                  </button>

                  <button
                    onClick={handleRemoveAll}
                    disabled={onlyLecture || files.length === 0 || (descriptionFieldRequired && watch('description') === '')}
                    className="remove-all-button custom-cancel-btn"
                  >
                    {files.length === 0 || (descriptionFieldRequired && watch('description') === '') ? <FaTrash style={{ color: '#d71b1bff', pointerEvents: 'none' }} />
                      : FaTrash}
                  </button>
                </>
              )
            }

          </div>
          <div
            onDrop={handleDrop}
            className="file-uploader"
            onDragOver={handleDragOver}
          >
            {(numOfFilesUploaded > 0 || prevFiles.length > 0) && (
              <div className="itemFile">
                <div className="flex align-items-center flex-wrap">
                  <ul className="file-list">
                    {files.filter((file, index) => files.findIndex((f) => f.name === file.name) === index).map((file, index) => (
                      <li key={index} className="file-item">
                        <div className="flex align-items-center file-name">
                          <span onClick={() => {
                            const fileURL = URL.createObjectURL(file);
                            window.open(fileURL);
                          }} className="name-file-date" style={{ color: "#052c56", cursor: "pointer" }}>
                            {file.name}
                            <small>
                              {unixToDateString(file.lastModified, "L")}
                            </small>
                          </span>
                        </div>
                        <span className="file-tag">
                          {megasToKilobytes(file.size)} KB
                        </span>
                        <div style={{ display: 'flex' }}>
                          <div style={{ paddingRight: 20 }}>
                            <button
                              type="button"
                              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                              onClick={() => {
                                const fileURL = URL.createObjectURL(file);
                                window.open(fileURL);
                              }}
                            >
                              {FaEye}
                            </button>
                          </div>
                          <div style={{ paddingRight: 20 }}>
                            <button
                              type="button"
                              className="remove-button p-button-outlined p-button-rounded p-button-danger"
                              disabled={onlyLecture}
                              onClick={() => handleFileRemove(file)}
                            >
                              {<FaTrash style={{ color: '#d71b1bff', pointerEvents: 'none' }} />}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}

                    {prevFiles?.length > 0 && prevFiles.map((prevFile, index) => {
                      return (
                        (
                          <li key={index} className="file-item">
                            <div className="flex align-items-center file-name">
                              <span onClick={() => getFileByPath({ pathFile: prevFile.ara_path })} className="name-file-date" style={{ color: "#533893", cursor: "pointer" }}>
                                {prevFile.ara_path}
                              </span>
                            </div>
                            <span className="file-tag">
                              Previo
                            </span>
                            <div style={{ display: 'flex' }}>
                              <div style={{ paddingRight: 20 }}>
                                <button
                                  type="button"
                                  style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                                  onClick={() => getFileByPath({ pathFile: prevFile.ara_path })}
                                >
                                  {loadingDownload ? <BiLoaderCircle style={{ fontSize: 40 }} /> : FaEye}
                                </button>
                              </div>
                              <div style={{ paddingRight: 20 }}>
                                <button
                                  type="button"
                                  disabled={onlyLecture}
                                  className="remove-button p-button-outlined p-button-rounded p-button-danger"
                                  onClick={() => removePrevFiles(prevFile)}
                                >
                                  {FaTrash}
                                </button>

                              </div>
                            </div>
                          </li>
                        )
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}
            {(numOfFilesUploaded === 0 && prevFiles.length === 0) && (
              <div className="flex align-items-center flex-column justify-center">
                <span className="flex-column files-zone">
                  <i>{FaRegImages}</i>
                  <p className="txtDrop">Arrastra y suelta los archivos aquí</p>
                </span>
              </div>
            )}
          </div>


          {showAcceptModal && (
            <div className="modalMessageOk">
              <div className="containerMessageOkIndex">
                <div>
                  <button
                    className="closeMessage"
                    onClick={() => setShowAcceptModal(false)}
                  >
                    X
                  </button>
                </div>
                <span className="titleMessage">Archivo adjunto</span>
                <p className="textMessage">Archivo adjuntado exitosamente</p>
                <button className="buttonMessageOk" onClick={() => setShowAcceptModal(false)}>
                  Aceptar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
};
export default memo(MassiveFileUploaderPage);
