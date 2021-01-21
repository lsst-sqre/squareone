/* Mock log out page */

import sleep from '../utils/sleep';

export default function Logout() {
  const handleSubmit = (event) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    fetch('http://localhost:3001/api/dev/logout', {
      method: 'POST',
    })
      .then((response) => console.log(response))
      .then(sleep(100).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log out</button>
    </form>
  );
}
