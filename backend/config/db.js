import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const mongo_url = process.env.MONGO_URI

const conn = () =>{
return mongoose.connect(mongo_url).then(() => {
    console.log("mongoose connected")
}).catch((err) => {
    console.error("mongoose not connected", err)
    throw err  // Re-throw error so server doesn't start without DB
})
}

export default conn;