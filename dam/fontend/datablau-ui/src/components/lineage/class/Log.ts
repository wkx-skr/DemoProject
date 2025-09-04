import moment from "moment";
class Log {
  private static logList: Array<string> = []
  private static getCurrentTime(): string {
    return moment(new Date()).format('YYYY-MM-DD HH:mm:ss:SSS')
  }
  public static basicLog(input: string): void {
    console.log(this.getCurrentTime() + ' ' + input)
    this.logList.push(input)
  }
  public static importantLog(input: string): void {
    console.warn(this.getCurrentTime() + ' ' + input)
    this.logList.push(input)
  }
}
export default Log
