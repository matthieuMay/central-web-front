function TitleInput() {
  return (
    <>
      <label htmlFor="page-title">Titre</label>
      <input id="page-title" type="text" />
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
  return (
    <main>
      <h1>Todo</h1>
      <TitleInput />
      <TodoForm />
      <TodoList />
    </main>
  )
}

export default App
