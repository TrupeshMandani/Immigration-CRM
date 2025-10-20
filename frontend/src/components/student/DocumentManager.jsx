import { useState, useEffect } from "react";
import { uploadService } from "../../services/uploadService";
import FilePreview from "../common/FilePreview";
import Button from "../common/Button";
import Loading from "../common/Loading";

const DocumentManager = ({
  aiKey,
  onDocumentClick,
  showCategories = true,
  showSearch = true,
  showFilters = true,
  className = "",
}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("date"); // 'date', 'name', 'size', 'type'

  const categories = uploadService.getDocumentCategories();

  useEffect(() => {
    fetchDocuments();
  }, [aiKey]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getStudentFiles(aiKey);
      console.log("📁 DocumentManager: Received response:", response);
      console.log("📁 DocumentManager: Files array:", response.files);

      // Ensure files array is properly formatted
      const files = response.files || [];
      const formattedFiles = files.map((file, index) => {
        console.log(`📁 File ${index}:`, file);
        return {
          ...file,
          // Ensure required fields exist
          name: file?.name || file?.originalName || `Document ${index + 1}`,
          mimeType: file?.mimeType || file?.type || "application/octet-stream",
          size: file?.size || 0,
          webViewLink: file?.webViewLink || "#",
          uploadedAt:
            file?.uploadedAt || file?.createdAt || new Date().toISOString(),
        };
      });

      setDocuments(formattedFiles);
    } catch (err) {
      setError("Failed to load documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentCategory = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes("passport")) return "passport";
    if (
      name.includes("education") ||
      name.includes("degree") ||
      name.includes("diploma")
    )
      return "education";
    if (
      name.includes("work") ||
      name.includes("experience") ||
      name.includes("employment")
    )
      return "work";
    if (name.includes("health") || name.includes("medical")) return "health";
    if (
      name.includes("financial") ||
      name.includes("bank") ||
      name.includes("income")
    )
      return "financial";
    return "other";
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "gray";
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        !searchTerm ||
        doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory ||
        getDocumentCategory(doc.name || doc.originalName) === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || a.originalName || "").localeCompare(
            b.name || b.originalName || ""
          );
        case "size":
          return (b.size || 0) - (a.size || 0);
        case "type":
          return (a?.mimeType || a?.type || "").localeCompare(
            b?.mimeType || b?.type || ""
          );
        case "date":
        default:
          return (
            new Date(b.uploadedAt || b.createdAt || 0) -
            new Date(a.uploadedAt || a.createdAt || 0)
          );
      }
    });

  const handleDocumentClick = (document) => {
    if (onDocumentClick) {
      onDocumentClick(document);
    } else if (document.webViewLink) {
      window.open(document.webViewLink, "_blank");
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <Loading size="lg" text="Loading documents..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
        <Button onClick={fetchDocuments} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {showSearch && (
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Category Filter */}
        {showCategories && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}

        {/* Sort */}
        {showFilters && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
            <option value="type">Sort by Type</option>
          </select>
        )}

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-sm ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Documents Count */}
      <div className="text-sm text-gray-600">
        {filteredDocuments.length} document
        {filteredDocuments.length !== 1 ? "s" : ""} found
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No documents
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory
              ? "No documents match your search criteria."
              : "Upload your first document to get started."}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-2"
          }
        >
          {filteredDocuments.map((document, index) => {
            const category = getDocumentCategory(
              document.name || document.originalName
            );
            const categoryColor = getCategoryColor(category);

            return (
              <div
                key={index}
                onClick={() => handleDocumentClick(document)}
                className={`
                  ${
                    viewMode === "grid"
                      ? "bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      : "bg-white border rounded p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {uploadService.getFileIcon(
                        document?.mimeType || document?.type
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.name || document.originalName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryColor}-100 text-${categoryColor}-800`}
                      >
                        {categories.find((cat) => cat.id === category)?.name ||
                          "Other"}
                      </span>
                      {document.size && (
                        <span className="text-xs text-gray-500">
                          {uploadService.formatFileSize(document.size)}
                        </span>
                      )}
                    </div>
                    {document.uploadedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded{" "}
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {document.webViewLink && (
                    <div className="flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
