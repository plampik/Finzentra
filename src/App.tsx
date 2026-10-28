import React, { useEffect, useRef, useState } from "react"
import { useFinanceStore } from "./store"
import { Dashboard } from "./components/Dashboard"
import { Transactions } from "./components/Transactions"
import { AuthScreen } from "./components/AuthScreen"
import HomeScreen from "./components/HomeScreen"
import { TransactionType } from "./types"

type SectionTab = "dashboard" | "operations" | "projects" | "settings"
type AppScreen = "home" | "register" | "login" | "demo"
type NavigationItem = {
  id: SectionTab
  label: string
}

function NavigationIcon({ section }: { section: SectionTab }) {
  const paths: Record<SectionTab, React.ReactNode> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    operations: (
      <>
        <path d="M7 7h12l-3-3" />
        <path d="m19 7-3 3" />
        <path d="M17 17H5l3 3" />
        <path d="m5 17 3-3" />
      </>
    ),
    projects: (
      <>
        <path d="M3.5 7.5h7l2 2h8v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
        <path d="M3.5 7.5v-2a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="navigation-icon cabinet-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[section]}
    </svg>
  )
}

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="logo__mark"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 27.5c6.2-1 10.4-4.7 12.7-11.2 2.7 4.3 6.5 6.8 11.3 7.5" />
      <path d="m26 18 6 5.8-7.4 3" />
      <path d="M8 12.5h8.5" />
    </svg>
  )
}

function InterfaceIcon({
  name,
}: {
  name: "bell" | "chevron" | "lock" | "trash"
}) {
  const paths: Record<typeof name, React.ReactNode> = {
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    chevron: <path d="m9 7 5 5-5 5" />,
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="cabinet-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

export function App() {
  const {
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
  } = useFinanceStore()

  const [activeSection, setActiveSection] = useState<SectionTab>("dashboard")
  const [screen, setScreen] = useState<AppScreen>("home")
  const [openOperationOnSection, setOpenOperationOnSection] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsPopoverRef = useRef<HTMLDivElement>(null)

  // Локальные состояния для раздела 3.3 «Проекты» (FR-PRJ-01, FR-PRJ-02)
  const [projName, setProjName] = useState("")
  const [projDesc, setProjDesc] = useState("")
  const [editingProjId, setEditingProjId] = useState<string | null>(null)
  const [projectFormOpen, setProjectFormOpen] = useState(false)
  const [projectFormError, setProjectFormError] = useState("")

  // Локальные состояния для раздела 3.4 «Настройки (Живые справочники)» (FR-SET-01, FR-SET-02)
  const [catTabType, setCatTabType] = useState<TransactionType>("EXPENSE")
  const [newCatName, setNewCatName] = useState("")
  const [catAlert, setCatAlert] = useState<string>("")

  useEffect(() => {
    if (!helpOpen && !notificationsOpen) return

    const closeOnPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !notificationsPopoverRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false)
        setHelpOpen(false)
      }
    }

    document.addEventListener("pointerdown", closeOnPointerDown)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [helpOpen, notificationsOpen])

  const navItems: NavigationItem[] = [
    { id: "dashboard", label: "Дашборд" },
    { id: "operations", label: "Операции" },
    { id: "projects", label: "Проекты" },
    { id: "settings", label: "Настройки" },
  ]

  const sectionDetails: Record<SectionTab, {
    title: string
    description: string
  }> = {
    dashboard: {
      title: "Добрый день, Гость",
      description: "Вот что происходит с финансами вашего бизнеса.",
    },
    operations: {
      title: "Операции",
      description: "Контролируйте каждое движение денег.",
    },
    projects: {
      title: "Проекты",
      description: "Финансы бизнеса по направлениям.",
    },
    settings: {
      title: "Настройки",
      description: "Справочники и параметры учёта.",
    },
  }

  const navigateToSection = (section: SectionTab) => {
    setActiveSection(section)
  }

  const openNewTransaction = () => {
    setActiveSection("operations")
    setOpenOperationOnSection(true)
  }

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projName.trim()) {
      setProjectFormError("Укажите название проекта.")
      return
    }
    if (editingProjId) {
      updateProject(editingProjId, projName.trim(), projDesc.trim())
      setEditingProjId(null)
    } else {
      addProject(projName.trim(), projDesc.trim())
    }
    setProjName("")
    setProjDesc("")
    setProjectFormError("")
    setProjectFormOpen(false)
  }

  const closeProjectForm = () => {
    setProjectFormOpen(false)
    setEditingProjId(null)
    setProjName("")
    setProjDesc("")
    setProjectFormError("")
  }

  if (screen === "home") {
    return <HomeScreen onNavigate={(mode) => setScreen(mode)} />
  }

  if (screen === "register" || screen === "login") {
    return (
      <AuthScreen
        key={screen}
        initialMode={screen}
        onBackHome={() => setScreen("home")}
        onContinueDemo={() => setScreen("demo")}
      />
    )
  }

  return (
    <div className="app-shell cabinet flex min-h-screen flex-col text-slate-900 md:flex-row">
      {/* Боковое меню для Десктопа (Раздел 2 ТЗ ЛК) */}
      <aside className="cabinet-sidebar">
        <div className="cabinet-sidebar__logo">
          <button
            type="button"
            className="logo"
            onClick={() => navigateToSection("dashboard")}
            aria-label="Finzentra — открыть дашборд"
          >
            <BrandMark />
            <span>Finzentra</span>
          </button>
        </div>

        <nav className="cabinet-nav" aria-label="Разделы кабинета">
          <p>Рабочее пространство</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateToSection(item.id)}
              aria-current={activeSection === item.id ? "page" : undefined}
              className={activeSection === item.id ? "is-active" : ""}
            >
              <NavigationIcon section={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-help"
          onClick={() => setHelpOpen(true)}
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">?</span>
          <div>
            <strong>Нужна помощь?</strong>
            <p>Справка по сервису</p>
          </div>
          <InterfaceIcon name="chevron" />
        </button>
        <div className="user-profile">
          <span className="user-profile__avatar">Г</span>
          <span>
            <strong>Гость</strong>
          </span>
        </div>
      </aside>

      <main className="cabinet-main">
        <header className="cabinet-header" data-section={activeSection}>
          <div>
            <p>{sectionDetails[activeSection].description}</p>
            <h1>{sectionDetails[activeSection].title}</h1>
          </div>
          <div className="cabinet-header__actions">
            <button
              type="button"
              className="notification-button"
              onClick={() => setScreen("home")}
              aria-label="Вернуться на главную"
              title="Вернуться на главную"
            >
              <svg
                aria-hidden="true"
                className="cabinet-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v11h14V9M9 20v-6h6v6" />
              </svg>
            </button>
            <div
              className="header-popover-anchor"
              ref={notificationsPopoverRef}
            >
              <button
                type="button"
                className="notification-button"
                aria-label="Уведомления"
                aria-haspopup="dialog"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
              >
                <InterfaceIcon name="bell" />
              </button>
              {notificationsOpen && (
                <div
                  className="header-popover notifications-popover"
                  role="dialog"
                  aria-label="Уведомления"
                >
                  <strong>Уведомления</strong>
                  <p role="status">Новых уведомлений нет</p>
                </div>
              )}
            </div>
            <button
              type="button"
              className="notification-button header-help-button"
              aria-label="Открыть справку по сервису"
              aria-haspopup="dialog"
              onClick={() => setHelpOpen(true)}
            >
              <span aria-hidden="true">?</span>
            </button>
            <button
              type="button"
              onClick={openNewTransaction}
              className="cabinet-primary"
            >
              <svg
                aria-hidden="true"
                className="cabinet-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Добавить операцию</span>
            </button>
          </div>
        </header>

        <section className="cabinet-content">
          {storageError && (
            <div
              role="alert"
              className="directory-toast directory-toast--error"
            >
              {storageError}
            </div>
          )}

          {/* 1. РАЗДЕЛ «ДАШБОРД» */}
          {activeSection === "dashboard" && (
            <Dashboard
              projects={projects}
              selectedProjectIds={selectedProjectIds}
              onChangeProjects={setSelectedProjectIds}
              categories={categories}
              transactions={transactions}
              onAddTransaction={openNewTransaction}
            />
          )}

          {/* 2. РАЗДЕЛ «ОПЕРАЦИИ» */}
          {activeSection === "operations" && (
            <Transactions
              projects={projects}
              selectedProjectIds={selectedProjectIds}
              onChangeProjects={setSelectedProjectIds}
              categories={categories}
              transactions={transactions}
              onAdd={addTransaction}
              onUpdate={updateTransaction}
              onDelete={deleteTransaction}
              openOnMount={openOperationOnSection}
              onOpenHandled={() => setOpenOperationOnSection(false)}
            />
          )}

          {/* 3. РАЗДЕЛ «ПРОЕКТЫ» (FR-PRJ-01, FR-PRJ-02) */}
          {activeSection === "projects" && (
            <section className="section-page directory">
              <div className="section-page__intro directory__intro">
                <div>
                  <h2>Мои проекты</h2>
                  <p>
                    {projects.filter((project) => project.is_active).length}{" "}
                    активных ·{" "}
                    {projects.filter((project) => !project.is_active).length} в
                    архиве
                  </p>
                </div>
                <button
                  type="button"
                  className="cabinet-primary"
                  onClick={() => {
                    setEditingProjId(null)
                    setProjName("")
                    setProjDesc("")
                    setProjectFormError("")
                    setProjectFormOpen(true)
                  }}
                >
                  <span aria-hidden="true">＋</span>
                  <span>Создать проект</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="projects-empty-state">
                  <div className="projects-empty-state__card">
                    <div className="projects-empty-state__icon">
                      <NavigationIcon section="projects" />
                    </div>
                    <h2>У вас пока нет проектов</h2>
                    <p>
                      Создайте проект, чтобы разделять финансы по направлениям
                      бизнеса и видеть аналитику по каждому отдельно.
                    </p>
                    <button
                      type="button"
                      className="dashboard-empty__button"
                      onClick={() => {
                        setProjectFormError("")
                        setProjectFormOpen(true)
                      }}
                    >
                      <span aria-hidden="true">＋</span>
                      Создать проект
                    </button>
                  </div>
                </div>
              ) : (
                <div className="project-directory-grid">
                  {projects.map((project, index) => {
                    const transactionCount = transactions.filter(
                      (transaction) => transaction.project_id === project.id,
                    ).length
                    const initials = project.name
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toLocaleUpperCase("ru")
                    const colorClass =
                      index % 3 === 1
                        ? " project-color--2"
                        : index % 3 === 2
                          ? " project-color--3"
                          : ""

                    return (
                      <article
                        key={project.id}
                        className={`project-card${
                          project.is_active ? "" : " project-card--archived"
                        }`}
                      >
                        <div className="project-card__top">
                          <span
                            className={`project-avatar${colorClass}`}
                            aria-hidden="true"
                          >
                            {initials}
                          </span>
                          <span
                            className={`status-badge ${
                              project.is_active
                                ? "status-badge--active"
                                : "status-badge--archived"
                            }`}
                          >
                            {project.is_active ? "Активен" : "В архиве"}
                          </span>
                        </div>
                        <h3>{project.name}</h3>
                        <p className="project-card__description">
                          {project.description || "Описание не добавлено"}
                        </p>
                        <p className="project-card__meta">
                          Операций: {transactionCount}
                        </p>
                        <div className="project-card__actions">
                          {project.is_active ? (
                            <>
                              <button
                                type="button"
                                className="directory-btn directory-btn--ghost"
                                onClick={() => {
                                  setEditingProjId(project.id)
                                  setProjName(project.name)
                                  setProjDesc(project.description || "")
                                  setProjectFormError("")
                                  setProjectFormOpen(true)
                                }}
                              >
                                Изменить
                              </button>
                              <button
                                type="button"
                                className="directory-btn directory-btn--soft"
                                onClick={() => toggleProjectArchive(project.id)}
                              >
                                В архив
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="directory-btn directory-btn--primary"
                              onClick={() => toggleProjectArchive(project.id)}
                            >
                              Восстановить
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {projects.length > 0 && (
                <div className="directory-hint">
                  <span aria-hidden="true">ⓘ</span>
                  <p>
                    Проекты с существующими операциями нельзя удалить — их можно
                    только переименовать или отправить в архив.
                  </p>
                </div>
              )}

              {projectFormOpen && (
                <div
                  className="directory-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="project-form-title"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) closeProjectForm()
                  }}
                >
                  <form
                    className="directory-modal__card"
                    onClick={(event) => event.stopPropagation()}
                    onSubmit={handleProjectSubmit}
                  >
                    <div className="directory-modal__head">
                      <h3 id="project-form-title">
                        {editingProjId
                          ? "Редактировать проект"
                          : "Новый проект"}
                      </h3>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label="Закрыть"
                        onClick={closeProjectForm}
                      >
                        ×
                      </button>
                    </div>
                    {projectFormError && (
                      <p className="directory-error" role="alert">
                        {projectFormError}
                      </p>
                    )}
                    <label>
                      Название проекта
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        value={projName}
                        onChange={(event) => {
                          setProjName(event.target.value)
                          setProjectFormError("")
                        }}
                        placeholder="Например, ПВЗ Wildberries"
                        autoFocus
                      />
                    </label>
                    <label>
                      Описание проекта
                      <input
                        type="text"
                        maxLength={255}
                        value={projDesc}
                        onChange={(event) => setProjDesc(event.target.value)}
                        placeholder="Краткое описание"
                      />
                    </label>
                    <div className="directory-modal__actions">
                      <button
                        type="button"
                        className="directory-btn directory-btn--ghost"
                        onClick={closeProjectForm}
                      >
                        Отмена
                      </button>
                      <button type="submit" className="cabinet-primary">
                        {editingProjId ? "Сохранить" : "Создать проект"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          )}

          {/* 4. РАЗДЕЛ «НАСТРОЙКИ (ЖИВЫЕ СПРАВОЧНИКИ КАТЕГОРИЙ)» (FR-SET-01, FR-SET-02) */}
          {activeSection === "settings" && (
            <section className="section-page directory">
              <div className="section-page__intro directory__intro">
                <div>
                  <h2>Живые справочники</h2>
                  <p>Управляйте категориями доходов, расходов и налогов</p>
                </div>
              </div>

              <div
                className="directory-tabs"
                role="tablist"
                aria-label="Категории"
              >
                {([
                  ["EXPENSE", "Расходы"],
                  ["INCOME", "Доходы"],
                  ["TAX", "Налоги"],
                ] as const).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={catTabType === type}
                    className={catTabType === type ? "is-active" : ""}
                    onClick={() => {
                      setCatTabType(type)
                      setCatAlert("")
                    }}
                  >
                    {label}
                    <i>
                      {
                        categories.filter((category) => category.type === type)
                          .length
                      }
                    </i>
                  </button>
                ))}
              </div>

              <form
                className="directory-add"
                onSubmit={(event) => {
                  event.preventDefault()
                  const name = newCatName.trim()
                  if (name.length < 2) {
                    setCatAlert(
                      "Введите название категории не короче 2 символов.",
                    )
                    return
                  }
                  if (
                    categories.some(
                      (category) =>
                        category.type === catTabType &&
                        category.name.localeCompare(name, "ru", {
                          sensitivity: "accent",
                        }) === 0,
                    )
                  ) {
                    setCatAlert("Категория с таким названием уже существует.")
                    return
                  }
                  addCategory(name, catTabType)
                  setNewCatName("")
                  setCatAlert("")
                }}
              >
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={newCatName}
                  onChange={(event) => setNewCatName(event.target.value)}
                  placeholder="Название новой категории"
                  aria-label="Название новой категории"
                />
                <button type="submit" className="cabinet-primary">
                  <span aria-hidden="true">＋</span>
                  <span>Добавить</span>
                </button>
              </form>

              {catAlert && (
                <div
                  className="directory-toast directory-toast--error"
                  role="alert"
                >
                  <span aria-hidden="true">ⓘ</span>
                  <span>{catAlert}</span>
                </div>
              )}

              <div className="category-list">
                {categories
                  .filter((category) => category.type === catTabType)
                  .map((category) => (
                    <div
                      key={category.id}
                      className={`category-row${
                        category.is_active ? "" : " category-row--hidden"
                      }`}
                    >
                      <span className="category-row__text">
                        <strong>{category.name}</strong>
                        <small>
                          {category.is_system
                            ? "Системная категория"
                            : "Пользовательская категория"}
                        </small>
                      </span>
                      {category.is_system && (
                        <span className="system-badge">
                          <InterfaceIcon name="lock" />
                          Системная
                        </span>
                      )}
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={category.is_active}
                          onChange={() => toggleCategoryActive(category.id)}
                          aria-label={`${category.name}: ${
                            category.is_active ? "Активна" : "Скрыта"
                          }`}
                        />
                        <span className="switch__track">
                          <span className="switch__thumb" />
                        </span>
                        <em>{category.is_active ? "Активна" : "Скрыта"}</em>
                      </label>
                      {category.is_system ? (
                        <span
                          className="category-lock"
                          aria-label="Системную категорию нельзя удалить"
                          title="Системную категорию нельзя удалить"
                        >
                          <InterfaceIcon name="lock" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="category-delete"
                          aria-label={`Удалить ${category.name}`}
                          onClick={() => {
                            const result = deleteCategory(category.id)
                            if (!result.success && result.message) {
                              setCatAlert(result.message)
                            } else {
                              setCatAlert("")
                            }
                          }}
                        >
                          <InterfaceIcon name="trash" />
                          <span>Удалить</span>
                        </button>
                      )}
                    </div>
                  ))}
              </div>

              <div className="directory-hint">
                <span aria-hidden="true">ⓘ</span>
                <p>
                  Системные категории можно скрывать, но нельзя удалять.
                  Пользовательскую категорию можно удалить, только если она не
                  используется в операциях.
                </p>
              </div>
            </section>
          )}
        </section>
      </main>

      {helpOpen && (
        <div
          className="directory-modal help-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false)
          }}
        >
          <div className="directory-modal__card help-modal__card">
            <div className="directory-modal__head">
              <h3 id="help-modal-title">Как работать с отчётом</h3>
              <button
                type="button"
                className="icon-button"
                aria-label="Закрыть справку"
                onClick={() => setHelpOpen(false)}
              >
                <svg
                  aria-hidden="true"
                  className="cabinet-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="help-modal__content">
              <section>
                <strong>Дата факта и дата периода</strong>
                <p>
                  Дата факта — день, когда деньги поступили или были списаны.
                  Дата периода — период, к которому относится доход или расход.
                  Например, оплата в апреле за мартовскую работу отражается в
                  апреле по дате факта и в марте по дате периода.
                </p>
              </section>
              <section>
                <strong>Кассовый метод</strong>
                <p>
                  Учитывает операции по дате фактического поступления или
                  списания денег.
                </p>
              </section>
              <section>
                <strong>Метод начисления</strong>
                <p>
                  Учитывает доходы и расходы в периоде, к которому они
                  относятся, независимо от даты оплаты.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Разделы кабинета">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateToSection(item.id)}
            aria-current={activeSection === item.id ? "page" : undefined}
            className={activeSection === item.id ? "is-active" : ""}
          >
            <NavigationIcon section={item.id} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button
        type="button"
        className="mobile-add"
        aria-label="Добавить операцию"
        onClick={openNewTransaction}
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
      </button>
    </div>
  )
}

export default App
