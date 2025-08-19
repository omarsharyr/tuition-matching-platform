// src/components/FileUpload.jsx
import React, { useRef, useState, useMemo } from "react";

/**
 * FileUpload
 * ----------
 * Props:
 *  - onFileSelect(files: File[])           -> required callback with accepted files
 *  - accept: string                        -> ".pdf,.jpg,.jpeg,.png" etc (defaults below)
 *  - multiple: boolean                     -> allow multiple files
 *  - maxSizeBytes: number                  -> per-file size limit (default 5MB)
 *  - placeholder: string                   -> dropzone text
 *  - showList: boolean                     -> show selected file list (default true)
 */
export default function FileUpload({
  onFileSelect = () => {},
  accept = ".pdf,.jpg,.jpeg,.png",
  multiple = false,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB
  placeholder = "Click to upload or drag & drop here",
  showList = true,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isOver, setIsOver] = useState(false);

  const acceptList = useMemo(
    () =>
      accept
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean),
    [accept]
  );

  const formatBytes = (b) => {
    if (!b && b !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = b;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i++;
    }
    return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
  };

  const validate = (list) => {
    const accepted = [];
    const rejected = [];

    const matchesAccept = (file) => {
      if (!acceptList.length) return true;
      const name = file.name.toLowerCase();
      const type = (file.type || "").toLowerCase();

      // Support simple extensions and mime wildcards like image/* (if used)
      return acceptList.some((rule) => {
        const r = rule.replace(/\s/g, "");
        if (r.includes("/")) {
          // mime type (e.g., image/* or application/pdf)
          if (r.endsWith("/*")) {
            const prefix = r.split("/")[0];
            return type.startsWith(prefix + "/");
          }
          return type === r;
        }
        // extension like .pdf .png
        return name.endsWith(r);
      });
    };

    for (const f of list) {
      if (!matchesAccept(f)) {
        rejected.push(`${f.name} — unsupported type`);
        continue;
      }
      if (f.size > maxSizeBytes) {
        rejected.push(`${f.name} — too large (>${formatBytes(maxSizeBytes)})`);
        continue;
      }
      accepted.push(f);
    }
    return { accepted, rejected };
  };

  const handleChoose = () => inputRef.current?.click();

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    processFiles(picked);
    // reset input value so the same file can be chosen again if needed
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    processFiles(dropped);
  };

  const processFiles = (picked) => {
    const { accepted, rejected } = validate(picked);
    setErrors(rejected);
    const finalFiles = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    setFiles(finalFiles);
    onFileSelect(finalFiles);
  };

  const prevent = (e) => e.preventDefault();

  const removeAt = (idx) => {
    const copy = files.slice();
    copy.splice(idx, 1);
    setFiles(copy);
    onFileSelect(copy);
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleChoose}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleChoose()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          prevent(e);
          if (!isOver) setIsOver(true);
        }}
        onDragEnter={(e) => {
          prevent(e);
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        style={{
          border: `1px dashed ${isOver ? "#111827" : "#d1d5db"}`,
          borderRadius: 14,
          padding: 16,
          background: isOver ? "#f3f4f6" : "#fafafa",
          cursor: "pointer",
          transition: "border-color .12s ease, background .12s ease",
          outline: "none",
        }}
        aria-label="File upload area"
      >
        <div style={{ fontSize: 14, color: "#111827", fontWeight: 600 }}>
          {placeholder}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
          Allowed: {acceptList.join(", ") || "any"} • Max size: {formatBytes(maxSizeBytes)} per file
          {multiple ? " • Multiple files allowed" : ""}
        </div>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Errors */}
      {!!errors.length && (
        <div
          style={{
            marginTop: 8,
            padding: "10px 12px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 12,
            fontSize: 13,
          }}
        >
          {errors.map((e, i) => (
            <div key={i}>• {e}</div>
          ))}
        </div>
      )}

      {/* Selected list */}
      {showList && !!files.length && (
        <ul style={{ marginTop: 10, fontSize: 13, color: "#374151", paddingLeft: 0, listStyle: "none" }}>
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                padding: "8px 10px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginTop: 6,
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name} <span style={{ color: "#6b7280" }}>• {formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                style={{
                  height: 28,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
