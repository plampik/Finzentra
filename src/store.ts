import { useState, useEffect } from "react"

import {
  Project,
  Category,
  Transaction,
  TransactionType,
  INITIAL_CATEGORIES,
  INITIAL_PROJECTS,
  INITIAL_TRANSACTIONS,
} from "./types"

const STORAGE_KEYS = {
  PROJECTS: "finzentra_v2_projects",

  CATEGORIES: "finzentra_v2_categories",

  TRANSACTIONS: "finzentra_v2_transactions",
}

type StoredArray<T,> = {
  value: T[]

  error?: string
}

function isProject(value: unknown): value is Project {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "is_active" in value &&
    typeof value.is_active === "boolean" &&
    (!("description" in value) || typeof value.description === "string")
  )
}

function isCategory(value: unknown): value is Category {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "type" in value &&
    (value.type === "INCOME" ||
      value.type === "EXPENSE" ||
      value.type === "TAX") &&
    "is_system" in value &&
    typeof value.is_system === "boolean" &&
    "is_active" in value &&
    typeof value.is_active === "boolean"
  )
}

function isTransaction(value: unknown): value is Transaction {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "project_id" in value &&
    typeof value.project_id === "string" &&
    "category_id" in value &&
    typeof value.category_id === "string" &&
    "type" in value &&
    (value.type === "INCOME" ||
      value.type === "EXPENSE" ||
      value.type === "TAX") &&
    "amount" in value &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount > 0 &&
    "date_fact" in value &&
    typeof value.date_fact === "string" &&
    "date_period" in value &&
    typeof value.date_period === "string" &&
    "created_at" in value &&
    typeof value.created_at === "string" &&
    (!("comment" in value) || typeof value.comment === "string")
  )
}

function readStoredArray<T>(
  key: string,

  fallback: T[],

  isItem: (value: unknown) => value is T,
): StoredArray<T> {
  try {
    const stored = localStorage.getItem(key)

    if (stored === null) return { value: fallback }

    const parsed: unknown = JSON.parse(stored)

    if (!Array.isArray(parsed) || !parsed.every(isItem)) {
      throw new Error("Stored value does not match the expected data format.")
    }

    return { value: parsed }
  } catch (error) {
    console.error(`Failed to load Finzentra data from "${key}".`, error)

    return {
      value: fallback,

      error:
        "Не удалось загрузить часть сохраненных данных. Проверьте хранилище браузера перед продолжением работы.",
    }
  }
}

function writeStoredArray(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))

    return true
  } catch (error) {
    console.error(`Failed to save Finzentra data to "${key}".`, error)

    return false
  }
}

export function useFinanceStore() {
  const [initialData] = useState(() => ({
    projects: readStoredArray(
      STORAGE_KEYS.PROJECTS,
      INITIAL_PROJECTS,
      isProject,
    ),

    categories: readStoredArray(
      STORAGE_KEYS.CATEGORIES,
      INITIAL_CATEGORIES,
      isCategory,
    ),

    transactions: readStoredArray(
      STORAGE_KEYS.TRANSACTIONS,

      INITIAL_TRANSACTIONS,

      isTransaction,
    ),
  }))

  const [storageError, setStorageError] = useState<string | null>(
    () =>
      initialData.projects.error ??
      initialData.categories.error ??
      initialData.transactions.error ??
      null,
  )
  const [persistenceEnabled, setPersistenceEnabled] = useState(() => ({
    projects: !initialData.projects.error,
    categories: !initialData.categories.error,
    transactions: !initialData.transactions.error,
  }))

  const [projects, setProjects] = useState<Project[]>(
    initialData.projects.value,
  )

  // Мультивыбор проектов для фильтрации (по умолчанию выбраны все активные)

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() =>
    projects.filter((p) => p.is_active).map((p) => p.id),
  )

  const [categories, setCategories] = useState<Category[]>(
    initialData.categories.value,
  )

  const [transactions, setTransactions] = useState<Transaction[]>(
    initialData.transactions.value,
  )

  useEffect(() => {
    if (!persistenceEnabled.projects) return
    if (!writeStoredArray(STORAGE_KEYS.PROJECTS, projects)) {
      setStorageError("Не удалось сохранить изменения в хранилище браузера.")
    }
  }, [projects, persistenceEnabled.projects])

  useEffect(() => {
    if (!persistenceEnabled.categories) return
    if (!writeStoredArray(STORAGE_KEYS.CATEGORIES, categories)) {
      setStorageError("Не удалось сохранить изменения в хранилище браузера.")
    }
  }, [categories, persistenceEnabled.categories])

  useEffect(() => {
    if (!persistenceEnabled.transactions) return
    if (!writeStoredArray(STORAGE_KEYS.TRANSACTIONS, transactions)) {
      setStorageError("Не удалось сохранить изменения в хранилище браузера.")
    }
  }, [transactions, persistenceEnabled.transactions])

  // --- ОПЕРАЦИИ (FR-OP-08, FR-OP-14, FR-OP-15) ---

  const addTransaction = (tx: Omit<Transaction, "id" | "created_at">) => {
    setPersistenceEnabled((prev) => ({ ...prev, transactions: true }))
    const newTx: Transaction = {
      ...tx,

      id: "tx-" + Date.now(),

      created_at: new Date().toISOString(),
    }

    setTransactions((prev) => [newTx, ...prev])
  }

  const updateTransaction = (
    id: string,
    updated: Omit<Transaction, "id" | "created_at">,
  ) => {
    setPersistenceEnabled((prev) => ({ ...prev, transactions: true }))
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx)),
    )
  }

  const deleteTransaction = (id: string) => {
    setPersistenceEnabled((prev) => ({ ...prev, transactions: true }))
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  // --- ПРОЕКТЫ (FR-PRJ-01, FR-PRJ-02) ---

  const addProject = (name: string, description?: string) => {
    setPersistenceEnabled((prev) => ({ ...prev, projects: true }))
    const newProj: Project = {
      id: "proj-" + Date.now(),

      name: name.slice(0, 100),

      description,

      is_active: true,
    }

    setProjects((prev) => [...prev, newProj])

    setSelectedProjectIds((prev) => [...prev, newProj.id])
  }

  const updateProject = (id: string, name: string, description?: string) => {
    setPersistenceEnabled((prev) => ({ ...prev, projects: true }))
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: name.slice(0, 100), description } : p,
      ),
    )
  }

  const toggleProjectArchive = (id: string) => {
    const project = projects.find((item) => item.id === id)

    if (!project) return

    setPersistenceEnabled((prev) => ({ ...prev, projects: true }))
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)),
    )

    setSelectedProjectIds((prev) => {
      if (!project.is_active) {
        return prev.includes(id) ? prev : [...prev, id]
      }

      const next = prev.filter((projectId) => projectId !== id)

      return next.length > 0
        ? next
        : projects
            .filter((item) => item.is_active && item.id !== id)
            .map((item) => item.id)
    })
  }

  // --- ЖИВОЙ СПРАВОЧНИК КАТЕГОРИЙ (FR-SET-01, FR-SET-02) ---

  const addCategory = (name: string, type: TransactionType) => {
    setPersistenceEnabled((prev) => ({ ...prev, categories: true }))
    const newCat: Category = {
      id: "cat-" + Date.now(),

      name,

      type,

      is_system: false,

      is_active: true,
    }

    setCategories((prev) => [...prev, newCat])

    return newCat
  }

  const toggleCategoryActive = (id: string) => {
    setPersistenceEnabled((prev) => ({ ...prev, categories: true }))
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c)),
    )
  }

  // Удаление пользовательской категории (только если нет привязанных операций)

  const deleteCategory = (id: string): {
    success: boolean
    message?: string
  } => {
    const cat = categories.find((c) => c.id === id)

    if (!cat) return { success: false }

    if (cat.is_system) {
      return {
        success: false,

        message: "Системную категорию нельзя удалить, но её можно скрыть.",
      }
    }

    const hasTx = transactions.some((t) => t.category_id === id)

    if (hasTx) {
      return {
        success: false,

        message:
          "Нельзя удалить категорию, по которой уже есть операции. Вы можете скрыть её.",
      }
    }

    setPersistenceEnabled((prev) => ({ ...prev, categories: true }))
    setCategories((prev) => prev.filter((c) => c.id !== id))

    return { success: true }
  }

  return {
    projects,

    selectedProjectIds,

    setSelectedProjectIds,

    storageError,

    categories,

    transactions,

    addTransaction,

    updateTransaction,

    deleteTransaction,

    addProject,

    updateProject,

    toggleProjectArchive,

    addCategory,

    toggleCategoryActive,

    deleteCategory,
  }
}
