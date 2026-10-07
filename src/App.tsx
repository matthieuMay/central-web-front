import { useState } from 'react'

type Todo = {
  id: string
  title: string
  done: boolean
}

type TitleInputProps = {
  value: string
  onChange: (value: string) => void
}

function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <>
      <label htmlFor="page-title">Titre</label>
      <input id="page-title" type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </>
  )
}

type TodoFormProps = {
  onAdd: (title: string) => void
}

function TodoForm({ onAdd }: TodoFormProps) {
  const [draft, setDraft] = useState('')

  function addTodo() {
    const title = draft.trim()
    if (!title) return
    onAdd(title)
    setDraft('')
  }

  return (
    <>
      <label htmlFor="todo-title">Nouvelle tâche</label>
      <div className="todo-form">
        <input id="todo-title" type="text" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button id="add-todo" type="button" onClick={addTodo}>+</button>
      </div>
    </>
  )
}

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
}

function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li className={todo.done ? 'done' : undefined}>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
      <span>{todo.title}</span>
    </li>
  )
}

type TodoListProps = {
  todos: Todo[]
  onToggle: (id: string) => void
}

function TodoList({ todos, onToggle }: TodoListProps) {
  return (
    <ul id="todo-list">
      {todos.map((todo) => <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />)}
    </ul>
  )
}

function App() {
  const [title, setTitle] = useState('')
  const [todos, setTodos] = useState<Todo[]>([])

  function addTodo(title: string) {
    const newTodo: Todo = { id: crypto.randomUUID(), title, done: false }
    setTodos((current) => {
      const firstDone = current.findIndex((todo) => todo.done)
      if (firstDone === -1) return [...current, newTodo]
      return [...current.slice(0, firstDone), newTodo, ...current.slice(firstDone)]
    })
  }

  function toggleTodo(id: string) {
    setTodos((current) => {
      const selected = current.find((todo) => todo.id === id)
      if (!selected) return current

      const remaining = current.filter((todo) => todo.id !== id)
      const toggled = { ...selected, done: !selected.done }
      if (toggled.done) return [...remaining, toggled]

      const firstDone = remaining.findIndex((todo) => todo.done)
      if (firstDone === -1) return [...remaining, toggled]
      return [...remaining.slice(0, firstDone), toggled, ...remaining.slice(firstDone)]
    })
  }

  return (
    <>
      <title>{title.trim() || 'Todo'}</title>
      <main>
        <h1>Todo</h1>
        <TitleInput value={title} onChange={setTitle} />
        <TodoForm onAdd={addTodo} />
        <TodoList todos={todos} onToggle={toggleTodo} />
      </main>
    </>
  )
}

export default App
