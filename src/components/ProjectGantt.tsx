import { Box, Button, Field, Heading, HStack, Input, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, DownloadIcon, DragHandleDots2Icon, UploadIcon } from '@radix-ui/react-icons'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { getUsers, usersKey } from '../api/board'
import { addDays, adjustPeriod, dayNumber, demoCalendar, historySegments, localDay, monday, movePeriod, parseCalendar, validPeriod, type CalendarCard, type CalendarData, type CalendarSnapshot, type CalendarStore, type PlannedPeriod } from '../calendar/calendar'
import type { BoardData, CardData } from '../types/board'
import type { UserData } from '../types/user'
import type { CardDragItem } from './CardDragPreview'
import './ProjectGantt.css'

const dayWidth = 40
const visibleDays = 28
const statusColors: Record<string, string> = { 'sprint-backlog': '#64748b', doing: '#2563eb', review: '#b45309', done: '#15803d' }
const otherColors = ['#64748b', '#2563eb', '#b45309', '#15803d', '#9333ea', '#be185d']
function colorFor(id: string) {
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return statusColors[id] ?? otherColors[hash % otherColors.length]
}
function formatDay(value: string) {
  return new Date(dayNumber(value) * 86_400_000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}
function formatTime(value: string) {
  return new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}
function timelinePosition(value: string, start: string) {
  const date = new Date(value)
  return (dayNumber(localDay(date)) - dayNumber(start) + (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 86_400) * dayWidth
}

function PlanningSource({ card, disabled }: { card: CardData; disabled: boolean }) {
  const element = useRef<HTMLDivElement>(null)
  const handle = useRef<HTMLButtonElement | null>(null)
  const [{ dragging }, drag, preview] = useDrag<CardDragItem, { moved: boolean }, { dragging: boolean }>(() => ({
    type: 'CARD', canDrag: !disabled,
    item: () => {
      const rect = element.current!.getBoundingClientRect()
      const grip = handle.current!.getBoundingClientRect()
      return { cardId: card.id, width: rect.width, offset: { x: rect.left - grip.left, y: rect.top - grip.top } }
    },
    collect: (monitor) => ({ dragging: monitor.isDragging() }),
  }), [card.id, disabled])
  useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }) }, [preview])
  return <div ref={element} className="gantt-source" style={{ opacity: dragging ? .5 : 1 }}>
    <div><strong title={card.title}>{card.title}</strong></div>
    <button ref={(node) => { handle.current = node; drag(node) }} type="button" disabled={disabled} aria-label={`Glisser ${card.title} sur le calendrier`} title="Glisser sur un jour"><DragHandleDots2Icon aria-hidden="true" /></button>
  </div>
}

function DateEditor({ card, period, disabled, onSave, onRemove }: { card: CardData; period: PlannedPeriod | null; disabled: boolean; onSave: (period: PlannedPeriod) => void; onRemove: () => void }) {
  const [start, setStart] = useState(period?.start ?? localDay())
  const [end, setEnd] = useState(period?.end ?? addDays(localDay(), 6))
  const valid = validPeriod({ start, end })
  return <Box as="form" onSubmit={(event) => { event.preventDefault(); if (valid && !disabled) onSave({ start, end }) }} className="gantt-date-editor">
    <Field.Root><Field.Label htmlFor="gantt-start">Début</Field.Label><Input id="gantt-start" type="date" value={start} min="1000-01-01" max={end || '9999-12-31'} disabled={disabled} onChange={(event) => setStart(event.target.value)} required /></Field.Root>
    <Field.Root><Field.Label htmlFor="gantt-end">Fin incluse</Field.Label><Input id="gantt-end" type="date" value={end} min={start || '1000-01-01'} max="9999-12-31" disabled={disabled} onChange={(event) => setEnd(event.target.value)} required /></Field.Root>
    <Button type="submit" size="sm" colorPalette="blue" disabled={disabled || !valid} aria-label={`Enregistrer les dates de ${card.title}`}>{period ? 'Appliquer les dates' : 'Planifier'}</Button>
    <Button type="button" size="sm" variant="ghost" disabled={disabled || !period} onClick={onRemove}>Retirer du planning</Button>
    {!valid && <Text role="alert" color="fg.error" fontSize="sm">La fin doit être égale ou postérieure au début.</Text>}
  </Box>
}

function PlannedBar({ card, period, start, disabled, onSave, onSelect, onPreview }: { card: CardData; period: PlannedPeriod; start: string; disabled: boolean; onSave: (period: PlannedPeriod) => boolean; onSelect: () => void; onPreview: (message: string) => void }) {
  const [draft, setDraft] = useState<PlannedPeriod | null>(null)
  const drag = useRef<{ x: number; period: PlannedPeriod; mode: 'move' | 'start' | 'end'; days: number } | null>(null)
  const shown = draft ?? period
  const left = (dayNumber(shown.start) - dayNumber(start)) * dayWidth
  const right = (dayNumber(shown.end) - dayNumber(start) + 1) * dayWidth
  if (right <= 0 || left >= visibleDays * dayWidth) return <span className="gantt-outside">Période hors de ces quatre semaines</span>
  const describe = (value: PlannedPeriod) => `${card.title} : du ${formatDay(value.start)} au ${formatDay(value.end)} (${dayNumber(value.end) - dayNumber(value.start) + 1} jours).`
  function begin(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return
    const target = event.target as HTMLElement
    if (!(target instanceof HTMLButtonElement)) return
    const mode = target.dataset.resize === 'start' ? 'start' : target.dataset.resize === 'end' ? 'end' : 'move'
    event.preventDefault()
    target.focus({ preventScroll: true })
    onSelect()
    drag.current = { x: event.clientX, period, mode, days: 0 }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraft(period)
    onPreview(describe(period))
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current) return
    const days = Math.round((event.clientX - current.x) / dayWidth)
    if (days === current.days) return
    const next = adjustPeriod(current.period, current.mode, days)
    if (!validPeriod(next)) return
    current.days = days
    setDraft(next)
    onPreview(describe(next))
  }
  function cancel() { drag.current = null; setDraft(null); onPreview('Modification annulée.') }
  function finish(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current) return
    const next = adjustPeriod(current.period, current.mode, current.days)
    drag.current = null
    setDraft(null)
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (!disabled && (next.start !== period.start || next.end !== period.end)) onSave(next)
  }
  const button = (mode: 'move' | 'start' | 'end', label: string) => <button type="button" data-resize={mode} className={mode === 'move' ? 'gantt-bar-body' : 'gantt-handle'} disabled={disabled} aria-label={label} title={`${label}. Flèches gauche/droite : un jour.`} onFocus={() => { onSelect(); onPreview(describe(shown)) }} onKeyDown={(event) => {
    if (event.key === 'Escape' && drag.current) { event.preventDefault(); event.stopPropagation(); cancel(); return }
    if (disabled || drag.current || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault(); event.stopPropagation()
    onSave(adjustPeriod(period, mode, event.key === 'ArrowLeft' ? -1 : 1))
  }}>{mode === 'move' ? 'Prévu' : '⋮'}</button>
  return <div className={`gantt-planned-bar${draft ? ' is-dragging' : ''}`} style={{ left: Math.max(0, left), width: Math.min(visibleDays * dayWidth, right) - Math.max(0, left) }} onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={() => { if (drag.current) cancel() }}>
    {left >= 0 && button('start', `Ajuster le début de ${card.title}`)}
    {button('move', `Déplacer la période prévue de ${card.title}`)}
    {right <= visibleDays * dayWidth && button('end', `Ajuster la fin de ${card.title}`)}
  </div>
}

function HistoryLane({ card, start, now, interrupted, onDetail }: { card: CalendarCard | undefined; start: string; now: string; interrupted: boolean; onDetail: (message: string) => void }) {
  if (!card?.observations.length) return <span className="gantt-outside">En attente d’une lecture confirmée</span>
  if (card.observations.length === 1 && card.observations[0].columnId === 'done') return <span className="gantt-outside">Déjà terminée ; date de fin réelle inconnue</span>
  return <>{historySegments(card, now, interrupted).map((segment, index) => {
    const left = timelinePosition(segment.start, start)
    const right = timelinePosition(segment.end, start)
    if (right < 0 || left >= visibleDays * dayWidth) return null
    const width = segment.kind === 'done' ? 10 : Math.max(2, Math.min(visibleDays * dayWidth, right) - Math.max(0, left))
    const message = `${segment.demo ? 'Démonstration simulée · ' : ''}${segment.kind === 'done' ? `${segment.title} — constaté le ${formatTime(segment.start)}` : `${segment.title} — ${formatTime(segment.start)} à ${formatTime(segment.end)}`}`
    return <button key={index} type="button" className={`gantt-history-segment ${segment.kind}${segment.demo ? ' demo' : ''}`} style={{ left: Math.max(0, left), width, paddingInline: width < 45 ? 0 : 4, '--status-color': colorFor(segment.columnId) } as CSSProperties} aria-label={message} title={message} onFocus={() => onDetail(message)} onMouseEnter={() => onDetail(message)}>{width < 45 ? '' : segment.kind === 'gap' ? 'Inconnu' : segment.kind === 'status' ? segment.title : ''}</button>
  })}</>
}

function Members({ card, users }: { card: CardData; users: UserData[] }) {
  return <div className="gantt-members" aria-label="Membres assignés">{card.assignees.slice(0, 4).map((id) => {
    const user = users.find((person) => person.id === id)
    const name = user ? `${user.firstname} ${user.lastname}` : `Utilisateur inconnu (${id})`
    return <span key={id} className="gantt-avatar" role="img" aria-label={name} title={name}>{user ? `${user.firstname[0] ?? ''}${user.lastname[0] ?? ''}`.toUpperCase() : '?'}</span>
  })}{card.assignees.length > 4 && <span title={card.assignees.slice(4).map((id) => { const user = users.find((person) => person.id === id); return user ? `${user.firstname} ${user.lastname}` : id }).join(', ')}>+{card.assignees.length - 4}</span>}</div>
}

export function ProjectGantt({ board, store, snapshot, disabled }: { board: BoardData; store: CalendarStore; snapshot: CalendarSnapshot; disabled: boolean }) {
  const [start, setStart] = useState(() => addDays(monday(localDay()), -7))
  const [selectedId, setSelectedId] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [detail, setDetail] = useState('')
  const [dropDay, setDropDay] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<CalendarData | null>(null)
  const [pendingSource, setPendingSource] = useState<'file' | 'demo'>('file')
  const [now, setNow] = useState(() => new Date().toISOString())
  const fileInput = useRef<HTMLInputElement>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const corner = useRef<HTMLDivElement>(null)
  const importing = useRef(false)
  const cards = board.columns.flatMap((column) => column.cards)
  const selected = cards.find((card) => card.id === selectedId) ?? cards[0]
  const selectedRecord = snapshot.data.cards.find((card) => card.cardId === selected?.id)
  const planned = cards.filter((card) => snapshot.data.cards.some((entry) => entry.cardId === card.id && entry.period))
  const blocked = disabled || !!snapshot.error || !!pendingImport
  const hasDemo = snapshot.data.cards.some((card) => card.observations.some((observation) => observation.demo))
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers, staleTime: 60_000, retry: false, enabled: planned.some((card) => card.assignees.length > 0) })
  const days = Array.from({ length: visibleDays }, (_, index) => addDays(start, index))
  const today = localDay(new Date(now))
  const todayOffset = dayNumber(today) - dayNumber(start)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date().toISOString()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  function save(cardId: string, period: PlannedPeriod | null) {
    if (blocked || !cards.some((card) => card.id === cardId)) return false
    try {
      store.setPeriod(cardId, period)
      setSelectedId(cardId)
      setMessage(period ? `Dates enregistrées : ${formatDay(period.start)} au ${formatDay(period.end)}.` : 'Carte retirée du planning. Son historique est conservé.')
      return true
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Enregistrement impossible.'); return false }
  }
  function locate(x: number) {
    if (!canvas.current || !corner.current) return null
    const day = Math.floor((x - canvas.current.getBoundingClientRect().left - corner.current.offsetWidth) / dayWidth)
    return day >= 0 && day < visibleDays ? addDays(start, day) : null
  }
  const [{ isOver }, drop] = useDrop<CardDragItem, { moved: boolean }, { isOver: boolean }>(() => ({
    accept: 'CARD',
    canDrop: (item, monitor) => !blocked && cards.some((card) => card.id === item.cardId) && !!locate(monitor.getClientOffset()?.x ?? -1),
    hover: (_item, monitor) => { const next = locate(monitor.getClientOffset()?.x ?? -1); setDropDay((current) => current === next ? current : next) },
    drop: (item, monitor) => {
      const date = locate(monitor.getClientOffset()?.x ?? -1)
      if (!date) return { moved: false }
      const old = snapshot.data.cards.find((card) => card.cardId === item.cardId)?.period ?? null
      return { moved: save(item.cardId, movePeriod(old, date)) }
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [blocked, board, snapshot.data, start])

  function exportFile() {
    const url = URL.createObjectURL(new Blob([store.exportData()], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `planning-${board.id}-${today}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Planning et historique exportés.')
  }
  async function readFile(file?: File) {
    if (!file || importing.current) return
    importing.current = true
    try {
      if (file.size > 2_000_000) throw new Error('Le fichier dépasse la limite de 2 Mo.')
      const data = parseCalendar(await file.text(), board.id, board)
      setPendingSource('file')
      setPendingImport(data)
      setMessage('Fichier validé. Confirmez son import pour remplacer les dates et l’historique locaux.')
    } catch (error) { setMessage(`Import impossible : ${error instanceof Error ? error.message : 'fichier invalide'}`) }
    finally { importing.current = false; if (fileInput.current) fileInput.current.value = '' }
  }

  return <Box as="section" data-gantt="" aria-labelledby="gantt-title" borderWidth="1px" borderColor="var(--app-border)" borderRadius="xl" bg="var(--app-surface)" overflow="hidden">
    <Stack gap={4} p={{ base: 4, md: 5 }}>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
        <Box><HStack gap={2}><CalendarIcon aria-hidden="true" /><Heading id="gantt-title" as="h2" size="lg" fontWeight="600">Planning du projet</Heading></HStack><Text mt={1} fontSize="sm" color="fg.muted">Les cartes à glisser sont juste au-dessus des dates. Une semaine au premier dépôt.</Text></Box>
        <HStack gap={2} flexWrap="wrap"><Button size="sm" variant="outline" onClick={exportFile}><DownloadIcon aria-hidden="true" />Exporter JSON</Button><Button size="sm" variant="outline" disabled={disabled || !!pendingImport} onClick={() => fileInput.current?.click()}><UploadIcon aria-hidden="true" />Importer JSON</Button><input ref={fileInput} hidden type="file" accept=".json,application/json" aria-label="Importer un planning JSON" onChange={(event) => void readFile(event.target.files?.[0])} /></HStack>
      </HStack>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        <HStack gap={2} flexWrap="wrap"><Button size="sm" variant="outline" aria-label="Semaine précédente" onClick={() => setStart(addDays(start, -7))}><ArrowLeftIcon /></Button><Button size="sm" variant="outline" onClick={() => setStart(addDays(monday(localDay()), -7))}>Aujourd’hui</Button><Button size="sm" variant="outline" aria-label="Semaine suivante" onClick={() => setStart(addDays(start, 7))}><ArrowRightIcon /></Button><Text fontWeight="500" fontSize="sm">{formatDay(start)} – {formatDay(addDays(start, 27))} {start.slice(0, 4)}</Text></HStack>
        <HStack gap={3}><Button size="sm" variant="outline" aria-expanded={editorOpen} aria-controls="gantt-date-controls" disabled={!cards.length} onClick={() => setEditorOpen((open) => !open)}>Régler les dates</Button><Text fontSize="sm" color="fg.muted">{planned.length} / {cards.length} cartes planifiées</Text></HStack>
      </HStack>
      <HStack flexWrap="wrap" gap={4} fontSize="xs" aria-label="Légende des statuts">{board.columns.map((column) => <HStack key={column.id} gap={1.5}><span className="gantt-legend-dot" style={{ background: colorFor(column.id) }} /><Text>{column.title}</Text></HStack>)}<HStack gap={1.5}><span className="gantt-legend-gap" /><Text>Observation inconnue</Text></HStack></HStack>
      <HStack gap={3} flexWrap="wrap">{hasDemo && <><Text fontSize="xs" color="fg.muted">Démo : les segments en pointillés sont simulés. Les nouvelles observations sont réelles.</Text><Button size="xs" variant="outline" disabled={blocked} onClick={() => { try { store.clearDemo(); setMessage('Historique simulé retiré. Les dates et les observations réelles sont conservées.') } catch (error) { setMessage(error instanceof Error ? error.message : 'Modification impossible.') } }}>Retirer l’historique démo</Button></>}<Button size="xs" variant="ghost" disabled={disabled || !!pendingImport || !cards.length} onClick={() => { setPendingSource('demo'); setPendingImport(demoCalendar(board, new Date().toISOString())) }}>{hasDemo ? 'Recharger la démo' : 'Charger une démonstration'}</Button></HStack>
      {snapshot.error && <Text role="alert" color="fg.error" fontSize="sm">{snapshot.error}</Text>}
      {pendingImport && <Box borderWidth="1px" borderColor="border.warning" borderRadius="md" p={3}><Text fontSize="sm" mb={2}>Remplacer le planning et l’historique locaux par {pendingSource === 'demo' ? 'la démonstration' : 'ce fichier'} ({pendingImport.cards.filter((card) => card.period).length} cartes planifiées) ? Les cartes du tableau restent intactes.</Text><HStack><Button size="sm" colorPalette="blue" disabled={disabled} onClick={() => {
        try { const checked = parseCalendar(JSON.stringify(pendingImport), board.id, board); store.importData(checked); setPendingImport(null); setMessage('Planning importé. Les prochaines lectures reprendront l’observation.') } catch (error) { setMessage(`Import impossible : ${error instanceof Error ? error.message : 'fichier invalide'}`) }
      }}>Remplacer les données locales</Button><Button size="sm" variant="outline" onClick={() => { setPendingImport(null); setMessage('Import annulé.') }}>Annuler</Button></HStack></Box>}
      {editorOpen && selected && <Box id="gantt-date-controls" className="gantt-editor" borderRadius="lg" bg="var(--app-panel)" p={3}>
        <Field.Root mb={3}><Field.Label htmlFor="gantt-card">Carte à planifier</Field.Label><NativeSelect.Root size="sm" disabled={blocked}><NativeSelect.Field id="gantt-card" value={selected.id} onChange={(event) => setSelectedId(event.target.value)}>{cards.map((card) => <option key={card.id} value={card.id}>{card.title}</option>)}</NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
        <DateEditor key={`${selected.id}:${selectedRecord?.period?.start}:${selectedRecord?.period?.end}`} card={selected} period={selectedRecord?.period ?? null} disabled={blocked} onSave={(period) => save(selected.id, period)} onRemove={() => save(selected.id, null)} />
      </Box>}
      <Text role="status" aria-live="polite" fontSize="sm" minH="1.25rem" color="fg.muted">{message || 'Les dates se sauvegardent dans ce navigateur. Exportez le JSON pour les transférer.'}</Text>
      {cards.length > 0 && <div><Text fontSize="xs" fontWeight="600" mb={2}>Cartes à glisser</Text><div className="gantt-sources" tabIndex={0} role="region" aria-label="Cartes à glisser, défilement horizontal">{cards.map((card) => <PlanningSource key={card.id} card={card} disabled={blocked} />)}</div></div>}
    </Stack>
    <div className="gantt-scroll" tabIndex={0} role="region" aria-label="Calendrier sur quatre semaines, défilement horizontal et vertical">
      <div className="gantt-canvas" ref={(node) => { canvas.current = node; drop(node) }}>
        <div className="gantt-header"><div ref={corner} className="gantt-corner">Carte / suivi</div>{days.map((date) => {
          const weekend = [0, 6].includes(new Date(dayNumber(date) * 86_400_000).getUTCDay())
          return <div key={date} className={`gantt-day${weekend ? ' weekend' : ''}${date === today ? ' today' : ''}`} title={formatDay(date)}><span>{new Date(dayNumber(date) * 86_400_000).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' }).slice(0, 3)}</span><strong>{date.slice(-2)}</strong>{date.slice(-2) === '01' && <span>{formatDay(date).split(' ').slice(1).join(' ')}</span>}</div>
        })}</div>
        {planned.length === 0 && <div className="gantt-row gantt-empty"><div className="gantt-label"><strong>Votre première carte</strong><span>Sept jours au dépôt</span></div><div className="gantt-tracks"><Text fontSize="sm" color="fg.muted" p={5}>Déposez une carte ici, ou utilisez les dates ci-dessus.</Text></div></div>}
        {planned.map((card) => {
          const record = snapshot.data.cards.find((entry) => entry.cardId === card.id)!
          const period = record.period!
          return <div key={card.id} className={`gantt-row${card.id === selected?.id ? ' selected' : ''}`}>
            <div className="gantt-label"><button type="button" className="gantt-card-title" title={card.title} onClick={() => { setSelectedId(card.id); setEditorOpen(true); requestAnimationFrame(() => document.getElementById('gantt-start')?.focus()) }} aria-label={`Régler les dates de ${card.title}`}>{card.title}</button><span>{formatDay(period.start)} – {formatDay(period.end)}</span><div className="gantt-card-meta"><Members card={card} users={users.isError ? [] : users.data ?? []} />{card.checklistItems.length > 0 && <span aria-label={`${card.checklistItems.filter((item) => item.done).length} tâches terminées sur ${card.checklistItems.length}`}>{card.checklistItems.filter((item) => item.done).length}/{card.checklistItems.length} tâches</span>}</div></div>
            <div className="gantt-tracks"><div className="gantt-planned-lane"><PlannedBar card={card} period={period} start={start} disabled={blocked} onSave={(value) => save(card.id, value)} onSelect={() => setSelectedId(card.id)} onPreview={setMessage} /></div><div className="gantt-history-lane"><span className="gantt-track-label">Historique</span><HistoryLane card={record} start={start} now={now} interrupted={snapshot.interrupted} onDetail={setDetail} /></div></div>
          </div>
        })}
        {todayOffset >= 0 && todayOffset < visibleDays && <div className="gantt-today-line" style={{ left: `calc(var(--gantt-label-width) + ${todayOffset * dayWidth}px)` }} aria-hidden="true" />}
        {isOver && dropDay && <div className="gantt-drop-line" style={{ left: `calc(var(--gantt-label-width) + ${(dayNumber(dropDay) - dayNumber(start)) * dayWidth}px)` }} aria-hidden="true"><span>Début : {formatDay(dropDay)}</span></div>}
      </div>
    </div>
    <Stack gap={1} px={{ base: 4, md: 5 }} py={3} borderTopWidth="1px" borderColor="var(--app-border)"><Text fontSize="xs" color="fg.muted">Prévu : poignées ou flèches du clavier, un jour à la fois. Échap annule le geste en cours.</Text><Text fontSize="xs" color="fg.muted">Historique local depuis la première observation ; ◆ marque une fin. Les hachures indiquent une période inconnue, pas du temps de travail.</Text>{snapshot.interrupted && <Text fontSize="xs" color="fg.muted">Observation interrompue. L’historique reprendra à la prochaine lecture serveur.</Text>}<Text fontSize="xs" role="status" minH="1rem">{detail}</Text></Stack>
  </Box>
}
