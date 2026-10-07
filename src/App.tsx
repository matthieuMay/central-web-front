import { useEffect, useState } from 'react'

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

function TodoForm() {
  return (
    <>
      <label htmlFor="todo-title">Nouvelle tâche</label>
      <div className="todo-form">
        <input id="todo-title" type="text" />
        <button id="add-todo" type="button">+</button>
      </div>
    </>
  )
}

function TodoList() {
  return <ul id="todo-list" />
}

function App() {
  const [title, setTitle] = useState('')

  useEffect(() => {
    document.title = title.trim() || 'Todo'
  }, [title])

  return (
    <main>
      <h1>Todo</h1>
      <TitleInput value={title} onChange={setTitle} />
      <TodoForm />
      <TodoList />
    </main>
  )
}

export default App
