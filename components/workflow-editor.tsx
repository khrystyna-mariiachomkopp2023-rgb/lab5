'use client'

import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Image as ImageIcon,
  MessageSquare,
  Minus,
  MousePointer2,
  Plus,
  Search,
  Share2,
  Shapes,
  Table2,
  Type,
  X,
} from 'lucide-react'

type NodeShape = 'start' | 'process' | 'end' | 'comment'
type FlowNode = { id: number; label: string; shape: NodeShape }

const tools = [
  { label: 'Вибрати · V', icon: MousePointer2, key: 'select' },
  { label: 'Фігури', icon: Shapes, key: 'shapes' },
  { label: 'Шаблони', icon: Copy, key: 'templates' },
  { label: 'Зображення', icon: ImageIcon, key: 'images' },
  { label: 'Текст · T', icon: Type, key: 'text' },
  { label: "З’єднати", icon: ArrowRight, key: 'connect' },
  { label: 'Малювати', icon: ArrowDown, key: 'draw' },
  { label: 'Коментар · C', icon: MessageSquare, key: 'comment' },
  { label: 'Таблиця', icon: Table2, key: 'table' },
  { label: 'Інші інструменти', icon: Plus, key: 'more' },
]

export default function WorkflowEditor() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: 1, label: 'Початок', shape: 'start' },
    { id: 2, label: 'Перевірка дизайну', shape: 'process' },
    { id: 3, label: 'Готово до публікації', shape: 'end' },
  ])
  const [selectedId, setSelectedId] = useState(2)
  const [selectedTool, setSelectedTool] = useState('select')
  const [activeTab, setActiveTab] = useState('Аркуші')
  const [zoom, setZoom] = useState(100)
  const [pageCount, setPageCount] = useState(1)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [showSchema, setShowSchema] = useState(false)
  const [notice, setNotice] = useState('')

  const selectedNode = nodes.find((node) => node.id === selectedId)
  const visibleNodes = useMemo(() => {
    if (!search.trim()) return nodes
    return nodes.filter((node) => node.label.toLowerCase().includes(search.toLowerCase()))
  }, [nodes, search])

  function addNode(shape: NodeShape, label?: string) {
    const id = Date.now()
    const fallback = shape === 'comment' ? 'Новий коментар' : 'Нова фігура'
    setNodes((current) => [...current.slice(0, -1), { id, label: label ?? fallback, shape }, current[current.length - 1]])
    setSelectedId(id)
    setSelectedTool('select')
    setNotice(shape === 'comment' ? 'Коментар додано' : 'Фігуру додано')
    window.setTimeout(() => setNotice(''), 1800)
  }

  function addStep() {
    const id = Date.now()
    const next = { id, label: 'Новий крок', shape: 'process' as const }
    setNodes((current) => [...current.slice(0, -1), next, current[current.length - 1]])
    setSelectedId(id)
    setEditingId(id)
  }

  function updateNode(id: number, label: string) {
    setNodes((current) => current.map((node) => (node.id === id ? { ...node, label } : node)))
  }

  function handleTool(key: string) {
    setSelectedTool(key)
    if (key === 'comment') addNode('comment')
    if (key === 'shapes') addNode('process')
    if (key === 'text') addNode('process', 'Текст')
    if (key === 'connect') setNotice('Оберіть дві фігури, щоб з’єднати їх')
    if (key === 'templates') setNotice('Шаблони скоро з’являться')
    if (key === 'images') setNotice('Перетягніть зображення на полотно')
    if (key === 'draw' || key === 'table' || key === 'more') setNotice('Інструмент вибрано')
    window.setTimeout(() => setNotice(''), 1800)
  }

  return (
    <main className="editor-shell">
      <header className="topbar">
        <button className="back-button" type="button" onClick={() => setNotice('Повернення до дошок')}>
          <ArrowLeft aria-hidden="true" /> <span>Дошки</span>
        </button>
        <div className="breadcrumb">Мої дошки <span>/</span> Нова схема</div>
        <div className="top-actions">
          <span className="collaborators">Ви · Марія · Анна</span>
          <button className="share-button" type="button" onClick={() => setShareOpen(true)}>
            <Share2 aria-hidden="true" /> Поділитися
          </button>
          <button className="show-schema" type="button" onClick={() => setShowSchema((value) => !value)}>
            {showSchema ? 'Сховати схему' : 'Показати схему'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="tool-rail" aria-label="Інструменти редактора">
          {tools.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              type="button"
              className={`tool-button ${selectedTool === key ? 'tool-active' : ''}`}
              onClick={() => handleTool(key)}
              aria-pressed={selectedTool === key}
            >
              <Icon aria-hidden="true" /> <span>{label}</span>
              {key === 'select' && <ChevronDown className="tool-chevron" aria-hidden="true" />}
            </button>
          ))}
        </aside>

        <section className="editor-main" aria-label="Полотно схеми">
          <div className="editor-content">
            <div className="quick-tools">
              <button type="button" onClick={() => addNode('process')}>Нова фігура</button>
              <button type="button" onClick={addStep}>Нова стрілка</button>
              <button type="button" onClick={() => addNode('comment')}>Коментар</button>
              <button type="button" onClick={() => setSearchOpen((value) => !value)}>
                <Search aria-hidden="true" /> Пошук
              </button>
              {searchOpen && (
                <label className="search-field">
                  <span className="sr-only">Пошук фігур</span>
                  <Search aria-hidden="true" />
                  <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Знайти на схемі" />
                  <button type="button" aria-label="Закрити пошук" onClick={() => { setSearch(''); setSearchOpen(false) }}><X /></button>
                </label>
              )}
            </div>
            <p className="helper-text">Інструменти підписані літерою · часті дії над полотном · Пошук команд: Ctrl+K</p>

            <div className={`canvas-board ${showSchema ? 'canvas-focused' : ''}`}>
              <div className="board-heading">Нова схема / Шлях користувача</div>
              {showSchema && <span className="overview-pill">Огляд схеми</span>}
              <div className="flow-stage" role="group" aria-label="Етапи шляху користувача">
                <div className="flow-line" aria-hidden="true" />
                {visibleNodes.map((node) => (
                  <div className="flow-item" key={node.id}>
                    {editingId === node.id ? (
                      <input
                        className={`flow-node node-${node.shape} node-selected`}
                        aria-label="Назва етапу"
                        autoFocus
                        value={node.label}
                        onChange={(event) => updateNode(node.id, event.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(event) => { if (event.key === 'Enter') setEditingId(null) }}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`flow-node node-${node.shape} ${selectedId === node.id ? 'node-selected' : ''}`}
                        onClick={() => setSelectedId(node.id)}
                        onDoubleClick={() => setEditingId(node.id)}
                        aria-pressed={selectedId === node.id}
                        title="Подвійне натискання — редагувати назву"
                      >
                        {node.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {visibleNodes.length === 0 && <p className="empty-search">Нічого не знайдено</p>}
              <div className="board-save">Аркуш {pageCount} · Щойно збережено</div>
            </div>

            <div className="canvas-status">
              <span>Вибрано: {selectedNode?.label ?? 'немає'} · {selectedNode ? '1 об’єкт' : '0 об’єктів'}</span>
              <div className="zoom-control" aria-label="Масштаб полотна">
                <button type="button" aria-label="Зменшити масштаб" onClick={() => setZoom((value) => Math.max(25, value - 10))}><Minus /></button>
                <span>{zoom}%</span>
                <button type="button" aria-label="Збільшити масштаб" onClick={() => setZoom((value) => Math.min(200, value + 10))}><Plus /></button>
              </div>
            </div>
          </div>
        </section>

        <aside className="right-panel" aria-label="Панель сторінок та обговорень">
          <div className="panel-tabs" role="tablist" aria-label="Панелі">
            {['Аркуші', 'Коментарі', 'Чат'].map((tab) => (
              <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} type="button">{tab}</button>
            ))}
          </div>
          {activeTab === 'Аркуші' ? (
            <div className="pages-panel">
              <h2>Аркуші · {pageCount}</h2>
              <button className="add-page" type="button" onClick={() => setPageCount((count) => count + 1)}><Plus /> Додати аркуш</button>
              <button className="page-card" type="button" aria-label={`Відкрити аркуш ${pageCount}`}>
                <span className="page-thumbnail">
                  <span className="thumbnail-line" />
                  <span className="thumbnail-node thumbnail-node-start" />
                  <span className="thumbnail-node thumbnail-node-mid" />
                  <span className="thumbnail-node thumbnail-node-end" />
                </span>
                <span className="page-name">Без назви</span>
                <span className="page-number">{pageCount}</span>
              </button>
            </div>
          ) : activeTab === 'Коментарі' ? (
            <div className="discussion-panel">
              <h2>Коментарі</h2>
              <div className="comment-entry"><span className="avatar">М</span><p><strong>Марія</strong><br />Чудовий початок схеми!</p></div>
              <button type="button" className="discussion-action" onClick={() => addNode('comment')}>+ Додати коментар</button>
            </div>
          ) : (
            <div className="discussion-panel">
              <h2>Чат команди</h2>
              <div className="chat-note">Марія та Анна працюють із вами над цією схемою.</div>
              <label className="chat-input-label"><span className="sr-only">Написати повідомлення</span><input placeholder="Написати повідомлення…" onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) { setNotice('Повідомлення надіслано'); event.currentTarget.value = '' } }} /></label>
            </div>
          )}
        </aside>
      </div>

      <footer className="bottom-bar">
        <span><Check aria-hidden="true" /> Усі зміни збережено</span>
        <span className="keyboard-help"><b>Пробіл</b> — рух полотна · <b>Ctrl+Z</b> — скасувати · <b>Ctrl+K</b> — знайти команду · <button type="button" onClick={() => setNotice('Довідка з клавіатурних скорочень')}>Допомога</button><CircleHelp aria-hidden="true" /></span>
      </footer>

      {notice && <div className="toast-message" role="status">{notice}</div>}
      {shareOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareOpen(false) }}>
          <section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <button className="modal-close" type="button" aria-label="Закрити" onClick={() => setShareOpen(false)}><X /></button>
            <h2 id="share-title">Поділитися схемою</h2>
            <p>Запросіть команду до спільної роботи над схемою.</p>
            <div className="share-link"><span>board.app/s/нова-схема</span><button type="button" onClick={() => { setShareOpen(false); setNotice('Посилання скопійовано') }}>Копіювати</button></div>
            <button className="share-confirm" type="button" onClick={() => setShareOpen(false)}>Готово</button>
          </section>
        </div>
      )}
    </main>
  )
}
