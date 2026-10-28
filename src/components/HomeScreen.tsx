type AuthMode = "register" | "login"

type HomeScreenProps = {
  onNavigate: (mode: AuthMode) => void
}

function Logo() {
  return (
    <span className="logo" aria-label="Finzentra">
      <svg className="logo__mark" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 27.5c6.2-1 10.4-4.7 12.7-11.2 2.7 4.3 6.5 6.8 11.3 7.5" />
        <path d="m26 18 6 5.8-7.4 3" />
        <path d="M8 12.5h8.5" />
      </svg>
      <span>Finzentra</span>
    </span>
  )
}

function Icon({ name }: { name: "spark" | "control" | "time" | "arrow" }) {
  if (name === "arrow") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    )
  }

  if (name === "spark") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </svg>
    )
  }

  if (name === "control") {
    return (
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
      </svg>
    )
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function BrandArtwork() {
  return (
    <div className="brand-art" aria-label="Абстрактная графика Finzentra">
      <div className="brand-art__orb" />
      <svg viewBox="0 0 620 500" aria-hidden="true">
        <defs>
          <linearGradient id="flow" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#8ebce9" />
            <stop offset="1" stopColor="#245c9c" />
          </linearGradient>
        </defs>
        <path
          className="brand-art__line brand-art__line--soft"
          d="M46 376C176 380 201 196 322 196c77 0 92 86 182 52"
        />
        <path
          className="brand-art__line"
          d="M34 414c153-7 182-232 327-232 94 0 116 87 198 32"
        />
        <path className="brand-art__arrow" d="m500 150 60 64-82 29" />
        <circle cx="123" cy="358" r="16" />
        <circle cx="361" cy="182" r="11" />
      </svg>
      <div className="brand-art__monogram">F</div>
    </div>
  )
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <main className="home">
      <div className="home__glow home__glow--one" aria-hidden="true" />
      <div className="home__glow home__glow--two" aria-hidden="true" />

      <header className="nav shell">
        <Logo />
        <nav className="nav__actions" aria-label="Навигация">
          <button
            className="button button--ghost"
            type="button"
            onClick={() => onNavigate("login")}
          >
            Войти
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => onNavigate("register")}
          >
            Зарегистрироваться
          </button>
        </nav>
      </header>

      <section className="hero shell">
        <div className="hero__copy">
          <p className="eyebrow">Финансовый учёт без лишней рутины</p>
          <h1>
            Не создавайте себе <span>вторую работу</span>
          </h1>
          <p className="hero__text">
            Finzentra помогает держать финансы бизнеса под контролем, чтобы вы
            меньше времени тратили на учёт и больше — на развитие своего дела.
          </p>
          <button
            className="button button--primary button--large"
            type="button"
            onClick={() => onNavigate("register")}
          >
            Зарегистрироваться
            <Icon name="arrow" />
          </button>
        </div>
        <BrandArtwork />
      </section>

      <section className="benefits shell" aria-labelledby="benefits-title">
        <div className="section-heading">
          <p className="eyebrow">Простота в основе</p>
          <h2 id="benefits-title">Финансы без второй смены</h2>
        </div>
        <div className="benefits__grid">
          <article className="benefit">
            <div className="benefit__icon">
              <Icon name="spark" />
            </div>
            <h3>Меньше рутины</h3>
            <p>Тратьте меньше времени на повседневный финансовый учёт.</p>
          </article>
          <article className="benefit">
            <div className="benefit__icon">
              <Icon name="control" />
            </div>
            <h3>Финансы под контролем</h3>
            <p>Сохраняйте ясное представление о доходах и расходах бизнеса.</p>
          </article>
          <article className="benefit">
            <div className="benefit__icon">
              <Icon name="time" />
            </div>
            <h3>Больше времени на своё дело</h3>
            <p>
              Сосредоточьтесь на развитии бизнеса, а не на бесконечных таблицах.
            </p>
          </article>
        </div>
      </section>

      <section className="cta shell">
        <div>
          <p className="eyebrow eyebrow--light">Начните сегодня</p>
          <h2>Пора освободить время для главного</h2>
          <p>
            Начните вести финансовый учёт с Finzentra — проще, понятнее и без
            лишней рутины.
          </p>
        </div>
        <button
          className="button button--white button--large"
          type="button"
          onClick={() => onNavigate("register")}
        >
          Зарегистрироваться
          <Icon name="arrow" />
        </button>
      </section>

      <footer className="footer shell">
        <div>
          <Logo />
          <p>Финансовый учёт без лишней рутины</p>
        </div>
        <nav aria-label="Дополнительная навигация">
          <button type="button" onClick={() => onNavigate("login")}>
            Войти
          </button>
          <button type="button" onClick={() => onNavigate("register")}>
            Зарегистрироваться
          </button>
        </nav>
      </footer>
    </main>
  )
}
