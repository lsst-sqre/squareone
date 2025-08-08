// State for the mocked authentication back end
// Log in using the POST /api/dev/login method and log out using
// the POST /api/dev/logout method.

export interface DevState {
  loggedIn: boolean;
  username: string;
  name: string;
  uid: number;
}

let DEV_STATE: DevState = {
  loggedIn: true,
  username: 'vera',
  name: 'Vera Rubin',
  uid: 1234,
};

export function setDevState(properties: Partial<DevState>): void {
  DEV_STATE = { ...DEV_STATE, ...properties };
}

export function getDevState(): DevState {
  return DEV_STATE;
}
