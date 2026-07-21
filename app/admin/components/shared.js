"use client";

import { ApiError } from "@/lib/api";
import { formatBackendDate, formatBackendDateTime } from "@/lib/formatDate";

export function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-tab${active ? " active" : ""}`}
    >
      {label}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  className = "",
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  rows = 4,
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="form-textarea"
      />
    </div>
  );
}

export function FileInput({
  label,
  onChange,
  className = "",
  accept = "image/*",
  required = false,
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onChange(e.target.files[0] || null)}
        className="form-input"
      />
    </div>
  );
}

export function fmtDate(value) {
  return formatBackendDate(value);
}

export function fmtDateTime(value) {
  return formatBackendDateTime(value);
}

export function handleErr(err, setError) {
  if (err instanceof ApiError) {
    setError(err.data?.message || err.message);
  } else {
    setError("Something went wrong");
  }
}
