import {useState} from "react";

export const useGetBucketFiles = () => {
  const [loadingDownload, setLoadingDownload] = useState(false);

  const getFileByRecordId = async ({
    canSign,
    recordId,
    onSignature,
  }: {
    canSign: boolean;
    recordId: string;
    onSignature?: (pdfFile: File) => void
  }) => {
    
   
      
  }
  


  const getFileByPath = async ({ pathFile }: { pathFile: string }) => {

  };

  return { loadingDownload, getFileByRecordId, getFileByPath };
}


