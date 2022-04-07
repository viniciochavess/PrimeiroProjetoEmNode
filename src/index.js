const { query } = require('express');
const express = require('express')
const app = express()

const { v4: uuidv4 } = require('uuid')
app.use(express.json())

const DB = [];


function accountIfExist(request, response, next) {
    const { cpf } = request.headers

    const accountExist = DB.find((account) => { return account.cpf == cpf })



    if (!accountExist) {
        return response.json({ 'Error': 'Error' })
    }


    request.accountExist = accountExist

    return next()
}

function accountNotExist(request, response, next) {
    const { cpf } = request.body
    const accountExist = DB.find((account) => { return account.cpf === cpf })

    if (accountExist) {
        return response.json({ 'Error': 'Error' })
    }

    return next()




}

function SaldoStatement(accountExist) {

    //console.log(accountExist)

    const SaldoTotal = accountExist.statement.reduce((acc, el) => {
        if (el.type === "Entrada") {

            return acc + el.amount

        } else {
            return acc - el.amount
        }

    }, 0)


    return SaldoTotal

}


app.post('/account', accountNotExist, (request, response) => {

    const { name, cpf } = request.body

    const Obj = {
        id: uuidv4(),
        name,
        cpf,
        statement: []
    }
    DB.push(Obj)

    console.log("Usuário cadastrado com sucesso !!!")
    return response.send().status(201)


})

app.get('/only', accountIfExist, (request, response) => {

    const { accountExist } = request;

    return response.json(accountExist)


})

app.post('/dep', accountIfExist, (request, response) => {
    const { accountExist } = request
    const { amount, description } = request.body
    const Obj = {
        type: "Entrada",
        Datetime: new Date(),
        amount,
        description
    }
    accountExist.statement.push(Obj)
    const saldoAtual = SaldoStatement(accountExist)
    console.log("Déposito efeituado!! no valor de " + amount)
    console.log(`Saldo Atual ${saldoAtual}`)
    return response.send().status(201)


})

app.post('/sai', accountIfExist, (request, response) => {
    const { accountExist } = request;
    const { amount } = request.body
    const getBalance = SaldoStatement(accountExist)

    if (getBalance >= amount) {
        accountExist.statement.push({
            type: "Saida",
            amount,
            Datetime: new Date()
        })
        console.log(`Retirado com sucesso`)
        const saldoAtual = SaldoStatement(accountExist)


        console.log(`saldo atual é : ${saldoAtual}`)
        return response.send().status(201)
    } else {

        return response.json({ "Error": "Error Saldo" })
    }





});





app.get('/query', (request, response) => response.json(DB))

app.get('/query/date', accountIfExist, (request, response) => {
    const { accountExist } = request;
    const { date } = request.query;

    const formatDate = new Date(date + " 00:00");
    const acc = accountExist.statement.filter((account) => {
        return account.Datetime.toDateString() === new Date(formatDate).toDateString();
    })

    return response.json(acc);


})








app.listen(3000)
