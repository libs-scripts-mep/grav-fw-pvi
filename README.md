# Gravação de Firmware PVI

Biblioteca que auxilia na gravação de microcontroladores por linha de comando através do PVI.

## Instalando

Abra o terminal, e na pasta do script, execute:

```
npm i @libs-scripts-mep/grav-fw-pvi
```

## Desinstalando

Abra o terminal, e na pasta do script, execute:

```
npm uninstall @libs-scripts-mep/grav-fw-pvi
```

<br>

| Fabricante | Ferramenta               | Suporte |
| ---------- | ------------------------ | ------- |
| ST         | STVP                     | ✔️       |
| Renesas    | Renesas Flash Programmer | ✔️       |
| Nuvoton    | JLink v7.82              | ✔️       |

## Resumo da Classe

```js

/**
 * Realiza gravacao nos microcontroladores ST atraves do PVI, via STVP command line 
 * @param {string} dirFirm formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
 * @param {string} dirOpt formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
 * @param {string} modelo_uC formato esperado: "STM8S003F3"
 * @param {function} callback 
 * @param {number} timeOut 
 */
GravaFW.STM8(params , callback , timeOut = 5000){

    //invoca o STVP passando os parametros informados
    let result = pvi.runInstructionS("stvp", [params])

    //executa callback dependendo do resultado
    if (result.includes(`Verify OPTION BYTE succeeds`)) {
        callback(true, result)
    } else if (result.includes(`ERROR : Cannot communicate with the tool`)) {
        callback(null, "Gravador não respondeu")
    } else {
        callback(false, "Falha na gravação do firmware final")
    }
}


/**
 * Realiza gravacao nos microcontroladores renesas atraves do PVI, via renesas flash programmer command line
 * @param {string} dirProject Formato esperado: "I:\\\Documentos\\\Softwares\\\RENESAS\\\R5F51303ADFL\\\INV-301\\\301v06\\\301v06.rpj"
 * @param {function} callback 
 * @param {number} timeOut 
 */
static Renesas(params, callback, timeOut = 5000) {

    //invoca o Renesas Flash Programmer passando os parametros informados
    let result = pvi.runInstructionS(`RENESAS.gravafw`, [params])

    //executa callback dependendo do resultado
    if (result.includes(`Operation completed.`)) {
        console.log(`%cLog Program:\n\n${result}`, ' color: #00EE66')
        callback(true, result)

    } else if (result.includes(`Cannot find the specified tool.`)) {
        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
        callback(null, `Gravador não respondeu`)

    } else if (result.includes(`Error: No project file specifed.`)) {
        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
        callback(false, `Projeto informado é inválido`)

    } else {
        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
        callback(false, `Falha na gravação do firmware final`)
    }    
}

/**
 * Realiza gravacao nos microcontroladores Nuvoton atraves do PVI, via Jlink v7 command line
 * @param {string} dirProject Formato esperado: "C:\\Users\\eduardo.rezzadori\\Desktop\\Farmwar\\193M3PL3v01_3.02.hex"
 * @param {string} commandFile Arquivo de comandos JLink, pseudo-script de gravação
 * @param {string} device modelo do micrcontrolador
 * @param {function} callback 
 * @param {number} timeOut 
 */
static JLink_v7(dirProject = null, commandFile = null, device, callback = () => { }, timeOut = 10000) {
    // inicia as variaveis locais utilizadas
    let error = null, observer = null, logGravacao = [], controleGravacao = null
    const pathPVI = pvi.runInstructionS("GETPVIPATH", [])

    // start do obsever para o retorno do cmd
    observer = pvi.FWLink.globalDaqMessagesObservers.add((m, data) => {
        console.log(m, data)

        // monta um array para validar a gravação
        logGravacao.push(data)

        // aguarda a string final do processo de gravação
        if (data == "Script processing completed.") {
            pvi.FWLink.globalDaqMessagesObservers.clear()
            pvi.daq.init()
            logGravacao.forEach((e) => {

                // mensagem que valida a gravação
                if (e == "O.K.") {
                    observer = () => { }
                    controleGravacao = true
                // erro conhecido    
                } else if (e == "Cannot connect to target.") {
                    error = e
                }
            })

            // retorno convencional do script
            if (controleGravacao) {
                clearTimeout(timeOutGravacao)
                callback(true, `Gravado com sucesso, caminho: ${dirProject}`)
            } else if (error) {
                clearTimeout(timeOutGravacao)
                callback(false, `Falha na gravação, ${error}`)
            } else {
                clearTimeout(timeOutGravacao)
                callback(false, `Falha na gravação, caminho: ${dirProject}`)
            }
        }
    }, "sniffer.exec")

    // execução do comando de gravação
    pvi.runInstructionS("EXEC", [`${pathPVI}\\Plugins\\JLINK7\\JLink.exe`, `-device ${device} -CommandFile ${commandFile}`, "true", "true"])

    // timeout para setar erro caso ocorra algum tipo de erro inesperado
    let timeOutGravacao = setTimeout(() => {
        pvi.FWLink.globalDaqMessagesObservers.clear()
        pvi.daq.init()
        callback(false, `Falha na gravação, verifique a conexão USB do gravador`)
    }, timeOut)
}
```

