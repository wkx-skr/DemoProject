<template>
  <div class="edit-security">
    <h3 class="edit-page-title">
      <!-- {{colData.objectPhysicalName}}  -->
      敏感数据分布
    </h3>
    <div class="col-prop">
      <p class="part-title">字段信息</p>
      <el-form
        class="page-form inline-form"
        label-position="right"
        label-width="110px"
        size="small"
        :model="colData"
        ref="form"
        :inline="true"
      >
        <el-form-item label="数据字段">
          <span class="item-value skip-item" @click="skip2Column">
            {{ colData.objectPhysicalName }}
          </span>
        </el-form-item>
        <el-form-item label="中文名称">
          <span class="item-value">{{ colData.objectLogicalName }}</span>
        </el-form-item>
        <el-form-item label="所属系统">
          <span class="item-value">{{ colData.modelCategoryName }}</span>
        </el-form-item>
        <el-form-item label="数据来源">
          <span class="item-value">{{ getSrc(colData) }}</span>
        </el-form-item>
      </el-form>
    </div>
    <div class="security-prop">
      <p class="part-title">安全属性</p>
      <el-form
        class="page-form inline-form"
        label-position="right"
        label-width="110px"
        size="small"
        :model="colData"
        ref="form"
        :inline="true"
      >
        <el-form-item label="安全等级">
          <span class="item-value skip-item" @click="skip2Tag">
            {{ colData.tagName }}
          </span>
        </el-form-item>
        <el-form-item label="数据分类">
          <el-select
            v-model="colData.dataType"
            size="mini"
            clearable
            allow-create
            filterable
          >
            <el-option
              v-for="item in allSafeType"
              :value="item"
              :key="item"
              :label="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <span class="item-value">
            {{ $timeFormatter(colData.creationTime) }}
          </span>
        </el-form-item>
      </el-form>
    </div>
    <div class="prob-resolve">
      <p class="part-title">问题处理</p>
      <el-form
        class="page-form inline-form"
        label-position="right"
        label-width="110px"
        size="small"
        :model="colData"
        ref="form"
        :inline="true"
      >
        <el-form-item label="负责人">
          <el-select v-model="colData.owner" size="mini" clearable filterable>
            <el-option
              v-for="item in allUserData"
              :value="item.username"
              :key="item.userId"
              :label="item.username"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="colData.status" size="mini" clearable filterable>
            <el-option
              v-for="item in statusTypeArr"
              :value="item"
              :key="item"
              :label="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="脱敏描述" class="safe-mask">
          <el-input
            size="mini"
            v-model="colData.dataMask"
            placeholder="请输入脱敏描述"
            clearable
            type="textarea"
            row="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注" class="safe-note">
          <el-input
            size="mini"
            v-model="colData.note"
            placeholder="请输入备注"
            clearable
            type="textarea"
            row="3"
          ></el-input>
        </el-form-item>
        <el-form-item class="confirm-line">
          <el-button
            size="small"
            type="primary"
            @click="confirm"
            :disabled="disableCommitButton"
          >
            确 定
          </el-button>
          <el-button size="small" class="white-btn" @click="cancel">

            {{ $t('common.button.cancel') }}

          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colData: {},
      disableCommitButton: false,
    }
  },
  components: {},
  props: {
    oldData: {
      type: Object,
      required: true,
    },
    statusTypeArr: {
      type: Array,
      required: true,
    },
    allUserData: {
      type: Object,
      required: true,
    },
    allSafeType: {
      type: Array,
      required: true,
    },
    tabNameMap: {
      type: Object,
      required: true,
    },
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.colData = _.cloneDeep(this.oldData)
    },
    getSrc(data) {
      const result = `${data.modelName}\\${data.databaseName}\\${data.tableName}`
      return result
    },
    skip2Column() {
      this.$router.push({
        name: 'dataCatalog',
        query: {
          objectId: this.colData.objectId,
        },
      })
    },
    skip2Tag() {
      const tag = this.tabNameMap[this.colData.tagName] || ''
      const tagId = tag ? tag.tagId : ''
      if (!tagId) {
        this.$showFailure('未找到目标标签')
        return
      }
      this.$router.push({
        name: 'tagManage',
        query: {
          tagId: tagId,
        },
      })
    },
    confirm() {
      const para = this.colData
      if (false) {
        this.$emit('updateSecurityInfo', para)
      } else {
        this.$http
          .post(`${this.$url}/service/tags/updateSecurityInfo`, para)
          .then(res => {
            this.$showSuccess('修改成功')
            this.$emit('updateSecurityInfo', para)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      this.$emit('cancel')
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.edit-security {
  font-size: 16px;
  padding-left: 20px;

  .edit-page-title {
    // border: 1px solid red;
    padding-bottom: 10px;
    font-weight: bold;
    font-size: 20px;
  }

  .col-prop,
  .security-prop,
  .prob-resolve {
    .part-title {
      font-size: 12px;
      padding: 8px 0;
      vertical-align: top;
      font-weight: 700;
      &::before {
        content: ' ';
        vertical-align: top;
        margin: 2px 2px 0 0;
        display: inline-block;
        border: 2px solid #000;
        width: 2px;
        height: 14px;
        border-top: none;
        border-bottom: none;
      }
    }
  }
  .page-form.inline-form {
    width: 800px;
    .el-form-item {
      width: 40%;
      .el-form-item__label {
        font-weight: 600;
      }
      .el-form-item__content {
        width: 200px;
        .el-select {
          width: 100%;
          .el-input {
            width: 100%;
          }
        }
        .item-value {
          font-size: 12px;
          color: #606266;
          white-space: nowrap;
          &.skip-item {
            color: #409eff;
            cursor: pointer;
          }
        }
      }
      &.safe-mask,
      &.safe-note {
        width: 80%;
        .el-form-item__content {
          width: 500px;
          .el-textarea {
            width: 100%;
            .el-textarea__inner {
              width: 100%;
            }
          }
        }
      }
      &.confirm-line {
        width: 700px;
        .el-form-item__content {
          width: 100%;
        }
      }
    }
  }
}
</style>
