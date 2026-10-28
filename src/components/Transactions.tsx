import React, { useEffect, useRef, useState } from "react"

import { Project, Category, Transaction, TransactionType } from "../types"
import { formatDate } from "../format"
import { currentPeriod, Period, periodContains, yearOptions } from "../period"

import {
  PeriodPicker,
  SegmentedControl,
  ProjectMultiSelect,
} from "./UiControls"

interface TransactionsProps {
  projects: Project[]

  selectedProjectIds: string[]

  onChangeProjects: (ids: string[]) => void

  categories: Category[]

  transactions: Transaction[]

  onAdd: (tx: Omit<Transaction, "id" | "created_at">) => void

  onUpdate: (id: string, tx: Omit<Transaction, "id" | "created_at">) => void

  onDelete: (id: string) => void

  openOnMount?: boolean

  onOpenHandled?: () => void
}

export const Transactions: React.FC<TransactionsProps> = ({
  projects,

  selectedProjectIds,

  onChangeProjects,

  categories,

  transactions,

  onAdd,

  onUpdate,

  onDelete,

  openOnMount = false,

  onOpenHandled,
}) => {
  const now = new Date()

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`

  // Поля формы (Раздел 4 ТЗ: по умолчанию тип = Расход)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const wasFormOpen = useRef(false)

  const [type, setType] = useState<TransactionType>("EXPENSE")

  const [amount, setAmount] = useState<string>("")

  const [dateFact, setDateFact] = useState<string>(today)

  const [datePeriod, setDatePeriod] = useState<string>(today)

  const [isPeriodManuallyChanged, setIsPeriodManuallyChanged] = useState(false)

  const activeProjects = projects.filter((p) => p.is_active)

  const [projectId, setProjectId] = useState<string>(
    activeProjects[0]?.id || "",
  )

  const [categoryId, setCategoryId] = useState<string>("")

  const [comment, setComment] = useState<string>("")

  const [error, setError] = useState<string>("")

  // Фильтры для списка операций (FR-OP-10..12)

  const [filterType, setFilterType] = useState<"ALL" | TransactionType>("ALL")

  const [searchQuery, setSearchQuery] = useState("")

  const [filterPeriod, setFilterPeriod] = useState<Period>(() =>
    currentPeriod("ALL"),
  )
  const availableYears = yearOptions(transactions)
  const typeCounts = {
    ALL: transactions.length,
    INCOME: transactions.filter((transaction) => transaction.type === "INCOME")
      .length,
    EXPENSE: transactions.filter(
      (transaction) => transaction.type === "EXPENSE",
    ).length,
    TAX: transactions.filter((transaction) => transaction.type === "TAX")
      .length,
  }

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!openOnMount) return
    returnFocusRef.current = addButtonRef.current
    setFormOpen(true)
    onOpenHandled?.()
  }, [openOnMount, onOpenHandled])

  // Категории из живого справочника для выбранного типа (FR-OP-06)

  const availableCategories = categories.filter(
    (c) => c.type === type && c.is_active,
  )

  // При смене Даты факта по умолчанию обновляем Дату периода, если пользователь не менял её вручную (FR-OP-04)

  const handleDateFactChange = (val: string) => {
    setDateFact(val)

    if (!isPeriodManuallyChanged && !editingId) {
      setDatePeriod(val)
    }
  }

  const resetForm = () => {
    setEditingId(null)

    setType("EXPENSE")

    setAmount("")

    setDateFact(today)

    setDatePeriod(today)

    setIsPeriodManuallyChanged(false)

    setCategoryId("")

    setComment("")

    setError("")
    setFormOpen(false)
  }

  const startEdit = (tx: Transaction, trigger: HTMLElement) => {
    returnFocusRef.current = trigger
    setEditingId(tx.id)

    setType(tx.type)

    setAmount(String(tx.amount))

    setDateFact(tx.date_fact)

    setDatePeriod(tx.date_period)

    setIsPeriodManuallyChanged(true)

    setProjectId(tx.project_id)

    setCategoryId(tx.category_id)

    setComment(tx.comment || "")

    setError("")
    setFormOpen(true)
  }

  useEffect(() => {
    if (!formOpen) {
      if (wasFormOpen.current) returnFocusRef.current?.focus()
      wasFormOpen.current = false
      return
    }

    wasFormOpen.current = true
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") resetForm()
      if (event.key !== "Tab") return

      const focusableElements = document.querySelectorAll<HTMLElement>(
        ".transaction-drawer button:not(:disabled), .transaction-drawer input:not(:disabled), .transaction-drawer select:not(:disabled)",
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

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
    }
  }, [formOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const numAmount = Number(amount)

    // Валидация на клиенте (FR-OP-02, NFR-OP-02)

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Введите сумму больше нуля (только положительные числа).")

      return
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError("Сумма может содержать максимум 2 знака после запятой.")

      return
    }

    if (!dateFact || !datePeriod) {
      setError("Дата факта и Дата периода обязательны для заполнения.")

      return
    }

    if (!projectId) {
      setError("Выберите активный проект.")

      return
    }

    const finalCategoryId = categoryId || availableCategories[0]?.id

    if (!finalCategoryId) {
      setError("Выберите категорию из справочника.")

      return
    }

    const payload = {
      type,

      amount: numAmount,

      date_fact: dateFact,

      date_period: datePeriod,

      project_id: projectId,

      category_id: finalCategoryId,

      comment: comment.trim().slice(0, 255),
    }

    if (editingId) {
      onUpdate(editingId, payload)
    } else {
      onAdd(payload)
    }

    resetForm()
  }

  // Сортировка списка по date_fact от новых к старым (FR-OP-09)

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru")
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  )
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  )
  const filteredTransactions = transactions

    .filter((tx) => {
      const matchProj = selectedProjectIds.includes(tx.project_id)

      const matchType = filterType === "ALL" || tx.type === filterType

      const matchPeriod = periodContains(filterPeriod, tx.date_fact)

      const matchQuery =
        !normalizedQuery ||
        [
          tx.comment ?? "",
          String(tx.amount),
          tx.amount.toLocaleString("ru-RU"),
          tx.date_fact,
          formatDate(tx.date_fact),
          tx.date_period,
          formatDate(tx.date_period),
          projectNames.get(tx.project_id) ?? "",
          categoryNames.get(tx.category_id) ?? "",
        ].some((value) =>
          value.toLocaleLowerCase("ru").includes(normalizedQuery),
        )

      return matchProj && matchType && matchPeriod && matchQuery
    })

    .sort((a, b) => b.date_fact.localeCompare(a.date_fact))

  return (
    <div className="transactions-page transactions-page--bolt">
      {formOpen && (
        <div
          className="transaction-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transaction-form-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) resetForm()
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="transaction-drawer surface-card"
          >
            <div className="transaction-drawer__heading">
              <div>
                <p className="transactions-kicker">
                  {editingId ? "РЕДАКТИРОВАНИЕ" : "НОВАЯ ЗАПИСЬ"}
                </p>
                <h2 id="transaction-form-title">
                  {editingId ? "Редактировать операцию" : "Новая операция"}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                className="transaction-drawer__close"
                aria-label="Закрыть форму операции"
                onClick={resetForm}
              >
                ×
              </button>
            </div>
            <div className="transaction-drawer__body">
              {/* FR-OP-01: Сегментированный контрол для типа (Доход / Расход / Налог) */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Тип операции *
                </label>
                <SegmentedControl
                  fullWidth
                  options={[
                    { value: "EXPENSE", label: "− Расход" },

                    { value: "INCOME", label: "+ Доход" },

                    { value: "TAX", label: "🏛 Налог" },
                  ]}
                  value={type}
                  onChange={(val) => {
                    setType(val)

                    setCategoryId("")
                  }}
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* FR-OP-02: Сумма в рублях */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Сумма (только рубли, ₽) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Например: 45000"
                    className="w-full border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#245c9c]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    ₽
                  </span>
                </div>
              </div>

              {/* ДВЕ ДАТЫ: Дата факта и Дата периода (FR-OP-03, FR-OP-04) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Дата факта (<code className="text-[11px]">date_fact</code>)
                    *
                  </label>
                  <input
                    type="date"
                    value={dateFact}
                    onChange={(e) => handleDateFactChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1">
                    День движения денег (Cash Flow)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#245c9c] mb-1">
                    Дата периода (
                    <code className="text-[11px]">date_period</code>) *
                  </label>
                  <input
                    type="date"
                    value={datePeriod}
                    onChange={(e) => {
                      setDatePeriod(e.target.value)

                      setIsPeriodManuallyChanged(true)
                    }}
                    className="w-full border border-[#c9dced] rounded-lg px-2.5 py-1.5 text-xs bg-white"
                  />
                  <span className="block text-[10px] text-[#245c9c] mt-1">
                    К какому месяцу относится (P&L)
                  </span>
                </div>
              </div>

              {/* FR-OP-05: Проект (только активные) */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Проект *
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FR-OP-06: Категория (зависит от выбранного типа) */}
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-medium">
                  Категория (
                  {type === "INCOME"
                    ? "Доходы"
                    : type === "EXPENSE"
                      ? "Расходы"
                      : "Налоги"}
                  ) *
                </label>
                <select
                  value={categoryId || availableCategories[0]?.id || ""}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* FR-OP-07: Комментарий до 255 символов */}
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Комментарий</span>
                  <span>{comment.length}/255</span>
                </div>
                <input
                  type="text"
                  maxLength={255}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Например: аренда за ноябрь"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#245c9c] hover:bg-[#1c4a7e] text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-xs"
              >
                {editingId ? "Сохранить изменения" : "Сохранить операцию"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="transactions-card transactions-card--bolt">
        <div className="transactions-filters transactions-filters--bolt">
          <label className="transactions-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Поиск по операциям..."
              aria-label="Поиск операций"
            />
          </label>
          <ProjectMultiSelect
            projects={projects}
            selectedIds={selectedProjectIds}
            onChange={onChangeProjects}
            compact
          />
          <details className="transactions-period-picker">
            <summary
              aria-label={`Период операций: ${
                filterPeriod.kind === "ALL"
                  ? "всё время"
                  : filterPeriod.kind === "MONTH"
                    ? "месяц"
                    : filterPeriod.kind === "QUARTER"
                      ? "квартал"
                      : "год"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="16" rx="3" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              <span>Период кабинета</span>
              <svg
                aria-hidden="true"
                className="transactions-period-picker__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </summary>
            <div className="transactions-period-picker__popover">
              <PeriodPicker
                value={filterPeriod}
                onChange={setFilterPeriod}
                years={availableYears}
                allowAll
                fullWidth
              />
            </div>
          </details>
        </div>

        <div
          className="operation-type-tabs"
          role="tablist"
          aria-label="Тип операции"
        >
          {([
            ["ALL", "Все"],
            ["INCOME", "Доходы"],
            ["EXPENSE", "Расходы"],
            ["TAX", "Налоги"],
          ] as const).map(([typeValue, label]) => (
            <button
              key={typeValue}
              type="button"
              role="tab"
              aria-selected={filterType === typeValue}
              className={filterType === typeValue ? "is-active" : ""}
              onClick={() => setFilterType(typeValue)}
            >
              {label}
              <span>{typeCounts[typeValue]}</span>
            </button>
          ))}
        </div>

        {transactions.length === 0 ? (
          <div className="transactions-empty-state">
            <div className="transactions-empty-state__card">
              <span
                className="transactions-empty-state__icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 7h12l-3-3" />
                  <path d="m19 7-3 3" />
                  <path d="M17 17H5l3 3" />
                  <path d="m5 17 3-3" />
                </svg>
              </span>
              <h2>Здесь появятся ваши операции</h2>
              <p>
                Добавьте первую операцию дохода или расхода, чтобы начать учёт
              </p>
              <button
                ref={addButtonRef}
                type="button"
                onClick={() => {
                  returnFocusRef.current = addButtonRef.current
                  setFormOpen(true)
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Добавить операцию
              </button>
            </div>
          </div>
        ) : (
          <div className="transactions-table-scroll">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th scope="col">Дата факта</th>
                  <th scope="col">Дата периода</th>
                  <th scope="col">Категория</th>
                  <th scope="col">Проект</th>
                  <th scope="col">Комментарий</th>
                  <th scope="col" className="transactions-table__amount">
                    Сумма
                  </th>
                  <th scope="col" className="transactions-table__actions">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="transactions-empty">
                      Операции по заданным фильтрам не найдены.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const project = projectNames.get(tx.project_id)
                    const category = categoryNames.get(tx.category_id)
                    const typeLabel =
                      tx.type === "INCOME"
                        ? "Доход"
                        : tx.type === "TAX"
                          ? "Налог"
                          : "Расход"

                    return (
                      <tr key={tx.id}>
                        <td>{formatDate(tx.date_fact)}</td>
                        <td>{formatDate(tx.date_period)}</td>
                        <td>
                          <span
                            className={`transaction-type-badge transaction-type-badge--${tx.type.toLowerCase()}`}
                          >
                            {typeLabel}
                          </span>
                          <strong className="transactions-table__category">
                            {category || "Категория"}
                          </strong>
                        </td>
                        <td>
                          <span className="project-badge">
                            {project || "Без проекта"}
                          </span>
                        </td>
                        <td className="transactions-table__comment">
                          {tx.comment || "—"}
                        </td>
                        <td
                          className={`transactions-table__amount transactions-table__amount--${tx.type.toLowerCase()}`}
                        >
                          {tx.type === "INCOME" ? "+" : "−"}{" "}
                          {tx.amount.toLocaleString("ru-RU")} ₽
                        </td>
                        <td className="transactions-table__actions">
                          <button
                            type="button"
                            onClick={(event) =>
                              startEdit(tx, event.currentTarget)
                            }
                            className="directory-btn directory-btn--ghost"
                            aria-label={`Редактировать операцию: ${category || typeLabel}`}
                          >
                            Изменить
                          </button>
                          {deleteConfirmId === tx.id ? (
                            <div
                              className="transaction-delete-confirm"
                              role="group"
                              aria-label={`Подтверждение удаления операции: ${category || typeLabel}`}
                            >
                              <span>Удалить эту операцию?</span>
                              <button
                                type="button"
                                className="directory-btn directory-btn--danger"
                                aria-label={`Подтвердить удаление операции: ${category || typeLabel}`}
                                onClick={() => {
                                  onDelete(tx.id)
                                  setDeleteConfirmId(null)
                                }}
                              >
                                Да, удалить
                              </button>
                              <button
                                type="button"
                                className="directory-btn directory-btn--ghost"
                                aria-label="Отменить удаление операции"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="directory-btn directory-btn--danger"
                              aria-label={`Удалить операцию: ${category || typeLabel}`}
                            >
                              Удалить
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
