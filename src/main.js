import '../styles/register.css';

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = e.target.getAttribute('data-page');
      try {
        const res = await fetch(`/pages/${page}`);
        if (!res.ok) throw new Error('Page not found');
        const html = await res.text();
        content.innerHTML = html;
      } catch (err) {
        content.innerHTML = '<h2>Error loading page</h2>';
      }
    });
  });
});

