import "./styles.css";
import React, {
  FC,
  memo,
  useRef,
  useState,
  Dispatch,
  useEffect,
  DragEvent,
  ChangeEvent,
  SetStateAction,
  useContext,
} from "react";
import { MassiveFileUploaderPage } from "./page";
import { AppContext } from "../../../common/contexts/app.context";

type MassiveFileUploaderProps = {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  handleUpload: (files: File[]) => void;
  messageFileIndex: boolean;
  setHideModalIndex: Dispatch<SetStateAction<boolean>>;
  setMessageFileIndex: Dispatch<SetStateAction<boolean>>;
  prevFiles?: any[];
  removePrevFiles?: any
  useDescriptionField?: boolean;
  descriptionFieldRequired?: boolean;
  onChangeDescription?: any
  defaultDescriptionValue?: string;
  clearOnAccept?: boolean;
  onlyLecture?: boolean;
};

const MassiveFileUploader: FC<MassiveFileUploaderProps> = ({
  files,
  setFiles,
  handleUpload,
  messageFileIndex,
  setHideModalIndex,
  setMessageFileIndex,
  removePrevFiles,
  prevFiles,
  useDescriptionField,
  descriptionFieldRequired,
  onChangeDescription,
  defaultDescriptionValue,
  clearOnAccept = false,
  onlyLecture = false,
}) => {
  console.log('prevFiles', prevFiles)
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAcceptModal, setShowAcceptModal] =
    useState<boolean>(false);
    const { setMessage } = useContext(AppContext);

  const handleFileSelect = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(target.files as FileList);

    // Agregar los archivos seleccionados al estado
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileRemove = (file: File) => {
    setMessage({
			title: "Eliminar archivo",
			description: "¿Está segur@ de eliminar el archivo?",
			show: true,
			background: true,
			OkTitle: "Aceptar",
			cancelTitle: "Cancelar",
			style: "z-index-3300",
			onOk: () => {
				const filteredFiles = files.filter(({ name }) => name !== file.name);
        setFiles(filteredFiles);
        clearInputFileRef();
				setMessage({});
			},
			onCancel: () => {
				setMessage({});
			},
		});
    
  };

  const handleRemoveAll = () => {
    setMessage({
			title: "Eliminar archivos",
			description: "¿Está segur@ de eliminar los archivos?",
			show: true,
			background: true,
			OkTitle: "Aceptar",
			cancelTitle: "Cancelar",
			style: "z-index-3300",
			onOk: () => {
				setFiles([]);
        clearInputFileRef();
				setMessage({});
			},
			onCancel: () => {
				setMessage({});
			},
		});
    
  };

  const clearInputFileRef = () => {
    if (inputRef?.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    const inputField = inputRef.current;
    if (inputField) {
      inputField.click();
    }
  };

  const handleAccepted = async () => {
    try {
      
      await handleUpload(files);
      if (messageFileIndex) {
        setShowAcceptModal(true);
      }

      if (clearOnAccept) {
        setFiles([]);
        clearInputFileRef();
      }
    } catch (error) {
      console.error("Error al subir archivos:", error);
    }
  };

  return (
    <MassiveFileUploaderPage
      files={files}
      inputRef={inputRef}
      handleClick={handleClick}
      handleUpload={handleUpload}
      handleAccepted={handleAccepted}
      showAcceptModal={showAcceptModal}
      handleRemoveAll={handleRemoveAll}
      handleFileSelect={handleFileSelect}
      handleFileRemove={handleFileRemove}
      numOfFilesUploaded={files.length}
      setShowAcceptModal={setShowAcceptModal}
      prevFiles={prevFiles|| []}
      removePrevFiles={removePrevFiles || function () {}}
      useDescriptionField={useDescriptionField}
      descriptionFieldRequired={ descriptionFieldRequired}
      onChangeDescription={onChangeDescription}
      defaultDescriptionValue={defaultDescriptionValue}
      setFiles={setFiles}
      onlyLecture={onlyLecture}
    />
  );
};
export default memo(MassiveFileUploader);
