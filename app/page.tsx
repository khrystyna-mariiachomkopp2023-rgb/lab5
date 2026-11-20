'use client'

import { useEffect, useState } from 'react'
import Dashboard from '@/components/dashboard'
import WorkflowEditor from '@/components/workflow-editor'
import { InviteDialog, PlanDialog, TemplatesDialog } from '@/components/editor-dialogs'

type Screen = 'editor' | 'dashboard'
type Overlay = 'invite' | 'plan' | 'templates' | null

export default function Page() {
  const [screen, setScreen] = useState<Screen>('editor')
  const [overlay, setOverlay] = useState<Overlay>(null)
  const [notice, setNotice] = useState('')
  const [boardTitle, setBoardTitle] = useState('Нова схема / Шлях користувача')

  useEffect(() => {
    function closeOverlay(event: KeyboardEvent) {
      if (event.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', closeOverlay)
    return () => window.removeEventListener('keydown', closeOverlay)
  }, [])

  function showNotice(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  function useTemplate(name: string) {
    setBoardTitle(`Нова схема / ${name}`)
    setScreen('editor')
    showNotice(`Шаблон «${name}» вибрано`)
  }

  return (
    <>
      {screen === 'dashboard' ? (
        <Dashboard
          onOpenEditor={() => { setBoardTitle('Нова схема / Шлях користувача'); setScreen('editor') }}
          onOpenPlan={() => setOverlay('plan')}
          onOpenInvite={() => setOverlay('invite')}
          onOpenTemplates={() => setOverlay('templates')}
          onNotice={showNotice}
        />
      ) : (
        <WorkflowEditor
          onGoHome={() => setScreen('dashboard')}
          onOpenTemplates={() => setOverlay('templates')}
          onInvite={() => setOverlay('invite')}
          boardTitle={boardTitle}
        />
      )}
      {notice && <div className="toast-message" role="status">{notice}</div>}
      {overlay === 'invite' && <InviteDialog onClose={() => setOverlay(null)} onNotice={showNotice} />}
      {overlay === 'plan' && <PlanDialog onClose={() => setOverlay(null)} onNotice={showNotice} />}
      {overlay === 'templates' && <TemplatesDialog onClose={() => setOverlay(null)} onSelectTemplate={useTemplate} />}
    </>
  )
}
