class GravaFW {

    /**
     * Realiza gravacao nos microcontroladores ST atraves do PVI, via STVP command line 
     * @param {string} dirFirm formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} dirOpt formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} modelo_uC formato esperado: "STM8S003F3"
     */
    static async STM8(dirFirm = null, dirOpt = null, modelo_uC = null, timeOut = 5000) {

        return new Promise(async (resolve) => {

            let ObjWriteSTM8 = await defineWriteSTM8(dirFirm, dirOpt, modelo_uC)

            let logGravacao = ""

            if (ObjWriteSTM8.sucess) {

                const id = PVI.FWLink.globalDaqMessagesObservers.add((msg, param) => {

                    console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
                    logGravacao = logGravacao + param[0]

                    if (param[0] != undefined) {

                        if (param[0].includes(`Verify OPTION BYTE succeeds`)) {

                            PVI.FWLink.globalDaqMessagesObservers.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ sucess: true, msg: logGravacao })

                        } else if (param[0].includes(`ERROR : Cannot communicate with the tool`)) {

                            PVI.FWLink.globalDaqMessagesObservers.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ sucess: null, msg: `Gravador não respondeu` })

                        }

                    }

                }, "sniffer.exec")

            } else {
                console.log(`%cNenhum diretório de firmware ou option byte informado`, ' color: #EE0033')
                resolve({ sucess: false, msg: `Nenhum diretório de firmware ou option byte informado` })
            }

            pvi.runInstructionS("EXEC", [`C:/Program Files (x86)/STMicroelectronics/st_toolset/stvp/STVP_CmdLine.exe`, ObjWriteSTM8.commandLineArguments, "true", "true"])

            let timeOutGravacao = setTimeout(() => {

                console.log(`%cLog Program:\n\n${logGravacao}`, ' color: #EE0033')
                PVI.FWLink.globalDaqMessagesObservers.remove(id)

                resolve({ sucess: false, msg: `Falha na gravação do firmware final` })

            }, timeOut)

        })


        async function defineWriteSTM8(dirFirm, dirOpt, modelo_uC) {

            return new Promise((resolve) => {

                if (dirFirm != null && dirOpt != null) {

                    dirFirm = dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)
                    dirOpt = dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)

                    resolve({
                        sucess: true,
                        commandLineArguments: `-BoardName=ST-LINK -Tool_ID=0 -NbTools=1 -Port=USB -ProgMode=SWIM -Device=${modelo_uC} -verbose -no_loop -no_warn_protect -FileProg=${dirFirm} -FileOption=${dirOpt}`,
                    })

                } else if (dirFirm != null) {

                    dirFirm = dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)

                    resolve({
                        sucess: true,
                        commandLineArguments: `-BoardName=ST-LINK -Tool_ID=0 -NbTools=1 -Port=USB -ProgMode=SWIM -Device=${modelo_uC} -verbose -no_loop -no_warn_protect -FileProg=${dirFirm}`,
                    })

                } else if (dirOpt != null) {

                    dirOpt = dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)

                    resolve({
                        sucess: true,
                        commandLineArguments: `-BoardName=ST-LINK -Tool_ID=0 -NbTools=1 -Port=USB -ProgMode=SWIM -Device=${modelo_uC} -verbose -no_loop -no_warn_protect -FileOption=${dirOpt}`,
                    })

                } else {
                    resolve({
                        sucess: false,
                    })
                }

            })

        }
    }

    /**
     * Realiza gravacao nos microcontroladores renesas atraves do PVI, via renesas flash programmer command line
     * @param {string} dirProject Formato esperado: "I:\\\Documentos\\\Softwares\\\RENESAS\\\R5F51303ADFL\\\INV-301\\\301v06\\\301v06.rpj"
     * @param {number} timeOut 
     */
    static Renesas(dirProject = null, timeOut = 5000) {

        return new Promise((resolve) => {

            if (dirProject != null) {

                let logGravacao = ""

                const id = PVI.FWLink.globalDaqMessagesObservers.add((msg, param) => {

                    console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
                    logGravacao = logGravacao + param[0]

                    if (param[0] != undefined) {

                        if (param[0].includes(`Operation completed.`)) {

                            PVI.FWLink.globalDaqMessagesObservers.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ sucess: true, msg: logGravacao })

                        } else if (param[0].includes(`Cannot find the specified tool.`)) {

                            PVI.FWLink.globalDaqMessagesObservers.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ sucess: null, msg: `Gravador não respondeu` })

                        } else if (param[0].includes(`Error: No project file specifed.`)) {

                            PVI.FWLink.globalDaqMessagesObservers.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ sucess: false, msg: `Projeto informado é inválido` })

                        }

                    }

                }, "sniffer.exec")

                pvi.runInstructionS("EXEC", [`${pvi.runInstructionS("GETPVIPATH", [])}/Resources/Renesas/RFPV3.Console.exe`, dirProject, "true", "true"])

                let timeOutGravacao = setTimeout(() => {

                    PVI.FWLink.globalDaqMessagesObservers.remove(id)
                    resolve({ sucess: false, msg: `Tempo de gravação excedido` })

                }, timeOut)

            } else {
                resolve({ sucess: false, msg: `Caminho do firmware não informado` })
            }

        })
    }

    /**
     * Realiza gravacao nos microcontroladores Nuvoton atraves do PVI, via JLink command line
     * @param {string} dirProject Formato esperado: "C:\\Users\\eduardo.rezzadori\\Desktop\\Farmwar\\193M3PL3v01_3.02.hex"
     * @param {string} commandFile Arquivo de comandos JLink, pseudo-script de gravação
     * @param {string} device modelo do micrcontrolador
     * @param {number} timeOut 
     */
    static JLink_v7(dirProject = null, commandFile = null, device, timeOut = 10000) {

        let logGravacao = ""

        const id = PVI.FWLink.globalDaqMessagesObservers.add((msg, param) => {

            console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
            logGravacao = logGravacao + param[0]

            if (data == "Script processing completed.") {

                PVI.FWLink.globalDaqMessagesObservers.remove(id)

                if (logGravacao.includes(`O.K.`)) {

                    clearTimeout(timeOutGravacao)
                    resolve({ sucess: true, msg: `Gravado com sucesso, caminho: ${dirProject}` })

                } else if (logGravacao.includes(`Cannot connect to target.`)) {

                    clearTimeout(timeOutGravacao)
                    resolve({ sucess: false, msg: `Cannot connect to target.` })

                }

            }
        }, "sniffer.exec")

        pvi.runInstructionS("EXEC", [`${pvi.runInstructionS("GETPVIPATH", [])}\\Plugins\\JLINK7\\JLink.exe`, `-device ${device} -CommandFile ${commandFile}`, "true", "true"])

        let timeOutGravacao = setTimeout(() => {

            PVI.FWLink.globalDaqMessagesObservers.remove(id)
            resolve({ sucess: false, msg: `Falha na gravação, verifique a conexão USB do gravador.` })

        }, timeOut)

    }
}