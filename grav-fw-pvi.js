class GravaFW {

    /**
     * Realiza gravacao nos microcontroladores ST atraves do PVI, via STVP command line 
     * @param {string} dirFirm formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} dirOpt formato esperado: "I:\\\Documentos\\\Softwares\\\STM8\\\STM8S003F3\\\INV-173\\\173v01\\\173v01_1.50_Com.stp"
     * @param {string} modelo_uC formato esperado: "STM8S003F3"
     * @param {function} callback 
     * @param {number} timeOut 
     */
    static STM8(dirFirm = null, dirOpt = null, modelo_uC = null, callback = () => { }, timeOut = 5000) {

        if (dirFirm != null && dirOpt != null) {

            let result = pvi.runInstructionS(`ST.writefirmwarestm8_stlink`, [
                dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`),
                dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`),
                modelo_uC
            ])

            let monitor = setInterval(() => {

                if (result != null) {

                    clearInterval(monitor)
                    clearTimeout(timeoutMonitor)

                    if (result.includes(`Verify OPTION BYTE succeeds`)) {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #00EE66')
                        callback(true, result)

                    } else if (result.includes(`ERROR : Cannot communicate with the tool`)) {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(null, `Gravador não respondeu`)

                    } else {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(false, `Falha na gravação do firmware final`)

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

        } else if (dirFirm != null) {

            let result = pvi.runInstructionS(`ST.writeprogramstm8_stlink`, [
                dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`),
                modelo_uC
            ])

            let monitor = setInterval(() => {

                clearInterval(monitor)
                clearTimeout(timeoutMonitor)

                if (result != null) {

                    if (result.includes(`Verifying PROGRAM MEMORY succeeds`)) {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #00EE66')
                        callback(true)

                    } else if (result.includes(`ERROR : Cannot communicate with the tool`)) {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(null, `Gravador não respondeu`)

                    } else {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(false, `Falha na gravação do firmware`)

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

        } else if (dirOpt != null) {

            let result = pvi.runInstructionS(`ST.writeoptionstm8_stlink`, [
                dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`),
                modelo_uC
            ])

            let monitor = setInterval(() => {

                clearInterval(monitor)
                clearTimeout(timeoutMonitor)

                if (result != null) {

                    if (result.includes(`Verify OPTION BYTE succeeds`)) {

                        console.log(`%cLog Desprotect:\n\n${result}`, ' color: #00EE66')
                        callback(true, result)

                    } else if (result.includes(`ERROR : Cannot communicate with the tool`)) {

                        console.log(`%cLog Desprotect:\n\n${result}`, ' color: #EE0033')
                        callback(null, `Gravador não respondeu`)

                    } else {

                        console.log(`%cLog Desprotect:\n\n${result}`, ' color: #EE0033')
                        callback(false, `Falha na gravação do option byte`)

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

        } else {
            callback(false, `Nenhum diretório de firmware ou option byte informado.`)
        }
    }

    /**
     * Realiza gravacao nos microcontroladores renesas atraves do PVI, via renesas flash programmer command line
     * @param {string} dirProject Formato esperado: "I:\\\Documentos\\\Softwares\\\RENESAS\\\R5F51303ADFL\\\INV-301\\\301v06\\\301v06.rpj"
     * @param {function} callback 
     * @param {number} timeOut 
     */
    static Renesas(dirProject = null, callback = () => { }, timeOut = 5000) {

        if (dirProject != null) {

            let result = pvi.runInstructionS(`RENESAS.gravafw`, [dirProject])

            let monitor = setInterval(() => {

                if (result != null) {

                    clearInterval(monitor)
                    clearTimeout(timeoutMonitor)

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
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, `Tempo de gravação excedido`)
            }, timeOut)

        } else {
            callback(false, `Caminho do firmware não informado`)
        }
    }
}