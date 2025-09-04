<template>
  <div class="addDataSource tab-page">
    <div class="container">
      <datablau-form-submit>
        <div class="collapse-title">
          <h2>{{ '业务术语' }}</h2>
        </div>
        <el-form
          class="page-form"
          label-position="right"
          label-width="180px"
          size="small"
          :model="glossary"
          :rules="glossaryFormRules"
          :max-height="tableHeight"
          ref="glossaryFormDom"
        >
          <el-form-item
            class="message-form-item"
            :label="$t('domain.glossary.standardTheme')"
            prop="folderId"
          >
            <el-cascader
              size="mini"
              expand-trigger="click"
              :disabled="formDisabled"
              :options="treeData && treeData.length ? treeData[0].nodes : []"
              :props="defaultProps2"
              :change-on-select="true"
              v-model="selectedFolderIds"
              :placeholder="$t('domain.glossary.themePlaceholder')"
              ref="pathSelector"
            ></el-cascader>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.domainCode')">
            <datablau-input
              size="mini"
              disabled
              v-model="glossary.domainCode"
              :placeholder="$t('domain.glossary.domainCodePlaceholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.cName')" prop="chName">
            <datablau-input
              size="mini"
              v-model="glossary.chName"
              :placeholder="$t('domain.glossary.namePlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.enName')" prop="enName">
            <datablau-input
              size="mini"
              v-model="glossary.enName"
              :placeholder="$t('domain.glossary.enNamePlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
            <!-- type="textarea" :autosize="{minRows: 3, maxRows: 18}" class="text-area" -->
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.abbr')" prop="abbr">
            <datablau-input
              size="mini"
              v-model="glossary.abbr"
              :placeholder="$t('domain.glossary.abbrPlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('domain.glossary.explanationTerms')"
            prop="explanationTerms"
          >
            <datablau-input
              size="mini"
              v-model="glossary.explanationTerms"
              type="textarea"
              :placeholder="$t('domain.glossary.explanationTermsPlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.scene')">
            <datablau-input
              size="mini"
              v-model="glossary.scene"
              type="textarea"
              :placeholder="$t('domain.glossary.scenePlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.example')">
            <datablau-input
              size="mini"
              v-model="glossary.example"
              type="textarea"
              :placeholder="$t('domain.glossary.examplePlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.businessTermAliases')">
            <datablau-input
              size="mini"
              v-model="glossary.businessTermAliases"
              type="textarea"
              :placeholder="
                $t('domain.glossary.businessTermAliasesPlaceholder')
              "
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('domain.glossary.relaId')">
            <datablau-select
              size="mini"
              v-model="glossary.relaId"
              :placeholder="$t('domain.glossary.relaIdPlaceholder')"
              :disabled="formDisabled"
            >
              <el-option
                v-for="item in relaItemList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </datablau-select>
          </el-form-item>
<!--          <el-form-item
            :label="$t('domain.glossary.managementDepartment')"
            prop="managementDepartment"
            + 123>
            &lt;!&ndash;  TODO wangjie根据当前登录用户自动填充               &ndash;&gt;
            <datablau-select
              ref="desOrgChoose"
              v-model="glossary.managementDepartment"
              clearable
              :placeholder="
                $t('domain.glossary.managementDepartmentPlaceholder')
              "
              @focus="selectOrganization"
              @visible-change="showSelectOrganization"
              type="select"
              :disabled="formDisabled"
            >
              <el-option
                v-for="item in allOrganizations.filter(
                  i => i.bm === glossary.managementDepartment
                )"
                :key="item.id"
                :label="item.fullName"
                :value="item.bm"
              ></el-option>
            </datablau-select>
            &lt;!&ndash;            <datablau-select
              size="mini"
              v-model="glossary.managementDepartment"
              :placeholder="
                $t('domain.glossary.managementDepartmentPlaceholder')
              "
              :disabled="!hasAccess"
            >
              <el-option
                v-for="item in departItemList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                :disabled="item.disabled"
              />
            </datablau-select>&ndash;&gt;
          </el-form-item>-->
          <el-form-item :label="$t('domain.glossary.source')">
            <datablau-input
              size="mini"
              v-model="glossary.source"
              :placeholder="$t('domain.glossary.sourcePlaceholder')"
              :disabled="formDisabled"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <template slot="buttons">
          <datablau-button
            size="small"
            type="important"
            @click="addGlossary"
            :disabled="editLoading"
            v-if="
              !formDisabled &&
              ((isAdd && ($auth['BUSI_TERM_ADD'] || $auth['DICTIONARY_ADD'])) ||
                (isEdit && ($auth['BUSI_TERM_EDIT'] || $auth['DICTIONARY_EDIT'])))
            "
          >
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button
            size="small"
            type="secondary"
            :disabled="editLoading"
            @click="removetab"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import { findByFoldId } from '@/view/dataStandardGlossary/glossaryConstants'

export default {
  props: [
    'oldGlossary',
    'isEdit',
    'isAdd',
    'isDetail',
    'isChangeFlow',
    'treeData',
    'foldId',
  ],
  inject: ['headerProduction'],

  data() {
    const glossaryUrl = this.$url + '/service/ns/'
    return {
      allOrganizations: [],
      glossaryUrl: glossaryUrl,
      glossary: {},
      tableHeight: undefined,
      relaItemList: [{ value: 1, label: 'test' }],
      glossaryFormRules: {
        managementDepartment: [
          {
            required: true,
            message: this.$t('domain.glossary.managementDepartmentNotEmpty'),
            trigger: 'change',
          },
        ],
        explanationTerms: [
          {
            required: true,
            message: this.$t('domain.glossary.explanationTermsNotEmpty'),
            trigger: 'blur',
          },
        ],
        chName: [
          {
            required: true,
            // message: this.$t('domain.glossary.nameNotEmpty'),
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('中文名称不能为空'))
                return
              }
              // 只能包含中文、字母和数字，长度不超过15位
              if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(value)) {
                callback(new Error('中文名称只能包含中文、字母和数字'))
                return
              }
              if (value.length > 15) {
                callback(new Error('中文名称长度不能超过15位'))
                return
              }
              callback()
            },
          },
        ],
        enName: [
          {
            required: true,
            // message: this.$t('domain.glossary.nameNotEmpty'),
            trigger: 'blur',
            validator(rule, value, callback) {
              if (!value) {
                callback(new Error('英文名称不能为空'))
                return
              }
              // 只能是字母和空格
              if (!/^[A-Za-z ]+$/.test(value)) {
                callback(new Error('英文名称只能包含字母和空格'))
                return
              }
              // 首字母大写
              if (!/^[A-Z]/.test(value)) {
                callback(new Error('首字母必须大写'))
                return
              }
              callback()
            },
          },
        ],
        folderId: [
          {
            required: true,
            trigger: 'change',
            // message: this.$t('domain.code.codeThemeNotEmpty'),
            validator: (rule, value, callback) => {
              if (
                !this.selectedFolderIds ||
                this.selectedFolderIds.length === 0
              ) {
                callback(new Error(this.$t('domain.code.codeThemeNotEmpty')))
              } /* else if (this.selectedFolderIds.length === 1) {
                callback(new Error(this.$t('domain.code.codeThemeNotEmpty')))
              } */ else {
                callback()
              }
            },
          },
        ],
      },
      selectedFolderIds: [],
      defaultProps2: {
        value: 'foldId',
        children: 'nodes',
        label: 'name',
      },
      editLoading: false,
      // *********************************
      // userModelCategory: [],
      // dbConnected: false,
      // lastLoadTimeStamp: 0,
      // interval: {},
    }
  },

  components: {},

  computed: {
    formDisabled() {
      return !this.hasAccess || this.isDetail
    },
    hasAccess() {
      return !(
        this.headerProduction.toUpperCase() !== 'DAM' && this.$damEnabled
      )
    },
  },

  beforeMount() {
    if (this.isAdd) {
      this.glossary = {}
      let fid
      if (this.foldId && this.foldId > 1) {
        fid = this.foldId
      } else {
        fid = this.treeData[0].nodes[0].foldId
      }
      const fids = []
      findByFoldId(this.treeData, fid, fids)
      fids.shift()
      this.selectedFolderIds = [...fids]
    } else {
      this.glossary = { ...this.oldGlossary }
      const fids = []
      findByFoldId(this.treeData, this.oldGlossary.folderId, fids)
      fids.shift()
      this.selectedFolderIds = [...fids]
    }
  },
  mounted() {
    this.initOrgs()
    // this.tableHeight = $(".table-row")[0].offsetHeight;
    // $(window).resize(this.resizeTable);
  },
  beforeDestroy() {
    // $(window).unbind("resize", this.resizeTable);
  },
  methods: {
    async addGlossary() {
      const res = await this.$refs.glossaryFormDom.validate()
      if (!res) return
      this.editLoading = true
      if (!this.isEdit) {
        const params = {
          ...this.glossary,
          folderId: this.selectedFolderIds[this.selectedFolderIds.length - 1],
        }
        HTTP.nsCreateNsService(params)
          .then(res => {
            this.$emit('editFinish')
            this.$message.success(this.$t('domain.common.addSucceed'))
          })
          .catch(e => {
            this.$showFailure(e)
          })
          .finally(() => {
            this.editLoading = false
          })
      } else {
        const params = [
          {
            ...this.glossary,
            folderId: this.selectedFolderIds[this.selectedFolderIds.length - 1],
          },
        ]
        if (this.isChangeFlow) {
          HTTP.applyChangeBusinessTerm(params)
            .then(res => {
              this.$emit('editFinish')
              this.$message.success(this.$t('domain.common.modifySuccessfully'))
            })
            .catch(e => {
              this.$showFailure(e)
            })
            .finally(() => {
              this.editLoading = false
            })
        } else {
          HTTP.nsUpdateNsService(params[0])
            .then(res => {
              this.$emit('editFinish')
              this.$message.success(this.$t('domain.common.modifySuccessfully'))
            })
            .catch(e => {
              this.$showFailure(e)
            })
            .finally(() => {
              this.editLoading = false
            })
        }
      }
    },
    removetab() {
      this.$emit('editFinish')
    },
    showSelectOrganization(show) {
      show && this.selectOrganization({})
    },
    selectOrganization(event) {
      if (event.relatedTarget && this.glossary.managementDepartment) {
        // this.desOrgOptions = null
        this.glossary.managementDepartment = ''
      } else {
        this.$utils.branchSelect.open().then(res => {
          // this.desOrgOptions = [res]
          // this.detail.descriptionDepartment = res.bm
          this.$set(this.glossary, 'managementDepartment', res.bm)
        })
      }
      if (this.$refs.desOrgChoose && this.$refs.desOrgChoose.blur) {
        this.$refs.desOrgChoose.blur()
      }
    },
    initOrgs() {
      HTTP.getOrgTree()
        .then(res => {
          const data = res.data
          const arr = [data]
          const getChildren = (obj, arr) => {
            if (obj.children && Array.isArray(obj.children)) {
              obj.children.forEach(item => {
                arr.push(item)
                getChildren(item, arr)
              })
            }
          }
          getChildren(data, arr)
          this.allOrganizations = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.tab-page {
  .container {
    overflow: auto;
    /deep/.form-submit {
      top: 70px;
      left: 20px;
      .page-form {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .el-form.page-form .el-select,
      .el-form.page-form .el-cascader,
      .el-form.page-form .el-input {
        width: 900px;
      }
    }
    /deep/.row-buttons {
      text-align: left;
    }
  }
}
.collapse-title {
  h2 {
    display: inline-block;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    position: relative;
    &::after {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -10px;
      width: 4px;
      height: 14px;
      content: '';
      background: #409eff;
      border-radius: 1px;
    }
  }
  i {
    margin: 20px 20px;
    font-size: 12px;
    color: #479eff;
    &:hover {
      /* text-decoration: underline; */
    }
  }
  padding-left: 10px;
}
</style>
