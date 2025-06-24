const express = require('express')
const PORT = 3000

app.get("/", (req, res) => {
    res.send("Welcome to my app!");
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
