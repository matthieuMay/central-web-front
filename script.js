const pageTitleInput = document.querySelector('#page-title');

pageTitleInput.addEventListener('input', () => {
  document.title = pageTitleInput.value.trim() || 'Todo';
});
