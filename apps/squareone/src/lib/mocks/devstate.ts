// State for the mocked authentication back end
// Log in using the POST /api/dev/login method and log out using
// the POST /api/dev/logout method.

export interface DevState {
  loggedIn: boolean;
  username: string;
  name: string;
  uid: number;
  /** Active Gafaelfawr scopes for the mocked session. */
  scopes: string[];
}

// Boot as an admin so the admin UI (Admin menu item, `/admin/*` pages) works
// out of the box. Step down to a less-privileged persona from the `/dev` panel.
let DEV_STATE: DevState = {
  loggedIn: true,
  username: 'vera',
  name: 'Vera Rubin',
  uid: 1234,
  scopes: [
    'exec:admin',
    'admin:token',
    'admin:notifications',
    'read:tap',
    'exec:notebook',
    'read:image',
  ],
};

export function setDevState(properties: Partial<DevState>): void {
  DEV_STATE = { ...DEV_STATE, ...properties };
}

export function getDevState(): DevState {
  return DEV_STATE;
}
