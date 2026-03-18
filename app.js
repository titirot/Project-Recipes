const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("השרת שלי עובד!");
});

app.listen(3000, () => {
    console.log("Success! השרת פועל בפורט 3000");
});