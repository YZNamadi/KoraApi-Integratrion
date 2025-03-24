const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./config/database');
const app = express();
app.use(bodyParser.json());

// Import Fincras routes (we’ll create these next)
const fincraRoutes = require('./routes/transactionRouter');
app.use('/api/fincras', fincraRoutes);

const PORT = process.env.PORT || 9875;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
