// @ts-ignore
const vThis = window.vueThis
export default class FormValidator {
  public static dataScaleValidator (rule, value, callback):void {
    if (value && isNaN(value)) {
      callback(
        new Error(`${vThis.$version.domain.property.dataScale}必须是数字`)
      )
    } else {
      callback()
    }
  }
  public static dataPrecisionValidator (rule, value, callback):void {
    if (value && isNaN(value)) {
      callback(
        new Error(`${vThis.$version.domain.property.dataPrecision}必须是数字`)
      )
    }
    else {
      callback()
    }
  }
}
