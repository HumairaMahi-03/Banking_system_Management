const express = require ('express')
const cookieParser = require('cookie-parser')




const app = express()
app.use(express.json())
app.use(cookieParser())
/**
 * - Routes required
 */

const authRouter = require('./routers/auth.routes')
const accountRouter = require('./routers/account.routes')
const transactionRouter = require('./routers/transaction.routes')

/**
 * - Use Routes
 */

app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)
app.use('/api/transactions', transactionRouter)


module.exports = app