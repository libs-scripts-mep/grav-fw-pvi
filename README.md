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

## Exemplo de Utilização de Buffers

```js

static async GravaFirmware(ObjParams) {

        return new Promise(async (resolve) => {

        if(await ExecGravacao(dirFirm, dirOpt, modelo_uC, ObjParams)){
            console.log("GRAVOU")
        }else{
            console.log("NÃO GRAVOU")
        }

        async function ExecGravacao(dirFirm, dirOpt, modelo_uC, ObjParams) {

            let RetornoGravacao = await GravaFW.STM8(dirFirm, dirOpt, modelo_uC, ObjParams.timeOut)

            if (RetornoGravacao.sucess) {

                return true
                
            } else {

                if (ObjParams.Tentativa >= ObjParams.MaxTentativas) {
                    return false
                } else {
                    ObjParams.Tentativa++
                    return ExecGravacao(dirFirm, dirOpt, modelo_uC, ObjParams)
                }

            }

        }
    }

```

