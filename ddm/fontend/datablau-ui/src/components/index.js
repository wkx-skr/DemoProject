import HelloWorld from "@/components/HelloWorld.vue";
import HiThere from "@/components/HiThere.vue"
import Root from "@/components/root/main.vue"
import Lineage from "@/components/lineage/main/lineageGraph.vue"
import DatablauButton from '@/components/basic/button/DatablauButton.vue'
import DatablauTooltip from '@/components/basic/tooltip/DatablauTooltip.vue'
import DatablauTips from '@/components/basic/tips/DatablauTips.vue'
// import DatablauBadge from '@/components/basic/badge/DatablauBadge.vue'
// import DatablauBreadcrumb from '@/components/basic/breadcrumb/Breadcrumb.vue'
// import DatablauCascader from '@/components/basic/cascader/DatablauCascader.vue'
// import DatablauCheckbox from '@/components/basic/checkbox/DatablauCheckbox.vue'
// import DatablauCheckbox2 from '@/components/basic/checkbox/DatablauCheckbox2.vue'
// import DatablauElTable from '@/components/basic/compositeTable/DatablauElTable.vue'
// import DatablauTreeWithList from '@/components/basic/compositeTree/DatablauTreeWithList.vue'
// import DatablauDatePicker from '@/components/basic/datepicker/DatablauDatePicker.vue'
// import DatablauDateRange from '@/components/basic/daterange/DatablauDateRange.vue'
// import DatablauDetail from '@/components/basic/detail/DatablauDetail.vue'
// import DatablauDetailSubtitle from '@/components/basic/detailSubtitle/DatablauDetailSubtitle.vue'
// import DatablauDialog from '@/components/basic/dialog/DatablauDialog.vue'
// import DatablauDownload from '@/components/basic/download/DatablauDownload.vue'
// import DatablauDropdown from '@/components/basic/dropdown/DatablauDropdown.vue'
// import DatablauEasyTree from '@/components/basic/easyTree/DatablauEasyTree.vue'
// import DatablauEditor from '@/components/basic/editor/DatablauEditor.vue'
// import DatablauForm from '@/components/basic/form/DatablauForm.vue'
// import DatablauFormSubmit from '@/components/basic/formSubmit/DatablauFormSubmit.vue'
// import DatablauHighLight from '@/components/basic/highLight/DatablauHighLight.vue'
// import DatablauIcon from '@/components/basic/icon/DatablauIcon.vue'
// import DatablauInput from '@/components/basic/input/DatablauInput.vue'
// import DatablauListSearch from '@/components/basic/listSearch/listSearch.vue'
// import DatablauMetaDataAttr from '@/components/basic/metaDataAttr/metaDataAttr.vue'
// import DatablauNull from '@/components/basic/nulldata/DatablauNull.vue'
// import DatablauPagination from '@/components/basic/pagination/DatablauPagination.vue'
// import DatablauPopConfirm from '@/components/basic/popConfirm/DatablauPopConfirm.vue'
// import DatablauProgress from '@/components/basic/progress/DatablauProgress.vue'
// import DatablauRadio from '@/components/basic/radio/DatablauRadio.vue'
// import DatablauRate from '@/components/basic/rate/DatablauRate.vue'
// import DatablauLink from '@/components/basic/richtip/DatablauRichtip.vue'
// import DatablauRoleselect from '@/components/basic/roleselect/DatablauRoleselect.vue'
// import DatablauSelect from '@/components/basic/select/DatablauSelect.vue'
// import DatablauStatus from '@/components/basic/status/DatablauStatus.vue'
// import DatablauSubtab from '@/components/basic/subtab/DatablauSubtab.vue'
// import DatablauSwitch from '@/components/basic/switch/DatablauSwitch.vue'
// import DatablauTable from '@/components/basic/table/DatablauTable.vue'
// import DatablauTabs from '@/components/basic/tabs/index.vue'
// import DatablauTag from '@/components/basic/tag/DatablauTag.vue'
// import DatablauTransfer from '@/components/basic/transfer/DatablauTransfer2.vue'
// import DatablauTree from '@/components/basic/tree/DatablauTree.vue'
// import DatablauTreeHeader from '@/components/basic/treeHeader/treeHeader.vue'
// import DatablauUpload from '@/components/basic/upload/DatablauUpload.vue'
// import DatablauUserselect from '@/components/basic/userselect/DatablauUserselect.vue'
import RouterUtils from "@/utils/RouterUtils";
// import { blauShowSuccess, blauShowFailure, DatablauMessage } from '@/components/basic/message/DatablauMessage'
// import { DatablauCofirm, DatablauAlert, DatablauPrompt } from '@/components/basic/messageBox/DatablauMessageBox'
import '@/components/basic/message/DatablauMessage.scss'

const components = [
  HelloWorld,
  HiThere,
  Root,
  Lineage,
  DatablauButton,
  DatablauTooltip,
  DatablauTips,
  // DatablauBadge,
  // DatablauBreadcrumb,
  // DatablauCascader,
  // DatablauCheckbox,
  // DatablauCheckbox2,
  // DatablauElTable,
  // DatablauTreeWithList,
  // DatablauDatePicker,
  // DatablauDateRange,
  // DatablauDetail,
  // DatablauDetailSubtitle,
  // DatablauDialog,
  // DatablauDownload,
  // DatablauDropdown,
  // DatablauEasyTree,
  // DatablauEditor,
  // DatablauForm,
  // DatablauFormSubmit,
  // DatablauHighLight,
  // DatablauIcon,
  // DatablauInput,
  // DatablauListSearch,
  // DatablauMetaDataAttr,
  // DatablauNull,
  // DatablauPagination,
  // DatablauPopConfirm,
  // DatablauProgress,
  // DatablauRadio,
  // DatablauRate,
  // DatablauLink,
  // DatablauRoleselect,
  // DatablauSelect,
  // DatablauStatus,
  // DatablauSubtab,
  // DatablauSwitch,
  // DatablauTable,
  // DatablauTabs,
  // DatablauTag,
  // DatablauTransfer,
  // DatablauTree,
  // DatablauTreeHeader,
  // DatablauUpload,
  // DatablauUserselect,
]
const install = function (Vue, opts = {}) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
  Vue.prototype.BaseUtils = {}
  Vue.prototype.BaseUtils.RouterUtils = RouterUtils
  // Vue.prototype.$blauShowSuccess = blauShowSuccess
  // Vue.prototype.$blauShowFailure = blauShowFailure
  // Vue.prototype.$datablauMessage = DatablauMessage
  // Vue.prototype.$DatablauCofirm = DatablauCofirm
  // Vue.prototype.$DatablauAlert = DatablauAlert
  // Vue.prototype.$DatablauPrompt = DatablauPrompt
}
export default {
  install,
  RouterUtils
}
