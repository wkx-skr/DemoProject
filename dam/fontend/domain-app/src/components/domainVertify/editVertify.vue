<template>
  <div class="edit-vertify-container">
    <datablau-form-submit>
      <div class="edit-domain-vertify">
        <h3 class="edit-page-title">
          {{ $t('domain.verification.uncheckedIssueTracking') }}
        </h3>
        <div class="col-prop">
          <p class="part-title">{{ $t('domain.verification.fieldInfo') }}</p>
          <datablau-form size="small" :model="colData" ref="form">
            <el-form-item :label="$t('domain.verification.dataField')">
              <span class="item-value skip-item" @click="skip2Column">
                {{ colData.objectPhysicalName }}
              </span>
            </el-form-item>
            <el-form-item :label="$t('domain.verification.chineseName')">
              <span class="item-value">{{ colData.objectLogicalName }}</span>
            </el-form-item>
            <el-form-item :label="$t('domain.verification.owningSystem')">
              <span class="item-value">{{ colData.modelCategoryName }}</span>
            </el-form-item>
            <el-form-item :label="$t('domain.verification.dataSources')">
              <span class="item-value">{{ getSrc(colData) }}</span>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="domain-prop">
          <p class="part-title">
            {{ $t('domain.verification.mappedDataStandards') }}
          </p>
          <datablau-form :model="colData" ref="form">
            <el-form-item :label="$t('domain.common.dataStandard')">
              <datablau-tooltip
                :content="domainData.state === 'X' ? '已废弃' : ''"
                placement="bottom-start"
                :disabled="!(domainData.state === 'X')"
              >
                <span
                  class="item-value skip-item"
                  :style="{
                    'text-decoration':
                      domainData.state === 'X' ? 'line-through' : 'auto',
                  }"
                  @click="skip2Domain"
                >
                  {{ colData.domainName }}
                </span>
              </datablau-tooltip>
            </el-form-item>
            <el-form-item :label="$t('domain.common.domainPropCode')">
              <span class="item-value">
                {{ domainData.domainCode }}
              </span>
            </el-form-item>
            <el-form-item :label="$t('domain.common.dataType')">
              <span class="item-value">
                {{ domainData.dataType }}
              </span>
            </el-form-item>
            <el-form-item :label="$t('domain.common.domainCode')">
              <datablau-tooltip
                :content="domainData.referenceCodeState === 'X' ? '已废弃' : ''"
                placement="bottom-start"
                :disabled="!(domainData.referenceCodeState === 'X')"
              >
                <span
                  class="item-value"
                  :style="{
                    'text-decoration':
                      domainData.referenceCodeState === 'X'
                        ? 'line-through'
                        : 'auto',
                  }"
                >
                  {{ domainData.referenceCode }}
                </span>
              </datablau-tooltip>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="prob-desc">
          <p class="part-title">
            {{ $t('domain.verification.problemDescription') }}
          </p>
          <datablau-form :model="colData" ref="form">
            <el-form-item :label="$t('domain.verification.checkResult')">
              <datablau-select
                v-model="colData.status"
                size="mini"
                clearable
                filterable
              >
                <el-option
                  v-for="statu in matchType"
                  :label="statu"
                  :value="statu"
                  :key="statu"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item :label="$t('domain.common.owner')">
              <datablau-input
                clearable
                v-model="colData.owner"
                @focus="selectProblemUser"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('domain.verification.problemDescription')"
              class="safe-mask"
            >
              <datablau-input
                size="mini"
                v-model="colData.problem"
                :placeholder="
                  $t('domain.verification.problemDescriptionPlaceholder')
                "
                clearable
                type="textarea"
                row="3"
              ></datablau-input>
            </el-form-item>
          </datablau-form>
        </div>
        <div class="prob-resolve">
          <p class="part-title">
            {{ $t('domain.verification.handlingSuggestion') }}
          </p>
          <datablau-form :model="colData" ref="form">
            <el-form-item
              :label="$t('domain.verification.handlingSuggestion')"
              class="safe-mask"
            >
              <datablau-input
                size="mini"
                v-model="colData.suggestion"
                :placeholder="
                  $t('domain.verification.handlingSuggestionPlaceholder')
                "
                clearable
                type="textarea"
                row="3"
              ></datablau-input>
            </el-form-item>
            <el-form-item :label="$t('domain.common.remark')" class="safe-note">
              <datablau-input
                size="mini"
                v-model="colData.note"
                :placeholder="$t('domain.common.remarkPlaceholder')"
                clearable
                type="textarea"
                row="3"
              ></datablau-input>
            </el-form-item>
          </datablau-form>
        </div>
      </div>
      <template slot="buttons">
        <datablau-button
          type="confirm"
          @click="confirm"
          :disabled="disableCommitButton"
        ></datablau-button>
        <datablau-button
          type="cancel"
          class="white-btn"
          @click="cancel"
        ></datablau-button>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
export default {
  data() {
    return {
      colData: {},
      disableCommitButton: false,
      domainData: {},
    }
  },
  components: {},
  props: {
    oldData: {
      type: Object,
      required: true,
    },
    // statusTypeArr: {
    //   type: Array,
    //   required: true,
    // },
    matchType: {
      type: Object,
      required: true,
    },
    // allSafeType: {
    //   type: Array,
    //   required: true
    // }
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        if (res && Array.isArray(res) && res.length === 1) {
          this.colData.owner = res[0].username
        }
      })
    },
    dataInit() {
      this.colData = _.cloneDeep(this.oldData)
      this.getDomainDetail(this.colData.domainId)
      // console.log(this.colData, 'colData')
    },
    getSrc(data) {
      // let result = `${data.modelName}\\${data.databaseName}\\${data.tableName}`;
      const result = `${data.modelName}\\${data.tableName}`
      return result
    },
    confirm() {
      const para = this.colData
      // console.log(para, 'para')
      // return;
      if (false) {
        this.$emit('updateDomVerInfo', para)
      } else {
        this.$http
          .post(`${this.$meta_url}/service/domains/updateVerifyInfo`, para)
          .then(res => {
            this.$datablauMessage.success(
              this.$t('domain.common.modifySuccessfully')
            )
            this.$emit('updateDomVerInfo', para)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    getDomainDetail(id) {
      if (!id) return
      this.$http
        .post(`${this.$domain_url}/domains/domain/getDomainById`, {
          domainId: id,
        })
        .then(res => {
          this.domainData = res.data || {}
          // console.log(res.data, 'domain detail')
        })
        .catch(e => {
          console.log(e)
        })
    },
    skip2Column() {
      this.$skip2({
        name: 'dataCatalog',
        query: {
          objectId: this.colData.objectId,
        },
      })
      // this.$router.push({
      //   name: 'dataCatalog',
      //   query: {
      //     objectId: this.colData.objectId,
      //   },
      // })
    },
    skip2Domain() {
      this.$skip2Domain(this.colData.domainId)
      // this.$router.push({
      //   name: 'dataStandard',
      //   query: {
      //     domain: this.colData.domainId,
      //   },
      // })
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped>
.skip-item {
  color: #409eff;
  cursor: pointer;
}
</style>

<style lang="scss">
.edit-vertify-container {
  position: absolute;
  left: 0;
  top: 40px;
  bottom: 0;
  right: 0;
}

.edit-domain-vertify {
  height: calc(100% - 40px);
  overflow-y: scroll;
  font-size: 16px;
  padding-left: 20px;

  .edit-page-title {
    // border: 1px solid red;
    padding: 10px 0;
    font-weight: bold;
    font-size: 14px;
  }

  .col-prop,
  .domain-prop,
  .prob-desc,
  .prob-resolve {
    .part-title {
      // font-size: 14px;
      // font-weight: 500;
      // color: #555555;
      // padding: 8px 0;
      // vertical-align: top;
      margin: 10px 0;
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      color: #555555;
      position: relative;
      padding-left: 10px;
      // margin-bottom: 20px;
      &::before {
        // content: ' ';
        // vertical-align: top;
        // margin: 2px 2px 0 0;
        // display: inline-block;
        // width: 4px;
        // height: 14px;
        // margin-right: 6px;
        // background: #409eff;
        // border-radius: 1px;
        position: absolute;
        content: '';
        left: 0;
        top: 4px;
        width: 4px;
        height: 14px;
        background: #409eff;
        border-radius: 1px;
      }
    }
  }
  .inline-form {
    width: 1000px;
    padding: 0 0;
    .el-form-item {
      // width: 40%;
      min-height: 34px;
      display: inline-block;
      margin: 0;
      margin-bottom: 20px;
      // margin-right: 20px;
      &:nth-child(odd) {
        margin-right: 20px;
        vertical-align: top;
      }
      .el-form-item__label {
        padding: 0 10px 0 0;
        font-size: 12px;
        // font-weight: 600;
        color: #555;
        line-height: 28px;
        vertical-align: middle;
      }
      .el-form-item__content {
        width: 300px;
        line-height: 28px;
        vertical-align: middle;
        .datablau-select {
          width: 100%;
          .datablau-input {
            width: 100%;
          }
        }
        .item-value {
          min-width: 300px;
          display: inline-block;
          font-size: 12px;
          // color: var(--table-color);
          color: rgba(0, 0, 0, 0.65);
          white-space: nowrap;
          &.skip-item {
            color: #409eff;
            cursor: pointer;
          }
        }
      }
      &.safe-mask,
      &.safe-note {
        width: 100%;
        margin-right: 0;
        .datablau-input {
          width: 810px;
          .el-form-item__content {
            width: 100%;
            .el-textarea {
              width: 100%;
              .el-textarea__inner {
                width: 100%;
              }
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
