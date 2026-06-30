"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  formatAirportLabel,
  formatAirportShort,
  getAirportByCode,
  searchAirports,
  type Airport,
} from "@/lib/airports";

interface AirportInputProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export function AirportInput({ label, value, onChange, placeholder = "YYC" }: AirportInputProps) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const selected = getAirportByCode(value);
  const results = open ? searchAirports(text) : [];

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(airport: Airport) {
    onChange(airport.code);
    setText(airport.code);
    setOpen(false);
  }

  function handleChange(raw: string) {
    const upper = raw.toUpperCase();
    setText(upper);
    setOpen(true);
    setHighlight(0);

    const exact = getAirportByCode(upper);
    if (exact) {
      onChange(exact.code);
      return;
    }

    if (upper.length <= 3) {
      onChange(upper);
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      const exact = getAirportByCode(text);
      if (exact) {
        onChange(exact.code);
        setText(exact.code);
      }
      setOpen(false);
    }, 150);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) {
      if (e.key === "ArrowDown" && text) setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && results[highlight]) {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />
      </label>

      {selected && !open && (
        <p className="mt-1.5 text-xs text-slate-400">
          {formatAirportLabel(selected)}
        </p>
      )}

      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl"
        >
          {results.map((airport, i) => (
            <li key={airport.code} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(airport)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex w-full flex-col px-4 py-2.5 text-left transition ${
                  i === highlight ? "bg-sky-500/15" : "hover:bg-slate-800"
                }`}
              >
                <span className="text-sm font-medium text-white">
                  <span className="text-sky-400">{airport.code}</span>
                  {" — "}
                  {airport.name}
                </span>
                <span className="text-xs text-slate-500">{formatAirportShort(airport)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && text.length > 0 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-500 shadow-xl">
          No airports found for &ldquo;{text}&rdquo;
        </div>
      )}
    </div>
  );
}
