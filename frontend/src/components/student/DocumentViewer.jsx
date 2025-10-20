import { useEffect } from "react";

const DocumentViewer = ({ document: doc, onClose }) => {
  const isPDF = doc?.mimeType?.includes("pdf");
  const isImage = doc?.mimeType?.includes("image");
  const hasValidLink = doc?.webViewLink && doc.webViewLink !== "#";

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDownload = () => {
    if (hasValidLink) {
      window.open(doc.webViewLink, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {doc.mimeType || "Unknown type"} •{" "}
              {doc.uploadedAt
                ? new Date(doc.uploadedAt).toLocaleDateString()
                : "Upload date unknown"}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {hasValidLink ? (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Open in Drive</span>
              </button>
            ) : (
              <div className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Preview Pending</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Close (ESC)"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {!hasValidLink ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <svg
                  className="w-16 h-16 text-blue-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Document Stored Successfully
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Your document has been uploaded and processed by AI. The
                  preview feature will be available once Google Drive is
                  configured by your administrator.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">
                    Document Information:
                  </h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>Name:</strong> {doc.name}
                    </p>
                    <p>
                      <strong>Type:</strong> {doc.mimeType || "Unknown"}
                    </p>
                    <p>
                      <strong>Uploaded:</strong>{" "}
                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Contact your administrator to enable Google Drive integration
                  for document previews.
                </p>
              </div>
            </div>
          ) : isPDF ? (
            <iframe
              src={`${doc.webViewLink}/preview`}
              className="w-full h-full min-h-[600px]"
              title={doc.name}
            />
          ) : isImage ? (
            <div className="flex items-center justify-center p-8 h-full">
              <img
                src={doc.webViewLink}
                alt={doc.name}
                className="max-w-full max-h-full object-contain rounded shadow-lg"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Document Available
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  This file type cannot be previewed in the browser. Click the
                  button below to open it in Google Drive.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Open in Google Drive
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
