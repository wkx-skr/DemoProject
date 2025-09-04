<template>
  <div class="en-list-box">
    <datablau-dialog
      :title="title"
      :visible.sync="visible"
      width="1000px"
      height="526"
      :close-on-click-modal="false"
      append-to-body
    >
      <div style="position: relative; height: 400px">
        <el-form
          class="st-page-form"
          label-position="right"
          :label-width="($i18n.locale === 'en' ? 90 : 50) + 'px'"
          :inline="true"
          :model="searchFormData"
          style="margin-top: 5px"
        >
          <el-form-item>
            <datablau-input
              clearable
              maxlength="100"
              style="width: 15vw"
              :placeholder="$t('domain.code.codeListSearchPlaceholder')"
              type="text"
              size="small"
              v-model="searchFormData.keyword"
            ></datablau-input>
          </el-form-item>
          <el-form-item>
            <datablau-select v-if="typeId" v-model="optionsValue">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item style="margin-left: 20px">
            <datablau-button
              size="mini"
              type="primary"
              @click="handleCurrentChange(1)"
            >
              {{ $t('domain.common.search') }}
            </datablau-button>
          </el-form-item>
        </el-form>
        <div style="position: absolute; top: 50px; bottom: 0; width: 100%">
          <datablau-table
            class="datablau-table"
            height="100%"
            id="selectDomainCodeTable"
            ref="selectDomainCodeTable"
            :data="tableData"
            v-loading="tableLoading"
            :data-selectable="true"
            @selection-change="tableSelectionChanged"
          >
            <!-- <el-table-column type="selection" width="50"></el-table-column> -->
            <el-table-column
              min-width="120px"
              :label="$t('domain.fieldDomain.standardClassification')"
              show-overflow-tooltip
              v-if="typeId"
            >
              <template slot-scope="scope">
                {{
                  scope.row.categoryId > 4
                    ? $t('domain.fieldDomain.domainCode')
                    : $t('domain.fieldDomain.basicCode')
                }}
              </template>
            </el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('domain.code.codeName')"
              prop="name"
              show-overflow-tooltip
            ></el-table-column>
            <!--            <el-table-column
              :label="$t('domain.domain.enName')"
              prop="enName"
              min-width="120px"
              show-overflow-tooltip
            ></el-table-column>-->
            <el-table-column
              width="100px"
              :label="$t('domain.code.codePropCode')"
              prop="code"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              min-width="120px"
              :label="$t('domain.common.standardTheme')"
              prop="datasetName"
              show-overflow-tooltip
            ></el-table-column>
            <!--            <el-table-column
              :label="$t('domain.code.codeStatus')"
              prop="state"
              :min-width="80"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ statusFormatter(scope.row.state) }}
              </template>
            </el-table-column>-->
            <el-table-column
              :label="$t('domain.common.creator')"
              prop="submitter"
              :min-width="80"
              show-overflow-tooltip
            ></el-table-column>
            <!--        <el-table-column-->
            <!--          :label="$version.tableHeader.publishTime"-->
            <!--          :min-width="130"-->
            <!--          column-key="publish"-->
            <!--          prop="firstPublish"-->
            <!--          :formatter="$timeFormatter"-->
            <!--          show-overflow-tooltip-->
            <!--        ></el-table-column>-->
            <!--        <el-table-column-->
            <!--          :label="$version.tableHeader.lastModificationTime"-->
            <!--          :min-width="130"-->
            <!--          column-key="last"-->
            <!--          prop="lastModification"-->
            <!--          :formatter="$timeFormatter"-->
            <!--          show-overflow-tooltip-->
            <!--        ></el-table-column>-->
            <el-table-column
              :label="$t('domain.common.remark')"
              prop="comment"
              :min-width="80"
              show-overflow-tooltip
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
      <div class="dialog-bottom">
        <div style="position: absolute; left: 20px">
          <datablau-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :pager-count="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></datablau-pagination>
        </div>
        <datablau-button
          @click="handleSelect"
          :disabled="selection.length < 1"
          type="important"
        >
          {{ $t('domain.common.sel') }}
        </datablau-button>
        <datablau-button type="secondary" @click="visible = false">
          {{ $t('domain.common.close') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main'

export default {
  name: 'codeSelect',
  data() {
    return {
      title: '',
      visible: false,
      dataList: [],
      filteredRules: [],
      tableData: [],
      headers: [],
      rowCanClick: false,
      fullSetting: {
        options: {},
        filters: [],
      },
      filters: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      rowClassName: '',
      keyword: '',
      showContent: false,
      tableLoading: false,
      firstTimeout: null,
      tableHeight: null,
      selection: [],
      stateOptions: [
        {
          label: this.$t('domain.common.all'),
          value: null,
        },
        {
          label: this.$t('domain.common.underReview'),
          value: 'C',
        },
        {
          label: this.$t('domain.common.pendingReview'),
          value: 'D',
        },
        {
          label: this.$t('domain.common.published'),
          value: 'A',
        },
        {
          label: this.$t('domain.common.obsolete'),
          value: 'X',
        },
      ],
      searchFormData: {
        keyword: '',
        code: '',
        state: null,
      },
      typeId: null,
      options: [
        {
          value: '0',
          label: this.$t('domain.fieldDomain.allStandard'),
        },
        {
          value: '1',
          label: this.$t('domain.fieldDomain.basicCode'),
        },
        {
          value: '2',
          label: this.$t('domain.fieldDomain.domainCode'),
        },
      ],
      optionsValue: '0',
    }
  },
  mounted() {
    this.$bus.$on('callDomainCodeSelector', (typeId, type) => {
      this.title =  type === 'cksj' ? '参考数据' : this.$t('domain.domain.chooseCode');
      this.visible = true
      if (typeId > 2) {
        this.typeId = typeId
      }
      this.getListData()
    })
  },
  beforeDestroy() {
    this.$bus.$off('callDomainCodeSelector')
  },
  watch: {
    visible(newVal) {
      this.searchFormData.keyword = ''
      this.optionsValue = '0'
    },
  },
  methods: {
    getListData() {
      this.tableLoading = true
      const obj = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchFormData.keyword,
        relaDomain: false,
        // state: 'A',
        // datasetName: '',
      }
      if (this.typeId && this.optionsValue === '0') {
        obj.categoryIds = [1, this.typeId]
      }
      if (
        this.typeId &&
        this.optionsValue !== '1' &&
        this.optionsValue !== '0'
      ) {
        obj.categoryId = this.typeId
      }
      // this.$http
      //   .post(`${this.$url}/service/domains/codes/page`, obj)
      HTTP.getCodeListService(obj)
        .then(res => {
          this.tableLoading = false
          this.tableData = res.data.data
          this.total = res.data.total
          setTimeout(() => {
            this.tableHeight = document.documentElement.clientHeight - 190
          })
          setTimeout(() => {
            $('#selectDomainCodeTable table th .el-checkbox').css({
              display: 'none',
            })
          }, 10)
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getListData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getListData()
    },
    tableSelectionChanged(selection) {
      this.selection = selection
      if (selection.length > 1) {
        const del_row = selection.shift()
        this.$refs.selectDomainCodeTable.toggleRowSelection(del_row, false)
      }
    },
    statusFormatter(status) {
      const param = {
        value: status,
      }
      switch (param.value) {
        case 'X':
          return this.$version.domain.status.deprecated
        case 'D':
          return this.$t('domain.common.pendingReview')
        case 'C':
          return this.$t('domain.common.underReview')
        case 'A':
          return this.$version.domain.status.adopted
      }
      return param.value
    },
    handleSelect() {
      this.$bus.$emit('domainCodeSelected', this.selection[0])
      this.visible = false
    },
  },
}
</script>
<style lang="scss">
.en-list-box .input input {
  background-color: #f6f6f6;
  border-radius: 3px;
  border: none;
  height: 30px;
  line-height: 30px;
  width: 240px;
}
</style>
<style scoped lang="scss">
.en-list-box {
  padding: 10px 0;
  overflow: auto;

  .content {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 15px 20px;
    z-index: 1;
  }
}

.row-filter {
  margin-top: 18px;
  min-width: 600px;
}

.row-table {
  position: absolute;
  top: 90px;
  left: 20px;
  right: 20px;
  bottom: 50px;
  min-width: 1000px;
  /*outline:1px solid pink;*/
}

.row-pagination {
  position: absolute;
  bottom: 5px;
  left: 20px;
  right: 20px;
  width: 100%;
}

.filter-item {
  margin-left: 1em;

  .label {
    margin-right: 0.5em;
    color: #20293b;
    font-size: 13px;
  }
}
</style>
