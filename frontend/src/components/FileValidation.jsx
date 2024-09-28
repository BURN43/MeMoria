import React, { useState } from 'react';

const FileValidation = ({ file, handleFileUpload, maxImageSizeMB = 15, maxVideoSizeMB = 50 }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/avi', 'video/quicktime'
  ];

  const validateFile = (file) => {
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      setErrorMessage('Unsupported file type. Please upload a valid image or video.');
      return false;
    }

    // Check file size
    const maxFileSizeBytes = fileType === 'image' ? maxImageSizeMB * 1024 * 1024 : maxVideoSizeMB * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      const maxSize = fileType === 'image' ? maxImageSizeMB : maxVideoSizeMB;
      setErrorMessage(`File size too large. Max allowed size for ${fileType}s is ${maxSize} MB.`);
      return false;
    }

    // Clear error if valid
    setErrorMessage('');
    return true;
  };

  React.useEffect(() => {
    if (file && validateFile(file)) {
      handleFileUpload(file);
    }
  }, [file, handleFileUpload]);

  return (
    <>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </>
  );
};

export default FileValidation;
