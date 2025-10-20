import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadService } from "../../services/uploadService";
import FilePreview from "../common/FilePreview";
import Button from "../common/Button";
import Loading from "../common/Loading";

const DocumentUpload = ({
  onUploadSuccess,
  onUploadError,
  aiKey,
  maxFiles = 20,
  className = "",
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const newErrors = rejectedFiles.map(({ file, errors }) => ({
          fileName: file.name,
          errors: errors.map((e) => e.message),
        }));
        setErrors((prev) => [...prev, ...newErrors]);
      }

      // Handle accepted files
      if (acceptedFiles.length > 0) {
        const validFiles = acceptedFiles.filter((file) => {
          const validation = uploadService.validateFile(file);
          if (!validation.isValid) {
            setErrors((prev) => [
              ...prev,
              {
                fileName: file.name,
                errors: validation.errors,
              },
            ]);
            return false;
          }
          return true;
        });

        setFiles((prev) => {
          const newFiles = [...prev, ...validFiles];
          if (newFiles.length > maxFiles) {
            setErrors((prev) => [
              ...prev,
              {
                fileName: "Selection",
                errors: [
                  `Maximum ${maxFiles} files allowed. You selected ${acceptedFiles.length} files.`,
                ],
              },
            ]);
            return prev;
          }
          return newFiles;
        });
      }
    },
    [maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileToRemove) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    setErrors((prev) =>
      prev.filter((error) => error.fileName !== fileToRemove.name)
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadService.uploadDocuments(files, aiKey);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Reset form
      setFiles([]);
      setUploadProgress(0);

      // Call success callback
      onUploadSuccess?.(result);
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError?.(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, PNG, JPG (max 10MB each, up to {maxFiles}{" "}
                  files)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file, index) => (
              <FilePreview
                key={`${file.name}-${index}`}
                file={file}
                onRemove={removeFile}
                showSize={true}
                showType={true}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-red-700">Upload Errors</h4>
            <button
              onClick={clearErrors}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div
                key={index}
                className="text-xs text-red-600 bg-red-50 p-2 rounded"
              >
                <strong>{error.fileName}:</strong> {error.errors.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loading size="sm" />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

