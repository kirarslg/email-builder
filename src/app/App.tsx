import { useState } from 'react'
import { EmailPage } from '../pages/EmailPage'
import { ReportPage } from '../pages/ReportPage'
import { HelpPage } from '../pages/HelpPage'
import { OnboardingModal } from '../components/shared/OnboardingModal'

type TabKey = 'email' | 'report' | 'help'

const ONBOARDING_KEY = 'onboarding_done_v1'

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('email')
  const [emailViewMode, setEmailViewMode] = useState<'inputs' | 'builder'>('inputs')
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) !== '1'
  )

  function closeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setShowOnboarding(false)
  }

  function openOnboarding() {
    setShowOnboarding(true)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="logo">
            <img alt="Конструктор писем" src="/logo/logo builder email.svg" />
          </div>
          <nav className="app-nav" role="navigation" aria-label="Разделы">
            <button
              className={"app-nav__item" + (activeTab === 'email' ? ' is-active' : '')}
              type="button"
              onClick={() => setActiveTab('email')}
            >
              Письма
            </button>
            <button
              className={"app-nav__item" + (activeTab === 'report' ? ' is-active' : '')}
              type="button"
              onClick={() => setActiveTab('report')}
            >
              Отчёты
            </button>
            <button
              className={"app-nav__item" + (activeTab === 'help' ? ' is-active' : '')}
              type="button"
              onClick={() => setActiveTab('help')}
            >
              Справка
            </button>
          </nav>
          {/* Feedback button — hidden for now
          <button className="app-header__btn" type="button">
            Обратная связь
          </button>
          */}
        </div>
      </header>

      <div
        className={"wrap email-layout email-mode-" + emailViewMode}
        id="tab-email"
        hidden={activeTab !== 'email'}
      >
        {activeTab === 'email' && <EmailPage emailViewMode={emailViewMode} onViewModeChange={setEmailViewMode} />}
      </div>

      <div className="wrap report-layout" id="tab-report" hidden={activeTab !== 'report'}>
        {activeTab === 'report' && <ReportPage />}
      </div>

      <div className="wrap help-layout" id="tab-help" hidden={activeTab !== 'help'}>
        {activeTab === 'help' && (
          <HelpPage onLaunchOnboarding={openOnboarding} />
        )}
      </div>

      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}
    </div>
  )
}
