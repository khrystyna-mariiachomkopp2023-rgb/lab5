import './styles.css'

const app = document.querySelector('#app')
const templates = ['Блок-схема', 'Візуальна дорожня карта', 'Діаграма мозкового штурму', 'Бульбашкова карта', 'Маркетинг-мікс', 'Wireframe-діаграма', 'Архітектура системи', 'Карта емпатії', 'Мережева діаграма', 'Мозковий штурм', 'Матриця 2x2', 'Персона']
const categories = ['Усі шаблони', 'Преміум-шаблони', 'Нещодавно використані', 'Діаграми та моделювання', 'Інженерія та інфраструктура', 'Мозковий штурм і зустрічі', 'Планування та управління', 'Дослідження та дизайн']
const seedBoards = [
  { title: 'Нова схема', owner: 'Христина-Марія', updated: 'Щойно', kind: 'flow' },
  { title: 'Шлях користувача', owner: 'Марія', updated: '2 години тому', kind: 'journey' },
  { title: 'Архітектура', owner: 'Анна', updated: 'Учора', kind: 'architecture' },
  { title: 'Бізнес-процес', owner: 'Христина-Марія', updated: '3 дні тому', kind: 'process' },
]
const plans = [
  { name: 'Free', description: 'Для невеликих проєктів', monthly: 0, yearly: 0, action: 'Ваш поточний план', current: true, features: ['Необмежено учасників', '6 аркушів', 'Експорт лише в PNG', 'Редагування в реальному часі', 'Коментарі та чат', 'Режим стеження', 'Код у граф', 'Інструмент Kanban'] },
  { name: 'Pro', description: 'Для індивідуальних користувачів', monthly: 7, yearly: 6, action: 'Перейти на Pro', recommended: true, features: ['1 учасник', 'Необмежено аркушів', 'Різні формати експорту', 'Редагування в реальному часі', 'Відеочат у застосунку', 'Коментарі та чат', 'Історія версій', 'Режим стеження'] },
  { name: 'Team', description: 'Для команд до 1 000 осіб', monthly: 22, yearly: 18, action: 'Перейти на Team', features: ['До 1 000 учасників', 'Необмежено аркушів', 'Різні формати експорту', 'Редагування в реальному часі', 'Відеочат у застосунку', 'Коментарі та чат', 'Режим стеження', 'Індивідуальне навчання'] },
]

const state = {
  screen: 'editor',
  overlay: null,
  notice: '',
  boardTitle: 'Нова схема / Шлях користувача',
  boards: seedBoards,
  activeNav: 'Усі дошки',
  boardSearch: '',
  owner: 'Усі власники',
  pages: [{ name: 'Без назви', nodes: [
    { id: 1, label: 'Початок', shape: 'start' },
    { id: 2, label: 'Перевірка дизайну', shape: 'process' },
    { id: 3, label: 'Готово до публікації', shape: 'end' },
  ] }],
  activePage: 0,
  selectedId: 2,
  activeTab: 'Аркуші',
  zoom: 100,
  selectedTool: 'select',
  showSchema: false,
  graphSearch: '',
  commandSearch: '',
  templateSearch: '',
  activeCategory: 'Усі шаблони',
  yearly: true,
}

const esc = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const currentPage = () => state.pages[state.activePage]
const selectedNode = () => currentPage().nodes.find((node) => node.id === state.selectedId)

function showNotice(message) {
  state.notice = message
  render()
  window.clearTimeout(showNotice.timer)
  showNotice.timer = window.setTimeout(() => { state.notice = ''; render() }, 2100)
}

function openEditor(title = 'Нова схема / Шлях користувача') {
  state.screen = 'editor'
  state.boardTitle = title
  state.overlay = null
  render()
}

function addNode(shape = 'process', label) {
  const page = currentPage()
  const id = Date.now()
  const nextNode = { id, label: label || (shape === 'comment' ? 'Новий коментар' : 'Нова фігура'), shape }
  page.nodes.splice(Math.max(0, page.nodes.length - 1), 0, nextNode)
  state.selectedId = id
  state.selectedTool = 'select'
  render()
  showNotice(shape === 'comment' ? 'Коментар додано' : 'Фігуру додано')
}

function addPage() {
  state.pages.push({ name: 'Без назви', nodes: [] })
  state.activePage = state.pages.length - 1
  state.selectedId = null
  render()
}

function renderNode(node) {
  return `<button type="button" class="flow-node ${esc(node.shape)} ${state.selectedId === node.id ? 'selected' : ''}" data-action="select-node" data-id="${node.id}" title="Подвійне натискання — редагувати назву">${esc(node.label)}</button>`
}

function renderEditor() {
  const nodes = currentPage().nodes
  const filteredNodes = state.graphSearch ? nodes.filter((node) => node.label.toLowerCase().includes(state.graphSearch.toLowerCase())) : nodes
  const tools = [
    ['select', 'Вибрати · V'], ['shapes', 'Фігури'], ['templates', 'Шаблони'], ['images', 'Зображення'],
    ['text', 'Текст · T'], ['connect', 'З’єднати'], ['draw', 'Малювати'], ['comment', 'Коментар · C'], ['table', 'Таблиця'], ['more', 'Інші інструменти'],
  ]
  return `<main class="editor-shell">
    <header class="topbar">
      <button class="back-button" type="button" data-action="home">← Дошки</button>
      <div class="breadcrumb">Мої дошки <span>/</span> ${esc(state.boardTitle.replace('Нова схема / ', ''))}</div>
      <div class="top-actions"><span class="collaborators">Ви · Марія · Анна</span><button class="dark-button" type="button" data-action="invite">Поділитися</button><button class="outline-button show-schema" type="button" data-action="toggle-overview">${state.showSchema ? 'Сховати схему' : 'Показати схему'}</button></div>
    </header>
    <div class="workspace">
      <aside class="tool-rail" aria-label="Інструменти редактора">${tools.map(([key, label]) => `<button class="tool-button ${state.selectedTool === key ? 'active' : ''}" type="button" data-action="tool" data-tool="${key}" aria-pressed="${state.selectedTool === key}">${esc(label)}${key === 'select' ? '⌄' : ''}</button>`).join('')}</aside>
      <section class="editor-main" aria-label="Полотно схеми"><div class="editor-content">
        <div class="quick-tools"><button type="button" data-action="add-shape">Нова фігура</button><button type="button" data-action="add-arrow">Нова стрілка</button><button type="button" data-action="add-comment">Коментар</button><button type="button" data-action="graph-search">Пошук</button>${state.graphSearch !== null && state.graphSearch !== undefined && state.graphSearchOpen ? `<label class="search-popover"><span class="visually-hidden">Пошук на схемі</span><input data-input="graph-search" value="${esc(state.graphSearch)}" placeholder="Знайти на схемі" /></label>` : ''}</div>
        <p class="helper-text">Інструменти підписані ліворуч · часті дії над полотном · Пошук команд: Ctrl+K</p>
        <div class="canvas-board"><div class="board-heading">${esc(state.boardTitle)}</div>${state.showSchema ? '<span class="overview-pill">Огляд схеми</span>' : ''}<div class="flow-stage" role="group" aria-label="Етапи шляху користувача">${filteredNodes.length > 1 ? '<span class="flow-line" aria-hidden="true"></span>' : ''}${filteredNodes.map(renderNode).join('')}</div>${state.graphSearch && filteredNodes.length === 0 ? '<p class="empty-search">Нічого не знайдено</p>' : ''}<div class="board-save">Аркуш ${state.activePage + 1} · Щойно збережено</div></div>
        <div class="canvas-status"><span>Вибрано: ${esc(selectedNode()?.label || 'немає')} · ${selectedNode() ? '1 об’єкт' : '0 об’єктів'}</span><div class="zoom-control" aria-label="Масштаб полотна"><button type="button" data-action="zoom-out" aria-label="Зменшити масштаб">−</button><span>${state.zoom}%</span><button type="button" data-action="zoom-in" aria-label="Збільшити масштаб">+</button></div></div>
      </div></section>
      <aside class="right-panel" aria-label="Панель сторінок та обговорень"><div class="panel-tabs" role="tablist" aria-label="Панелі">${['Аркуші', 'Коментарі', 'Чат'].map((tab) => `<button type="button" role="tab" data-action="right-tab" data-tab="${tab}" aria-selected="${state.activeTab === tab}" class="${state.activeTab === tab ? 'active' : ''}">${tab}</button>`).join('')}</div>${renderRightPanel()}</aside>
    </div>
    <footer class="bottom-bar"><span>✓ Усі зміни збережено</span><span class="keyboard-help"><b>Пробіл</b> — рух полотна · <b>Ctrl+Z</b> — скасувати · <b>Ctrl+K</b> — знайти команду · <button type="button" class="text-button" data-action="help">Допомога</button></span></footer>
  </main>`
}

function renderRightPanel() {
  if (state.activeTab === 'Аркуші') return `<section class="pages-panel"><h2>Аркуші · ${state.pages.length}</h2><button class="add-page" type="button" data-action="add-page">+ Додати аркуш</button>${state.pages.map((page, index) => `<button class="page-card ${state.activePage === index ? 'active' : ''}" type="button" data-action="select-page" data-page="${index}" aria-pressed="${state.activePage === index}"><span class="page-thumbnail"><span class="mini-line"></span><span class="mini-node mini-start"></span><span class="mini-node mini-middle"></span><span class="mini-node mini-end"></span></span><span class="page-name">${esc(page.name)}</span><span class="page-number">${index + 1}</span></button>`).join('')}</section>`
  if (state.activeTab === 'Коментарі') return `<section class="discussion-panel"><h2>Коментарі</h2><div class="comment-entry"><span class="avatar">М</span><p><strong>Марія</strong><br />Чудовий початок схеми!</p></div><button class="discussion-action" type="button" data-action="add-comment">+ Додати коментар</button></section>`
  return `<section class="discussion-panel"><h2>Чат команди</h2><div class="chat-note">Марія та Анна працюють із вами над цією схемою.</div><input class="form-control chat-input" data-input="chat" placeholder="Написати повідомлення…" aria-label="Написати повідомлення" /></section>`
}

function renderDashboard() {
  const navigation = ['Усі дошки', 'Нещодавні', 'Мої дошки', 'Вибране', 'Архів']
  const suggested = ['Мозковий штурм', 'Матриця 2x2', 'Персона', 'Ментальна карта', 'Розбір дій']
  const visibleBoards = state.boards.filter((board) => board.title.toLowerCase().includes(state.boardSearch.toLowerCase()) && (state.owner === 'Усі власники' || state.owner === board.owner))
  return `<main class="dashboard-shell"><header class="dashboard-topbar"><button class="brand-wordmark" type="button" data-action="all-boards">cacoo</button><div class="dashboard-top-actions"><button class="btn btn-dark" type="button" data-action="plan">Оновити план</button><button class="btn btn-outline-dark" type="button" data-action="invite">Запросити учасників</button><span class="account-name">Христина-Марія</span></div></header>
    <div class="dashboard-body"><aside class="dashboard-sidebar" aria-label="Навігація по дошках"><button type="button" class="create-board-button" data-action="new-board">+ Створити дошку</button><nav class="board-navigation">${navigation.map((item) => `<button type="button" class="${state.activeNav === item ? 'nav-current' : ''}" data-action="nav" data-nav="${item}" aria-current="${state.activeNav === item ? 'page' : 'false'}">${item}</button>`).join('')}</nav><section class="folder-prompt"><h2>ПРИВАТНІ ПАПКИ</h2><p>Створіть приватну папку для особистих дошок.</p></section><section class="folder-prompt"><h2>СПІЛЬНІ ПАПКИ</h2><p>Створіть спільну папку для роботи з командою.</p></section></aside>
    <section class="dashboard-content"><section class="suggestions-panel"><div class="section-heading"><h1>Спробуйте шаблони Cacoo</h1><button type="button" data-action="templates">Усі шаблони</button></div><div class="suggestions-grid">${suggested.map((name, index) => `<button class="suggestion-card" type="button" data-action="templates"><span class="suggestion-art suggestion-art-${index}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span>${name}</span></button>`).join('')}</div></section>
    <section class="recent-section"><h2>${esc(state.activeNav === 'Усі дошки' ? 'Нещодавно переглянуті' : state.activeNav)}</h2><div class="board-filters"><label class="board-search"><span class="visually-hidden">Пошук дошок</span><input class="form-control" data-input="board-search" value="${esc(state.boardSearch)}" placeholder="Пошук дошок..." /></label><label class="owner-filter-wrap"><span class="visually-hidden">Фільтр за власником</span><select class="form-select owner-select" data-input="owner-filter"><option>Усі власники</option><option>Христина-Марія</option><option>Марія</option><option>Анна</option></select></label></div><div class="boards-grid">${visibleBoards.map((board) => `<button type="button" class="board-card" data-action="open-board" data-title="${esc(board.title)}"><span class="board-preview board-preview-${board.kind}" aria-hidden="true"><span class="preview-line"></span><i></i><i></i><i></i></span><span class="board-card-title">${esc(board.title)}</span><span class="board-card-meta">${esc(board.owner)} · ${esc(board.updated)}</span></button>`).join('')}${visibleBoards.length === 0 ? '<p class="boards-empty">Дошок не знайдено</p>' : ''}<button type="button" class="new-board-card" data-action="new-board"><span>+</span><strong>Створити дошку</strong></button></div></section></section></div><footer class="bottom-bar"><span>✓ Усі зміни збережено</span><span class="keyboard-help"><b>Ctrl+K</b> — пошук дошок · <b>N</b> — нова дошка · <b>Esc</b> — закрити вікно</span></footer></main>`
}

function renderDialog() {
  if (!state.overlay) return ''
  if (state.overlay === 'command') return renderCommandDialog()
  if (state.overlay === 'invite') return renderInviteDialog()
  if (state.overlay === 'plan') return renderPlanDialog()
  return renderTemplatesDialog()
}

function renderCommandDialog() {
  const commands = ['Нова фігура', 'Нова стрілка', 'Коментар', 'Пошук на схемі', 'Шаблони'].filter((command) => command.toLowerCase().includes(state.commandSearch.toLowerCase()))
  return `<div class="app-overlay command-overlay" data-action="backdrop"><section class="app-dialog command-dialog" role="dialog" aria-modal="true" aria-labelledby="command-title"><header class="dialog-header"><h2 id="command-title">Пошук команд (Ctrl+K)</h2><button type="button" class="icon-button" data-action="close-dialog" aria-label="Закрити">×</button></header><input class="command-input" data-input="command-search" value="${esc(state.commandSearch)}" placeholder="Наприклад: Нова фігура..." aria-label="Пошук команд" />${state.commandSearch ? `<div class="command-results">${commands.map((command) => `<button type="button" data-action="run-command" data-command="${command}">${command}</button>`).join('')}</div>` : ''}<p class="command-help">Enter — виконати · Esc — закрити</p></section></div>`
}

function renderInviteDialog() {
  return `<div class="app-overlay" data-action="backdrop"><section class="app-dialog invite-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-title"><header class="dialog-header"><h2 id="invite-title">Запросити учасників</h2><button class="icon-button" type="button" aria-label="Закрити" data-action="close-dialog">×</button></header><form data-form="invite"><p class="invite-intro">Додати з: <strong>Slack</strong> або <strong>Email</strong></p><div class="invite-fields"><label class="dialog-field"><span>Електронна адреса</span><input class="form-control" name="emails" placeholder="Введіть адресу" /></label><label class="dialog-field invite-role-field"><span>Роль</span><select class="form-select" name="role"><option>Учасник</option><option>Адміністратор</option><option>Перегляд</option></select></label></div><p class="field-hint">Можна ввести кілька адрес через кому</p><div class="invite-link-section"><label for="invite-link">Запросити за посиланням</label><div class="invite-link-row"><input class="form-control" id="invite-link" readonly value="https://apps.nulab.com/invite/abc123" /><button type="button" data-action="copy-link">Копіювати</button></div></div><footer class="dialog-footer"><button type="button" class="text-button" data-action="close-dialog">Скасувати</button><button type="submit" class="dark-button">Запросити</button></footer></form></section></div>`
}

function renderPlanDialog() {
  return `<div class="app-overlay" data-action="backdrop"><section class="app-dialog plan-dialog" role="dialog" aria-modal="true" aria-labelledby="plan-title"><header class="dialog-header"><h2 id="plan-title">Оновіть свій план</h2><button class="icon-button" type="button" aria-label="Закрити" data-action="close-dialog">×</button></header><div class="billing-toggle"><span>Щомісяця</span><button class="billing-switch ${state.yearly ? 'active' : ''}" type="button" role="switch" aria-checked="${state.yearly}" aria-label="Щорічна оплата" data-action="billing"><span></span></button><span>Щорічно</span><strong class="discount-badge">−16%</strong></div><div class="plan-grid">${plans.map((plan) => `<article class="plan-card ${plan.recommended ? 'recommended' : ''}">${plan.recommended ? '<div class="recommend-banner">★ Рекомендовано вам</div>' : ''}<div class="plan-body"><h3>${plan.name}</h3><p class="plan-description">${plan.description}</p><div class="plan-price">$${state.yearly ? plan.yearly : plan.monthly}</div><div class="plan-period">на місяць</div><button type="button" class="plan-action ${plan.recommended ? 'primary' : ''}" ${plan.current ? 'disabled' : ''} data-action="choose-plan" data-plan="${plan.name}">${plan.action}</button><ul class="plan-features">${plan.features.map((feature) => `<li>${feature}</li>`).join('')}</ul></div></article>`).join('')}</div></section></div>`
}

function renderTemplatesDialog() {
  const filtered = templates.filter((name) => name.toLowerCase().includes(state.templateSearch.toLowerCase()))
  return `<div class="app-overlay" data-action="backdrop"><section class="app-dialog templates-dialog" role="dialog" aria-modal="true" aria-labelledby="templates-title"><header class="dialog-header"><h2 id="templates-title">Шаблони</h2><button class="icon-button" type="button" aria-label="Закрити" data-action="close-dialog">×</button></header><div class="templates-layout"><aside class="template-categories"><input class="form-control" data-input="template-search" value="${esc(state.templateSearch)}" placeholder="Пошук шаблонів..." aria-label="Пошук шаблонів" />${categories.map((category, index) => `<button type="button" class="${state.activeCategory === category ? 'active' : ''} ${index === 3 ? 'category-heading' : ''}" data-action="category" data-category="${category}">${category}</button>`).join('')}</aside><section class="template-results"><h3>${state.templateSearch ? 'Результати пошуку' : state.activeCategory}</h3><div class="template-grid">${filtered.map((name, index) => `<button class="template-card" type="button" data-action="use-template" data-template="${name}"><span class="template-art template-art-${index % 3}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>${name}</span></button>`).join('')}${filtered.length ? '' : '<p class="no-templates">Шаблонів не знайдено</p>'}</div></section></div></section></div>`
}

function render() {
  app.innerHTML = `${state.screen === 'editor' ? renderEditor() : renderDashboard()}${renderDialog()}${state.notice ? `<div class="toast-message" role="status">${esc(state.notice)}</div>` : ''}`
  const ownerFilter = app.querySelector('[data-input="owner-filter"]')
  if (ownerFilter) ownerFilter.value = state.owner
  const focusSelector = state.overlay === 'command' ? '[data-input="command-search"]' : state.overlay === 'templates' ? '[data-input="template-search"]' : null
  if (focusSelector) app.querySelector(focusSelector)?.focus({ preventScroll: true })
}

function runCommand(command) {
  state.overlay = null
  state.commandSearch = ''
  if (command === 'Нова фігура') return addNode('process')
  if (command === 'Нова стрілка') return addNode('process', 'Новий крок')
  if (command === 'Коментар') return addNode('comment')
  if (command === 'Пошук на схемі') { state.graphSearchOpen = true; render(); return }
  if (command === 'Шаблони') { state.overlay = 'templates'; render(); return }
  render()
}

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]')
  if (!button) return
  const { action } = button.dataset
  if (action === 'backdrop' && event.target === button) { state.overlay = null; render(); return }
  if (action === 'close-dialog') { state.overlay = null; render(); return }
  if (action === 'home') { state.screen = 'dashboard'; state.overlay = null; render(); return }
  if (action === 'new-board') { state.boards.unshift({ title: 'Нова схема', owner: 'Христина-Марія', updated: 'Щойно', kind: 'flow' }); return openEditor() }
  if (action === 'open-board') return openEditor(`Нова схема / ${button.dataset.title}`)
  if (action === 'all-boards') { state.activeNav = 'Усі дошки'; render(); return }
  if (action === 'nav') { state.activeNav = button.dataset.nav; render(); return }
  if (action === 'plan') { state.overlay = 'plan'; render(); return }
  if (action === 'invite') { state.overlay = 'invite'; render(); return }
  if (action === 'templates') { state.overlay = 'templates'; state.templateSearch = ''; render(); return }
  if (action === 'add-page') return addPage()
  if (action === 'select-page') { state.activePage = Number(button.dataset.page); state.selectedId = null; render(); return }
  if (action === 'right-tab') { state.activeTab = button.dataset.tab; render(); return }
  if (action === 'toggle-overview') { state.showSchema = !state.showSchema; render(); return }
  if (action === 'add-shape' || (action === 'tool' && button.dataset.tool === 'shapes')) return addNode('process')
  if (action === 'add-arrow') return addNode('process', 'Новий крок')
  if (action === 'add-comment' || (action === 'tool' && button.dataset.tool === 'comment')) return addNode('comment')
  if (action === 'tool') {
    const tool = button.dataset.tool
    state.selectedTool = tool
    if (tool === 'templates') { state.overlay = 'templates'; render(); return }
    if (tool === 'text') return addNode('process', 'Текст')
    if (tool === 'connect') return showNotice('Оберіть дві фігури, щоб з’єднати їх')
    if (tool === 'images') return showNotice('Перетягніть зображення на полотно')
    if (tool === 'draw' || tool === 'table' || tool === 'more') return showNotice('Інструмент вибрано')
    render(); return
  }
  if (action === 'select-node') { state.selectedId = Number(button.dataset.id); render(); return }
  if (action === 'graph-search') { state.graphSearchOpen = !state.graphSearchOpen; state.graphSearch = ''; render(); return }
  if (action === 'zoom-in') { state.zoom = Math.min(200, state.zoom + 10); render(); return }
  if (action === 'zoom-out') { state.zoom = Math.max(25, state.zoom - 10); render(); return }
  if (action === 'billing') { state.yearly = !state.yearly; render(); return }
  if (action === 'choose-plan') { const plan = button.dataset.plan; state.overlay = null; showNotice(`План ${plan} вибрано`); return }
  if (action === 'copy-link') { navigator.clipboard?.writeText('https://apps.nulab.com/invite/abc123').catch(() => {}); showNotice('Посилання скопійовано'); return }
  if (action === 'category') { state.activeCategory = button.dataset.category; render(); return }
  if (action === 'use-template') { state.boardTitle = `Нова схема / ${button.dataset.template}`; state.overlay = null; state.screen = 'editor'; showNotice(`Шаблон «${button.dataset.template}» вибрано`); return }
  if (action === 'help') showNotice('Довідка з клавіатурних скорочень')
  if (action === 'run-command') runCommand(button.dataset.command)
})

app.addEventListener('input', (event) => {
  const input = event.target
  if (input.matches('[data-input="board-search"]')) {
    state.boardSearch = input.value
    const position = input.selectionStart
    render()
    const next = app.querySelector('[data-input="board-search"]')
    next?.focus({ preventScroll: true })
    next?.setSelectionRange(position, position)
  }
  if (input.matches('[data-input="command-search"]')) {
    state.commandSearch = input.value
    const position = input.selectionStart
    render()
    const next = app.querySelector('[data-input="command-search"]')
    next?.focus({ preventScroll: true })
    next?.setSelectionRange(position, position)
  }
  if (input.matches('[data-input="template-search"]')) {
    state.templateSearch = input.value
    const position = input.selectionStart
    render()
    const next = app.querySelector('[data-input="template-search"]')
    next?.focus({ preventScroll: true })
    next?.setSelectionRange(position, position)
  }
  if (input.matches('[data-input="graph-search"]')) {
    state.graphSearch = input.value
    const position = input.selectionStart
    render()
    const next = app.querySelector('[data-input="graph-search"]')
    next?.focus({ preventScroll: true })
    next?.setSelectionRange(position, position)
  }
})

app.addEventListener('change', (event) => {
  if (event.target.matches('[data-input="owner-filter"]')) { state.owner = event.target.value; render() }
})

app.addEventListener('dblclick', (event) => {
  const button = event.target.closest('[data-action="select-node"]')
  if (!button) return
  const node = currentPage().nodes.find((item) => item.id === Number(button.dataset.id))
  if (!node) return
  const input = document.createElement('input')
  input.value = node.label
  input.className = `flow-node ${node.shape} selected`
  input.setAttribute('aria-label', 'Назва етапу')
  button.replaceWith(input)
  input.focus()
  input.select()
  const finish = () => { node.label = input.value.trim() || node.label; render() }
  input.addEventListener('blur', finish, { once: true })
  input.addEventListener('keydown', (keyEvent) => { if (keyEvent.key === 'Enter') input.blur() })
})

app.addEventListener('submit', (event) => {
  if (event.target.matches('[data-form="invite"]')) {
    event.preventDefault()
    const email = new FormData(event.target).get('emails')?.toString().trim()
    state.overlay = null
    showNotice(email ? 'Запрошення надіслано' : 'Посилання готове для команди')
  }
})

app.addEventListener('keydown', (event) => {
  if (event.target.matches('[data-input="command-search"]') && event.key === 'Enter' && !event.isComposing && event.keyCode !== 229) {
    const command = ['Нова фігура', 'Нова стрілка', 'Коментар', 'Пошук на схемі', 'Шаблони'].find((item) => item.toLowerCase().includes(state.commandSearch.toLowerCase()))
    if (command) { event.preventDefault(); runCommand(command) }
  }
})

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    if (state.screen === 'dashboard') {
      document.querySelector('[data-input="board-search"]')?.focus()
      return
    }
    state.overlay = 'command'
    state.commandSearch = ''
    render()
  }
  if (event.key === 'Escape' && state.overlay) { state.overlay = null; state.commandSearch = ''; render() }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)
  if (!typing && state.screen === 'dashboard' && event.key.toLowerCase() === 'n') { state.boards.unshift({ title: 'Нова схема', owner: 'Христина-Марія', updated: 'Щойно', kind: 'flow' }); openEditor() }
})

render()
