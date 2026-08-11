const tokenKey = 'blog_api_token';
const usernameKey = 'blog_api_username';

const state = {
  token: localStorage.getItem(tokenKey) || '',
  username: localStorage.getItem(usernameKey) || '',
  authMode: 'login',
  posts: [],
  selectedPostId: '',
  selectedPost: null,
  comments: [],
  editingPostId: '',
};

const toast = document.getElementById('toast');
const authStatus = document.getElementById('authStatus');
const refreshBtn = document.getElementById('refreshBtn');
const signOutBtn = document.getElementById('signOutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const postForm = document.getElementById('postForm');
const postFormTitle = document.getElementById('postFormTitle');
const clearPostFormBtn = document.getElementById('clearPostFormBtn');
const workspaceHint = document.getElementById('workspaceHint');
const postsList = document.getElementById('postsList');
const postsCount = document.getElementById('postsCount');
const selectedPostCard = document.getElementById('selectedPostCard');
const commentsList = document.getElementById('commentsList');
const commentsCount = document.getElementById('commentsCount');
const commentForm = document.getElementById('commentForm');

function showToast(message, kind = 'info') {
  toast.textContent = message;
  toast.className = `toast ${kind} visible`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.className = 'toast';
  }, 2600);
}

function formatDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

function setAuthMode(mode) {
  state.authMode = mode;
  document.querySelectorAll('[data-auth-tab]').forEach((button) => {
    button.classList.toggle('active', button.dataset.authTab === mode);
  });
  loginForm.classList.toggle('hidden', mode !== 'login');
  registerForm.classList.toggle('hidden', mode !== 'register');
}

function setAuthenticatedUI() {
  const signedIn = Boolean(state.token);
  authStatus.textContent = signedIn ? `Signed in as ${state.username || 'user'}` : 'Not signed in';
  refreshBtn.hidden = !signedIn;
  signOutBtn.hidden = !signedIn;

  const controlsDisabled = !signedIn;
  [postForm, commentForm].forEach((form) => {
    form.querySelectorAll('input, textarea, button').forEach((field) => {
      if (field.type !== 'button') {
        field.disabled = controlsDisabled;
      }
    });
  });

  workspaceHint.classList.toggle('hidden', signedIn);
  if (!signedIn) {
    workspaceHint.textContent = 'Log in to load your posts and start editing.';
  }
}

function resetPostForm() {
  state.editingPostId = '';
  postForm.reset();
  postForm.postId.value = '';
  postFormTitle.textContent = 'Write a post';
  postForm.querySelector('button[type="submit"]').textContent = 'Publish post';
}

function resetSelection() {
  state.selectedPostId = '';
  state.selectedPost = null;
  state.comments = [];
  selectedPostCard.className = 'selected-post empty-state';
  selectedPostCard.innerHTML = 'Pick a post to inspect the full thread.';
  commentsList.innerHTML = '';
  commentsCount.textContent = '0 comments';
}

function renderPostSelection(post) {
  state.selectedPost = post;
  state.selectedPostId = post._id;
  selectedPostCard.className = 'selected-post';
  selectedPostCard.innerHTML = `
    <div class="card-meta">
      <span>${post.author?.username || 'Unknown author'}</span>
      <span>${formatDate(post.date)}</span>
      <span>${post._id}</span>
    </div>
    <h3>${escapeHtml(post.title)}</h3>
    <p class="comment-body">${escapeHtml(post.body)}</p>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderPosts(posts) {
  state.posts = posts;
  postsCount.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'}`;

  if (!posts.length) {
    postsList.innerHTML = '<div class="empty-state">No posts yet. Create the first one from the editor above.</div>';
    return;
  }

  postsList.innerHTML = posts
    .map((post) => {
      const isActive = state.selectedPostId === post._id;
      const snippet = post.body.length > 180 ? `${post.body.slice(0, 180)}...` : post.body;
      return `
        <article class="post-card ${isActive ? 'active' : ''}" data-post-id="${post._id}">
          <div class="card-meta">
            <span>${escapeHtml(post.author?.username || 'Unknown author')}</span>
            <span>${formatDate(post.date)}</span>
          </div>
          <h3 class="post-title">${escapeHtml(post.title)}</h3>
          <p class="post-body">${escapeHtml(snippet)}</p>
          <div class="post-actions">
            <button class="secondary-btn" type="button" data-action="view" data-id="${post._id}">Open</button>
            <button class="ghost-btn" type="button" data-action="edit" data-id="${post._id}">Edit</button>
            <button class="danger-btn" type="button" data-action="delete" data-id="${post._id}">Delete</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderComments(comments) {
  state.comments = comments;
  commentsCount.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;

  if (!comments.length) {
    commentsList.innerHTML = '<div class="empty-state">No comments on this post yet.</div>';
    return;
  }

  commentsList.innerHTML = comments
    .map(
      (comment) => `
        <article class="comment-card">
          <div class="comment-meta">
            <span>${escapeHtml(comment.author?.username || 'Unknown author')}</span>
            <span>${formatDate(comment.date)}</span>
            <span>${comment._id}</span>
          </div>
          <p class="comment-body">${escapeHtml(comment.text)}</p>
          <div class="comment-actions">
            <button class="danger-btn" type="button" data-action="delete-comment" data-id="${comment._id}">Delete</button>
          </div>
        </article>
      `,
    )
    .join('');
}

async function loadPosts({ keepSelection = false } = {}) {
  if (!state.token) {
    renderPosts([]);
    resetSelection();
    return;
  }

  const { posts } = await request('/posts');
  renderPosts(posts);

  if (!posts.length) {
    resetSelection();
    return;
  }

  const nextSelected = keepSelection
    ? posts.find((post) => post._id === state.selectedPostId)
    : posts[0];

  if (nextSelected) {
    await openPost(nextSelected._id);
  } else {
    resetSelection();
  }
}

async function openPost(postId) {
  const { post } = await request(`/posts/${postId}`);
  renderPostSelection(post);
  await loadComments(postId);
  renderPosts(state.posts);
}

async function loadComments(postId) {
  const { comments } = await request(`/posts/${postId}/comments`);
  renderComments(comments);
}

function fillPostForm(post) {
  state.editingPostId = post._id;
  postForm.postId.value = post._id;
  postForm.title.value = post.title;
  postForm.body.value = post.body;
  postFormTitle.textContent = 'Edit post';
  postForm.querySelector('button[type="submit"]').textContent = 'Update post';
  postForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deletePost(postId) {
  if (!window.confirm('Delete this post and all of its comments?')) return;
  await request(`/posts/${postId}`, { method: 'DELETE' });
  showToast('Post deleted', 'success');
  if (state.selectedPostId === postId) {
    resetSelection();
  }
  await loadPosts();
}

async function deleteComment(commentId) {
  if (!state.selectedPostId) return;
  await request(`/posts/${state.selectedPostId}/comments/${commentId}`, { method: 'DELETE' });
  showToast('Comment deleted', 'success');
  await loadComments(state.selectedPostId);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  try {
    const { token } = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
      }),
    });

    state.token = token;
    state.username = String(formData.get('username') || '');
    localStorage.setItem(tokenKey, state.token);
    localStorage.setItem(usernameKey, state.username);
    setAuthenticatedUI();
    showToast('Logged in successfully', 'success');
    await loadPosts();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  try {
    await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
      }),
    });

    showToast('Account created. Switch to login and sign in.', 'success');
    setAuthMode('login');
    loginForm.username.value = String(formData.get('username') || '');
    loginForm.password.value = '';
    registerForm.reset();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.token) {
    showToast('Log in first', 'error');
    return;
  }

  const formData = new FormData(postForm);
  const payload = {
    title: formData.get('title'),
    body: formData.get('body'),
  };

  try {
    if (state.editingPostId) {
      await request(`/posts/${state.editingPostId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('Post updated', 'success');
    } else {
      await request('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Post published', 'success');
    }

    resetPostForm();
    await loadPosts();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

commentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.selectedPostId) {
    showToast('Pick a post first', 'error');
    return;
  }

  const formData = new FormData(commentForm);
  try {
    await request(`/posts/${state.selectedPostId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text: formData.get('text') }),
    });
    showToast('Comment sent', 'success');
    commentForm.reset();
    await loadComments(state.selectedPostId);
  } catch (error) {
    showToast(error.message, 'error');
  }
});

document.querySelectorAll('[data-auth-tab]').forEach((button) => {
  button.addEventListener('click', () => setAuthMode(button.dataset.authTab));
});

document.getElementById('clearPostFormBtn').addEventListener('click', () => {
  resetPostForm();
});

refreshBtn.addEventListener('click', async () => {
  try {
    await loadPosts({ keepSelection: true });
    showToast('Data refreshed', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
});

signOutBtn.addEventListener('click', () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(usernameKey);
  state.token = '';
  state.username = '';
  state.selectedPostId = '';
  state.selectedPost = null;
  state.comments = [];
  state.posts = [];
  resetPostForm();
  resetSelection();
  renderPosts([]);
  setAuthenticatedUI();
  showToast('Signed out', 'info');
});

postsList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  const post = state.posts.find((item) => item._id === id);

  if (action === 'view') {
    try {
      await openPost(id);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  if (action === 'edit' && post) {
    fillPostForm(post);
  }

  if (action === 'delete') {
    try {
      await deletePost(id);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
});

commentsList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action="delete-comment"]');
  if (!button) return;

  try {
    await deleteComment(button.dataset.id);
  } catch (error) {
    showToast(error.message, 'error');
  }
});

setAuthMode(state.authMode);
setAuthenticatedUI();
resetPostForm();

if (state.token) {
  loadPosts().catch((error) => showToast(error.message, 'error'));
}