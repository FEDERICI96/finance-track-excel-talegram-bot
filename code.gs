    //  viene attivata quando chiamata dal browser
function doGet(e) {
    return HtmlService.createHtmlOutput("Ciao!");
}

function sendMessage(chat_id, text, opt=true, data) {
    var options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(data)
    };
    var url = telegramUrl + "/sendMessage?chat_id=" + chat_id + "&text=" + text;
    try {
      var response;
      if (opt) { response = UrlFetchApp.fetch(url, options)
      } else { response = UrlFetchApp.fetch(url) }
      PropertiesService.getScriptProperties().setProperty('MsgId', JSON.parse(response.getContentText()).result.message_id)
    } catch (e) {
        mailLogger("Error Log", e)
    }
}

function doPost(e) {
    //mailLogger("Execution Log", e)
    var contents = JSON.parse(e.postData.contents);

    if (contents.message != undefined) {
        var chat_id = contents.message.from.id;
        if (chat_id != myChatId) {
            return false
        }
        var check = (isNumeric(contents.message.text) && 
          PropertiesService.getScriptProperties().getProperty('Primaria') != "" &&
          PropertiesService.getScriptProperties().getProperty('Secondaria') != "") ||
          (PropertiesService.getScriptProperties().getProperty('Secondaria') == "Benzina")

        if (contents.message.text.localeCompare("/start") == 0) {
            reset();
            sendMessage(chat_id, "Ciao!", true, Comandi);
        } else if (PropertiesService.getScriptProperties().getProperty('LastMsg') == "Importo" && check) {
            try {
              var primaria = PropertiesService.getScriptProperties().getProperty('Primaria')
              var secondaria = PropertiesService.getScriptProperties().getProperty('Secondaria')
              var descrizione = PropertiesService.getScriptProperties().getProperty('Descrizione')
              var importo;

              //  controllo se devo inseririre anche la benzina
              if(secondaria == "Benzina"){
                var res = (contents.message.text).split("-")
                if(res.length != 3){throw "Formato benzina non corretto"}
                importo = parseFloat(res[0])
                inserisciBenzina(importo, parseFloat(res[1]), parseFloat(res[2]))
              }else{
                importo = parseFloat(contents.message.text)
              }

              //  elimino il messaggio precedente e il messaggio con l'importo
              deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
              deleteMessage(chat_id, contents.message.message_id);
            
              var lRow = sheet.getLastRow();
              var lCol = sheet.getLastColumn()
              var range = sheet.getRange(lRow, 1, 1, lCol);
              var formulas = range.getFormulas();
              sheet.insertRowsAfter(lRow, 1);
              newRange = sheet.getRange(lRow + 1, 1, 1, lCol);
              newRange.setFormulas(formulas);

              //  imposto la validation corretta
              sheet.getRange(lRow + 1, 4, 1).setDataValidation(null)
              var dataValidation = SpreadsheetApp.newDataValidation().requireValueInRange(sheet.getRange(primaria)).build()
              sheet.getRange(lRow + 1, 4, 1).setDataValidation(dataValidation)

              //  inserimento dei dati
              sheet.getRange(lRow + 1, 1, 1).setValue(importo);
              sheet.getRange(lRow + 1, 2, 1).setValue(Utilities.formatDate(new Date(), 'GMT', 'dd'));
              sheet.getRange(lRow + 1, 3, 1).setValue(primaria);
              sheet.getRange(lRow + 1, 4, 1).setValue(secondaria);
              sheet.getRange(lRow + 1, 5, 1).setValue(descrizione);

              var answer = "Inserimento effettuato!%0A"
              answer += primaria + " ("
              answer += secondaria + ") : "
              answer += importo + " €%0A"
              answer += descrizione + "%0A%0A" + getRiepilogoMensile("corrente")
              sendMessage(chat_id, answer, true, OnlyOKButton);

            } catch (e) {
                reset()
                sendMessage(chat_id, "Inserimento fallito!", false);
            }
        } else if (PropertiesService.getScriptProperties().getProperty('LastMsg') == "Descrizione") {
            var cat_secondaria = PropertiesService.getScriptProperties().getProperty('Secondaria')
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
            deleteMessage(chat_id, contents.message.message_id);

            //  imposto la descrizione
            let descrizione = contents.message.text
            PropertiesService.getScriptProperties().setProperty('Descrizione', descrizione);
            PropertiesService.getScriptProperties().setProperty('LastMsg', "Importo");
            var answer = (cat_secondaria == "Benzina")?"Inserisci importo (€-km-€l)":"Inserisci importo"
            sendMessage(chat_id, answer, false);
        } else {
          deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
          deleteMessage(chat_id, contents.message.message_id);
          reset()
          sendMessage(chat_id, "Inserimento fallito!", false);
        }
    } else if (contents.callback_query != undefined) {
        var chat_id = contents.callback_query.from.id;
        if (chat_id != myChatId) {
            return false
        }
        
        if(contents.callback_query.message.text.startsWith("Ciao")){
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
            if(contents.callback_query.data == "AGGIUNGI MOVIMENTO"){
              sendMessage(chat_id, "Categoria primaria:", true, Primaria);
            }else if(contents.callback_query.data == "MESE"){
              sendMessage(chat_id, getRiepilogoMensile("corrente"), true, OnlyOKButton);
            }else if(contents.callback_query.data == "ULTIMI MOVIMENTI"){
              sendMessage(chat_id, getUltimiMovimenti(), true, UltimiMovimenti);
            }else if(contents.callback_query.data == "MESE PRECEDENTE"){
              sendMessage(chat_id, getRiepilogoMensile("precedente"), true, OnlyOKButton);
            }          
        } else if(contents.callback_query.data == "OK"){
            //  torno alla home
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
            reset()
            sendMessage(chat_id, "Ciao!", true, Comandi);
        } else if(contents.callback_query.data == "ELIMINA ULTIMO MOVIMENTO"){
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));
            var answer, res = eliminaUltimoMovimento()
            if(res == "OK"){ answer = "Movimento eliminato" }
            else{ answer = "Nessun movimento da eliminare" }
            sendMessage(chat_id, answer, true, OnlyOKButton);
        } else if (contents.callback_query.message.text == "Categoria primaria:") {
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));

            //  dopo aver impostato la categoria primaria chiedo la secondaria
            let cat_primaria = contents.callback_query.data
            PropertiesService.getScriptProperties().setProperty('Primaria', cat_primaria);
            var answer = "Categoria secondaria:";
            sendMessage(chat_id, answer, true, Secondaria[cat_primaria]);

        } else if (contents.callback_query.message.text == "Categoria secondaria:") {
            deleteMessage(chat_id, PropertiesService.getScriptProperties().getProperty('MsgId'));

            //  imposto la categoria secondaria
            let cat_secondaria = contents.callback_query.data
            PropertiesService.getScriptProperties().setProperty('Secondaria', cat_secondaria);
            //  lo devo salvare per inteccettare la risposta
            PropertiesService.getScriptProperties().setProperty('LastMsg', "Descrizione");
            sendMessage(chat_id, "Descrizione:", false);
        }
    }
}

function setWebhook() {
    var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function getMe() {
    var url = telegramUrl + "/getMe";
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function getUpdates() {
    var url = telegramUrl + "/getUpdates";
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function getMyCommands() {
    var url = telegramUrl + "/getMyCommands";
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function mailLogger(subject, content) {
    GmailApp.sendEmail(myEmail, subject, JSON.stringify(content));
}

function isNumeric(str) {
    if (typeof str != "string")
        return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function reset() {
    PropertiesService.getScriptProperties().setProperty('MsgId', "");
    PropertiesService.getScriptProperties().setProperty('Primaria', "");
    PropertiesService.getScriptProperties().setProperty('Secondaria', "");
    PropertiesService.getScriptProperties().setProperty('Descrizione', "");
    PropertiesService.getScriptProperties().setProperty('LastMsg', "");
}

function deleteMessage(chatId, msgId) {
    var options = {
          'method': 'post',
          'contentType': 'application/json',
          'payload': JSON.stringify( { chat_id: chatId, message_id: msgId } )
      };
    var url = telegramUrl + "/deleteMessage";
    UrlFetchApp.fetch(url, options);
}

function getRiepilogoMensile(tipo){
  var rowMese, nome;
  var sheetRiepilogo = spreadsheet.getSheetByName(anno);
  if(tipo == "corrente"){
    rowMese = 3 + mese
    nome = nomeMese
  }else if(tipo == "precedente"){
    if(mese == 0){
      return "Mese precedente non disponibile"
    }else{
      rowMese = 3 + (mese - 1)
      nome = mesi[(mese - 1)]
    }
  }

  let Tot = (sheetRiepilogo.getRange(31, rowMese, 1, 1).getValue()).toFixed(2)
  let TotInv = (sheetRiepilogo.getRange(32, rowMese, 1, 1).getValue()).toFixed(2)
  let Perc = (sheetRiepilogo.getRange(33, rowMese, 1, 1).getValue()).toFixed(2) * 100
  let PercInv = (sheetRiepilogo.getRange(34, rowMese, 1, 1).getValue()).toFixed(2) * 100

  var ret = "------------------------------%0A"
  ret += "RIEPILOGO " + nome + " %0A"
  ret += "------------------------------%0A"
  ret += "Spesa: " + (sheetRiepilogo.getRange(2, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "Macchina: " + (sheetRiepilogo.getRange(9, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "Viaggi: " + (sheetRiepilogo.getRange(12, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "Altro: " + (sheetRiepilogo.getRange(17, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "TOT: " + (sheetRiepilogo.getRange(19, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "------------------------------%0A"
  ret += "Investimenti: " + (sheetRiepilogo.getRange(24, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "------------------------------%0A"
  ret += "Entrate: " + (sheetRiepilogo.getRange(29, rowMese, 1, 1).getValue()).toFixed(2) + " €%0A"
  ret += "------------------------------%0A"
  ret += "Tot: " + Tot + " € [" + Perc + "%25] %0A"
  ret += "Tot (inv): " + TotInv + " € [" + PercInv + "%25] %0A"
  ret += "------------------------------%0A"
  return ret
}

function getUltimiMovimenti(){
  var ret = "", lRow = sheet.getLastRow();
  for(var i=0; i<(lRow-1);i++){
    var giorno = sheet.getRange(i+2, 2, 1, 1).getValue()
    var data = creaData(giorno,mese+1,anno)
    ret += "[" + data + "] "
    ret += sheet.getRange(i+2, 3, 1, 1).getValue() + " ("
    ret += sheet.getRange(i+2, 4, 1, 1).getValue() + ") - "
    ret += sheet.getRange(i+2, 5, 1, 1).getValue() + " : "
    ret += sheet.getRange(i+2, 1, 1, 1).getValue() + " €%0A"
  }
  if(ret == ""){ ret = "Nessun movimento questo mese" }
  return ret;
}

function eliminaUltimoMovimento(){
  var last = sheet.getLastRow()
  if(last>1){
    sheet.deleteRow(last)
    return "OK"
  }else{
    return "KO"
  }
}

function inserisciBenzina(importo, km, prezzo){
  var lRow = benzSheet.getLastRow();
  var lCol = benzSheet.getLastColumn()
  var range = benzSheet.getRange(lRow, 1, 1, lCol);
  var formulas = range.getFormulas();
  benzSheet.insertRowsAfter(lRow, 1);
  newRange = benzSheet.getRange(lRow + 1, 1, 1, lCol);
  newRange.setFormulas(formulas);

  benzSheet.getRange(lRow + 1, 3, 1).setValue(Utilities.formatDate(new Date(), 'GMT', 'dd/mm/yyyy'));
  benzSheet.getRange(lRow + 1, 4, 1).setValue(importo);
  benzSheet.getRange(lRow + 1, 5, 1).setValue(km);
  benzSheet.getRange(lRow + 1, 6, 1).setValue(prezzo);
}

function encURI(str){
  var ret = str.replaceAll(")","\\)").replaceAll("(","\\(").replaceAll("-","\\-")
  return encodeURIComponent(ret)
}

function creaData(g,m,y){
  return (numDigits(g) == 1 ? ("0" + g) : g) + "/" +
    (numDigits(m) == 1 ? ("0" + m) : m) + "/" + + y
}

function numDigits(x) {
  return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}

//  setta il dropdown per la categoria secondaria, chiamata quando si modifica manualmente il foglio
function onEdit() {
  var sheetName = spreadsheet.getSheetName()
  if (mesi.includes(sheetName) && sheet.getActiveRange().getColumn() == 3 && sheet.getActiveRange().getRow() > 2) {
      var primaria = sheet.getActiveRange().getValue()
      var dataValidation = SpreadsheetApp.newDataValidation().requireValueInRange(sheet.getRange(primaria)).build()
      sheet.getActiveRange().offset(0, 1).setDataValidation(dataValidation)
  }
}
