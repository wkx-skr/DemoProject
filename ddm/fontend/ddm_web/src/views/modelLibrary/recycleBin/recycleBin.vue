<template>
  <div class="recycle-container">
    <datablau-dialog
        append-to-body
        title="模型回收站"
        width="720px"
        height="465px"
        :visible.sync="showRecycleBinDialog"
        custom-class="recycle-bin-dialog"
        :blackTheme="$route.path.indexOf('sql_editor') !== -1"
    >
      <delete-model-list v-if="showRecycleBinDialog"></delete-model-list>
    </datablau-dialog>
    <datablau-button
        type="normal"
        class="iconfont icon-Recycle"
        :themeBlack="$route.path.indexOf('sql_editor') !== -1"
        @click="showRecycleBin">
      模型回收站
    </datablau-button>
  </div>
</template>

<script>
import deleteModelList from './deleteModelList.vue'

export default {
  name: 'recycleBin',
  data () {
    return {
      showRecycleBinDialog: false
    }
  },
  components: {
    deleteModelList
  },
  computed: {},
  mounted () {
    this.dataInit()
  },
  methods: {
    dataInit () {
      // console.log('dataInit')
    },
    showRecycleBin () {
      this.showRecycleBinDialog = true
    }
  },
  watch: {}
}
</script>

<style lang="scss" scoped>
.recycle-container {
  display: inline-block;
}
</style>
<style lang="scss">
.recycle-bin-dialog {
  .content-inner {
    height: 100%;
  }
}

.el-dialog__wrapper .recycle-bin-dialog.el-dialog .el-dialog__body {
  padding-top: 0;
}

</style>
