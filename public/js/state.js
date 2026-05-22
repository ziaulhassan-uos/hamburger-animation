// Simple reactive state — components subscribe to changes

const state = {
  account: null,           // current authenticated account
  workspaces: [],
  activeWorkspaceId: null,
  activeProjectId: null,
  ghlLocations: [],        // sub-accounts (agency only)
  ghlUsers: [],            // users available for assigning
  filterLocationId: '',
  filterAssigneeId: '',
};

const listeners = new Set();

export function getState() { return state; }

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
