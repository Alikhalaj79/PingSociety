"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  name: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  required?: boolean;
  validationMessage?: string;
}

export default function Select({
  name,
  options,
  placeholder = "- انتخاب کنید -",
  defaultValue = "",
  className,
  required = false,
  validationMessage = "لطفاً این فیلد را پر کنید",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!listRef.current && !buttonRef.current) return;
      if (
        listRef.current?.contains(e.target as Node) ||
        buttonRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current && required) {
      const input = inputRef.current;
      const handleInvalid = (e: Event) => {
        e.preventDefault();
        input.setCustomValidity(validationMessage);
      };
      const handleInput = () => {
        input.setCustomValidity("");
      };
      input.addEventListener("invalid", handleInvalid);
      input.addEventListener("input", handleInput);
      return () => {
        input.removeEventListener("invalid", handleInvalid);
        input.removeEventListener("input", handleInput);
      };
    }
  }, [required, validationMessage]);

  useEffect(() => {
    if (inputRef.current && value) {
      inputRef.current.setCustomValidity("");
    }
  }, [value]);

  return (
    <div className={`relative ${className || ""}`} dir="rtl">
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        value={value}
        required={required}
        title={validationMessage}
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full pr-4 pl-10 py-3 bg-white/10 border border-white/30 hover:border-[#F84920]/60 rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:ring-offset-2 focus:ring-offset-[#0C0C22] transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#F84920]/80">
          ▾
        </span>
        <span
          className={`block truncate ${
            selected ? "text-white" : "text-white/60"
          }`}
        >
          {selected ? selected.label : placeholder}
        </span>
      </button>

      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-[#0C0C22] text-white shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setValue(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-right px-4 py-2.5 text-sm transition flex items-center justify-between hover:bg-white/10 ${
                  value === opt.value
                    ? "bg-white/10 text-[#F84920]"
                    : "text-white"
                }`}
                role="option"
                aria-selected={value === opt.value}
              >
                <span>{opt.label}</span>
                {value === opt.value && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}