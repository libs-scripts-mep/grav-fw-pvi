class GravaFW {

    static STM8(dirFirm = null, dirOpt = null, modelo_uC = null, callback = () => { }, timeOut = 5000) {

        if (dirFirm != null && dirOpt != null) {

            let result = pvi.runInstructionS("ST.writefirmwarestm8_stlink", [
                dirFirm.replace(/[\\]/g, "\/").replace(/\.stp|\.STP/, ".HEX"),
                dirOpt.replace(/[\\]/g, "\/").replace(/\.stp|\.STP/, ".HEX"),
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
                        callback(null, "Gravador não respondeu")

                    } else {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(false, "Falha na gravação do firmware final")

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, "Tempo de gravação excedido")
            }, timeOut)

        } else if (dirFirm != null) {

            let result = pvi.runInstructionS(`ST.writeprogramstm8_stlink`, [
                dirFirm.replace(/[\\]/g, "\/").replace(/\.stp|\.STP/, ".HEX"),
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
                        callback(null, "Gravador não respondeu")

                    } else {

                        console.log(`%cLog Program:\n\n${result}`, ' color: #EE0033')
                        callback(false, "Falha na gravação do firmware")

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, "Tempo de gravação excedido")
            }, timeOut)

        } else if (dirOpt != null) {

            let result = pvi.runInstructionS("ST.writeoptionstm8_stlink", [
                dirOpt.replace(/[\\]/g, "\/").replace(/\.stp|\.STP/, ".HEX"),
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
                        callback(null, "Gravador não respondeu")

                    } else {

                        console.log(`%cLog Desprotect:\n\n${result}`, ' color: #EE0033')
                        callback(false, "Falha na gravação do option byte")

                    }
                }
            }, 100)

            let timeoutMonitor = setTimeout(() => {
                clearInterval(monitor)
                callback(false, "Tempo de gravação excedido")
            }, timeOut)

        } else {
            callback(false, "Nenhum diretório de firmware ou option byte informado.")
        }
    }
}