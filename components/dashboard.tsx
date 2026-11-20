'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, ChevronDown, Star, Clock3, Archive, LayoutGrid } from 'lucide-react'

const boards = [
  { title: 'Нова схема', owner: 'Христина-Марія', updated: 'Щойно', kind: 'flow' },
  { title: 'Шлях користувача', owner: 'Марія', updated: '2 години тому', kind: 'journey' },
  { title: 'Архітектура', owner: 'Анна', updated: 'Учора', kind: 'architecture' },
  { title: 'Бізнес-процес', owner: 'Христина-Марія', updated: '3 дні тому', kind: 'process' },
]
const suggestedTemplates = ['Мозковий штурм', 'Матриця 2x2', 'Персона', 'Ментальна карта', 'Розбір дій']
const navigation = [
  { label: 'Усі дошки', icon: LayoutGrid },
  { label: 'Нещодавні', icon: Clock3 },
  { label: 'Мої дошки', icon: LayoutGrid },
  { label: 'Вибране', icon: Star },
  { label: 'Архів', icon: Archive },
]

type DashboardProps = {
  onOpenEditor: () => void
  onOpenPlan: () => void
  onOpenInvite: () => void
  onOpenTemplates: () => void
  onNotice: (message: string) => void
}

export default function Dashboard({ onOpenEditor, onOpenPlan, onOpenInvite, onOpenTemplates, onNotice }: DashboardProps) {
  const [activeNav, setActiveNav] = useState('Усі дошки')
  const [search, setSearch] = useState('')
  const [owner, setOwner] = useState('Усі власники')
  const visibleBoards = useMemo(() => boards.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()) && (owner === 'Усі власники' || board.owner === owner)), [search, owner])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT'
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document.querySelector<HTMLInputElement>('.board-search input')?.focus()
      }
      if (event.key.toLowerCase() === 'n' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) onOpenEditor()
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [onOpenEditor])

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <button type="button" className="brand-wordmark" onClick={() => setActiveNav('Усі дошки')}>cacoo</button>
        <div className="dashboard-top-actions">
          <button type="button" className="dashboard-dark-button" onClick={onOpenPlan}>Оновити план</button>
          <button type="button" className="dashboard-outline-button" onClick={onOpenInvite}>Запросити учасників</button>
          <span className="account-name">Христина-Марія</span>
        </div>
      </header>
      <div className="dashboard-body">
        <aside className="dashboard-sidebar" aria-label="Навігація по дошках">
          <button type="button" className="create-board-button" onClick={onOpenEditor}><Plus /> Створити дошку</button>
          <nav className="board-navigation">
            {navigation.map(({ label, icon: Icon }) => <button key={label} type="button" className={activeNav === label ? 'nav-current' : ''} aria-current={activeNav === label ? 'page' : undefined} onClick={() => setActiveNav(label)}><Icon />{label}</button>)}
          </nav>
          <section className="folder-prompt"><h2>ПРИВАТНІ ПАПКИ</h2><p>Створіть приватну папку для особистих дошок.</p></section>
          <section className="folder-prompt"><h2>СПІЛЬНІ ПАПКИ</h2><p>Створіть спільну папку для роботи з командою.</p></section>
        </aside>
        <section className="dashboard-content">
          <section className="suggestions-panel" aria-labelledby="suggestions-title">
            <div className="section-heading"><h1 id="suggestions-title">Спробуйте шаблони Cacoo</h1><button type="button" onClick={onOpenTemplates}>Усі шаблони</button></div>
            <div className="suggestions-grid">
              {suggestedTemplates.map((template, index) => <button className="suggestion-card" key={template} type="button" onClick={onOpenTemplates}><span className={`suggestion-art suggestion-art-${index}`} aria-hidden="true"><i /><i /><i /><i /><i /></span><span>{template}</span></button>)}
            </div>
          </section>
          <section className="recent-section" aria-labelledby="recent-title">
            <h2 id="recent-title">{activeNav === 'Усі дошки' ? 'Нещодавно переглянуті' : activeNav}</h2>
            <div className="board-filters">
              <label className="board-search"><Search aria-hidden="true" /><span className="sr-only">Пошук дошок</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Пошук дошок..." /></label>
              <label className="owner-select"><span className="sr-only">Фільтр за власником</span><select value={owner} onChange={(event) => setOwner(event.target.value)}><option>Усі власники</option><option>Христина-Марія</option><option>Марія</option><option>Анна</option></select><ChevronDown aria-hidden="true" /></label>
            </div>
            <div className="boards-grid">
              {visibleBoards.map((board) => <button type="button" key={board.title} className="board-card" onClick={onOpenEditor}>
                <span className={`board-preview board-preview-${board.kind}`} aria-hidden="true"><span className="preview-line" /><i /><i /><i /></span>
                <span className="board-card-title">{board.title}</span>
                <span className="board-card-meta">{board.owner} · {board.updated}</span>
              </button>)}
              {visibleBoards.length === 0 && <div className="boards-empty">Дошок не знайдено</div>}
              <button type="button" className="new-board-card" onClick={onOpenEditor}><span><Plus /></span><strong>Створити дошку</strong></button>
            </div>
          </section>
          <button type="button" className="dashboard-help" onClick={() => onNotice('Довідка Cacoo')}>Довідка та поради</button>
        </section>
      </div>
      <footer className="bottom-bar"><span>✓ Усі зміни збережено</span><span className="keyboard-help"><b>Ctrl+K</b> — пошук дошок · <b>N</b> — нова дошка · <b>Esc</b> — закрити вікно</span></footer>
    </main>
  )
}
