const pageTitleInput = document.querySelector('#page-title');

pageTitleInput.addEventListener('input', () => {
  document.title = pageTitleInput.value.trim() || 'Todo';
});

const todoTitleInput = document.querySelector('#todo-title');
const addTodoButton = document.querySelector('#add-todo');
const todoList = document.querySelector('#todo-list');

addTodoButton.addEventListener('click', () => {
  const title = todoTitleInput.value.trim();
  if (!title) return;

  const item = document.createElement('li');
  const checkbox = document.createElement('input');
  const text = document.createElement('span');

  checkbox.type = 'checkbox';
  text.textContent = title;
  item.append(checkbox, text);

  checkbox.addEventListener('change', () => {
    item.classList.toggle('done', checkbox.checked);
    if (checkbox.checked) {
      todoList.append(item);
    } else {
      todoList.insertBefore(item, todoList.querySelector('.done'));
    }
  });

  todoList.insertBefore(item, todoList.querySelector('.done'));
  todoTitleInput.value = '';
});
