const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const app = express()
const runsRoutes = require('./routes/runs.routes')
const statsRoutes = require('./routes/stats.routes')

app.use(cors({origin:true, credentials: true}));
app.use(express.json())

app.use("/runs", runsRoutes)
app.use("/stats", statsRoutes)

app.get('/health',(req,res)=>{
    res.json({ok:true});
});

app.use("/auth", authRoutes);

module.exports = app;