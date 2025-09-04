// @ts-ignore
import html2pdf from 'html2pdf.js'
// @ts-ignore
import $ from 'jquery'
class ExportPdfService {
  public static export (dom: any,fileName = 'export', quality = 0.8, margin = 15, maxHeight = 12000): void {
      const width = parseInt($(dom).css('width'))
      const height = parseInt($(dom).css('height'))
      let opt = {
        margin: margin ? margin : 15,
        filename: fileName + '.pdf',
        image: { type: 'jpeg', quality: quality },
        html2canvas: {
          width: width,
          height: height > maxHeight ? maxHeight : height
        },
        pagebreak: { mode: 'legacy', before: '#page2el' }
      }
      html2pdf().set(opt).from(dom).save()
  }
}
export default ExportPdfService
