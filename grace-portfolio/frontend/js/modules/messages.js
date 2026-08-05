const Messages = (() => {

  async function renderMessagesViewer() {
    const content = document.getElementById('studio-content');
    content.innerHTML = `
      <div class="studio-page-header">
        <h1>Messages</h1>
        <span id="msg-count" style="color:#666;font-size:.9rem"></span>
      </div>
      <div id="messages-list" class="studio-loading">Loading…</div>
    `;

    try {
      const rows = await apiFetch('/api/contact');
      renderList(rows);
    } catch (err) {
      document.getElementById('messages-list').innerHTML =
        `<p style="color:#b42318">Failed to load messages: ${err.message}</p>`;
    }
  }

  function renderList(rows) {
    const el = document.getElementById('messages-list');
    const countEl = document.getElementById('msg-count');
    countEl.textContent = `${rows.length} submission${rows.length !== 1 ? 's' : ''}`;

    if (rows.length === 0) {
      el.className = 'studio-empty';
      el.innerHTML = '<h2>No messages yet</h2><p>Contact form submissions will appear here.</p>';
      return;
    }

    el.className = '';
    el.innerHTML = rows.map(row => `
      <div class="msg-card studio-card" style="margin-bottom:18px">
        <div class="msg-header">
          <div>
            <span class="msg-name">${escHtml(row.name)}</span>
            <a class="msg-email" href="mailto:${escHtml(row.email)}">${escHtml(row.email)}</a>
          </div>
          <span class="msg-date">${formatDate(row.created_at)}</span>
        </div>
        <p class="msg-body">${escHtml(row.message)}</p>
        <div class="msg-actions">
          <a class="msg-reply-btn" href="mailto:${escHtml(row.email)}?subject=Re: your message">
            Reply
          </a>
          <button class="msg-delete-btn" data-id="${row.id}">Delete</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.msg-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteMessage(btn.dataset.id));
    });
  }

  async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
      await apiFetch(`/api/contact/${id}`, { method: 'DELETE' });
      renderMessagesViewer(); // refresh
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  return { renderMessagesViewer };
})();