const express=require('express')
const userController=require('../controller/userController')
const expenseController=require('../controller/expenseController')
const middleware=require('../middleware/auth')

const router=express.Router()

router.post('/user/signup',userController.signup)
router.post('/user/login',userController.login)
router.get('/user/getuser',middleware.authenticate,userController.getuser)
router.get('/user/download',middleware.authenticate,expenseController.downloadexpense)

module.exports=router