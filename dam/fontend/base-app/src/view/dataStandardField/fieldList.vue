<template>
  <div class="data-standard-field">
    <div class="tab-outer">
      <datablau-list-search class="search-outer">
        <datablau-input
          clearable
          maxlength="100"
          type="text"
          v-model="keyword"
          :placeholder="$t('domain.fieldDomain.groupSearchPlaceholder')"
          :iconfont-state="true"
        ></datablau-input>
        <div class="right-btn-container" slot="buttons">
          <datablau-button
            class="iconfont icon-tianjia"
            type="primary"
            size="mini"
            @click="addFolder"
            v-if="$isAdmin || $auth['DATA_STANDARD_CATEGORY_CREATE']"
          >
            {{
              $t('domain.common.addButton', {
                type: $t('domain.fieldDomain.domainGroup'),
              })
            }}
          </datablau-button>
        </div>
      </datablau-list-search>
      <datablau-form-submit class="list-outer">
        <datablau-table
          class="datablau-table"
          height="100%"
          ref="folderTable"
          :data="tableShowData"
          :data-selectable="false"
        >
          <el-table-column
            :label="$t('domain.fieldDomain.domainGroup')"
            prop="name"
            min-width="80px"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            minWidth="150px"
            :label="$t('domain.common.description')"
            prop="description"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('domain.fieldDomain.permission')"
            prop="permissionLevel"
            width="250"
            :formatter="typeFormatter"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            :label="$t('meta.DS.treeSubOperation.viewDetail')"
            align="center"
            :width="$i18n.locale === 'zh' ? 180 : 280"
          >
            <template slot-scope="scope">
              <datablau-button
                type="text"
                @click="showDomain({ data: scope.row })"
              >
                {{ $t('domain.common.dataStandard') }}
              </datablau-button>
              <datablau-button
                type="text"
                @click="showCode({ data: scope.row })"
              >
                {{ $t('domain.common.domainCode') }}
              </datablau-button>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('domain.common.operation')"
            align="center"
            width="120"
            fixed="right"
            header-align="center"
            v-if="hasManageAuth"
          >
            <template slot-scope="scope">
              <datablau-tooltip
                :content="$t('domain.fieldDomain.permission')"
                v-if="$isAdmin || scope.row.permissionLevel === 'ADMIN'"
              >
                <datablau-button
                  type="icon"
                  class="iconfont icon-lock"
                  @click="authority({ data: scope.row })"
                ></datablau-button>
              </datablau-tooltip>
              <datablau-tooltip
                :content="$t('common.button.edit')"
                v-if="
                  $isAdmin ||
                  scope.row.permissionLevel === 'WRITE' ||
                  scope.row.permissionLevel === 'ADMIN'
                "
              >
                <datablau-button
                  type="icon"
                  class="iconfont icon-bianji"
                  @click="editFolder({ data: scope.row })"
                ></datablau-button>
              </datablau-tooltip>
              <datablau-tooltip
                :content="$t('domain.common.delete')"
                v-if="
                  $isAdmin ||
                  scope.row.permissionLevel === 'WRITE' ||
                  scope.row.permissionLevel === 'ADMIN'
                "
              >
                <datablau-button
                  type="icon"
                  class="iconfont icon-delete"
                  @click="deleteParam({ data: scope.row })"
                ></datablau-button>
              </datablau-tooltip>
            </template>
          </el-table-column>
        </datablau-table>
        <template slot="buttons">
          <datablau-pagination
            class="pagination-component"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalShow"
          ></datablau-pagination>
        </template>
      </datablau-form-submit>
    </div>
  </div>
</template>

<script>
import HTTP from '@/http/main'
import commonMixin from '@/components/common/commonMixin.js'

export default {
  data() {
    return {
      totalShow: 0,
      columnDefs: [],
      tableOption: {
        selectable: false,
        columnResizable: true,
        rowSelection: 'single',
      },
      defaultParaData: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
      },
      domainCategories: null,
      tableShowData: [],
      tableLoading: false,
      levelArr: [
        { value: 'ADMIN', label: this.$t('domain.common.manage') },
        { value: 'WRITE', label: this.$t('domain.common.edit') },
        { value: 'READ', label: this.$t('domain.common.check') },
        { value: 'NONE', label: this.$t('domain.common.disable') },
      ],
    }
  },
  props: {
    hasManageAuth: {
      type: Boolean,
      default: true
    }
  },
  mixins: [commonMixin.tableWithPage],
  components: {},
  computed: {},
  beforeMount() {
    this.dataInit()
  },
  mounted() {},
  methods: {
    dataInit() {
      this.domainCategories = HTTP.getDomainCategories()
      this.getShowData()
    },
    getShowData() {
      this.tableLoading = true
      return new Promise((resolve, reject) => {
        this.domainCategories
          .then(res => {
            let data = res.data || []
            data = data.filter(item => item.id > 4)
            this.$emit('getAllData', [...data])
            if (!this.$isAdmin) {
              data = data.filter(
                item => item.permissionLevel && item.permissionLevel !== 'NONE'
              )
            } else {
              data.forEach(item => {
                item.permissionLevel = 'ADMIN'
              })
            }
            let keyword = _.trim(this.keyword)
            if (keyword) {
              let arr = data
              data = []
              arr.forEach(item => {
                if (this.$MatchKeyword(item, keyword, 'name', 'description')) {
                  data.push(item)
                }
              })
            }
            // console.log(data, 'data')
            this.totalShow = data.length

            let s = this.pageSize
            let c = this.currentPage
            this.tableShowData = data.slice(s * (c - 1), s * c)
            this.tableLoading = false
            resolve(this.tableShowData)
          })
          .catch(e => {
            reject(e)
            this.$showFailure(e)
          })
      })
    },
    showDomain(para) {
      let newParaData = _.cloneDeep(para)
      this.$emit('rowClick', { type: 'showDomain', para: newParaData })
    },
    showCode(para) {
      let newParaData = _.cloneDeep(para)
      this.$emit('rowClick', { type: 'showCode', para: newParaData })
    },
    editFolder(para) {
      let newParaData = _.cloneDeep(para)
      this.$emit('rowClick', { type: 'editFolder', para: newParaData })
    },
    authority(para) {
      let newParaData = _.cloneDeep(para)
      this.$emit('rowClick', { type: 'authority', para: newParaData })
    },
    deleteParam(para) {
      this.deleteFolder(para)
    },
    addFolder() {
      this.$emit('addFolder')
    },
    refreshList() {
      this.domainCategories = HTTP.getDomainCategories()
      this.getShowData()
      // if (this.$refs.fieldsTable && this.$refs.fieldsTable.refreshData) {
      //   this.$refs.fieldsTable.refreshData()
      // }
    },
    typeFormatter(row, column, cellValue, index) {
      const map = {}
      this.levelArr.forEach(item => {
        map[item.value] = item.label
      })
      return cellValue ? map[cellValue] : ''
    },
    deleteFolder(para) {
      this.$DatablauCofirm(
        this.$t('system.systemSetting.delConfirm'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(res => {
          console.log(para, 'para')
          HTTP.deleteFolderService({
            folderId: para.data.id,
            withNoValid: true,
          })
            .then(res => {
              this.$emit('rowClick', { type: 'deleteFolder', para })
              this.$blauShowSuccess(this.$t('domain.common.delSucceed'))
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          this.$datablauMessage({
            message: this.$t('domain.common.cancel'),
            type: 'info',
          })
        })
    },
  },
  watch: {
    tableLoading: {
      immediate: true,
      handler: function (newValue) {
        if (newValue) {
          this.tableShowData = null
        }

      }
    }
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

.tab-outer {
  @include absPos();
  //border: 1px solid red;

  .search-outer {
    @include absPos();
    padding: 10px 20px 0;
    height: 50px;
    //left: 20px;
    //right: 20px;
    bottom: auto;
    // padding: 0
  }

  .list-outer {
    @include absPos();
    top: 50px;
  }
}
</style>
