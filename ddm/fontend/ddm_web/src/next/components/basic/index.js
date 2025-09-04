import DatablauButton from '@/next/components/basic/button/DatablauButton.vue'
import DatablauInput from '@/next/components/basic/input/DatablauInput.vue'
import DatablauRadio from '@/next/components/basic/radio/DatablauRadio.vue'
import DatablauUpload from '@/next/components/basic/upload/DatablauUpload.vue'
import DatablauTree from '@/next/components/basic/tree/DatablauTree.vue'
import DatablauProgress from '@/next/components/basic/progress/DatablauProgress.vue'
import DatablauTabs from '@/next/components/basic/tabs/index.vue'
import DatablauCheckbox from '@/next/components/basic/checkbox/DatablauCheckbox.vue'
import DatablauCheckbox2 from '@/next/components/basic/checkbox/DatablauCheckbox2.vue'
import DatablauDatePicker from '@/next/components/basic/datepicker/DatablauDatePicker.vue'
import DatablauEditor from '@/next/components/basic/editor/DatablauEditor.vue'
import DatablauSelect from '@/next/components/basic/select/DatablauSelect.vue'
import DatablauCascader from '@/next/components/basic/cascader/DatablauCascader.vue'
import DatablauTransfer from '@/next/components/basic/transfer/DatablauTransfer2.vue'
import DatablauTable from '@/next/components/basic/table/DatablauTable.vue'
import DatablauTableCheckboxFilter from '@components/basic/table/DatablauTableCheckboxFilter.vue'
import DatablauTableDateRangeFilter from '@components/basic/table/DatablauTableDateRangeFilter.vue'
import DatablauTableTreeFilter from '@components/basic/table/DatablauTableTreeFilter.vue'
import DatablauDateRange from '@/next/components/basic/daterange/DatablauDateRange.vue'
import DatablauRate from '@/next/components/basic/rate/DatablauRate.vue'
import DatablauPagination from '@/next/components/basic/pagination/DatablauPagination.vue'
import DatablauBreadcrumb from '@/next/components/basic/breadcrumb/Breadcrumb.vue'
import DatablauTooltip from '@/next/components/basic/tooltip/DatablauTooltip.vue'
import DatablauDownload from '@/next/components/basic/download/DatablauDownload.vue'
import DatablauElTable from '@/next/components/basic/compositeTable/DatablauElTable.vue'
import DatablauTreeWithList from '@/next/components/basic/compositeTree/DatablauTreeWithList.vue'
import DatablauNull from '@/next/components/basic/nulldata/DatablauNull.vue'
import DatablauSelectWeak from '@/next/components/basic/select/DatablauSelectWeak.vue'
import DatablauFormSubmit from '@/next/components/basic/formSubmit/DatablauFormSubmit.vue'
import DatablauForm from '@/next/components/basic/form/DatablauForm.vue'
import DatablauDialog from '@/next/components/basic/dialog/DatablauDialog.vue'
import DatablauListSearch from '@/next/components/basic/listSearch/listSearch.vue'
import DatablauSwitch from '@/next/components/basic/switch/DatablauSwitch.vue'
import DatablauIcon from '@/next/components/basic/icon/DatablauIcon.vue'
import DatablauTips from '@/next/components/basic/tips/DatablauTips.vue'
import DatablauCodeMirror from '@/next/components/basic/codeMirror/DatablauCodeMirror.vue'
import DatablauSubtab from '@/next/components/basic/subtab/DatablauSubtab.vue'
import DatablauStatus from '@/next/components/basic/status/DatablauStatus.vue'
import DatablauDetailSubtitle from '@/next/components/basic/detailSubtitle/DatablauDetailSubtitle.vue'
import DatablauDetail from '@/next/components/basic/detail/DatablauDetail.vue'
import DatablauUserselect from '@/next/components/basic/userselect/DatablauUserselect.vue'
import DatablauRoleselect from '@/next/components/basic/roleselect/DatablauRoleselect.vue'
import DatablauLink from '@/next/components/basic/richtip/DatablauRichtip.vue'
import DatablauMetaDataAttr from '@/next/components/basic/metaDataAttr/metaDataAttr.vue'
import DatablauTag from '@/next/components/basic/tag/DatablauTag.vue'
import DatablauBadge from '@/next/components/basic/badge/DatablauBadge.vue'
import DatablauPopConfirm from '@/next/components/basic/popConfirm/DatablauPopConfirm.vue'
import DatablauDropdown from '@/next/components/basic/dropdown/DatablauDropdown.vue'
import DatablauEasyTree from '@/next/components/basic/easyTree/DatablauEasyTree.vue'
import DatablauLineage from '@/next/components/basic/lineage/main/lineageGraph.vue'
import DatablauFolderHeader from '@/next/components/basic/folderHeader/DatablauFolderHeader'


const components = [
  DatablauButton,
  DatablauInput,
  DatablauRadio,
  DatablauUpload,
  DatablauTree,
  DatablauCheckbox,
  DatablauCheckbox2,
  DatablauDatePicker,
  DatablauEditor,
  DatablauProgress,
  DatablauTabs,
  DatablauSelect,
  DatablauTable,
  DatablauTableCheckboxFilter,
  DatablauTableDateRangeFilter,
  DatablauTableTreeFilter,
  DatablauDateRange,
  DatablauRate,
  DatablauBreadcrumb,
  DatablauCascader,
  DatablauTransfer,
  DatablauTooltip,
  DatablauPagination,
  DatablauDownload,
  DatablauElTable,
  DatablauTreeWithList,
  DatablauNull,
  DatablauSelectWeak,
  DatablauFormSubmit,
  DatablauForm,
  DatablauDialog,
  DatablauListSearch,
  DatablauSwitch,
  DatablauIcon,
  DatablauTips,
  DatablauCodeMirror,
  DatablauSubtab,
  DatablauStatus,
  DatablauDetailSubtitle,
  DatablauDetail,
  DatablauUserselect,
  DatablauRoleselect,
  DatablauLink,
  DatablauMetaDataAttr,
  DatablauTag,
  DatablauBadge,
  DatablauPopConfirm,
  DatablauDropdown,
  DatablauEasyTree,
  DatablauLineage,
  DatablauFolderHeader,
]

const install = function (Vue, opts = {}) {
  components.forEach(component => {
    if (component.entryName) {
      Vue.component(component.entryName, component)
    } else {
      Vue.component(component.name, component)
    }
  })
}
export default {
  install,
}
