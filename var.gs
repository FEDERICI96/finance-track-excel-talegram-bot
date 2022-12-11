//eval(UrlFetchApp.fetch('http://path.to/external/javascript.js').getContentText());
const mesi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"]
const token = "";
const telegramUrl = "https://api.telegram.org/bot" + token;
const webAppUrl = "";
const myChatId = ""
const myEmail = ""
const sheetLOG = SpreadsheetApp.getActive().getSheetByName('BOT LOG')

try{
  //  va nel try perche va in errore quando viene chiamata onEdit()

  //  a fine anno va cambiato con il collegamento al nuovo file
  var spreadsheet = SpreadsheetApp.openByUrl("");
  var anno = (new Date()).getFullYear()
  var mese = (new Date()).getMonth()
  var nomeMese = mesi[mese]
  var sheet = spreadsheet.getSheetByName(nomeMese);

  //var benzFile = SpreadsheetApp.openByUrl("")
  var benzFile = SpreadsheetApp.openByUrl("")
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
            "inline_keyboard": [
              [{
                "text": "CASA",
                "callback_data": "Casa"
            }], [{
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
                "text": "TRASPORTI",
                "callback_data": "Trasporti"
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
                "text": "MANUTENZIONE",
                "callback_data": "Manutenzione"
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
                "text": "ATTIVITA",
                "callback_data": "Attivita"
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
                "text": "ALTRO",
                "callback_data": "Altro"
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
        }], [{
            "text": "PORTAFOGLIO",
            "callback_data": "PORTAFOGLIO"
        }], [{
            "text": "❌",
            "callback_data": "CHIUDI"
        }]]
    }
}

const UltimiMovimenti = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "ELIMINA ULTIMO MOVIMENTO",
            "callback_data": "ELIMINA ULTIMO MOVIMENTO"
        }],[{
            "text": "❌",
            "callback_data": "OK"
        }]]
    }
}

const OnlyOKButton = {
    "reply_markup": {
        "inline_keyboard": [[{
            "text": "❌",
            "callback_data": "OK"
        }]]
    }
}
