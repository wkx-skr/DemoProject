// @ts-ignore
const vThis = window.vueThis;
enum PluginType {
  DataSourcePlugin = 10000,
  ReversePlugin = 10001,
}
const PluginTypeLabel: Array<string> = []
PluginTypeLabel[PluginType.DataSourcePlugin] = vThis.$mainVue.$t('system.plugInManager.DataSourcePlugin')
PluginTypeLabel[PluginType.ReversePlugin] = vThis.$mainVue.$t('system.plugInManager.ReversePlugin')
export {PluginType, PluginTypeLabel}
