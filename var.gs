//eval(UrlFetchApp.fetch('http://path.to/external/javascript.js').getContentText());
const mesi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"]
const token = /*telegram bot token*/
const telegramUrl = "https://api.telegram.org/bot" + token;
const webAppUrl = /*google app script web app url, used to set webhook*/
const myChatId = /*telegram chat id*/
const myEmail = /*mail for logging*/

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var anno = (new Date()).getFullYear()
var mese = (new Date()).getMonth()
var nomeMese = mesi[mese]
var sheet = spreadsheet.getSheetByName(nomeMese);

try{
  //  va nel try perche va in errore quando viene chiamata onEdit()
    var benzFile = SpreadsheetApp.openByUrl(/*url to fuel sheet*/)
    var benzSheet = benzFile.getSheetByName("BENZINA")
}catch(e){}

const Primaria = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "SPESA",
            "callback_data": "Spesa"
        }], [{
            "text": "MACCHINA",
            "callback_data": "Macchina"
        }], [{
            "text": "VIAGGI",
            "callback_data": "Viaggi"
        }], [{
            "text": "ALTRO",
            "callback_data": "Altro"
        }], [{
            "text": "INVESTIMENTI",
            "callback_data": "Investimenti"
        }], [{
            "text": "ENTRATE",
            "callback_data": "Entrate"
        }]]
    }
}
const Secondaria = {
    Spesa: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "CIBO",
                "callback_data": "Cibo"
            }], [{
                "text": "BAGNO",
                "callback_data": "Bagno"
            }], [{
                "text": "VESTITI",
                "callback_data": "Vestiti"
            }], [{
                "text": "SPORT",
                "callback_data": "Sport"
            }], [{
                "text": "SVAGO",
                "callback_data": "Svago"
            }], [{
                "text": "ALTRO",
                "callback_data": "Altro"
            }]]
        }
    },
    Macchina: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "BENZINA",
                "callback_data": "Benzina"
            }], [{
                "text": "ALTRO",
                "callback_data": "Altro"
            }]]
        }
    },
    Viaggi: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "TRASPORTI",
                "callback_data": "Trasporti"
            }], [{
                "text": "CASA",
                "callback_data": "Casa"
            }], [{
                "text": "CIBO",
                "callback_data": "Cibo"
            }], [{
                "text": "ALTRO",
                "callback_data": "Altro"
            }]]
        }
    },
    Altro: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "ALTRO",
                "callback_data": "Altro"
            }]]
        }
    },
    Investimenti: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "ETF",
                "callback_data": "ETF"
            }], [{
                "text": "CRIPTO",
                "callback_data": "Cripto"
            }]]
        }
    },
    Entrate: {
        "reply_markup": {
            "inline_keyboard": [[{
                "text": "STIPENDIO",
                "callback_data": "Stipendio"
            }], [{
                "text": "ALTRO",
                "callback_data": "Altro"
            }]]
        }
    }
}

const Comandi = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "AGGIUNGI MOVIMENTO",
            "callback_data": "AGGIUNGI MOVIMENTO"
        }], [{
            "text": "ULTIMI MOVIMENTI",
            "callback_data": "ULTIMI MOVIMENTI"
        }], [{
            "text": "MESE",
            "callback_data": "MESE"
        }], [{
            "text": "MESE PRECEDENTE",
            "callback_data": "MESE PRECEDENTE"
        }]]
    }
}

const EliminaUltimoMovimento = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "ELIMINA ULTIMO MOVIMENTO",
            "callback_data": "ELIMINA ULTIMO MOVIMENTO"
        }]]
    }
}
