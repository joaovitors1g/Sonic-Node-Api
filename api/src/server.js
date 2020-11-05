const express = require('express');
const { v4: uuid } = require('uuid');
const Sonic = require('sonic-channel');

const app = express();

app.use(express.json());

const sonicChannelIngest = new Sonic.Ingest({
  host: 'localhost',
  port: 1491,
  auth: 'SecretPassword'
});

const sonicChannelSearch = new Sonic.Search({
  host: 'localhost',
  port: 1491,
  auth: 'SecretPassword'
});

sonicChannelIngest.connect({
  connected: () => {
    console.log('Injest: conectou');
  }
});

sonicChannelSearch.connect({
  connected: () => {
    console.log('Search: conectou');
  }
});

app.post('/pages', async (req, res) => {
  const { title, content } = req.body;
  const id = uuid();

  await sonicChannelIngest.push('pages', 'default', `page:${id}`, `${title} ${content}`, {
    lang: 'por'
  });

  return res.status(201).send();
});

app.get('/search', async (req, res) => {
  const { q } = req.query;

  const results = await sonicChannelSearch.query(
    'pages',
    'default',
    q,
    {
      lang: 'por'
    }
  );

  return res.json(results);
});

app.get('/suggest', async (req, res) => {
  const { q } = req.query;

  const results = await sonicChannelSearch.suggest(
    'pages',
    'default',
    q,
    {
      limit: 5
    }
  );
  return res.json(results);
});

app.listen(3333, () => {
  console.log('🚀 App listening at 3333');
});
