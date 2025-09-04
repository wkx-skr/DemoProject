<template>
  <div class="api-overview">
    <el-dialog
      :visible.sync="showDetailDialog"
      :append-to-body="true"
      :fullscreen="true"
      :show-close="false"
      class="api-detail-dialog"
    >
      <detail
        v-if="showType === 'dialog'"
        @closeDetailTab="closeDetailTab"
        @apiUpdate="apiUpdate"
        :isAdd="isAdd"
        :apiData="currentApiData"
        :ApiBaseurl="ApiBaseurl"
        :defaultDetailTab="defaultDetailTab"
        :modeType="modeType"
        :moudleType="moudleType"
        :disabledOption="disabledOption"
      ></detail>
    </el-dialog>
    <div class="api-list-container">
      <list
        v-if="!(showDetail && showType === 'default')"
        ref="listData"
        @addApi="addApi"
        @checkedApi="checkApi"
        @editApi="editApi"
        :modeType="modeType"
        :moudleType="moudleType"
        :disabledOption="disabledOption"
        :tableIdFilter="tableIdFilter"
        :hideTitle="hideTitle"
      ></list>
    </div>
    <div class="api-detail" v-if="showDetail && showType === 'default'">
      <detail
        @closeDetailTab="closeDetailTab"
        @apiUpdate="apiUpdate"
        :isAdd="isAdd"
        :apiData="currentApiData"
        :ApiBaseurl="ApiBaseurl"
        :defaultDetailTab="defaultDetailTab"
        :modeType="modeType"
        :moudleType="moudleType"
        :disabledOption="disabledOption"
        :defaultTableId="defaultTableId"
      ></detail>
    </div>
  </div>
</template>

<script>
import list from '@/view/dataAplication/apiOverview/list.vue'
import detail from '@/view/dataAplication/apiOverview/detail.vue'
import HTTP from '@/view/dataAplication/ddsHTTP'

export default {
  data() {
    return {
      showDetail: false, // 是否显示 api detail 页面
      showDetailDialog: false, // 是否显示 detail dialog
      isAdd: true,
      ApiBaseurl: '',
      defaultDetailTab: 'apiDoc',
      currentApiData: null,
      defaultTableId: null,
    }
  },
  name: 'apiOverview',
  props: {
    modeType: {},
    moudleType: {},
    // 详情显示方式
    showType: {
      default: 'default', // default dialog, // TODO newTab
    },
    // 是否隐藏 操作按钮
    disabledOption: {
      type: Boolean,
      default: false,
    },
    // 根据 表 id 过滤 list
    tableIdFilter: {
      type: [String, Number],
      default: '',
    },
    // 是否隐藏 list title
    hideTitle: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    list,
    detail,
  },
  computed: {},
  beforeMount() {
    this.getBaseurl()
  },
  mounted() {
    if (this.$route.query.apiId) {
      this.checkApi(this.$route.query.apiId)
    } else {
      this.showDetail = false
    }
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log('dataInit')
    },
    addApi(tableId) {
      if (tableId) {
        this.defaultTableId = tableId
      } else {
        this.defaultTableId = ''
      }
      this.defaultDetailTab = 'apiEdit'
      this.isAdd = true
      this.currentApiData = {}
      this.showDetail = true
    },
    closeDetailTab() {
      this.showDetail = false
    },
    getBaseurl() {
      HTTP.getApiBaseurl()
        .then(res => {
          this.ApiBaseurl = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkApi(id) {
      this.isAdd = false
      this.defaultDetailTab = 'apiDoc'

      const apiData = { id: id }

      this.currentApiData = apiData
      this.showDetail = true
    },
    editApi(id) {
      this.defaultDetailTab = 'apiEdit'
      const apiData = { id: id }
      this.currentApiData = apiData
      this.showDetail = true
    },
    apiUpdate() {
      if (this.$refs.listData && this.$refs.listData.refreshTable) {
        this.$refs.listData.refreshTable()
      }
    },
  },
  watch: {
    showDetail(newVal) {
      this.$emit('showDetail', newVal)
      if (this.showType === 'dialog') {
        this.showDetailDialog = newVal
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@mixin absPos() {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.api-overview {
  //border: 1px solid red;
  height: 100%;
  background-color: #fff;
  position: relative;

  .api-list-container,
  .api-detail {
    @include absPos();
    background-color: #fff;
    z-index: 1;
  }

  .api-detail {
    z-index: 3;
  }
}
</style>
