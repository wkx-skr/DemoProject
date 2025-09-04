<template>
  <datablau-dialog
    class="checkin-version-wrapper"
    :title="type? '更新表' :$store.state.$v.OperationLog.updateModel"
    :visible.sync="visible"
    append-to-body
    width="600px"
    :blackTheme="$route.path.indexOf('sql_editor') !== -1"
  >
    <el-form
      size="small"
      label-width="75px"
      :class="{'elformDataWare':typeDataWareHouse}"
      @submit.native.prevent
    >
      <!--<el-form-item label-width="0">
        确定要更新模型库吗？
      </el-form-item>-->
      <!--<el-form-item
        label-width="0"
      >
        <el-checkbox v-model="checkIn">同时签入版本</el-checkbox>
      </el-form-item>-->
      <el-form-item
        :label="$store.state.$v.dataEntity.version"
        required
        v-show="checkIn"
      >
        <datablau-input
          :themeBlack="$route.path.indexOf('sql_editor') !== -1"
          v-model="request.version"
          disabled
          style="width:100%"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        :label="$store.state.$v.dataEntity.disc"
        :required="descriptionRequired"
        v-show="checkIn"
      >
        <datablau-input
          type="textarea"
          maxlength="500"
          show-word-limit
          style="width:100%"
          :themeBlack="$route.path.indexOf('sql_editor') !== -1"
          v-model="request.description"
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <datablau-button :themeBlack="$route.path.indexOf('sql_editor') !== -1" @click="visible=false">{{$store.state.$v.report.cancel}}</datablau-button>
      <datablau-button :themeBlack="$route.path.indexOf('sql_editor') !== -1" type="primary" @click="save" :disabled="checkIn && !(request.version && (descriptionRequired ? request.description : true))">{{$store.state.$v.dataEntity.ok}}</datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  data () {
    return {
      checkIn: true,
      request: {
        version: '',
        description: ''
      },
      descriptionRequired: false
    }
  },
  props: {
    dialogVisible: {
      default: false,
      type: Boolean
    },
    typeDataWareHouse: {},
    modelId: {},
    type: {}
  },
  methods: {
    async save () {
      try {
        await this.$http.post(this.$url + `/editor/${+this.$route.query.id ? this.$route.query.id : this.modelId}/versions/try`, {
          version: this.request.version
        })
        if (this.checkIn) {
          this.$emit('save', _.clone(this.request))
        } else {
          this.$emit('save')
        }
        this.$emit('close')
      } catch (e) {
        this.$showFailure(e)
      }
    },
    clearForm () {
      this.request.version = ''
      this.request.description = ''
    },
    getRequiredInfo () {
      this.$http.get(this.$url + '/service/configs/get_one?name=configurable.model.save.version.description.force').then(res => {
        if (res.data.propertyValue === 'true') {
          this.descriptionRequired = true
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    getVersions () {
      let id = ''
      if (this.$route.query.id) {
        if (this.$route.path === '/main/enterpriseLogicalModel') {
          id = this.$route.query.modelId
        } else {
          id = this.$route.query.id
        }
      } else {
        id = this.modelId
      }
      if (this.$route.query.id || this.modelId) {
        this.$http.get(this.$url + '/service/models/' + id + '/versions').then(res => {
          let tableData = _.cloneDeep(res.data)
          tableData = tableData.filter(item => item.name !== 'Latest Version')
          tableData && tableData.length && tableData.sort((a, b) => {
            return b.timestamp - a.timestamp
          })
          this.request.lastVersion = res.data[0].endVersion
          this.request.version = this.RecommendVersion(tableData[0]?.name)
          this.$forceUpdate()
        }).catch(e => {
          this.$showFailure(e)
        })
      }
    },
    RecommendVersion (priorVersion) {
      let versionNum = priorVersion.includes('V') ? priorVersion.split('V')[1] : priorVersion
      let nextVersion = parseInt(versionNum) + 1
      // if (priorVersion != null && priorVersion.length > 0) {
      //   let versions = priorVersion.split('.')
      //   if (versions.length > 0) {
      //     if (versions.length <= 2) {
      //       nextVersion = priorVersion + '.1'
      //     } else {
      //       let lastnumber = 0
      //       let bnumber = Number.isInteger(parseInt(versions[versions.length - 1]))
      //       let lastDot = priorVersion.lastIndexOf('.')
      //       let prefix = priorVersion.substring(0, lastDot + 1)
      //       lastnumber = bnumber ? parseInt(versions[versions.length - 1]) : lastnumber
      //       nextVersion = prefix + (++lastnumber).toString()
      //     }
      //   }
      // }
      return 'V' + nextVersion
    }
  },
  computed: {
    visible: {
      get: function () {
        this.clearForm()
        return this.dialogVisible
      },
      set: function (newValue) {
        if (!newValue) {
          this.$emit('close')
        }
      }
    }
  },
  mounted () {
    this.getRequiredInfo()
    this.getVersions()
  },
  watch: {
    dialogVisible (val) {
      if (val) {
        this.getVersions()
      }
    }
  }
}
</script>

<style scoped>

</style>
<style lang="scss">
  .elformDataWare{
    .el-input__inner:hover{
      border-color: #409EFF;
    }
    .el-textarea__inner:hover{
      border-color: #409EFF;
    }
  }
</style>
