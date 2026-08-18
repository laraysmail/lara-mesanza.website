document.querySelectorAll('.filter-pills[data-filter-target]').forEach((group) => {
  const target = document.getElementById(group.dataset.filterTarget);
  if (!target) return;
  const items = target.querySelectorAll('[data-category]');

  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    group.querySelectorAll('.filter-pill').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    items.forEach((item) => {
      const cats = item.dataset.category.split(' ');
      const show = filter === 'todo' || cats.includes(filter);
      item.style.display = show ? '' : 'none';
    });
  });
});
