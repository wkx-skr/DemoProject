interface ErrorResponseData {
  rootErrorMessage ?: string,
  errorMessage ?: string
}
class ErrorHandler {
  public static buildInMessageTransformer(errorResponseData: ErrorResponseData): void {
    if (errorResponseData.errorMessage && errorResponseData.errorMessage.includes('Elasticsearch') && errorResponseData.errorMessage.includes('document_missing_exception')) {
      errorResponseData.rootErrorMessage = '进入系统任务执行 [元数据-全文索引更新任务]'
      errorResponseData.errorMessage = errorResponseData.rootErrorMessage
    }
  }
}
export default ErrorHandler
