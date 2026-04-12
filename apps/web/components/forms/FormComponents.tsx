/**
 * Form Components Library
 * Reusable form inputs with validation and styling
 */

import React from "react";
import { AlertCircle } from "lucide-react";

// Input Field Component
export function TextField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3 text-gray-400">{Icon}</div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${Icon ? "pl-10" : "px-4"} py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />
      </div>
      {error && (
        <div className="mt-1 flex gap-2 items-center">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Select Field Component
export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  required = false,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 flex gap-2 items-center">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Textarea Component
export function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
}: {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition resize-none ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      />
      {error && (
        <div className="mt-1 flex gap-2 items-center">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Number Field Component
export function NumberField({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
}: {
  label?: string;
  placeholder?: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      />
      {error && (
        <div className="mt-1 flex gap-2 items-center">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Checkbox Field Component
export function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// Radio Group Component
export function RadioGroup({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Date Field Component
export function DateField({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
}: {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500"
        }`}
      />
      {error && (
        <div className="mt-1 flex gap-2 items-center">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// Form Container Component
export function FormContainer({
  onSubmit,
  children,
  className = "",
}: {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

// Form Section Component
export function FormSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
