import React, { useEffect, useRef, useState } from "react"

import { Project } from "../types"

import { MONTH_NAMES, Period, PeriodKind } from "../period"

// 1. СЕГМЕНТИРОВАННЫЙ КОНТРОЛ (Segmented Control)

interface SegmentOption<T extends string> {
  value: T

  label: string

  badge?: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]

  value: T

  onChange: (val: T) => void

  fullWidth?: boolean
}

export function SegmentedControl<T extends string>({
  options,

  value,

  onChange,

  fullWidth = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`segmented-control${
        fullWidth ? " segmented-control--full" : ""
      }`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value

        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`segmented-control__button${
              isActive ? " is-active" : ""
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge && (
              <span
                className={`segmented-control__badge${
                  isActive ? " is-active" : ""
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface PeriodPickerProps {
  value: Period
  onChange: (period: Period) => void
  years: number[]
  allowAll?: boolean
  fullWidth?: boolean
}

export const PeriodPicker: React.FC<PeriodPickerProps> = ({
  value,

  onChange,
  years,
  allowAll = false,
  fullWidth = false,
}) => {
  const options: SegmentOption<PeriodKind>[] = []
  if (allowAll) options.push({ value: "ALL", label: "Всё время" })
  options.push(
    { value: "MONTH", label: "Месяц" },
    { value: "QUARTER", label: "Квартал" },
    { value: "YEAR", label: "Год" },
  )

  const selectClass = `${
    fullWidth ? "min-w-0 flex-1" : ""
  } border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium bg-slate-50`

  const updatePeriod = (changes: Partial<Period>) =>
    onChange({ ...value, ...changes })

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <SegmentedControl
        options={options}
        value={value.kind}
        onChange={(kind) => updatePeriod({ kind })}
        fullWidth={fullWidth}
      />

      {value.kind === "MONTH" && (
        <>
          <select
            aria-label="Месяц"
            value={value.month}
            onChange={(event) =>
              updatePeriod({ month: Number(event.target.value) })
            }
            className={selectClass}
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
          <YearSelect
            value={value.year}
            years={years}
            onChange={(year) => updatePeriod({ year })}
          />
        </>
      )}

      {value.kind === "QUARTER" && (
        <>
          <select
            aria-label="Квартал"
            value={value.quarter}
            onChange={(event) =>
              updatePeriod({ quarter: Number(event.target.value) })
            }
            className={selectClass}
          >
            <option value={1}>Q1 (Янв–Мар)</option>
            <option value={2}>Q2 (Апр–Июн)</option>
            <option value={3}>Q3 (Июл–Сен)</option>
            <option value={4}>Q4 (Окт–Дек)</option>
          </select>
          <YearSelect
            value={value.year}
            years={years}
            onChange={(year) => updatePeriod({ year })}
          />
        </>
      )}

      {value.kind === "YEAR" && (
        <YearSelect
          value={value.year}
          years={years}
          onChange={(year) => updatePeriod({ year })}
        />
      )}
    </div>
  )
}

interface YearSelectProps {
  value: number

  years: number[]

  onChange: (year: number) => void
}

function YearSelect({ value, years, onChange }: YearSelectProps) {
  return (
    <select
      aria-label="Год"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium bg-slate-50"
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}

// 2. МОДАЛЬНОЕ ОКНО С ЧЕКБОКСАМИ + КНОПКА «ВСЕ ПРОЕКТЫ»

interface ProjectMultiSelectProps {
  projects: Project[]

  selectedIds: string[]

  onChange: (ids: string[]) => void

  compact?: boolean
}

export const ProjectMultiSelect: React.FC<ProjectMultiSelectProps> = ({
  projects,

  selectedIds,

  onChange,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const activeProjects = projects.filter((p) => p.is_active)

  const isAllSelected =
    activeProjects.length > 0 &&
    activeProjects.every((p) => selectedIds.includes(p.id))

  const toggleProject = (id: string) => {
    if (selectedIds.includes(id)) {
      // Не даем снять последнюю галочку, чтобы отчет не был пустым

      if (selectedIds.length > 1) {
        onChange(selectedIds.filter((item) => item !== id))
      }
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectAll = () => {
    onChange(activeProjects.map((p) => p.id))
  }

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        return
      }

      if (event.key !== "Tab") return

      const focusableElements =
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled), input:not(:disabled)",
        )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [isOpen])

  // Текст на кнопке открытия модалки

  const getButtonLabel = () => {
    if (isAllSelected || selectedIds.length === 0) return "Все проекты"

    if (selectedIds.length === 1) {
      const found = projects.find((p) => p.id === selectedIds[0])

      return found ? found.name : "1 проект"
    }

    return `Выбрано проектов: ${selectedIds.length}`
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          compact
            ? "transactions-project-button"
            : "inline-flex items-center justify-between gap-2 bg-white border border-slate-200 hover:border-[#245c9c] rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition"
        }
        aria-label="Фильтр по проектам"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {compact ? (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h5" />
            </svg>
            <span className="transactions-project-button__label">
              {getButtonLabel()}
            </span>
            <svg
              aria-hidden="true"
              className="transactions-project-button__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </>
        ) : (
          <>
            <svg
              aria-hidden="true"
              className="dashboard-project-trigger__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h5" />
            </svg>
            <span className="dashboard-project-trigger__label">
              {getButtonLabel()}
            </span>
            <svg
              aria-hidden="true"
              className="dashboard-project-trigger__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-100 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-filter-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3
                id="project-filter-title"
                className="font-bold text-slate-800 text-base"
              >
                Фильтр по проектам
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg px-2"
                aria-label="Закрыть фильтр по проектам"
              >
                ✕
              </button>
            </div>

            {/* Быстрая кнопка «Все проекты» сверху по требованию аналитика */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <span className="text-xs font-medium text-slate-600">
                Выбрано: {selectedIds.length} из {activeProjects.length}
              </span>
              <button
                type="button"
                onClick={selectAll}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isAllSelected
                    ? "bg-[#245c9c] text-white"
                    : "bg-white text-[#245c9c] border border-[#c9dced] hover:bg-[#edf5fc]"
                }`}
              >
                ✓ Все проекты
              </button>
            </div>

            {/* Список проектов с чекбоксами */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {activeProjects.map((proj) => {
                const checked = selectedIds.includes(proj.id)

                return (
                  <label
                    key={proj.id}
                    className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {proj.name}
                      </p>
                      {proj.description && (
                        <p className="text-xs text-slate-400">
                          {proj.description}
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProject(proj.id)}
                      className="w-5 h-5 rounded accent-[#245c9c] focus:ring-[#245c9c] border-slate-300"
                    />
                  </label>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-[#245c9c] hover:bg-[#1c4a7e] text-white font-semibold py-2.5 rounded-xl text-sm transition"
            >
              Применить фильтр
            </button>
          </div>
        </div>
      )}
    </>
  )
}
