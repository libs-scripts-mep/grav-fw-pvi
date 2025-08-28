class GravaFW {

    /**
     * Realiza gravacao nos microcontroladores ST atraves do PVI, via STVP command line 
     * @param {string} dirFirm formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} dirOpt formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} modelo_uC formato esperado: "STM8S003F3"
     * @param {function(boolean, string)} callback 
     * @param {number} timeOut 
    */
    static STM8(dirFirm = null, dirOpt = null, device = "STM8S003F3", callback = () => { }, timeOut = 5000) {
        if (dirFirm != null || dirOpt != null) {
            let validationMsg = ""

            if (dirFirm != null && dirOpt != null) validationMsg = `Verify OPTION BYTE succeeds`
            else if (dirFirm != null) validationMsg = `Verifying PROGRAM MEMORY succeeds`
            else if (dirOpt != null) validationMsg = `Verify OPTION BYTE succeeds`
            else validationMsg = "error"

            const eventObserverId = pvi.FWLink.globalDaqMessagesObservers.add((msg, [stm8OutLog]) => {
                console.log(`%cLog Program: ${stm8OutLog}`, ' color: #B0E0E6')

                if (stm8OutLog != undefined) {
                    if (stm8OutLog.includes(validationMsg)) {
                        clearTimeout(timeoutGravacao)
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        callback(true, `Gravação bem-sucedida`)
                    } else if (stm8OutLog.includes(`ERROR : Cannot communicate with the tool`)) {
                        clearTimeout(timeoutGravacao)
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        callback(null, `Gravador não respondeu`)
                    } else if (stm8OutLog.includes(`(API) ERROR`)) {
                        clearTimeout(timeoutGravacao)
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        callback(null, `Não foi possível realizar a gravação`)
                    }
                }
            }, "sniffer.exec")

            const timeoutGravacao = setTimeout(() => {
                pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

            pvi.runInstructionS(
                "EXEC",
                [`${pvi.runInstructionS("GETRESOURCESPATH", [])}\\stvp\\STVP_CmdLine.exe`, this.stm8CommandLineArguments(dirFirm, dirOpt, device), "true", "true"]
            )
        } else {
            callback(false, `Nenhum diretório de firmware ou option byte informado.`)
        }
    }

    static stm8CommandLineArguments(dirFirm, dirOpt, device) {
        const fileProg = dirFirm != null ? `-FileProg=${dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)} ` : ""
        const fileOption = dirOpt != null ? `-FileOption=${dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)} ` : ""
        return `-BoardName=ST-LINK -Tool_ID=0 -NbTools=1 -Port=USB -ProgMode=SWIM -no_loop -no_warn_protect ${fileProg}${fileOption}-Device=${device}`
    }

    /**
     * Realiza gravacao nos microcontroladores renesas atraves do PVI, via renesas flash programmer command line
     * @param {string} dirProject Formato esperado: "I:\\\Documentos\\\Softwares\\\RENESAS\\\R5F51303ADFL\\\INV-301\\\301v06\\\301v06.rpj"
     * @param {function} callback 
     * @param {number} timeOut 
     */
    static Renesas(dirProject = null, callback = () => { }, timeOut = 5000) {

        if (dirProject != null) {
            const eventObserverId = pvi.FWLink.globalDaqMessagesObservers.add((msg, [renesasOutLog]) => {
                console.log(`%cLog Program: ${renesasOutLog}`, ' color: #B0E0E6')

                if (renesasOutLog != undefined) {
                    if (renesasOutLog.includes(`Operation completed.`)) {
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        clearTimeout(timeoutGravacao)
                        callback(true, `Gravação bem-sucedida: ${dirProject}`)
                    } else if (renesasOutLog.includes(`Cannot find the specified tool.`)) {
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        clearTimeout(timeoutGravacao)
                        callback(null, `Gravador não respondeu`)
                    } else if (renesasOutLog.includes(`Error: No project file specifed.`)) {
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        clearTimeout(timeoutGravacao)
                        callback(false, `Projeto informado é inválido`)
                    } else if (renesasOutLog.includes(`The device is not responding.`)) {
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        clearTimeout(timeoutGravacao)
                        callback(false, `Sem resposta do microcontrolador`)
                    } else if (renesasOutLog.includes(`A framing error occurred while receiving data`)) {
                        pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                        clearTimeout(timeoutGravacao)
                        callback(false, `Falha ao receber dados do microcontrolador`)
                    }
                }
            }, "sniffer.exec")

            let timeoutGravacao = setTimeout(() => {
                pvi.FWLink.globalDaqMessagesObservers.remove(eventObserverId)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

            pvi.runInstructionS("EXEC", [`${pvi.runInstructionS("GETRESOURCESPATH", [])}/Renesas/RFPV3.Console.exe`, dirProject, "true", "true"])
        } else {
            callback(false, `Caminho do firmware não informado`)
        }
    }

    /**
     * Realiza gravacao nos microcontroladores Nuvoton atraves do PVI, via JLink command line
     * @param {string} dirProject Formato esperado: "C:\\Users\\eduardo.rezzadori\\Desktop\\Farmwar\\193M3PL3v01_3.02.hex"
     * @param {string} commandFile Arquivo de comandos JLink, pseudo-script de gravação
     * @param {string} device modelo do micrcontrolador
     * @param {function} callback 
     * @param {number} timeOut 
     */
    static JLink_v7(dirProject = null, commandFile = null, device, callback = () => { }, timeOut = 10000) {

        let error = null, observer = null, logGravacao = [], controleGravacao = null
        const pathPVI = pvi.runInstructionS("GETPVIPATH", [])

        observer = pvi.FWLink.globalDaqMessagesObservers.add((m, data) => {
            console.log(m, data)
            logGravacao.push(data)
            if (data == "Script processing completed.") {
                pvi.FWLink.globalDaqMessagesObservers.clear()
                pvi.daq.init()
                logGravacao.forEach((e) => {
                    if (e == "O.K.") {
                        observer = () => { }
                        controleGravacao = true
                    } else if (e == "Cannot connect to target.") {
                        error = e
                    }
                })
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
        pvi.runInstructionS("EXEC", [`${pathPVI}\\Plugins\\JLINK7\\JLink.exe`, `-device ${device} -CommandFile ${commandFile}`, "true", "true"])
        let timeOutGravacao = setTimeout(() => {
            pvi.FWLink.globalDaqMessagesObservers.clear()
            pvi.daq.init()
            callback(false, `Falha na gravação, verifique a conexão USB do gravador`)
        }, timeOut)
    }
}