const inquirer = require("inquirer")
const chalk = require("chalk")
const fs = require("fs")

operation()

function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed("Essa conta não existe!"))
        return false
    }
    return true
}

function operation() {
    inquirer.prompt([{

        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: [
            'Registrar',
            'Entrar',
            'Sair',
        ]
    }]).then((answer) => {

        const action = answer['action']

        if (action === 'Registrar') {
            register()
        } else if (action === 'Entrar') {
            login()
        }
        else if (action === 'Sair') {
            exit()
        }
    })
}

function register() {
    inquirer.prompt([

        {
            name: 'accountName',
            message: 'Digite o nome da sua conta:',
        },
        {
            name: 'accountPassword',
            message: 'Digite a senha da sua conta:',
        }

    ]).then((answer) => {

        const accountName = answer['accountName']
        const accountPassword = answer['accountPassword']
        let accountCash = 100
        let accountDivida = 0
        let accountTurns = 0
        let accountEarnings = 0
        let accountLost = 0

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black("Essa conta já existe!")
            )

            register()
            return
        }

        fs.writeFileSync(
            `accounts/${accountName}.json`,

`{
"name": "${accountName}", 
"password": "${accountPassword}",
"cash": ${accountCash},
"divida": ${accountDivida},
"turns": ${accountTurns},
"totalEarnings": ${accountEarnings},
"totalLost": ${accountLost}
}`,

            function (err) {
                console.log(err)
            }
        )

        console.log(chalk.green("Sua conta foi registrada!"))
        operation()

    })
}

function login() {
    inquirer.prompt([

        {
            name: 'nome',
            message: 'Digite o nome da sua conta:',
        },
        {
            name: 'password',
            message: 'Digite a senha da sua conta:',
        }

    ]).then((answer) => {

        const name = answer['nome']
        const password = answer['password']

        if (!checkAccount(name)) {
            operation()
        } else {

            const accountData = getAccount(name)
            if (password === accountData.password) {
                const cash = accountData.cash
                menu(name, password, cash)

            } else {
                console.log("SENHA ERRADA")
                operation()
            }

        }
    })
}

function transferir(name, cash) {
    inquirer.prompt([

        {
            name: 'nome',
            message: 'Nome da conta que vai receber:',
        },
        {
            name: 'quantity',
            message: 'Quantia que ira trasferir:',
        }

    ]).then((answer) => {

        const receiver = answer['nome']
        const quantity = parseInt(answer['quantity'])

        if (!checkAccount(receiver)) {
            console.log(chalk.red(`A conta de nome ${receiver} não foi encontrada`))
            menu(name)
        } else {
            const receiverData = getAccount(receiver)
            const payerData = getAccount(name)
       
            if (quantity > cash) {
                console.log(chalk.red(`Saldo Insuficiente`))
            } else {
                if (receiver!==name){
                    accountUpdate(receiver, receiverData.password, receiverData.cash + quantity, receiverData.divida, receiverData.turns, receiverData.totalEarnings, receiverData.totalLost)
                    accountUpdate(name, payerData.password, payerData.cash - quantity, payerData.divida, payerData.turns, payerData.totalEarnings, payerData.totalLost)
    
                    console.log(chalk.green(`Transferencia sucedida!`))
    
                    menu(name)
                } else {
                    console.log(chalk.red(`Transferencia não aceita`))
                    menu(name)
                }
            }
        }
    })
}



function saldo(name, divida, cash) {
    console.log('NOME: ' + name)

    if (divida <= 0) {
        console.log(chalk.bgGreen('DIVIDA: ' + divida))
    } else {
        console.log(chalk.bgRed('DIVIDA: ' + divida))
    }

    if (cash >= 0) {
        console.log(chalk.bgGreen('SALDO: ' + cash))
    } else {
        console.log(chalk.bgRed('SALDO: ' + cash))
    }

}

function menu(name) {
    const accountData = getAccount(name)

    const password = accountData.name
    var divida = accountData.divida
    var turns = accountData.turns
    var totalEarnings = accountData.totalEarnings
    var totalLost = accountData.totalLost

    var data = [name, password, divida, turns, totalEarnings, totalLost]

    let cash = Math.round((accountData.cash + Number.EPSILON) * 100) / 100;

    saldo(name, divida, cash)
    options(name, password, cash, divida, turns, totalEarnings, totalLost)
}

function options(name, password, cash, divida, turns, totalEarnings, totalLost) {

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Aposte',
        choices: [
            'Jogar Slot Machine',
            'Fazer Empréstimo',
            'Pagar Divida',
            'Transferir Dinheiro',
            'Informações da Conta',
            'Sair'
        ]

    }]).then((answer) => {

        const action = answer['action']
        if (action === 'Jogar Slot Machine') {
            exibirQuantia(name, password, cash, divida, turns, totalEarnings, totalLost)
        } else if (action === 'Fazer Empréstimo') {
            emprestimo(name, password, cash, divida, turns, totalEarnings, totalLost)
        } else if (action === 'Pagar Divida') {
            pagarDivida(name, password, cash, divida, turns, totalEarnings, totalLost)
        } else if (action === 'Transferir Dinheiro') {
            transferir(name, cash)
        } else if (action === 'Informações da Conta') {
            infoAccount(name, password, cash, divida, turns, totalEarnings, totalLost)
        } else if (action === 'Sair') {
            operation()
        }
    })
}

function infoAccount(name, password, cash, divida, turns, totalEarnings, totalLost) {
    console.log(
        `
        Nome da Conta: ${name}
        Senha da Conta: ${password}
        Dinheiro Atual: ${cash}
        Dívida Atual: ${divida}
        Slots Jogados: ${turns}
        Total de Dinheiro Ganho: ${otalEarnings}
        Total de Dinheiro Perdido: ${totalLost}
        `
    )
    menu(name)
}

function pagarDivida(name, password, cash, divida, turns, totalEarnings, totalLost) {
    saldo(name, divida, cash)

    if (divida >= 100) {

        cash = cash - 100
        divida = divida - 100

        accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost)
        menu(name)
    } else if (divida<100){
        cash = cash - divida
        divida = divida - divida

        accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost)
        menu(name)
    } else if(divida=0){
        console.log(chalk.green(`Sem dividas a pagar`))
        menu(name)
    } else {
        console.log(chalk.red(`Saldo Insuficiente!`))
        menu(name)
    }

}

function slotMachineInfo(name, divida, cash) {
    console.log(chalk.bgBlueBright("SLOT MACHINE:"))
    console.log(chalk.green("777 - Multipica o dinheiro apostado por 10"))
    console.log(chalk.green("Junção de três números iguais que não são 777 - Multipica o dinheiro apostado por 5"))
    console.log(chalk.green("Junção de dois números iguais - Multipica o dinheiro apostado por 1,5"))
    console.log(chalk.red("Nenhum número igual - Perde o dinheiro apostado"))

    saldo(name, divida, cash)
}

function exibirQuantia(name, password, cash, divida, turns, totalEarnings, totalLost) {

    slotMachineInfo(name, divida, cash)
    inquirer.prompt([{

        name: 'quantity',
        message: 'Digite o quanto você quer apostar:',

    }]).then((answer) => {
        var quantity = parseInt(answer['quantity'])

        if (quantity > cash || quantity < 0) {
            console.log(chalk.red("Você não pode apostar essa quantia!"))
            menu(name)
        } else {
            roleta(name, password, cash, quantity, divida, turns, totalEarnings, totalLost)
        }
    })
}

function randomNumber() {
    return Math.floor(Math.random() * 9)
}

function roleta(name, password, cash, quantity, divida, turns, totalEarnings, totalLost) {

    var cashGained = 0
    var winMultiplicator = 0

    const random1 = randomNumber()
    const random2 = randomNumber()
    const random3 = randomNumber()

    var result = [random1, random2, random3]

    function wait(a) {
        console.log(chalk.black(result[a]))
    }

    function winMachine(cashGained, divida) {
        setTimeout(wait, 500, 0)
        setTimeout(wait, 1000, 1)
        setTimeout(wait, 1500, 2)
        setTimeout(win, 2000, cashGained)
        setTimeout(menu, 2500, name)
    }

    function defeatMachine(cashLost) {
        setTimeout(wait, 500, 0)
        setTimeout(wait, 1000, 1)
        setTimeout(wait, 1500, 2)
        setTimeout(defeatMessage, 2000, cashLost, divida)
        setTimeout(menu, 2500, name)
    }

    function defeat(name, password, cash, divida, turns, totalEarnings, totalLost, quantity) {
        cash = cash - quantity
        var cashLost = quantity
        totalLost = totalLost - quantity
        turns++
        divida = divida * 1.1

        accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost)

        defeatMachine(cashLost)
    }

    function win(cashGained) {
        console.log(chalk.bgGreen(`Você ganhou ${cashGained} de Cash!`))
    }
    function defeatMessage(cashLost) {
        console.log(chalk.bgRed(`Você perdeu ${cashLost} de Cash!`))
    }

    function multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings) {

        cash = cash + (quantity * winMultiplicator)

        var cashGained1 = quantity * winMultiplicator
        var cashGained = Math.round((cashGained1 + Number.EPSILON) * 100) / 100;
        totalEarnings = totalEarnings + cashGained
        turns++
        divida = divida * 1.1

        accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost)
        winMachine(cashGained)
    }

    if (random1 == 7, random2 == 7, random3 == 7) {

        winMultiplicator = 10
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)

    } else if (

        random1 == 0 && random2 == 0 && random3 == 0 ||
        random1 == 1 && random2 == 1 && random3 == 1 ||
        random1 == 2 && random2 == 2 && random3 == 2 ||
        random1 == 3 && random2 == 3 && random3 == 3 ||
        random1 == 4 && random2 == 4 && random3 == 4 ||
        random1 == 5 && random2 == 5 && random3 == 5 ||
        random1 == 7 && random2 == 7 && random3 == 7 ||
        random1 == 8 && random2 == 8 && random3 == 8 ||
        random1 == 9 && random2 == 9 && random3 == 9
    ) {

        winMultiplicator = 5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)

    } else if (random1 == 6 && random2 == 6 && random3 == 6) {

        defeat(name, password, cash, divida, turns, totalEarnings, totalLost, 666)

    } else if (random1 == random2) {

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)

    } else if (random1 == random3) {

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)

    } else if (random2 == random1) {

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)

    } else if(random2 == random3){

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)
    
    } else if(random3 == random1){

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)
    
    } else if(random3 == random2){

        winMultiplicator = 1.5
        multiply(winMultiplicator, name, password, cash, quantity, divida, turns, totalEarnings)
    
    } else {

        defeat(name, password, cash, divida, turns, totalEarnings, totalLost, quantity)
    
    }

}

function accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost) {
    fs.writeFileSync(
        `accounts/${name}.json`,
        `{
        "name": "${name}", 
        "password": "${password}",
        "cash": ${cash},
        "divida": ${Math.round(divida)},
        "turns": ${turns},
        "totalEarnings": ${totalEarnings},
        "totalLost": ${Math.abs(totalLost)}
        }`,
    )
}

function emprestimo(name, password, cash, divida, turns, totalEarnings, totalLost) {
    divida = divida + 100

    const amount = 100

    cash = parseFloat(amount) + parseFloat(cash)

    accountUpdate(name, password, cash, divida, turns, totalEarnings, totalLost)

    console.log(chalk.green("Foi depositado 100 na sua conta"),
    )

    menu(name)
}

function getAccount(name) {
    const accountJSON = fs.readFileSync(`accounts/${name}.json`,
        {
            encoding: 'utf-8',
            flag: 'r',
        })
    return JSON.parse(accountJSON)
}

function exit() {
    process.exit()
}