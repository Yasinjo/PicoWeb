const express = require('express');
const app = express();
app.get('/api', (req, res) => {
  res.status(200).send({
    objet : 'Jenkins CI CD msg',
    message: 'Its working Correctly'

  })
});
const PORT = 9090;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});