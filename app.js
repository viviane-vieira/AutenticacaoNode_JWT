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
//PRIVATE ROUTE
app.get("/user/:id",checkToken, async (req,res) => {
    const id = req.params.id

    //CHECK IF USER EXISTS
    const user = await User.findById(id, '-password')

    if(!user){
        return res.status(404).json({message: "Usuário não encontrado"})
    }
    res.status(200).json({user})
})

function checkToken(req,res,next){

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    
    if(!token) {
        return res.status(401).json({message: "Acesso Negado!"})

    }
    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
        
    } catch (error) {
        res.status(400).json({message: "Token Inválido!"})
    }
}

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
    //CHECK IF USER EXISTS
    const userExists = await User.findOne({email : email})

    if(userExists) {
        return res.status(422).json({message: " Digite um novo email!"})
    }

    //CREATE PASSWORD
    const salt =  await bcrypt.genSalt(12)
    const passwordHash =  await bcrypt.hash(password, salt)

    //CREATE user 
    const user = new User({
        name,
        email,
        password: passwordHash,

    })

    try {

        await user.save()

        res.status(200).json({message: "Usuário criado com sucesso!"})
    } catch (error) {
        res.status(500).json({message:"Erro no servidor!"})
        
    }

})
//LOGIN USER
app.post("/auth/login", async (req,res) =>{

    const {email, password} =req.body

    //validations
    if(!email) {
        if(!email){
            return res.status(422).json({message: "O Email é obrigatorio!"})
        }
        if(!password){
            return res.status(422).json({message: "A Senha é obrigatoria!"})
        }
    }
    //CHECK IF USER EXISTS
    const user = await User.findOne({email : email})

    if(!user) {
        return res.status(404).json({message: "Usuario não encontrado!"})
    }
    //CHECK IF PASSWORD MATCH
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword) {
        return res.status(422).json({message: "Senha inválida!"})
    }
    try {
        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user._id
        },
        secret,
      )

      res.status(200).json({message: "Autentivação realizada com sucesso", token})        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message:"Aconteceu um erro no servidor, tente novamente mais tarde!"
        })
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