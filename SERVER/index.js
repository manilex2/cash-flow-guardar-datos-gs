require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql2');
const { database } = require('./keys');
const PUERTO = 4300;
const app = express();
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const spreadsheetId = process.env.SPREADSHEET_ID;

app.use(morgan('dev'));

app.get('/', async (req, res) => {
    const conexion = mysql.createConnection({
        host: database.host,
        user: database.user,
        password: database.password,
        port: database.port,
        database: database.database
    });
    const client = await auth.getClient();
    const googleSheet = google.sheets({ version: 'v4', auth: client });
    try {
        var sql = `SELECT date,
        symbol, 
        cik,
        reportedCurrency,
        fillingDate,
        acceptedDate,
        calendarYear,
        period,
        netIncome,
        depreciationAndAmortization,
        deferredIncomeTax,
        stockBasedCompensation,
        changeInWorkingCapital,
        accountsReceivables,
        inventory,
        accountsPayables,
        otherWorkingCapital,
        otherNonCashItems,
        netCashProvidedByOperatingActivities,
        investmentsInPropertyPlantAndEquipment,
        acquisitionsNet,
        purchasesOfInvestments,
        salesMaturitiesOfInvestments,
        otherInvestingActivites,
        netCashUsedForInvestingActivites,
        debtRepayment,
        commonStockIssued,
        commonStockRepurchased,
        dividendsPaid,
        otherFinancingActivites,
        netCashUsedProvidedByFinancingActivities,
        effectOfForexChangesOnCash,
        netChangeInCash,
        cashAtEndOfPeriod,
        cashAtBeginningOfPeriod,
        operatingCashFlow,
        capitalExpenditure,
        freeCashFlow,
        link,
        finalLink FROM ${process.env.TABLE_CASH_FLOW}`;
        conexion.query(sql, function (err, resultado) {
            if (err) throw err;
            JSON.stringify(resultado);
            trasladarCashFlow(resultado);
        });
    } catch (error) {
        console.error(error);
    }
    async function trasladarCashFlow(resultado){
        try {
            await googleSheet.spreadsheets.values.clear({
                auth,
                spreadsheetId,
                range: `${process.env.ID_HOJA_RANGO}`
            });
            var datos = [];
            for (let i = 0; i < resultado.length; i++) {
                datos.push([
                    resultado[i].date,
                    resultado[i].symbol,
                    resultado[i].cik,
                    resultado[i].reportedCurrency,
                    resultado[i].fillingDate,
                    resultado[i].acceptedDate,
                    resultado[i].calendarYear,
                    resultado[i].period,
                    resultado[i].netIncome,
                    resultado[i].depreciationAndAmortization,
                    resultado[i].deferredIncomeTax,
                    resultado[i].stockBasedCompensation,
                    resultado[i].changeInWorkingCapital,
                    resultado[i].accountsReceivables,
                    resultado[i].inventory,
                    resultado[i].accountsPayables,
                    resultado[i].otherWorkingCapital,
                    resultado[i].otherNonCashItems,
                    resultado[i].netCashProvidedByOperatingActivities,
                    resultado[i].investmentsInPropertyPlantAndEquipment,
                    resultado[i].acquisitionsNet,
                    resultado[i].purchasesOfInvestments,
                    resultado[i].salesMaturitiesOfInvestments,
                    resultado[i].otherInvestingActivites,
                    resultado[i].netCashUsedForInvestingActivites,
                    resultado[i].debtRepayment,
                    resultado[i].commonStockIssued,
                    resultado[i].commonStockRepurchased,
                    resultado[i].dividendsPaid,
                    resultado[i].otherFinancingActivites,
                    resultado[i].netCashUsedProvidedByFinancingActivities,
                    resultado[i].effectOfForexChangesOnCash,
                    resultado[i].netChangeInCash,
                    resultado[i].cashAtEndOfPeriod,
                    resultado[i].cashAtBeginningOfPeriod,
                    resultado[i].operatingCashFlow,
                    resultado[i].capitalExpenditure,
                    resultado[i].freeCashFlow,
                    resultado[i].link,
                    resultado[i].finalLink
                ]);
            }
            await googleSheet.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: `${process.env.ID_HOJA_RANGO}`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    "range": `${process.env.ID_HOJA_RANGO}`,
                    "values": datos
                }
            });
            console.log('Datos agregados correctamente.');
        } catch (error) {
            console.error(error);
        }
        await finalizarEjecucion();
    };
    async function finalizarEjecucion() {
        conexion.end()
        res.send("Ejecutado");
    }
});

app.listen(process.env.PORT || PUERTO, () => {
    console.log(`Escuchando en puerto ${process.env.PORT || PUERTO}`);
});