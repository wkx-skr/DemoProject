1. ExportExcelService
用于导出xlsx格式的excel表格
该类为静态类，只暴露一个export方法。
```typescript
ExportExcelService.export (tableData: Array<Array<any>>, fileName = 'export', sheetName = 'sheet1'): void
```
第一个参数为数据，格式是一个二维数组，第二个参数是文件名，第三个参数是sheet名

2. ExportPdfService
用于将指定dom导出为pdf
该类为静态类，只暴露一个export方法
```typescript
ExportPdfService.export (dom: any,fileName = 'export', quality = 0.8, margin = 15, maxHeight = 12000): void
```
第一个参数为dom，第二个参数是图片质量，第三个参数是页面边距，第四个参数为高度上限（组件不支持过大的图片，该值设置过大会导致页面崩溃）
