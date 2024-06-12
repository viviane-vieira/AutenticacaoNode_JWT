//imports 

require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const app = express()

//CONFIG JSON RESPONSE
app.use(express.json())

//  Models

const User = require('./models/User')


//OPEN ROUTE - PUBLIC ROUTE
app.get('/', (req,res) => {
    res.status(200).json({message:"bem vindo"})
})

//REGISTER USE
app.post('/auth/register', async(req,res) => {
    const {name, email, password, confirmpassword} = req.body

    //validations
    if(!name){
        return res.status(422).json({message: "O Nome é obrigatorio!"})
    }
    if(!email){
        return res.status(422).json({message: "O Email é obrigatorio!"})
    }
    if(!password){
        return res.status(422).json({message: "A Senha é obrigatoria!"})
    }

    if (password !== confirmpassword){
        return res.status(422).json({message: " As Senhas não Conferem!"})
    }
})



//CREDENTIALS TO ACCESS MONGODB
const dbUser =  process.env.DB_USER
const dBPassword = process.env.DB_PASSWORD
//
//CONNECTION STRING WITH BANK MONGO.DB THROUGH MONGOOSE
mongoose
.connect(`mongodb+srv://${dbUser}:${dBPassword}@clusterjwt.5rlph4i.mongodb.net/?retryWrites=true&w=majority&appName=ClusterJWT`)
.then(() =>{
    app.listen(3000)
    console.log("conectado ao mongoDB!!")
})
.catch((err) => {
    
})

app.listen(3001)