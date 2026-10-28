import { useMemo, useState } from "react"

import FinancialDashboard from "./FinancialDashboard"

import { Category, Project, Transaction, TransactionType } from "../types"

type PeriodType = "month" | "quarter" | "year"

type FinancialOperationType = "income" | "expense" | "tax"

interface DashboardProps {
  projects: Project[]

  selectedProjectIds: string[]

  onChangeProjects: (ids: string[]) => void

  categories: Category[]

  transactions: Transaction[]

  onAddTransaction: () => void
}

function operationType(type: TransactionType): FinancialOperationType {
  switch (type) {
    case "INCOME":
      return "income"

    case "EXPENSE":
      return "expense"

    case "TAX":
      return "tax"
  }
}

function currentPeriod(type: PeriodType, date = new Date()) {
  const year = date.getFullYear()

  if (type === "year") return String(year)

  if (type === "quarter") {
    return `${year}-Q${Math.floor(date.getMonth() / 3) + 1}`
  }

  return `${year}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export const Dashboard = ({
  projects,

  selectedProjectIds,

  onChangeProjects,

  categories,

  transactions,

  onAddTransaction,
}: DashboardProps) => {
  const [periodType, setPeriodType] = useState<PeriodType>("month")

  const [selectedPeriod, setSelectedPeriod] = useState(() =>
    currentPeriod("month"),
  )

  const dashboardProjects = useMemo(
    () =>
      projects
        .filter((project) => project.is_active)
        .map((project) => ({
          id: project.id,

          name: project.name,

          archived: false,
        })),

    [projects],
  )

  const dashboardOperations = useMemo(() => {
    const activeCategories = categories.filter((category) => category.is_active)
    const activeCategoryIds = new Set(
      activeCategories.map((category) => category.id),
    )
    const categoryNames = new Map(
      activeCategories.map((category) => [category.id, category.name]),
    )

    return transactions
      .filter((transaction) => activeCategoryIds.has(transaction.category_id))
      .map((transaction) => ({
        id: transaction.id,

        type: operationType(transaction.type),

        category: categoryNames.get(transaction.category_id) ?? "Без категории",

        projectId: transaction.project_id,

        date: transaction.date_fact,

        periodDate: transaction.date_period,

        comment: transaction.comment ?? "",

        amount: Math.round(transaction.amount * 100) / 100,
      }))
  }, [categories, transactions])

  return (
    <FinancialDashboard
      projects={dashboardProjects}
      operations={dashboardOperations}
      periodType={periodType}
      selectedPeriod={selectedPeriod}
      onPeriodChange={(type, period) => {
        setPeriodType(type)

        setSelectedPeriod(period)
      }}
      selectedProjectIds={selectedProjectIds}
      onSelectedProjectIdsChange={(ids) => {
        onChangeProjects(
          ids.length > 0
            ? ids
            : projects
                .filter((project) => project.is_active)
                .map((project) => project.id),
        )
      }}
      onAddTransaction={onAddTransaction}
    />
  )
}
