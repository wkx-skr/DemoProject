// @ts-ignore
import $ from 'jquery'
class ExportExcelService {
  private static initLibrary () {
    // @ts-ignore
    if (typeof window.XLSX === 'undefined') {
      $(document.body).append('<script src="./static/js/xlsx.full.min.js"></script>')
    }
  }
  public static export (tableData: Array<Array<any>>, fileName = 'export', sheetName = 'sheet1'): void {
    ExportExcelService.initLibrary()
    // @ts-ignore
    const wb = XLSX.utils.book_new(); const ws = XLSX.utils.aoa_to_sheet(tableData)
    /* add worksheet to workbook */
    // @ts-ignore
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    // @ts-ignore
    XLSX.writeFile(wb, fileName)
  }
  public static import(): void {
    ExportExcelService.initLibrary()

  }
}
export default ExportExcelService
