/** * codeDetailTab.vue */
<template>
  <div
    class="details code-detail-com"
    v-loading="showLoading"
    :class="{ 'com-show-scroll': !showList }"
  >
    <div
      class="show-message filter-line descriptionMessage-title"
      v-if="!applyData"
    >
      <el-form
        class="st-page-form"
        label-width="120px"
        :inline="true"
        :model="details"
        style="margin-top: 15px"
      >
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.common.standardTheme')}${$t(
            'domain.common.colon'
          )}`"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.datasetName"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">{{ details.datasetName }}</span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.code.codePropCode')}${$t(
            'domain.common.colon'
          )}`"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.realCode"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">{{ details.realCode }}</span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.code.cName')}${$t('domain.common.colon')}`"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.name"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">
              {{ details.name }}
            </span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.code.enName')}${$t('domain.common.colon')}`"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.enName"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">
              {{ details.enName }}
            </span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.code.code')}${$t('domain.common.colon')}`"
          v-if="isField"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="refCodeName"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">
              {{ refCodeName }}
            </span>
          </datablau-tooltip>
        </el-form-item>
        <!-- <br /> -->
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.common.remark')}${$t('domain.common.colon')}`"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.comment"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">{{ details.comment }}</span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          v-for="(udp, index) in additionalProperties.filter(
            e => e.catalog === $t('domain.domain.codeProp')
          )"
          :key="index"
          :label="udp.name + ':'"
        >
          <template slot="label">
            <el-tooltip
              :content="udp.name"
              placement="top"
              :open-delay="500"
              :disabled="true"
            >
              <span>{{ udp.name + ':' }}</span>
            </el-tooltip>
          </template>
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="udp.value"
            placement="top-start"
            :open-delay="500"
          >
            <div style="display: inline-block">
              <span class="nowrap-span">
                {{ udp.value }}
              </span>
            </div>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          class="st-page-form-span"
          :label="`${$t('domain.code.codeMapping')}${$t(
            'domain.common.colon'
          )}`"
          v-if="isField"
        >
          <datablau-tooltip
            class="item"
            effect="dark"
            :content="details.refStdCode"
            placement="top-start"
            :open-delay="500"
          >
            <span class="nowrap-span">
              {{ details.refStdCode }}
            </span>
          </datablau-tooltip>
        </el-form-item>
        <el-form-item
          label="是否来源系统："
          style="display: block; width: 100%; margin-bottom: 0"
        >
          <span class="nowrap-span">{{ details.jobId ? '是' : '否' }}</span>
        </el-form-item>
        <div v-if="details.jobId">
          <el-form-item class="st-page-form-span" label="目标数据源：">
            <datablau-tooltip
              class="item"
              effect="dark"
              :content="details.modelName"
              placement="top-start"
              :open-delay="500"
            >
              <span class="nowrap-span">{{ details.modelName }}</span>
            </datablau-tooltip>
          </el-form-item>
          <el-form-item class="st-page-form-span" label="编码取值字段：">
            <span class="nowrap-span">{{ details.codeField }}</span>
          </el-form-item>
          <el-form-item class="st-page-form-span" label="编码中文名称字段：">
            <span class="nowrap-span">{{ details.codeChineseField }}</span>
          </el-form-item>
          <el-form-item class="st-page-form-span" label="父编码取值：">
            <span class="nowrap-span">{{ details.parentValue }}</span>
          </el-form-item>
          <el-form-item class="st-page-form-span" label="备注1：">
            <span class="nowrap-span">{{ details.authDimension }}</span>
          </el-form-item>
          <el-form-item
            class="st-page-form-span"
            label="sql语句："
            style="width: 100%"
          >
            <span style="white-space: pre-wrap">{{ details.sql }}</span>
          </el-form-item>
          <el-form-item
            class="st-page-form-span"
            label="重复周期："
            style="width: 100%"
          >
            <select-period
              style="transform: translateX(0px)"
              :hasLable="true"
              :cron="
                details.schedule && details.schedule.includes('cron:')
                  ? details.schedule.split('cron:')[1]
                  : details.schedule
              "
              defaultCheck="scheduleByCron"
              class="datablau-select-period"
            ></select-period>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <div class="show-container descriptionMessage-title" v-else>
      <div
        class="table-box"
        ref="tableBox"
        :class="{ 'table-with-page': totalShow > 10 }"
      >
        <div class="table-container">
          <datablau-table
            ref="rightTable"
            :data="tableDataShow"
            :height="302"
            @sort-change="handleSortChange"
          >
            <el-table-column
              :label="$t('domain.code.order')"
              prop="order"
              sortable="custom"
              :width="$i18n.locale === 'en' ? 120 : 100"
              show-overflow-tooltip
              :min-width="120"
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.codeValueCode')"
              prop="value"
              sortable="custom"
              :min-width="120"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.codeValueName')"
              prop="name"
              sortable="custom"
              show-overflow-tooltip
              :min-width="120"
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.parentCodeValue')"
              prop="parentValue"
              :min-width="$i18n.locale === 'zh' ? 120 : 130"
              show-overflow-tooltip
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.parentCodeValueName')"
              :min-width="$i18n.locale === 'zh' ? 120 : 160"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ codeMapName.get(scope.row.parentValue) }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('domain.code.mappingCodeValueCode')"
              :min-width="$i18n.locale === 'zh' ? 120 : 140"
              v-if="isField"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.refValue ? scope.row.refValue.value : '' }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="isField"
              :min-width="$i18n.locale === 'zh' ? 130 : 180"
              :label="$t('domain.code.mappingCodeName')"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                {{ scope.row.refValue ? scope.row.refValue.name : '' }}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('domain.code.remark1')"
              prop="definition"
              sortable="custom"
              show-overflow-tooltip
              :min-width="$i18n.locale === 'zh' ? 80 : 100"
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.remark2')"
              prop="definition2"
              sortable="custom"
              show-overflow-tooltip
              v-if="!gszcCustomer"
              :min-width="$i18n.locale === 'zh' ? 80 : 100"
            ></el-table-column>
            <el-table-column
              :label="$t('domain.code.remark3')"
              prop="definition3"
              sortable="custom"
              show-overflow-tooltip
              :min-width="$i18n.locale === 'zh' ? 80 : 100"
              v-if="!gszcCustomer"
            ></el-table-column>
          </datablau-table>
        </div>
      </div>
    </div>
    <div v-if="applyData" class="footer-row" style="position: static">
      <datablau-pagination
        v-if="totalShow > 10"
        style="float: right; margin-top: 10px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalShow"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import HTTP from '@/http/main.js'

export default {
  data() {
    return {
      additionalProperties: [],
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
      showLoading: false,
      keyword2: '',
      ifDumValue: false,
      tableDataShow: [], // right table data show
      tableHeight: null,
      showList: true, // show list or tree

      /* right tree  */
      treeShowData: [], // right tree data
      valueTreeSave: [], // right tree data (dealed)
      // valueTreeSave if need refresh
      valueTreeSaveRefresh: true,
      // rightTreeSelected: [],
      deleteDisabled: true,
      allDataRight: [],
      // timer2: '',
      currentPage: 1,
      pageSize: 10,
      totalShow: 0,
      // selection: [],
      sortData: {},
      // value formatter to tree
      detailTree: [],
      // value formatter to map
      detailTreeMap: {},
      details: {},
      valueSave: [],
      refCodeName: '',
      blank: '',
      codeMapName: new Map(),
      isShowTooltip: false,
    }
  },
  props: {
    code: {},
    processInstanceId: {
      default: '',
    },
    categoryId: {
      default: 1,
    },
    useWorkflow: {
      type: Boolean,
      default: true,
    },
    isField: {
      type: Boolean,
      default: false,
    },
    applyData: {
      type: Boolean,
      default: false,
    },
    udps: {},
    hasEditAuth: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    spanWithTooltip,
  },
  computed: {
    gszcCustomer() {
      return this.$customerId === 'gszc'
    },
    unDiscardCode() {
      return this.details.state === 'A'
    },
  },
  mounted() {},
  inject: ['headerProduction'],
  methods: {
    visibleTooltip(e) {
      this.isShowTooltip = !(
        e.target.offsetWidth + 18 - e.fromElement.clientWidth >
        0
      ) // 18为required *号引起的偏差。
    },
    getCodeDetail(code) {
      this.showLoading = true
      /* HTTP.getCodeContent({
        codeNumber: this.code || code,
        // categoryId: this.categoryId,
        categoryId: null,
      }) */
      this.$http
        .post(
          `/domain/flow/standard/getProcessDetail?processInstanceId=${code}`
        )
        .then(res => {
          this.showLoading = false
          this.details = res.data
          console.log('this.details', this.details)
          this.valueSave = res.data.values
          res.data.values.forEach(element => {
            this.codeMapName.set(element.value, element.name)
          })
          if (this.details && this.details.refStdCode) {
            this.getRefCode(this.details.refStdCode)
          }
          this.handleCurrentChange(1)
          this.details.additionalProperties?.length &&
            this.details.additionalProperties.forEach(e => {
              if (
                this.udps?.filter(item => item.udpId === parseInt(e[0])).length
              ) {
                const obj = {
                  name: this.udps?.filter(
                    item => item.udpId === parseInt(e[0])
                  )[0].name,
                  value: e[1],
                  catalog: this.udps?.filter(
                    item => item.udpId === parseInt(e[0])
                  )[0].catalog,
                }
                this.additionalProperties.push(obj)
              }
            })
          this.$emit('setPath', [
            {
              name: res.data.datasetName,
              couldClick: false,
            },
            {
              name: res.data.code,
              couldClick: false,
            },
          ])
        })
        .catch(e => {
          this.showLoading = false
          this.$showFailure(e)
        })
    },
    handleEditNode() {
      this.$emit('openEdit', 'edit', this.details)
    },
    handleShowDomRef() {
      this.$emit('handleShowDomRef', this.details)
    },
    handleShowColRef() {
      this.$emit('handleShowColRef', this.details)
    },
    handleShowHistory() {
      this.$emit('handleShowHistory', this.details)
    },
    handleShowMetaQuote() {
      this.$emit('handleShowMetaQuote', this.details)
    },
    // handleNodeClick() {
    //   this.showList = true;
    //   this.allDataRight = this.currentCodeData.values || [];
    //   valueSave = this.allDataRight;
    //   this.$utils.sort.sort(valueSave,'value');
    //   this.dealwithTableData();
    //   this.updateTableBoxScrollbar();
    //   this.showCodeList(this.showList);
    // },
    toPublish(typeName) {
      if (typeName) {
        this.applyCodeState('A', '领域标准代码')
      } else {
        this.applyCodeState('A', '标准代码')
      }
    },
    toUpdate() {
      this.details.isUpdate = true
      this.$emit('openEdit', 'edit', this.details)
    },
    toAbandon(typeName) {
      this.$DatablauCofirm(
        this.$t('domain.code.discardCodeConfirm'),
        this.$t('domain.common.warning'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          // TODO i18n
          if (typeName) {
            this.applyCodeState('', '领域标准代码_废弃')
          } else {
            this.applyCodeState('', '标准代码_废弃')
          }
        })
        .catch(() => {})
    },
    applyCodeState(newState, processType) {
      const codeValueLabel = []
      codeValueLabel.push(
        {
          name: this.$t('domain.code.codeValue'),
          value: 'value',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.cName'),
          value: 'name',
          type: 'normal',
        },
        {
          name: this.$t('domain.code.order'),
          value: 'order',
          type: 'normal',
        },
        {
          name: this.$t('domain.common.remark'),
          value: 'definition',
          type: 'normal',
        }
      )
      const para = {
        requestBody: {
          processType: processType,
          formDefs: [
            { code: 'realCode', value: this.details.realCode },
            { code: 'codeValueLabel', value: JSON.stringify(codeValueLabel) },
            {
              code: 'codeValueValue',
              value: this.tableDataShow.length
                ? JSON.stringify(this.tableDataShow)
                : '',
            },
          ],
        },
      }
      HTTP.publish(para)
        .then(() => {
          this.$message.success(this.$t('domain.common.applicationSubmitted'))
          this.$emit('freshCode')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDeleteCode() {
      this.$confirm(
        this.$t('domain.common.delConfirm'),
        this.$t('domain.common.tip'),
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(res => {
          const codeNumber = this.details.realCode
          let url = ''
          const data = [codeNumber]
          HTTP.deleteCodeService({ codes: data, categoryId: this.categoryId })
            .then(res => {
              this.$message.success(this.$t('domain.common.delSucceed'))
              this.$emit('freshCode')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {
          console.log(e)
        })
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
    getRefCode(code) {
      HTTP.getCodeContent({
        codeNumber: code,
        categoryId: 1,
      })
        .then(res => {
          this.refCodeName = res.data ? res.data.name : ''
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    tabOnTop() {
      // this.setLoadingFalse();
    },

    setLoadingFalse() {
      if (this.timer2) {
        clearTimeout(this.timer2)
      }
      this.timer2 = setTimeout(() => {
        this.resetTreeStyle()
        this.$nextTick(() => {
          this.showLoading = false
        })
      }, 50)
    },
    initSet() {
      this.$refs.rightTable.clearSort()
      this.keyword2 = ''
    },
    /* pagination: START */
    // right table sort
    handleSortChange(sortData) {
      this.sortData = sortData
      this.resetPageData({
        sortData: sortData,
      })
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.resetPageData({
        pageSize: this.pageSize,
      })
    },
    handleCurrentChange() {
      this.resetPageData({
        currentPage: this.currentPage,
      })
    },
    /* pagination: END */

    resetPageData({ currentPage, pageSize, keyword, sortData }) {
      if (!this.valueSave) {
        this.showLoading = false
        return
      }
      if (currentPage) {
        sortData = sortData || this.sortData
      }
      keyword = keyword || this.keyword2
      sortData = sortData || {}
      currentPage = currentPage || 1
      this.currentPage = currentPage
      pageSize = pageSize || this.pageSize
      const arr = []
      this.valueSave.forEach(item => {
        let bool = false
        const testArr = ['name', 'value']
        testArr.forEach(attr => {
          if (
            item[attr] &&
            item[attr].toLowerCase().indexOf(keyword.toLowerCase()) !== -1
          ) {
            bool = true
          }
        })
        if (bool) {
          arr.push(item)
        }
      })
      if (!sortData || !sortData.prop || !sortData.sort) {
        this.$utils.sort.sortConsiderChineseNumber(arr, 'order')
      } else if (sortData && sortData.prop) {
        this.$utils.sort.sortConsiderChineseNumber(arr, sortData.prop)
      }
      if (sortData.prop && sortData.order === 'descending') {
        arr.reverse()
      }
      this.totalShow = arr.length
      if (this.totalShow > 10) {
        this.tableHeight = null
      } else {
        this.tableHeight = document.documentElement.clientHeight - 520
      }
      const resultArr = arr.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )
      this.tableDataShow = resultArr.map(item => {
        const result = _.cloneDeep(item)
        delete result.children
        return result
      })
      this.showLoading = false
    },
    /* set show style (right part,tree or list) */
    showCodeList(ifShowList) {
      this.showLoading = true
      this.initSet()
      this.showList = ifShowList
      $(this.$refs.tableBox).scrollTop(0)
      this.updateTableBoxScrollbar()
      if (ifShowList) {
        const currentPage = 1
        const pageSize = this.pageSize || 10
        const keyword = this.keyword2 || ''
        const sortData = {}
        this.resetPageData({
          currentPage,
          pageSize,
          keyword,
          sortData,
        })
      } else {
        this.currentPage = 1
        this.pageSize = 10
        this.keyword2 = ''
        this.sortData = {}
        let handleShow = null
        if (this.valueTreeSaveRefresh) {
          this.dealwithTableData()
        } else {
          handleShow = () => {
            this.$nextTick(() => {
              this.showLoading = false
            })
          }
        }
        setTimeout(() => {
          if (!this.valueTreeSave || this.valueTreeSave.length === 0) {
            this.showLoading = false
          }
          this.treeShowData = this.valueTreeSave
          handleShow && handleShow()
        }, 20)
        this.resetTreeStyle()
      }
    },
    updateTableBoxScrollbar(time) {
      setTimeout(() => {
        Ps.update($('.table-box')[0])
      }, time || 500)
    },
    handleTreeFilter(value, data) {
      if (!value) return true
      if (!data.name || !data.value) return false
      return (
        data.name.toLowerCase().indexOf(value) !== -1 ||
        data.value.toLowerCase().indexOf(value) !== -1
      )
    },

    renderContent2(h, { node, data, store }) {
      this.setLoadingFalse()
      const getClou = () => {
        const result = []
        let propsArr = [
          'name',
          'enName',
          'order',
          'definition',
          'definition2',
          'definition3',
        ]
        if (this.gszcCustomer) {
          propsArr = ['name', 'order', 'definition']
        }
        for (let i = 0, len = propsArr.length; i < len; i++) {
          const dom = h(spanWithTooltip, {
            props: {
              classString: 'flex-item',
              widthStr: '120px',
              content: node.data[propsArr[i]]
                ? node.data[propsArr[i]] + ''
                : '',
              displayType: 'block',
            },
          })
          result.push(dom)
        }
        return result
      }
      const getWidth = () => {
        return 150 - 16 * (parseInt(node.level) - 1) + 'px'
      }
      const result = h('p', { class: 'node-line' }, [
        h(spanWithTooltip, {
          props: {
            content: node.data.value,
            classString: 'code-value',
            widthStr: getWidth(),
          },
        }),
        h('span', { class: 'flex-container' }, [
          h('span', { class: 'flex-box' }, getClou()),
        ]),
      ])
      return result
    },
    editCodeShow(code) {
      const obj = _.clone(code)
      const index = this.editTabArr.findIndex(item => {
        return item.name === obj.value
      })
      if (index === -1) {
        this.editTabArr.push({
          oldCode: obj,
          name: obj.value,
          label: obj.name,
          type: 'value',
        })
      }
      this.currentTab = obj.value
    },
    resetTreeStyle() {
      setTimeout(() => {
        $('.code-in-tree .el-tree-node').each(function (index) {
          if (index % 2 !== 0) {
            $(this).css({
              'background-color': '#FAFAFA',
            })
          } else {
            $(this).css({
              'background-color': '#fff',
            })
          }
        })
        const width = $('.tree-title').width()
        $('.flex-box').width(width - 370)
      }, 10)
    },
    dealwithTableData() {
      const map = {}
      const tree = []
      const dupMap = {}
      let ifDup = false
      this.valueSave.forEach((item, index) => {
        map[item.value] = item
        item.coustomId = index + 1 + ''
        if (dupMap[item.value]) {
          ifDup = true
        }
        dupMap[item.value] = true
      })
      this.ifDumValue = ifDup
      this.valueSave.forEach(item => {
        let parent = {}
        if (item.parentValue && map[item.parentValue]) {
          parent = map[item.parentValue]
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(item)
          parent.hasChildren = true
          // childrenShow 默认为空数组, 当加载子节点时, 将 children 的数据指向 childrenShow
          parent.childrenShow = []
        } else {
          tree.push(item)
        }
      })
      this.detailTree = tree
      this.detailTreeMap = map // item with children
      this.valueTreeSave = tree
      this.valueTreeSaveRefresh = false
      this.treeShowData = this.valueTreeSave
      this.showLoading = false
    },
    getChildrenShow(row, treeNode, resolve) {
      row.childrenShow = row.children
      resolve(row.childrenShow)
    },
    handleRightFilter(keyword) {
      if (this.showList) {
        this.$refs.rightTable.clearSort()
        this.resetPageData({
          keyword,
        })
      }
    },
  },
  watch: {
    keyword2(val) {
      this.handleRightFilter(val)
    },
    processInstanceId(val) {
      if (val) {
        this.getCodeDetail(val)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$tree-line-height: 44px;
$blue: #268bd3;
.nowrap-span {
  display: inline-block;
  max-width: 120px;
  min-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details.code-detail-com {
  &.com-show-scroll {
    overflow: auto;
    min-height: 0;
  }

  .filter-line {
    overflow: hidden;
    padding-top: 10px;
    //margin-left: 2em;
    white-space: nowrap;
    // height: 60px;
    position: relative;

    .detail {
      display: inline-block;
      margin-right: 50px;
      font-size: 14px;
    }

    .searchbox {
      display: inline-block;
      width: 30%;
      height: 32px;
      margin-right: 80px;
    }

    .right-btn-con {
      float: right;
      // position: absolute;
      // right: 20px;
      // top: 10px;

      /deep/ .datablau-tooltip {
        margin-right: 4px;

        .is-block.icon {
          width: auto;
        }
      }
    }

    .icon-box {
      padding-left: 7px;
      padding-right: 7px;
      margin-right: 0px;
      margin-left: 0px;

      &.activeType {
        // border: $blue;
        color: $blue;
        // color: #409EFF;
        border-color: #c6e2ff;
        background-color: #ecf5ff;
      }
    }
  }
  .show-message {
    flex-shrink: 0;
  }

  .show-container {
    flex-grow: 1;
    // overflow: hidden;
    // max-height: 500px;
    position: relative;
    // top: 120px;
    // left: 0;
    // right: 0;
    // bottom: 0;

    .table-box {
      overflow: hidden;
      //overflow-y: scroll;
      min-width: 850px;

      /*&.table-with-page {
        //border: 1px solid red;
        overflow: hidden;
        //height: 100%;
        position: absolute;
        top: 100px;
        left: 0;
        right: 0;
        bottom: 0;

        .table-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 50px;
          padding-top: 5px;
          border-bottom: 1px solid #e0e0e0;
        }
      }*/
      &.table-with-page {
        .table-container {
          border-bottom: 1px solid #e0e0e0;
          .footer-row {
            position: static;
            white-space: nowrap;
            .red-btn {
              position: absolute;
            }
          }
        }
      }
    }

    .right-tree-con {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      min-width: 1200px;

      .tree-title {
        position: relative;
        box-sizing: border-box;
        height: $tree-line-height;
        width: 100%;
        padding-left: 20px;
        background-color: var(--grey-table-title);
        line-height: $tree-line-height;
        font-weight: bold;
        font-size: 14px;

        .code-name {
        }

        .flex-container {
          position: absolute;
          left: 150px;
          right: 150px;
          top: 0px;
          bottom: 0px;
        }

        .code-control {
          float: right;
          margin-right: 50px;
        }
      }

      .right-tree-box {
        position: absolute;
        top: 44px;
        left: 0;
        right: 0;
        // bottom: 60px;
        bottom: 0px;
        overflow: auto;

        &.more-height {
          bottom: 0;
        }
      }

      .right-tree-footer-row {
        position: absolute;
        bottom: 8px;
        left: 20px;
        right: 0;
        top: auto;
      }
    }

    // .coverMask {
    //   // display: none;
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   right: 0;
    //   bottom: 0;
    //   z-index: 2;
    //   text-align: center;
    //   color: $blue;
    //   font-size: 40px;
    //   background-color: rgba(211, 211, 211, 0.945);
    //   // background-color: red;
    //   // border: 1px solid #aaa;
    //   border: 1px solid red;
    //   i {
    //     margin-top: 30%;
    //   }
    // }
  }

  &.loadingIcon {
    .coverMask {
      // display: block;
      // z-index: 4;
      // background-color: red;
      // display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 4;
      text-align: center;
      color: $blue;
      font-size: 40px;
      // background-color: rgba(211, 211, 211, 0.545);
      background-color: #fff;

      i {
        margin-top: 30%;
      }
    }
  }
}

.st-page-form {
  .st-page-form-span {
    float: left;
    width: 33%;
    display: flex;
    margin-bottom: 0;
  }
}
</style>
<style lang="scss">
.plain-tableTree {
  .el-table__row--level-1 {
    background: #fafafa !important;
  }
}
.st-page-form {
  max-width: 1600px;
  display: flex;
  flex-wrap: wrap;
  .st-page-form-span {
    width: 33%;
    margin: 0;
    &:nth-child(odd) {
    }
    .el-form-item__label {
      padding-right: 6px !important;
      //white-space: pre-line;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .el-form-item__content {
      //width: 300px !important;
      flex: 1;
    }
  }
}
.descriptionMessage-title {
  .message-title {
    margin-top: 20px;
  }
  &:first-of-type {
    .message-title {
      margin-top: 0;
    }
  }
}
</style>
