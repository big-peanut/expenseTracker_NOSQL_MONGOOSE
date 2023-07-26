const express=require('express')
const mongoose=require('mongoose')
const bodyparser=require('body-parser')
const cors=require('cors')
const userRoutes=require('./routes/userRoutes')
const expenseRoutes=require('./routes/expenseRoutes')
const purchaseRoutes=require('./routes/purchaseRoutes')
const premiumRoutes=require('./routes/premiumRoutes')
const forgotpwdRoutes=require('./routes/forgotpwdRoutes')

const app=express()
app.use(bodyparser.json())
app.use(cors())

app.use(userRoutes)
app.use(expenseRoutes)
app.use(purchaseRoutes)
app.use(premiumRoutes)
app.use(forgotpwdRoutes)

mongoose.connect('mongodb+srv://sandeep:LDSY3Fhdi93MU8L6@cluster0.lkqagga.mongodb.net/expenseTracker?retryWrites=true&w=majority')
    .then(result=>{
        app.listen(3000)
        console.log('connected')
    })
    .catch(err=>{
        console.log(err)
    })