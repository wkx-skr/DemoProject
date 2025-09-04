<template>
  <div>
    <el-tabs
      type="card"
      class="page-card-tabs"
      v-model="currentTab"
      @tab-remove="removeTab"
    >
      <!-- dataServiceTab -->
      <el-tab-pane label="我的服务" name="mySer">
        <data-service-tab
          :serType="'mySer'"
          key="mySer"
          ref="mySer"
        ></data-service-tab>
      </el-tab-pane>
      <el-tab-pane label="共享服务" name="sharedSer" v-if="false">
        <data-service-tab
          :serType="'sharedSer'"
          key="sharedSer"
          ref="sharedSer"
        ></data-service-tab>
      </el-tab-pane>

      <!-- edit dataService Tab -->
      <!-- <el-tab-pane
        v-for="item in editTabs"
        :key="item.id"
        :label="item.label"
        :name="item.id + ''"
        closable
      >
        <edit-interface-tab
          :oldInterface="item.interfaceData"
          @closeEditTab="removeTab(item.id)"
          @editSuccesed="editSuccesed(item.id)"
          :interfaceUrl="interfaceUrl"
          :resourceTypeArr="resourceTypeArr"
          :callTypeArr="callTypeArr"
        ></edit-interface-tab>
      </el-tab-pane> -->
    </el-tabs>
  </div>
</template>
<script>
import dataServiceTab from './dataServiceTab.vue'

export default {
  components: {
    dataServiceTab,
  },
  data() {
    const interfaceUrl = this.$url + '/service/systemcall'
    return {
      currentTab: 'mySer',

      // currentTab: "interfaceTab",
      // editTabs: [],
      // postUrl: interfaceUrl + '/upload',
      // hasAccess: this.$auth['ROLE_LINEAGE_ADMIN'], // 增删改权限
      // interfaceUrl: interfaceUrl,
      // categoryMap: {},
      // dataSourceMap: {},
      // callTypeMap: {},
      // resourceTypeArr: [
      //   {
      //     label: '数据表',
      //     value: 'TABLE',
      //   },
      //   {
      //     label: '视图',
      //     value: 'VIEW',
      //   },
      //   {
      //     label: 'API',
      //     value: 'API',
      //   },
      //   {
      //     label: '文件名称',
      //     value: 'DOC',
      //   },
      // ],
      // callTypeArr: [
      //   {
      //     value: 'DB_LINK',
      //     label: 'DB link',
      //     desc: '本系统的数据库通过Oracle DBLink的方式链接到其它系统的数据库后，应用再访问本地数据库的数据使用模式',
      //   },
      //   {
      //     value: 'FILE_TRANSFER',
      //     label: '文件交换',
      //     desc: '本系统通过数据文件交换方式将其它系统数据文件同步到本系统数据库后，再进行访问的模式',
      //   },
      //   {
      //     value: 'DIRECT',
      //     label: 'Direct',
      //     desc: '本系统通过直连其它系统数据库访问数据的模式',
      //   },
      //   {
      //     value: 'MESSAGE',
      //     label: '消息',
      //     desc: '本系统通过消息的方式与其它系统进行数据对接的模式，异步模式',
      //   },
      //   {
      //     value: 'API',
      //     label: 'API',
      //     desc: '本系统的应用直接通过调用其它系统的API的方式访问其它系统数据的模式，同步模式',
      //   },
      // ],
      // onUpload: false, // 是否正在解析文件
      // defaultInterface: '',
      // reloadModelCategories: false,
    }
  },
  // beforeCreate() {
  beforeMount() {
    // let para = this.$route.query;
    // if (para && para.interfaceId) {
    //   this.defaultInterface = para.interfaceId;
    // }
  },
  mounted() {
    // this.getCategoryMap();
    // // this.getDataSourceMap();
    // this.getCallTypeMap();
  },
  methods: {
    /** 响应事件 */
    removeTab(name) {
      const index = this.editTabs.findIndex(item => {
        return item.id == name
      })
      if (index !== -1) {
        this.editTabs.splice(index, 1)
        this.currentTab = 'interfaceTab'
      }
    },
    // interface: 调用文件信息(更新);
    showtab(interfaceData) {
      const index = this.editTabs.findIndex(item => {
        return item.id === interfaceData.id
      })
      if (index >= 0) {
        this.currentTab = this.editTabs[index]
          ? this.editTabs[index].id + ''
          : 'interfaceTab'
        return
      }
      let obj = {}
      if (interfaceData.id !== 'add') {
        let str = ''
        if (
          this.categoryMap[interfaceData.callerModelCategoryId] &&
          this.categoryMap[interfaceData.calleeModelCategoryId]
        ) {
          str =
            '"' +
            this.categoryMap[interfaceData.callerModelCategoryId].categoryName +
            '" 调用 "' +
            this.categoryMap[interfaceData.calleeModelCategoryId].categoryName +
            '"'
        }
        obj = {
          id: interfaceData.id,
          label: str,
          edit: true,
          interfaceData: interfaceData,
        }
      } else {
        obj = {
          id: 'add',
          label: '添加调用',
          edit: false,
          interfaceData: { id: 'add' },
        }
      }
      this.editTabs.push(obj)
      this.currentTab = obj.id + ''
    },
    downloadMouldFile() {
      const url = this.interfaceUrl + '/template'
      this.$downloadFile(url)
    },
    // downloadInterfaceFile() {
    //   window.location.href = this.interfaceUrl + "file";
    // },
    handleBeforeUpload() {
      this.onUpload = true
    },
    // Wait
    onUploadSuccess(response) {
      this.currentTab = 'interfaceTab'
      this.$message.success({
        message: '上传成功，解析出' + response + '个调用',
      })
      this.onUpload = false
    },
    onUploadError(e) {
      this.$showUploadFailure(e)
      this.onUpload = false
    },
    editSuccesed(id) {
      this.$refs.interfaceTab.getTableData()
      this.removeTab(id)
    },
    /** 处理不显示的数据 */
    getCategoryMap() {
      this.categoryMap = {}
      this.$modelCategories.forEach(item => {
        this.categoryMap[item.categoryId] = item
      })
    },
    reloadCategories() {
      const callback = () => {
        this.getCategoryMap()
        this.reloadModelCategories = true
        this.$refs.interfaceTab.getTableData()
      }
      this.$getModelCategories(callback)
    },
    getDataSourceMap() {
      this.dataSourceMap = {}
      this.$http
        .get(this.$url + '/service/models/fromre/')
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              this.dataSourceMap[item.categoryId] = item
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getCallTypeMap() {
      this.callTypeMap = {}
      this.callTypeArr.forEach(item => {
        this.callTypeMap[item.value] = item
      })
    },
  },
  watch: {
    onUpload(newVal) {
      if (newVal) {
        this.$refs.interfaceTab.showLoading()
      } else {
        this.$refs.interfaceTab.hideLoading()
        this.$refs.interfaceTab.getTableData()
      }
    },
    currentTab(newVal) {
      if (this.$refs[newVal] && this.$refs[newVal].tableLayout) {
        this.$refs[newVal].tableLayout()
      }
    },
  },
}
</script>
<style scoped lang="scss">
.right-top {
  position: absolute;
  top: 8px;
  right: 20px;
  z-index: 9;
  .margin20 {
    margin-right: 10px;
  }
  .inline-block {
    display: inline-block;
  }
  .add-demand-btn.green-btn.green-btn {
    height: 28px;
    padding: 0 1em;
  }
}
</style>
