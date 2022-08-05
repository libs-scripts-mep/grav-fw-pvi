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
| Renesas    | Renesas Flash Programmer | ❌       |

## Resumo da Classe

```js

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

```

