//  setta il dropdown per la categoria secondaria, chiamata quando si modifica manualmente il foglio
function onEdit() {
  const mesi = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"]
  var anno = (new Date()).getFullYear()
  var mese = (new Date()).getMonth()
  var nomeMese = mesi[mese]
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = spreadsheet.getSheetName()
  var sheet = spreadsheet.getSheetByName(nomeMese);

  if (mesi.includes(sheetName) && sheet.getActiveRange().getColumn() == 3 && sheet.getActiveRange().getRow() > 1) {
      var primaria = sheet.getActiveRange().getValue()
      var dataValidation = SpreadsheetApp.newDataValidation().requireValueInRange(sheet.getRange(primaria)).build()
      sheet.getActiveRange().offset(0, 1).setDataValidation(dataValidation)
  }
}
