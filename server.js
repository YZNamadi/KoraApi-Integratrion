const express = require('express');
require('./config/database');
const transactionRouter = require('./routes/transactionRouter');

const PORT = 7496;
const app = express();

app.use(express.json());
app.use('/api/v1/', transactionRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});
app.listen(PORT, ()=>{
    console.log(`Server is listening to PORT ${PORT}`)
})

 
