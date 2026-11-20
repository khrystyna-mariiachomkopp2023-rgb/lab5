'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Star, X } from 'lucide-react'

type DialogProps = { onClose: () => void; onNotice: (message: string) => void }

function DialogFrame({ title, children, className = '', onClose }: { title: string; children: ReactNode; className?: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`app-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
        <header className="app-dialog-header">
          <h2 id="app-dialog-title">{title}</h2>
          <button className="modal-close" type="button" aria-label="Закрити" onClick={onClose}><X /></button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function InviteDialog({ onClose, onNotice }: DialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Учасник')
  const inviteLink = 'https://apps.nulab.com/invite/abc123'

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(inviteLink)
    } catch {
      // Clipboard permissions can be unavailable in preview frames; keep the confirmation actionable.
    }
    onNotice('Посилання скопійовано')
  }

  return (
    <DialogFrame title="Запросити учасників" className="invite-dialog" onClose={onClose}>
      <form className="invite-form" onSubmit={(event) => { event.preventDefault(); onClose(); onNotice(email.trim() ? 'Запрошення надіслано' : 'Посилання готове для команди') }}>
        <p className="invite-intro">Додати з: <strong>Slack</strong> або <strong>Email</strong></p>
        <div className="invite-fields">
          <label className="dialog-field invite-email-field">
            <span>Електронна адреса</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault() }} placeholder="Введіть адресу" type="text" />
          </label>
          <label className="dialog-field invite-role-field">
            <span>Роль</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Учасник</option>
              <option>Адміністратор</option>
              <option>Перегляд</option>
            </select>
          </label>
        </div>
        <p className="field-hint">Можна ввести кілька адрес через кому</p>
        <div className="invite-link-section">
          <label htmlFor="invite-link">Запросити за посиланням</label>
          <div className="invite-link-row">
            <input id="invite-link" readOnly value={inviteLink} />
            <button type="button" onClick={copyLink}>Копіювати</button>
          </div>
        </div>
        <footer className="dialog-footer">
          <button type="button" className="text-button" onClick={onClose}>Скасувати</button>
          <button type="submit" className="dark-button">Запросити</button>
        </footer>
      </form>
    </DialogFrame>
  )
}

const plans = [
  { name: 'Free', description: 'Для невеликих проєктів', monthly: 0, yearly: 0, action: 'Ваш поточний план', current: true, features: ['Необмежено учасників', '6 аркушів', 'Експорт лише в PNG', 'Редагування в реальному часі', 'Коментарі та чат', 'Режим стеження', 'Код у граф', 'Інструмент Kanban'] },
  { name: 'Pro', description: 'Для індивідуальних користувачів', monthly: 7, yearly: 6, action: 'Перейти на Pro', recommended: true, features: ['1 учасник', 'Необмежено аркушів', 'Різні формати експорту', 'Редагування в реальному часі', 'Відеочат у застосунку', 'Коментарі та чат', 'Історія версій', 'Режим стеження'] },
  { name: 'Team', description: 'Для команд до 1 000 осіб', monthly: 22, yearly: 18, action: 'Перейти на Team', features: ['До 1 000 учасників', 'Необмежено аркушів', 'Різні формати експорту', 'Редагування в реальному часі', 'Відеочат у застосунку', 'Коментарі та чат', 'Режим стеження', 'Індивідуальне навчання'] },
]

export function PlanDialog({ onClose, onNotice }: DialogProps) {
  const [yearly, setYearly] = useState(true)
  return (
    <DialogFrame title="Оновіть свій план" className="plan-dialog" onClose={onClose}>
      <div className="billing-toggle"><span className={!yearly ? 'billing-active' : ''}>Щомісяця</span><button type="button" role="switch" aria-checked={yearly} aria-label="Щорічна оплата" className={`switch ${yearly ? 'switch-on' : ''}`} onClick={() => setYearly((value) => !value)}><span /></button><span className={yearly ? 'billing-active' : ''}>Щорічно</span><strong>−16%</strong></div>
      <div className="plan-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${plan.recommended ? 'plan-recommended' : ''}`} key={plan.name}>
            {plan.recommended && <div className="recommend-banner"><Star aria-hidden="true" /> Рекомендовано вам</div>}
            <div className="plan-card-body">
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-price">${yearly ? plan.yearly : plan.monthly}</div>
              <div className="plan-period">на місяць</div>
              <button type="button" className={`plan-action ${plan.current ? 'plan-current' : ''} ${plan.recommended ? 'plan-action-dark' : ''}`} disabled={plan.current} onClick={() => { onClose(); onNotice(`План ${plan.name} вибрано`) }}>{plan.action}</button>
              <ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </DialogFrame>
  )
}

const templateNames = ['Блок-схема', 'Візуальна дорожня карта', 'Діаграма мозкового штурму', 'Бульбашкова карта', 'Маркетинг-мікс', 'Wireframe-діаграма', 'Архітектура системи', 'Карта емпатії', 'Мережева діаграма', 'Мозковий штурм', 'Матриця 2x2', 'Персона']
const templateGroups = ['Усі шаблони', 'Преміум-шаблони', 'Нещодавно використані', 'Діаграми та моделювання', 'Інженерія та інфраструктура', 'Мозковий штурм і зустрічі', 'Планування та управління', 'Дослідження та дизайн']

export function TemplatesDialog({ onClose, onSelectTemplate }: { onClose: () => void; onSelectTemplate: (name: string) => void }) {
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState(templateGroups[0])
  const filtered = useMemo(() => templateNames.filter((name) => name.toLowerCase().includes(query.toLowerCase())), [query])
  return (
    <DialogFrame title="Шаблони" className="templates-dialog" onClose={onClose}>
      <div className="templates-layout">
        <aside className="template-categories">
          <label className="template-search"><span className="sr-only">Пошук шаблонів</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Пошук шаблонів..." /></label>
          {templateGroups.map((group, index) => <button key={group} className={`${activeGroup === group ? 'category-active' : ''} ${index === 3 ? 'category-heading' : ''}`} type="button" onClick={() => setActiveGroup(group)}>{group}</button>)}
        </aside>
        <section className="template-results">
          <h3>{query ? 'Результати пошуку' : activeGroup}</h3>
          <div className="template-grid">
            {filtered.map((name, index) => <button className="template-card" key={name} type="button" onClick={() => { onClose(); onSelectTemplate(name) }}><span className={`template-art template-art-${index % 4}`} aria-hidden="true"><i /><i /><i /><i /></span><span>{name}</span></button>)}
            {filtered.length === 0 && <p className="no-templates">Шаблонів не знайдено</p>}
          </div>
        </section>
      </div>
    </DialogFrame>
  )
}
