// Thin fetch wrapper — all calls go through here so errors are handled uniformly

async function request(method, url, body) {
  const opts = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get  = (url)       => request('GET',    url);
const post = (url, body) => request('POST',   url, body);
const put  = (url, body) => request('PUT',    url, body);
const patch= (url, body) => request('PATCH',  url, body);
const del  = (url)       => request('DELETE', url);

export const auth = {
  me:     ()    => get('/auth/me'),
  logout: ()    => post('/auth/logout'),
};

export const workspaces = {
  list:   ()           => get('/api/workspaces'),
  create: (data)       => post('/api/workspaces', data),
  update: (id, data)   => put(`/api/workspaces/${id}`, data),
  remove: (id)         => del(`/api/workspaces/${id}`),
};

export const projects = {
  list:         (wsId)       => get(`/api/projects/workspace/${wsId}`),
  get:          (id)         => get(`/api/projects/${id}`),
  create:       (data)       => post('/api/projects', data),
  update:       (id, data)   => put(`/api/projects/${id}`, data),
  remove:       (id)         => del(`/api/projects/${id}`),
  stages:       (id)         => get(`/api/projects/${id}/stages`),
  addStage:     (id, data)   => post(`/api/projects/${id}/stages`, data),
  updateStage:  (id, sid, d) => put(`/api/projects/${id}/stages/${sid}`, d),
  deleteStage:  (id, sid)    => del(`/api/projects/${id}/stages/${sid}`),
  addList:      (id, data)   => post(`/api/projects/${id}/lists`, data),
  updateList:   (id, lid, d) => put(`/api/projects/${id}/lists/${lid}`, d),
  deleteList:   (id, lid)    => del(`/api/projects/${id}/lists/${lid}`),
};

export const tasks = {
  list:    (params = {}) => get('/api/tasks?' + new URLSearchParams(params)),
  get:     (id)          => get(`/api/tasks/${id}`),
  create:  (data)        => post('/api/tasks', data),
  update:  (id, data)    => put(`/api/tasks/${id}`, data),
  move:    (id, data)    => patch(`/api/tasks/${id}/move`, data),
  remove:  (id)          => del(`/api/tasks/${id}`),
  comment: (id, content) => post(`/api/tasks/${id}/comments`, { content }),
};

export const ghl = {
  locations:    ()           => get('/api/ghl/locations'),
  locationUsers:(locationId) => get(`/api/ghl/locations/${locationId}/users`),
  users:        ()           => get('/api/ghl/users'),
};
