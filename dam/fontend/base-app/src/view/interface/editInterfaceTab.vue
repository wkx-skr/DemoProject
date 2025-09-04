<template>
  <div class="tab-page">
    <datablau-form-submit>
      <el-form
        class="page-form"
        label-position="right"
        label-width="180px"
        size="small"
        ref="form"
        :rules="rules"
        :model="interfaceData"
      >
        <el-form-item
          :label="$t('meta.interface.callerSys')"
          prop="callerModelCategoryId"
        >
          <el-select
            v-model="interfaceData.callerModelCategoryId"
            :placeholder="$t('meta.interface.selSys')"
            filterable
          >
            <el-option
              v-for="c in $modelCategories"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.interface.calleeSys')"
          prop="calleeModelCategoryId"
        >
          <el-select
            v-model="interfaceData.calleeModelCategoryId"
            :placeholder="$t('meta.interface.selSys')"
            @change="calleeMoCaChange"
            filterable
          >
            <el-option
              v-for="c in $modelCategories"
              :label="c.categoryName + '(' + c.categoryAbbreviation + ')'"
              :value="c.categoryId"
              :key="c.categoryId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('meta.interface.callType1')" prop="callType">
          <el-select
            v-model="interfaceData.callType"
            :placeholder="$t('meta.interface.selCallType')"
            @change="changeType"
          >
            <el-option
              v-for="item in callTypeArr"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            >
              {{ item.label }}
              <span style="font-size: 12px; color: #666; opacity: 0.8">
                （{{ item.desc }}）
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.interface.dbs')"
          :prop="requiredName ? 'calleeModelId' : null"
        >
          <!-- <el-select
          v-model="interfaceData.calleeModelName"
          placeholder="请选择或填写数据库"
          allow-create
          clearable
          filterable
          @change="changeModelId"
        >
          <el-option v-for="item in dataSourceArr" :label="item.definition" :value="item.definition" :key="item.definition"></el-option>
        </el-select> -->
          <!-- @change="changeModelId" -->
          <el-autocomplete
            v-model="interfaceData.calleeModelName"
            :placeholder="$t('meta.interface.selSbs')"
            @clear="clearAutocomplete"
            clearable
            ref="cautocomplete"
            @select="
              item => {
                changeModelId(item.value)
              }
            "
            @blur="
              e => {
                changeModelId(interfaceData.calleeModelName)
              }
            "
            :fetch-suggestions="
              (queryString, cb) => {
                cb(
                  $getSuggettionInputValue(
                    queryString,
                    cb,
                    dataSourceArr,
                    'definition'
                  )
                )
              }
            "
          ></el-autocomplete>
        </el-form-item>
        <el-form-item
          :label="$t('meta.interface.resourceType')"
          :prop="requiredName ? 'resourceType' : null"
        >
          <el-select
            v-model="interfaceData.resourceType"
            :placeholder="$t('meta.interface.selResourcrType')"
            clearable
            filterable
          >
            <!-- allow-create -->
            <el-option
              v-for="item in resourceTypeArrSelected"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('meta.interface.resourceName')"
          :prop="requiredName ? 'resourceName' : null"
        >
          <datablau-input
            :placeholder="$t('meta.interface.selResourceName')"
            v-model="interfaceData.resourceName"
            show-word-limit
            maxlength="100"
            class="maxlengthInput max3"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="$t('meta.interface.featureDesc')"
          prop="description"
          class="item-textarea"
        >
          <datablau-input
            v-model="interfaceData.description"
            type="textarea"
            :placeholder="$t('meta.interface.fillFeatureDesc')"
          ></datablau-input>
        </el-form-item>
        <el-form-item :label="$t('meta.interface.filter')" prop="filer">
          <datablau-input
            :placeholder="$t('meta.interface.fillFilter')"
            v-model="interfaceData.filer"
            show-word-limit
            maxlength="100"
            class="maxlengthInput max3"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <div slot="buttons" style="text-align: left">
        <datablau-button type="secondary" @click="removetab">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="confirmPost"
          :disabled="btnDisable && isShow"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  props: ['oldInterface', 'interfaceUrl', 'resourceTypeArr', 'callTypeArr'],
  data() {
    return {
      emptyData: {
        callerModelCategoryId: '',
        calleeModelCategoryId: '',
        calleeModelId: '',
        calleeModelName: '',
        resourceType: '',
        resourceName: '',
        callType: '',
        description: '',
        filer: '',
        id: null,
      },
      rules: {
        callerModelCategoryId: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.interface.selSys'),
        },
        calleeModelCategoryId: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.interface.selSys'),
        },
        callType: {
          required: 'true',
          trigger: 'blur',
          message: this.$t('meta.interface.selCallType'),
        },
        calleeModelId: {
          required: this.requiredName + '',
          trigger: 'blur',
          message: this.$t('meta.interface.selSbs'),
        },
        resourceType: {
          required: this.requiredName + '',
          trigger: 'blur',
          message: this.$t('meta.interface.selSourcrType'),
        },
        resourceName: {
          required: this.requiredName + '',
          trigger: 'blur',
          message: this.$t('meta.interface.selSourcrName'),
        },
      },
      interfaceData: {},
      isEdit: false,
      dataSourceArr: [],
      requiredName: false,
      customCalleeModelName: false, // 数据库名称是否自定义
      resourceTypeArrSelected: [],
      isShow: true,
    }
  },

  components: {},

  computed: {
    btnDisable() {
      let result = false
      if (this.requiredName) {
        result =
          result ||
          !this.interfaceData.calleeModelName ||
          !this.interfaceData.calleeModelId ||
          !this.interfaceData.resourceName ||
          !this.interfaceData.resourceType
      }
      result =
        result ||
        !this.interfaceData.callerModelCategoryId ||
        !this.interfaceData.calleeModelCategoryId ||
        !this.interfaceData.callType
      return result
    },
  },

  mounted() {
    this.dataInit()
  },
  destroyed() {},
  watch: {},
  methods: {
    clearAutocomplete() {
      this.$refs.cautocomplete.activated = true
    },
    /** 响应事件 */
    dataInit() {
      this.interfaceData = {}
      if (this.oldInterface.id === 'add') {
        for (const key in this.emptyData) {
          this.$set(this.interfaceData, key, this.emptyData[key])
        }
      } else {
        for (const key in this.oldInterface) {
          this.$set(this.interfaceData, key, this.oldInterface[key])
        }
        if (
          this.interfaceData.calleeModelName &&
          !this.interfaceData.calleeModelId
        ) {
          this.interfaceData.calleeModelId = this.interfaceData.calleeModelName
          this.customCalleeModelName = true
        }
        if (this.interfaceData.calleeModelCategoryId) {
          this.calleeMoCaChange(this.interfaceData.calleeModelCategoryId, true)
        }
        this.changeType(this.interfaceData.callType, true)
      }
    },
    changeType(callType, isInitial) {
      this.requiredName = callType === 'DB_LINK' || callType === 'DIRECT'
      this.resourceTypeArrSelected = []
      if (this.oldInterface.id === 'add' || !isInitial) {
        this.interfaceData.resourceType = ''
      }
      if (this.interfaceData.resourceType === 'UNKNOWN') {
        this.interfaceData.resourceType = ''
      }
      let pushArr = []
      switch (callType) {
        case 'DB_LINK':
          pushArr = [1, 1, 0, 0]
          break
        case 'FILE_TRANSFER':
          pushArr = [0, 0, 0, 1]
          break
        case 'DIRECT':
          pushArr = [1, 1, 0, 0]
          break
        case 'MESSAGE':
          pushArr = [0, 0, 1, 1]
          break
        case 'API':
          pushArr = [0, 0, 1, 0]
          break
      }
      for (let i = 0; i < this.resourceTypeArr.length; i++) {
        if (pushArr[i] === 1) {
          this.resourceTypeArrSelected.push(this.resourceTypeArr[i])
        }
      }
    },
    confirmPost() {
      const url = this.interfaceUrl + '/'
      for (const key in this.interfaceData) {
        if (!this.interfaceData[key]) {
          this.interfaceData[key] = null
        }
      }
      if (this.interfaceData.resourceName) {
        this.$set(
          this.interfaceData,
          'resourceName',
          this.interfaceData.resourceName.slice(0, 255)
        )
      }
      if (this.customCalleeModelName) {
        this.interfaceData.calleeModelId = null
      }
      this.isShow = false
      this.$http
        .post(url, this.interfaceData)
        .then(res => {
          this.$emit('editSuccesed')
          this.isShow = true
          if (this.oldInterface.id === 'add') {
            this.$message.success(this.$t('meta.DS.message.addSucceed'))
          } else {
            this.$message.success(this.$t('meta.DS.message.editSucceed'))
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.isShow = true
        })
    },
    removetab() {
      this.$emit('closeEditTab')
    },
    calleeMoCaChange(id, isDataInit) {
      const params = {
        categoryId: id,
        currentPage: 1,
        pageSize: 500,
      }
      this.$http
        .post(this.$meta_url + `/service/models/fromre/page`, params)
        .then(res => {
          if (res && Array.isArray(res.data.content)) {
            this.dataSourceArr = res.data.content
          } else {
            this.dataSourceArr = []
          }
          if (!isDataInit) {
            this.interfaceData.calleeModelId = ''
          }
        })
        .catch(e => {
          this.$showFailure(e)
          this.dataSourceArr = []
        })
    },
    changeModelId(name) {
      const index = this.dataSourceArr.findIndex(item => {
        return item.definition == name
      })
      if (index === -1) {
        this.interfaceData.calleeModelId = name
        if (this.interfaceData.calleeModelName) {
          this.interfaceData.calleeModelName = name.slice(0, 255)
        }
        this.customCalleeModelName = true
      } else {
        this.customCalleeModelName = false
        this.interfaceData.calleeModelId = this.dataSourceArr[index]
          ? this.dataSourceArr[index].modelId
          : name
      }
    },
  },
}
</script>
<style scoped lang="scss">
.item-textarea {
  /deep/ .el-form-item__content {
    .el-textarea__inner {
      width: 460px;
    }
  }
}
.page-form {
  padding: 10px 0;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
}
/deep/ .form-submit {
  padding: 0 20px;
}
</style>
<style lang="scss">
.halfWidth {
  width: 40%;
}
.description {
  #desc {
    width: 40%;
  }
}
</style>
