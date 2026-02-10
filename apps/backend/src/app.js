const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth.routes')
const app = express()
const runsRoutes = require('./routes/runs.routes')
const statsRoutes = require('./routes/stats.routes')

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (es. Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);


app.use(cors({origin:true, credentials: true}));
app.options("*", cors());
app.use(express.json())

app.use("/runs", runsRoutes)
app.use("/stats", statsRoutes)

app.get('/health',(req,res)=>{
    res.json({ok:true});
});

app.use("/auth", authRoutes);

module.exports = app;