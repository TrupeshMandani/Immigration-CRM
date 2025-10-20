const ProfileFieldDisplay = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  const formatValue = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === "object" && !Array.isArray(val)) {
      return JSON.stringify(val, null, 2);
    }
    if (Array.isArray(val)) {
      return val.map((item, index) => (
        <div key={index} className="ml-4 mt-1">
          • {typeof item === "object" ? JSON.stringify(item, null, 2) : item}
        </div>
      ));
    }
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return val.toString();
  };

  const formatLabel = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, " $1") // Add space before capitals
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  return (
    <div className="py-4 border-b border-gray-200 last:border-0">
      <dt className="text-sm font-bold text-gray-900 mb-2">
        {formatLabel(label)}
      </dt>
      <dd className="text-sm text-gray-700 whitespace-pre-wrap">
        {formatValue(value)}
      </dd>
    </div>
  );
};

export default ProfileFieldDisplay;
