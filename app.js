require("express-async-errors");
require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000 || process.env.PORT;
const notFoundPage = require("./middleware/pageNotFound");
const errorHandler = require("./middleware/errorHandler");
const { connectDb, connectDBLocally, connectWithMongooseLocally } = require("./db/dbConnect");
const cors = require("cors");
const router = require("./router/admin");
const noteRouter = require("./router/note");
const userRouter = require("./router/user");
const studentRouter = require("./router/student");
const hodRouter = require("./router/HOD");
const wpsRouter = require("./router/wps");
const landingRouter = require("./router/landingPage");
const infoRouter = require("./router/info");
const cooker_parser = require("cookie-parser");
const { join } = require("path");
const { logs } = require("./middleware/log");
const mongoose = require("mongoose");


/**MIDDLEWARES */
app.use(express.json());
app.use(cooker_parser())

// app.use(cors({
//     credentials: true,
//     origin: "http://localhost:5173"
// }));


app.use(cors({
    credentials: true,
    origin: "https://honeyland-note-app.vercel.app/"
}));

//https://frontend-note-khaki.vercel.app/

app.use("/upload", express.static(join(__dirname, "upload")));


app.get("/", (req, res) => {
    res.status(200).json({msg:'Welcome to honeyland note'})
})

app.use("/api/v1/user", router);
app.use("/api/v1/note", noteRouter);
app.use("/api/v1/client", userRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/hod", hodRouter);
app.use("/api/v1/wps", wpsRouter);
app.use("/api/v1/landing", landingRouter);
app.use("/api/v1/info", infoRouter);


async function starter() {
    try {
        //const db = await connectWithMongooseLocally()
        const db = await connectDb();
        if (db) {
            console.log("connected to the database successfully...");
        }
        app.listen(port, () => console.log(`server listening on port ${port}`));
    } catch (error) {
        console.log(error.message);
    }
}

starter();

app.use("*", notFoundPage);
app.use(errorHandler);
app.use(logs)


// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing MongoDB connection');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing MongoDB connection');
    await mongoose.connection.close();
    process.exit(0);
});
