import FWLink from "../daq-fwlink/FWLink.js"

export default class GravaFW {

    /**
     * 
     * @param {String} dirFirm 
     * @param {String} dirOpt 
     * @param {Object} objArguments 
     * @param {Number} [timeOut=5000] 
     * @returns 
     * 
     * # Exemplos
     * 
     * ```js
     * const programPath = "I:/script_repo/fw_repo/fw_v1_0.2.hex"
     * const optionPath = "I:/script_repo/fw_repo/opt.hex"
     * const writeFirmware = await GravaFW.STM8(programPath, optionPath, { Device: "STM8S003F3" })
     * ```
     * 
     * # Retorno
     * 
     * ```js
     * { success: Boolean, msg: String }
     * ```
     */
    static async STM8(dirFirm = null, dirOpt = null, objArguments = {}, timeOut = 5000) {

        return new Promise(async (resolve) => {

            let validationMsg = ``

            if (dirFirm != null && dirOpt != null) { validationMsg = `Verify OPTION BYTE succeeds` }
            else if (dirFirm != null) { validationMsg = `Verifying PROGRAM MEMORY succeeds` }
            else if (dirOpt != null) { validationMsg = `Verify OPTION BYTE succeeds` }
            else { validationMsg = "error" }

            let ObjWriteSTM8 = await defineWriteSTM8(dirFirm, dirOpt, objArguments)

            let logGravacao = ""

            if (ObjWriteSTM8.success) {

                const id = FWLink.PVIEventObserver.add((msg, param) => {

                    console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
                    logGravacao = logGravacao + param[0]

                    if (param[0] != undefined) {

                        if (param[0].includes(validationMsg)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: true, msg: "Gravação bem sucedida", dirFirm: dirFirm })

                        } else if (param[0].includes(`ERROR : Cannot communicate with the tool`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: null, msg: `Gravador não respondeu`, dirFirm: dirFirm })

                        } else if (param[0].includes(`(API) ERROR`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: null, msg: `Não foi possível realizar a gravação`, dirFirm: dirFirm })

                        }

                    }

                }, "sniffer.exec")

                let timeOutGravacao = setTimeout(() => {

                    console.log(`%cLog Program:\n\n${logGravacao}`, ' color: #EE0033')
                    FWLink.PVIEventObserver.remove(id)

                    resolve({ success: false, msg: `Falha na gravação do firmware final` })

                }, timeOut)

            } else {
                console.log(`%cNenhum diretório de firmware ou option byte informado`, ' color: #EE0033')
                resolve({ success: false, msg: `Nenhum diretório de firmware ou option byte informado` })
            }

            FWLink.runInstructionS("EXEC", [`${FWLink.runInstructionS("GETRESOURCESPATH", [])}\\stvp\\STVP_CmdLine.exe`, ObjWriteSTM8.commandLineArguments, "true", "true"])

        })

        /**
         * 
         * @param {String} dirFirm 
         * @param {String} dirOpt 
         * @param {Object} objArguments 
         * @returns 
         */
        async function defineWriteSTM8(dirFirm, dirOpt, objArguments) {

            return new Promise(async (resolve) => {

                const log = objArguments.log == true ? "-log " : ""
                const loop = objArguments.loop == true ? "-loop " : "-no_loop "
                const erase = objArguments.erase == true ? "-erase " : ""
                const blank = objArguments.blank == true ? "-blank " : ""
                const verif = objArguments.verif == true ? "-verif " : ""
                const verbose = objArguments.verbose == true ? "-verbose " : ""
                const version = objArguments.version == true ? "-version " : ""
                const progress = objArguments.progress == true ? "-progress " : ""
                const readProg = objArguments.readProg == true ? "-readProg " : ""
                const readData = objArguments.readData == true ? "-readData " : ""
                const readOption = objArguments.readOption == true ? "-readOption " : ""
                const no_progProg = objArguments.no_progProg == true ? "-no_progProg " : ""
                const warn_protect = objArguments.warn_protect == true ? "-warn_protect " : "-no_warn_protect "
                const no_progOption = objArguments.no_progOption == true ? "-no_progOption " : ""

                const Port = objArguments.Port != undefined ? `-Port=${objArguments.Port} ` : "-Port=USB "
                const ProgMode = objArguments.ProgMode != undefined ? `-ProgMode=${objArguments.ProgMode} ` : "-ProgMode=SWIM "
                const Device = objArguments.Device != undefined ? `-Device=${objArguments.Device}` : ""
                const NbTools = objArguments.NbTools != undefined ? `-NbTools=${objArguments.NbTools} ` : "-NbTools=1 "
                const Tool_ID = objArguments.Tool_ID != undefined ? `-Tool_ID=${objArguments.Tool_ID} ` : "-Tool_ID=0 "
                const BoardName = objArguments.BoardName != undefined ? `-BoardName=${objArguments.BoardName} ` : "-BoardName=ST-LINK "

                const FileData = objArguments.FileData != undefined ? `-FileOption=${objArguments.FileData} ` : ""
                const FileProg = dirFirm != null ? `-FileProg=${dirFirm.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)} ` : ""
                const FileOption = dirOpt != null ? `-FileOption=${dirOpt.replace(/[\\]/g, `\/`).replace(/\.stp|\.STP/, `.HEX`)} ` : ""

                resolve({
                    success: true,
                    commandLineArguments: `${BoardName}${Tool_ID}${NbTools}${Port}${ProgMode}${verbose}` +
                        `${loop}${warn_protect}${erase}${blank}${verif}${FileProg}${FileOption}${FileData}` +
                        `${readProg}${readData}${readOption}${log}${progress}${no_progOption}${no_progProg}${version}${version}${Device}`,
                })

            })
        }
    }

    /**
     * 
     * @param {String} dirProject 
     * @param {Number} [timeOut=5000] 
     * @returns 
     * 
     * # Exemplos
     * 
     * ```js
     * const programPath = "I:/script_repo/fw_repo/fw_v1_0.2.rpj"
     * const writeFirmware = await GravaFW.Renesas(programPath)
     * ```
     * 
     * # Retorno
     * 
     * ```js
     * { success: Boolean, msg: String }
     * ```
     */
    static async Renesas(dirProject = null, timeOut = 5000) {

        return new Promise((resolve) => {

            if (dirProject != null) {

                let logGravacao = ""

                const id = FWLink.PVIEventObserver.add((msg, param) => {

                    console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
                    logGravacao = logGravacao + param[0]

                    if (param[0] != undefined) {

                        if (param[0].includes(`Operation completed.`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: true, msg: "Gravação bem sucedida", dirProject: dirProject })

                        } else if (param[0].includes(`Cannot find the specified tool.`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: false, msg: `Gravador não respondeu`, dirProject: dirProject })

                        } else if (param[0].includes(`Error: No project file specifed.`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: false, msg: `Projeto informado é inválido`, dirProject: dirProject })

                        } else if (param[0].includes(`A framing error occurred while receiving data`)) {

                            FWLink.PVIEventObserver.remove(id)
                            clearTimeout(timeOutGravacao)

                            resolve({ success: false, msg: `Falha ao receber dados do microcontrolador`, dirProject: dirProject })

                        }

                    }

                }, "sniffer.exec")

                FWLink.runInstructionS("EXEC", [`${FWLink.runInstructionS("GETRESOURCESPATH", [])}/Renesas/RFPV3.Console.exe`, dirProject, "true", "true"])

                let timeOutGravacao = setTimeout(() => {

                    FWLink.PVIEventObserver.remove(id)
                    resolve({ success: false, msg: `Tempo de gravação excedido` })

                }, timeOut)

            } else {
                resolve({ success: false, msg: `Caminho do firmware não informado` })
            }

        })
    }


    /**
     * Realiza gravacao nos microcontroladores Nuvoton atraves do PVI, via JLink command line.
     * 
     * @param {string} dirProject caminho do firmware
     * @param {string} nameFile nome para o arquivo de comandos JLink que ficará na pasta 'C:/Temp/', sujestão: código effective
     * @param {string} device modelo do micrcontrolador
     * @param {number} [speed=4000] velocidade de gravação
     * @param {number} [timeOut=5000] tempo máximo de gravação
     * @returns {Promise<{success: boolean, msg: string}>} - resultado da gravação
     * 
     * # Exemplos
     * 
     * ```js
     * const programPath = "I:/script_repo/fw_repo/fw_v1_0.2.hex"
     * const codigo_effective = "1234"
     * const device = "STM32C031K6"
     * const writeFirmware = await GravaFW.JLink_v7(programPath, codigo_effective, device)
     * ```
     * 
     * # Retorno
     * 
     * ```js
     * { success: Boolean, msg: String }
     * ```
     */
    static async JLink_v7(dirProject = null, nameFile, device, speed = 4000, timeOut = 5000) {

        return new Promise((resolve) => {

            FWLink.runInstructionS("JLINK7.init", []) // Inicializa o JLink
            
            let logGravacao = ""

            const id = FWLink.PVIEventObserver.add((msg, param) => {

                console.log(`%cLog Program: ${param[0]}`, ' color: #B0E0E6')
                logGravacao = logGravacao + param[0]

                if (param == "Script processing completed.") {

                    FWLink.PVIEventObserver.remove(id)

                    if (logGravacao.includes('Program & Verify speed')) {

                        clearTimeout(timeOutGravacao)
                        resolve({ success: true, msg: dirProject })

                    } else if (logGravacao.includes(`Cannot connect to target.`)) {

                        clearTimeout(timeOutGravacao)
                        resolve({ success: false, msg: `Cannot connect to target.` })

                    }

                }
            }, "sniffer.exec")

            const commandFile = commandJlink(nameFile, speed, dirProject)
            FWLink.runInstructionS("EXEC", [`${FWLink.runInstructionS("GETPVIPATH", [])}\\Plugins\\JLINK7\\JLink.exe`, `-device ${device} -CommandFile ${commandFile}`, "true", "true"])

            let timeOutGravacao = setTimeout(() => {
                FWLink.PVIEventObserver.remove(id)
                resolve({ success: false, msg: `Falha na gravação, verifique a conexão USB do gravador.` })
            }, timeOut)
        })

        function commandJlink(nameFile, speed, dirProject) {
            if (FWLink.runInstructionS("vfs.directoryexists", [`C:/Temp/`]) == '1') {
                if (FWLink.runInstructionS("vfs.fileexists", [`C:/Temp/${nameFile}.txt`]) == '1') {
                    FWLink.runInstructionS("EXEC", ["cmd.exe", `/c (echo si 1 & echo speed ${speed} & echo r & echo h & echo erase & echo loadfile ${dirProject} & echo exit) > C:/Temp/${nameFile}.txt`, true, true])
                    return `C:/Temp/${nameFile}.txt`
                } else {
                    FWLink.runInstructionS("EXEC", ["cmd.exe", `/c (echo texto invalido) > C:/Temp/${nameFile}.txt`, true, true])
                    return commandJlink(nameFile, speed, dirProject)
                }
            } else {
                FWLink.runInstructionS("vfs.createdirectory", [`C:/Temp/`])
                return commandJlink(nameFile, speed, dirProject)
            }
        }
    }


    /**
     * Realiza gravacao nos microcontroladores Nuvoton atraves do PVI, via JLink command line
     * @param {string} sessionStorageTag tag para armazenar e acessar o numero da porta COM
     * @param {string} appPath formato esperado: "I:\\Documentos\\Softwares\\ESP32\\INV-161\\31L\\INV-161_INV-161_HW2-31-FW-v1.bat" ou "I:\\Documentos\\Softwares\\ESP32\\INV-161\\31L\\INV-161_INV-161_HW2-31-FW-v1.bin"
     * @param {boolean} isBatFile distingue extensão entre .bat e .bin
     * @param {number} betweenMsgTimeout timeout maximo para inatividade na comunicação com o ESP32 
     * 
     * # Exemplos
     * 
     * ```js
     * const AddressFilePath = "I:/firmware/path/FW-v1.bin"
     * const result = await GravaFW.ESP32("Controlador", AddressFilePath, false, 5000)
     * ```
     * 
     * # Result
     * 
     * ```js
     * { success: Boolean, msg: String }
     * ```
     */
    static async ESP32(sessionStorageTag, AddressFilePath, isBatFile, betweenMsgTimeout) {

        return new Promise((resolve) => {

            if (!AddressFilePath) {
                resolve({ success: false, msg: "Caminho de arquivo para gravação não especificado", AddressFilePath: AddressFilePath }); return
            }

            let portsFound = null, tryingPorts = [], lastTimeMsg = new Date().getTime()

            const betweenMsgMonitor = setInterval(() => {

                if (new Date().getTime() - lastTimeMsg > betweenMsgTimeout) {
                    clearInterval(betweenMsgMonitor)
                    FWLink.PVIEventObserver.remove(id)
                    resolve({ success: false, msg: "esptool.py encontrou um problema e teve que ser finalizado.", AddressFilePath: AddressFilePath }); return
                }

            }, 1000)

            const id = FWLink.PVIEventObserver.add((msg, param) => {

                const info = param[0]
                lastTimeMsg = new Date().getTime()
                console.log(`%cLog Program: ${param}`, ' color: #87CEEB')

                if (info.includes("Found")) {
                    const splittedInfo = info.split(" ")
                    portsFound = parseInt(splittedInfo[1])

                } else if (info.includes("Serial port")) {
                    const splittedInfo = info.split(" ")
                    tryingPorts.push(splittedInfo[2])

                } else if (info.includes("Failed to connect")) {
                    if (tryingPorts.length >= portsFound) {
                        FWLink.PVIEventObserver.remove(id)
                        resolve({ success: false, msg: "Gravador não conseguiu se conectar com o ESP32", AddressFilePath: AddressFilePath }); return
                    }

                } else if (info.includes("%")) {

                } else if (info.includes("Hard resetting via RTS pin...")) {
                    sessionStorage.getItem(sessionStorageTag) == null ? sessionStorage.setItem(sessionStorageTag, tryingPorts.pop()) : null
                    FWLink.PVIEventObserver.remove(id)
                    resolve({ success: true, msg: "Gravação bem sucedida", AddressFilePath: AddressFilePath })
                    console.timeEnd("WriteFirmware")
                }

            }, "PVI.Sniffer.sniffer.exec_return.data")

            console.log("writeFirmware ID", id)

            let pythonPath = "C:/esp-idf/Python/python.exe"
            let espToolPath = "C:/esp-idf/components/esptool_py/esptool/esptool.py"
            let port = ""

            sessionStorage.getItem(sessionStorageTag) != null ? port = `-p${sessionStorage.getItem(sessionStorageTag)}` : null

            const args = `${espToolPath} ${port} -b 480600 --before default_reset --after hard_reset --chip esp32  write_flash --flash_mode dio --flash_size detect --flash_freq 40m ${AddressFilePath}`

            if (isBatFile) {
                console.log(`Executando batch: ${AddressFilePath} args: ${port}`)
                FWLink.runInstructionS("EXEC", [AddressFilePath, port, "true", "true", "true"])
            } else {
                console.log(`Executando python: ${pythonPath} args: ${args}`)
                FWLink.runInstructionS("EXEC", [pythonPath, args, "true", "true", "true"])
            }

        })
    }

    static { window.GravaFW = GravaFW }

}