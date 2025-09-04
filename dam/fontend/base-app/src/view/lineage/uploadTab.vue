<template>
  <div :class="{ 'tab-page': true, 'tab-page-hide': batch }">
    <datablau-form-submit class="uploadTabForm">
      <el-form
        class="page-form"
        style="padding: 10px 0"
        label-position="right"
        label-width="100px"
        size="small"
      >
        <el-form-item
          :label="$t('meta.lineageManage.fileType')"
          :required="true"
        >
          <el-select
            v-model="lineageType"
            :placeholder="$t('meta.lineageManage.selFileType')"
            clearable
            :disabled="updata"
            @change="changeLineageType"
          >
            <el-option
              v-for="item in types"
              :key="item.type"
              :label="item.displayName"
              :value="item.type"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="导入模式" v-if="!updata"> -->
        <!--        <el-form-item :label="$t('meta.lineageManage.importMode')" v-if="false">
          <el-switch
            v-model="batch"
            :active-text="$t('meta.lineageManage.batch')"
            :inactive-text="$t('meta.lineageManage.single')"
          ></el-switch>
        </el-form-item>-->
        <el-form-item :label="$t('meta.lineageManage.file')" v-show="!batch">
          <el-upload
            :action="uploadUrl"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadFauilure"
            :headers="$headers"
            :accept="acceptType"
            v-if="!$isIE"
            ref="upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            :auto-upload="false"
            :on-change="handleChange"
            :limit="1"
            class="halfWidth"
            :on-exceed="showLast"
            :disabled="!showUpload"
          >
            <datablau-button
              slot="trigger"
              type="important"
              :disabled="!showUpload"
            >
              {{ $t('meta.lineageManage.selFile') }}
            </datablau-button>
            <div slot="tip" class="el-upload__tip" v-if="showUpload">
              <span
                v-if="lineageType === 'EXCEL' || lineageType === 'GENERAL_SQL'"
              >
                {{ $t('meta.lineageManage.uploadType', { type: acceptFile }) }}
                <span v-if="!updata && couleZip">
                  {{ $t('meta.lineageManage.orZip') }}
                </span>
              </span>
              <span v-else>
                {{ $t('meta.lineageManage.uploadTypeTip') }}
              </span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item
          :label="$t('meta.lineageManage.desc')"
          :required="true"
          class="description"
          v-show="!batch"
        >
          <datablau-input
            style="width: 100%"
            v-model="lineageName"
            type="textarea"
            :clearable="true"
            id="desc"
            :placeholder="$t('meta.lineageManage.fillDesc')"
          ></datablau-input>
        </el-form-item>
        <!-- <el-form-item v-show="!batch">
          <datablau-button
            class="green-btn el-btn"
            type="important"
            @click="submitUpload"
            :disabled="!canUpload"
          >
            确定
          </datablau-button>
        </el-form-item> -->
        <el-form-item
          v-show="batch"
          :label="$t('meta.lineageManage.filePath')"
          :required="true"
        >
          <el-input
            v-model="dir"
            :placeholder="$t('meta.lineageManage.fillFilePath')"
          ></el-input>
        </el-form-item>
        <el-form-item v-show="batch">
          <datablau-button
            class="green-btn el-btn"
            type="important"
            @click="uploadBatch"
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
        </el-form-item>
      </el-form>
      <div slot="buttons" v-show="!batch" style="text-align: left">
        <datablau-button
          class="green-btn el-btn"
          type="important"
          @click="submitUpload"
          :disabled="!canUpload"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-form-submit>

    <!-- <div class="page-btn-group left-bottom">
      <el-button size="small" type="primary" @click="confirmUpload">确 定</el-button>
      <el-button size="small" class="white-btn" @click="removetab">取消</el-button>
    </div> -->
  </div>
</template>

<script>
export default {
  props: ['lineage', 'folderId', 'catalogueScan'],
  data() {
    return {
      lineageName: '',
      lineageType: '',
      types: [],
      fileList: [],
      acceptType: '',
      acceptFile: '', // input accept
      filename: '',
      fileType: '',
      typeRight: false,
      dir: '',
      batch: false,
      updata: false,
      tableData: [],
      successed: false,
      disabledConfirm: false,
      noLimitType: [
        'script-tsql',
        'script-plsql',
        'script-hql',
        'script-postgresql',
        'script-gaussdb',
        'script-flink',
        'script-redshift',
        'script-clickhouse',
        'script-mysql',
        'script-gbase',
        'script-spark',
      ],
      lineageTypesMap: {},
    }
  },

  components: {},

  computed: {
    zipbatch() {
      let result = false
      if (this.fileList[0]) {
        const nameArr = this.fileList[0].name.split('.')
        const type = nameArr[nameArr.length - 1]
        result = type === 'zip'
      }
      return result
    },
    showUpload() {
      return this.lineageType.length > 0
    },
    couleZip() {
      let bool = true
      if (this.lineageType && this.lineageType === 'GENERAL_SQL') {
        bool = false
      }
      return bool
    },
    uploadUrl() {
      let result = `${this.$meta_url}/lineage/parse?folderId=${this.folderId}&type=${this.lineageType}&description=${this.lineageName}`
      if (this.lineage.updata && this.lineage.lineage) {
        const originalLineageId = this.lineage.lineage.id
        result += `&originalLineageId=${originalLineageId}`
      }
      return result
    },
    canUpload() {
      const typeRight =
        this.acceptFile === '' ||
        this.acceptFile.split(',').includes(this.fileType) ||
        this.fileType === this.acceptFile ||
        this.fileType === 'zip' ||
        this.fileType === 'pjb' ||
        this.fileType === 'dsx' ||
        this.noLimitType.includes(this.lineageType)
      this.typeRight = typeRight
      return (
        (this.lineageName &&
          this.lineageName.length > 0 &&
          this.fileList.length === 1 &&
          typeRight &&
          !this.disabledConfirm) ||
        this.lineage.updata
      )
    },
  },

  mounted() {
    // if (this.lineage && this.lineage.updata) { // 手动查重
    //   this.$http.post(this.$url + '/service/lineage/imported', {}).then(res => {
    //     this.tableData = res.data;
    //   }).catch(e=>{
    //     this.$showFailure(e);
    //   });
    // }
    this.getLineageType()
    this.initUploadTab()
    $(document).on('keydown', this.dev)
  },
  beforeDestroy() {
    $(document).off('keydown')
  },
  destroyed() {
    // this.lineage = null;
  },
  watch: {
    lineageType(newVal) {
      if (this.lineage.updata) {
        this.fileList = []
        this.lineageName = this.lineage.name
      }
    },
  },

  methods: {
    arrToMap(arr, key) {
      return new Map(arr.map(item => [item[key], item]))
    },
    getLineageType() {
      this.$http
        .post(`${this.$meta_url}/lineage/getLineageTypeInfos`)
        .then(res => {
          this.types = res.data
          if (res.data.length) {
            this.lineageTypesMap = this.arrToMap(res.data, 'type')
          }
        })
        .catch(err => {
          this.types = []
        })
    },
    changeLineageType(type) {
      if (!type) return
      const accept =
        this.lineageTypesMap.get(type).supportFileExtension === '*'
          ? ''
          : this.lineageTypesMap
              .get(type)
              .supportFileExtension.split('|')
              .join(',')
      this.acceptType = accept === '*' ? '' : accept
      this.acceptFile = this.acceptType.replace(/\./g, '')
    },
    clearFiles() {
      this.$refs.upload.clearFiles()
    },
    dev(e) {
      if ((e.keyCode === 46 && e.ctrlKey) || (e.keyCode === 8 && e.ctrlKey)) {
        this.types.push({
          name: 'Flink Script',
          value: 'script-flink',
        })
      }
    },
    initUploadTab() {
      if (this.lineage.updata) {
        this.updata = true
        this.lineageType = this.lineage.type
        this.lineageName = this.lineage.name
      } else {
        this.updata = false
        this.lineageName = ''
        this.lineageType = ''
      }
    },
    uploadBatch(file) {
      const result = this.$meta_url + '/service/lineage/batchimport'
      const query = {
        folder: this.dir,
        type: this.lineageType,
      }
      this.$http
        .post(result, query)
        .then(res => {
          const para = {}
          // para.type = this.lineageType;
          // para.name = this.lineageName;
          // para.filename = this.filename;
          // para.id = 'fake';
          // para.creator = this.$user.username;
          this.$bus.$emit('onUploadSuccess', res.data, para)
          this.$emit('closeUploadTab')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleChange(file, fileList) {
      if (this.successed) return
      this.fileList = fileList
      const nameArr = file.name.split('.')
      const fileName = nameArr[0]
      this.fileType = (nameArr[nameArr.length - 1] || '').toLowerCase()
      if (
        this.acceptFile === '' ||
        this.fileType === this.acceptFile ||
        this.acceptFile.split(',').includes(this.fileType) ||
        this.fileType === 'pjb' ||
        this.fileType === 'dsx' ||
        this.noLimitType.includes(this.lineageType)
      ) {
        const index = this.tableData.findIndex(item => {
          return item.filename === file.name
        })
        this.lineageName = this.lineage.updata ? this.lineage.name : fileName
      } else if (this.fileType === 'zip' && !this.lineage.updata) {
        this.lineageName = fileName
      } else {
        this.fileType = ''
        this.fileList = []
        this.lineageName = this.lineage.updata ? this.lineage.name : ''
        this.$message.error({
          message: this.$t('meta.lineageManage.fileTypeError'),
        })
      }
    },
    handlePreview(file) {},
    showLast(file, fileList) {
      this.$message.error({
        message: this.$t('meta.lineageManage.oneUploaded'),
      })
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
      this.lineageName = this.lineage.updata ? this.lineage.name : ''
    },
    handleBeforeUpload(file) {
      this.filename = file.name
    },
    submitUpload() {
      this.disabledConfirm = true
      const fileList = this.fileList
      if (
        this.lineage.updata &&
        fileList &&
        Array.isArray(fileList) &&
        fileList.length == 0
      ) {
        this.updataDescription()
        this.disabledConfirm = false
      } else {
        this.$refs.upload.submit()
        if (this.catalogueScan) {
          this.$emit('handleCloseUploadTab')
          this.disabledConfirm = false
        }
      }
    },
    updataDescription() {
      // lineage/{lineageId}/name
      let lineageId = ''
      if (this.lineage.updata && this.lineage.lineage) {
        lineageId = this.lineage.lineage.id
      } else {
        return
      }
      let folderId = ''
      if (this.lineage.lineage.folderId) {
        folderId = this.lineage.lineage.folderId
      }
      const url = `${this.$meta_url}/lineage/${lineageId}/name?folderId=${folderId}`
      const newName = this.lineageName
      // this.$plainRequest.put(url, newName)
      this.$http
        .post(url, newName)
        .then(res => {
          if (this.catalogueScan) {
            this.$emit('handleCloseUploadTab')
            this.$message.success('更新成功')
          } else {
            this.disabledConfirm = false
            this.successed = true
            this.$emit('closeUpdataTab')
          }
          this.clearFiles()
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // .finally(() => {
      //   this.successed = true;
      //   console.log('finally');
      // })
    },
    handleUploadError(err) {
      this.successed = true
      this.$nextTick(() => {
        this.lineageName = this.lineage.updata ? this.lineage.name : ''
        this.successed = false
      })
      this.$emit('closeUpdataTab')
      this.$message.error({
        title: this.$t('meta.lineageManage.fileError'),
        message: JSON.parse(err.message).errorMessage,
      })
    },
    handleUploadSuccess(response) {
      this.disabledConfirm = false
      this.successed = true
      const para = {}
      para.type = this.lineageType
      switch (this.lineageType) {
        case 'kettle':
          para.type = 'Kettle'
          break
        case 'ssis':
          para.type = 'SSIS'
          break
        case 'excel':
          para.type = 'Excel'
          break
        case 'informatica':
          para.type = 'XML'
          break
        case 'datastage':
          para.type = 'DSX'
          break
        case 'tableau':
          para.type = 'Tableau'
          break
        case 'script-tsql':
          para.type = 'TSQL Script'
          break
        case 'script-plsql':
          para.type = 'PL/SQL Script'
          break
        case 'script-hql':
          para.type = 'Hive SQL Script'
          break
        case 'generalsql':
          para.type = 'SQL'
          break
      }
      para.name = this.lineageName
      para.filename = this.filename
      para.id = 'fake'
      para.creator = this.$user.username
      // para.deletId = this.lineage.id;
      this.$bus.$emit('onUploadSuccess', response, para)
      if (this.lineage.updata) {
        this.$emit('closeUpdataTab')
        // this.$bus.$emit('deletLineage', this.lineage.id)
      } else {
        this.$emit('closeUploadTab')
      }
    },
    handleUploadFauilure(e) {
      this.disabledConfirm = false
      this.$showUploadFailure(e)
    },
  },
}
</script>
<style scoped lang="scss">
/deep/ .form-submit {
  //top: 44px;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
  .el-form-item__label {
    height: 34px;
    line-height: 34px;
  }
}
</style>
<style lang="scss">
.tab-page-hide {
  .row-buttons {
    display: none;
  }
}
.halfWidth {
  width: auto;
}
.description {
  #desc {
    width: 40%;
  }
}
</style>
