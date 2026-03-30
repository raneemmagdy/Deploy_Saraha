import express from 'express'
import { PORT } from '../config/config.service.js'
import { globaLErrorHandler, NotFoundException } from './Common/index.js'
import { authRouter, userRouter } from './Modules/index.js'
import { checkConnectionDB } from './DB/connection.db.js'
import cors from 'cors'
import { resolve } from 'path'
import { connectRedis } from './DB/redis.connection.db.js'
const bootstrap = async () => {
    const app = express()
    //===========================middleware===========================
    app.use(express.json())
    app.use('/uploads', express.static(resolve('./uploads')))
    //===========================cors===========================
    app.use(cors({
        origin: "http://localhost:3000"
    }))
    //===========================db===========================
    await checkConnectionDB()
    await connectRedis()

    //===========================routes===========================
    app.use('/auth', authRouter)
    app.use('/user', userRouter)
    //===========================Cron job===========================


    //===========================Root===============================
    app.get('/', (req, res) => {
        return res.json({ message: "Welcome from server side APIs 🧨🧨❤️" })
    })
    //===========================Page not found===========================

    app.all('{/*dummy}', (req, res) => {
        return NotFoundException({ message: "Page not found" })
    })

    //===========================error handler===========================
    app.use(globaLErrorHandler)
    //===========================server===========================
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`)
    })


}
export default bootstrap