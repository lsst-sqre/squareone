/* Mock log in page */

import { useState } from 'react';
import sleep from '../utils/sleep';

export default function Login() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    const body = JSON.stringify({ name, username });
    fetch('http://localhost:3001/api/dev/login', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => console.log(response))
      .then(sleep(100).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">
        Name
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label htmlFor="username">
        Username:
        <input
          type="text"
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
