const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.getEmbedding = async (text) => {
  const res = await fetch('http://127.0.0.1:1234/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma-3b-it', 
      input: text
    })
  });

  const json = await res.json();
  return json.data[0].embedding;
};
