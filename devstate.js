// State for the mocked authentication back end
// Log in using the POST /api/dev/login method and log out using
// the POST /api/dev/logout method.

let DEV_STATE = {
  loggedIn: false,
  username: 'vera',
  name: 'Vera Rubin',
  uid: 1234,
};

export function setDevState(properties) {
  DEV_STATE = { ...DEV_STATE, ...properties };
}

export function getDevState() {
  return DEV_STATE;
}
