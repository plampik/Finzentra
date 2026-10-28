import { useState } from "react"

type AuthMode = "register" | "login"

type AuthScreenProps = {
  initialMode: AuthMode
  onBackHome: () => void
  onContinueDemo: () => void
}

function BrandLogo() {
  return (
    <div className="logo auth-brand" role="img" aria-label="Finzentra">
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 27.5c6.2-1 10.4-4.7 12.7-11.2 2.7 4.3 6.5 6.8 11.3 7.5" />
        <path d="m26 18 6 5.8-7.4 3" />
        <path d="M8 12.5h8.5" />
      </svg>
      <span>Finzentra</span>
    </div>
  )
}

function PasswordToggle({
  visible,

  onToggle,

  label,
}: {
  visible: boolean

  onToggle: () => void

  label: string
}) {
  return (
    <button
      type="button"
      className="password-toggle"
      onClick={onToggle}
      aria-label={`${visible ? "Скрыть" : "Показать"} пароль ${label}`}
      aria-pressed={visible}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {visible ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.3 9 7-.2.8-.8 1.8-1.7 2.8" />
            <path d="M6.2 6.2C4.3 7.5 3.3 9.4 3 12c.7 2.7 4 7 9 7 1.1 0 2.1-.2 3-.6" />
          </>
        ) : (
          <>
            <path d="M2.5 12s3.2-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.2 6.5-9.5 6.5S2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="2.5" />
          </>
        )}
      </svg>
    </button>
  )
}

export function AuthScreen({
  initialMode,
  onBackHome,
  onContinueDemo,
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [accountType, setAccountType] = useState<"ИП" | "Компания">("ИП")

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [message, setMessage] = useState("")

  const isRegister = mode === "register"
  const isInfoMessage =
    message.startsWith("Форма проверена") ||
    message.startsWith("Восстановление пароля")

  const passwordsMismatch =
    isRegister && confirmPassword.length > 0 && password !== confirmPassword

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode)

    setMessage("")

    setPassword("")

    setConfirmPassword("")
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setMessage("")

    if (isRegister && !name.trim()) {
      setMessage("Укажите имя, чтобы продолжить регистрацию.")

      return
    }

    if (isRegister && password !== confirmPassword) {
      setMessage("Пароли не совпадают. Проверьте оба поля.")

      return
    }

    setMessage(
      isRegister
        ? "Форма проверена. Для создания аккаунта подключите backend — введённые данные не отправляются и не сохраняются."
        : "Форма проверена. Для входа подключите backend — введённые данные не отправляются и не сохраняются.",
    )
  }

  return (
    <main className="auth-page">
      <div className="ambient ambient--top" aria-hidden="true" />
      <div className="ambient ambient--bottom" aria-hidden="true" />
      <div className="auth-page__top">
        <button
          type="button"
          className="auth-home-button"
          onClick={onBackHome}
          aria-label="На главную Finzentra"
        >
          <BrandLogo />
        </button>
      </div>

      <section
        className={`auth-card${isRegister ? " auth-card--register" : ""}`}
        aria-labelledby="auth-title"
      >
        <header className="auth-card__header">
          <p className="auth-kicker">
            {isRegister ? "Финансы под контролем" : "С возвращением"}
          </p>
          <h1 id="auth-title">
            {isRegister ? "Создайте аккаунт" : "Вход в Finzentra"}
          </h1>
          <p>
            {isRegister
              ? "Управляйте финансами проектов в одном личном кабинете."
              : "Войдите в личный кабинет, чтобы продолжить работу."}
          </p>
        </header>

        {message && (
          <div
            className={`form-alert${isInfoMessage ? " form-alert--info" : ""}`}
            role={isInfoMessage ? "status" : "alert"}
          >
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form__fields">
            {isRegister && (
              <>
                <div className="field">
                  <label className="field__label" htmlFor="auth-name">
                    Ваше имя
                  </label>
                  <input
                    className="field__control"
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="Например, Анна"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value)
                      setMessage("")
                    }}
                    required
                  />
                </div>

                <fieldset className="field fieldset-reset">
                  <legend className="field__label">Тип аккаунта</legend>
                  <div
                    className="segmented"
                    role="group"
                    aria-label="Тип аккаунта"
                  >
                    {(["ИП", "Компания"] as const).map((type) => (
                      <button
                        className={`segmented__item${
                          accountType === type ? " segmented__item--active" : ""
                        }`}
                        type="button"
                        key={type}
                        aria-pressed={accountType === type}
                        onClick={() => {
                          setAccountType(type)
                          setMessage("")
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div className="field">
              <label className="field__label" htmlFor="auth-email">
                Электронная почта
              </label>
              <input
                className="field__control"
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                placeholder="name@example.ru"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setMessage("")
                }}
                required
              />
            </div>

            <div className="field">
              <label className="field__label" htmlFor="auth-password">
                Пароль
              </label>
              <div className="field__input-wrap">
                <input
                  className="field__control"
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  minLength={8}
                  maxLength={128}
                  placeholder="Не менее 8 символов"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setMessage("")
                  }}
                  required
                />
                <PasswordToggle
                  visible={showPassword}
                  onToggle={() => setShowPassword((visible) => !visible)}
                  label="в первом поле"
                />
              </div>
              <p className="field__message">Используйте не менее 8 символов.</p>
            </div>

            {isRegister && (
              <div
                className={`field${passwordsMismatch ? " field--error" : ""}`}
              >
                <label className="field__label" htmlFor="auth-confirm-password">
                  Повторите пароль
                </label>
                <div className="field__input-wrap">
                  <input
                    className="field__control"
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    placeholder="Введите пароль ещё раз"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      setMessage("")
                    }}
                    aria-invalid={passwordsMismatch}
                    aria-describedby={
                      passwordsMismatch ? "auth-password-error" : undefined
                    }
                    required
                  />
                  <PasswordToggle
                    visible={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    label="в поле подтверждения"
                  />
                </div>
                {passwordsMismatch && (
                  <p
                    className="field__message field__message--error"
                    id="auth-password-error"
                  >
                    Пароли не совпадают.
                  </p>
                )}
              </div>
            )}
          </div>

          {!isRegister && (
            <button
              className="forgot-link"
              type="button"
              onClick={() =>
                setMessage(
                  "Восстановление пароля станет доступно после подключения backend.",
                )
              }
            >
              Забыли пароль?
            </button>
          )}

          <button className="primary-button" type="submit">
            {isRegister ? "Создать аккаунт" : "Войти"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"}{" "}
          <button
            type="button"
            onClick={() => changeMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Войти" : "Зарегистрироваться"}
          </button>
        </p>

        <div className="transition-note" role="note">
          <span aria-hidden="true" />
          <p>
            Экран готов к интеграции. Учётные записи и пароли пока не
            обрабатываются сервером.
          </p>
        </div>

        <button className="text-link" type="button" onClick={onContinueDemo}>
          Посмотреть демо-кабинет
        </button>
      </section>
    </main>
  )
}
