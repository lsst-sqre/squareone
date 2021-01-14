// Mock of Gafaelfawr user-info endpoint

export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      username: 'jonathansick',
      name: 'Jonathan Sick',
      uid: 1234,
    })
  );
}
