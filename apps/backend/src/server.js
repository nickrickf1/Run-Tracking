const path = require("path");

// forza dotenv a leggere SEMPRE apps/backend/.env
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log("JWT_SECRET loaded?", !!process.env.JWT_SECRET);
    console.log(`API running on http://localhost:${PORT}`);
});
