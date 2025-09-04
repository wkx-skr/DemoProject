<template>
  <div class="historyRecord">
    <div class="leftLine"></div>
    <div class="subTitleLine">
      <datablau-detail-subtitle
        :title="$t('quality.page.dataQualityRepairJob.recorded')"
        mb="0"
      ></datablau-detail-subtitle>
      <span>
        {{
          $t('quality.page.dataQualityRepairJob.history.totalNum', {
            num: tableData.length,
          })
        }}
      </span>
    </div>
    <div class="recordCard">
      <div class="card" v-for="item in tableData">
        <div class="cardHeader">
          <span>
            <i class="iconfont icon-ownsee" style="color: #999"></i>
            <span-with-tooltip
              class="operator"
              :content="item.operator"
            ></span-with-tooltip>
          </span>
          <span>{{ $timeFormatter(item.editTimestamp) }}</span>
        </div>
        <div class="cardContent">
          <span>{{ item.detail }}</span>
        </div>
      </div>
    </div>

    <!--    <datablau-table
      :data="tableData"
      :data-selectable="option.selectable"
      :auto-hide-selection="option.autoHideSelectable"
      :show-column-selection="option.showColumnSelection"
      :column-selection="option.columnSelection"
      :border="option.columnResizable"
      max-height="300"
    >
      <el-table-column
        prop="operator"
        :label="$t('quality.page.dataQualityRepairJob.history.operator')"
      >
        <template slot-scope="scope">
          <span>
            {{
              scope.row.operator === 'system'
                ? scope.row.operator
                : nameMapping[scope.row.operator]
                ? nameMapping[scope.row.operator]
                : scope.row.operator
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="editTimestamp"
        :formatter="$timeFormatter"
        :label="$t('quality.page.dataQualityRepairJob.history.editTimestamp')"
      ></el-table-column>
      <el-table-column
        prop="detail"
        :label="$t('quality.page.dataQualityRepairJob.history.detail')"
        show-overflow-tooltip
      ></el-table-column>
    </datablau-table>-->
  </div>
</template>

<script>
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
export default {
  props: {
    taskId: {
      required: true,
    },
  },
  data() {
    return {
      tableData: [],
      nameMapping: {},
      deleteArr: ['tableData', 'nameMapping'],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
    }
  },
  components: {
    spanWithTooltip,
  },
  mounted() {
    this.getData()
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    })
  },
  methods: {
    getData() {
      this.$http
        .get(this.$quality_url + `/quality/rules/tasks/${this.taskId}/history`)
        .then(res => {
          this.tableData = res.data
          let arr2 = []
          this.tableData.forEach(e => {
            arr2.push(e.operator)
            e.detail.includes('给') &&
              e.detail.includes('给') &&
              arr2.push(
                ...e.detail.substring(e.detail.indexOf('给') + 1).split(',')
              )
          })
          arr2 = [...new Set(arr2)]
          // this.getUserByIds(arr2).then(() => {
          //   this.tableData.forEach(e => {
          //     if (e.detail.includes('给')) {
          //       e.detail = e.detail.substring(0, e.detail.indexOf('给') + 1) + this.getMappingName(e.detail.substring(e.detail.indexOf('给') + 1))
          //     }
          //   })
          // })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj

            resolve()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    getMappingName(st) {
      if (!st) {
        return ''
      }
      const arr = st.split(',')
      return arr
        .map(e => (e.trim() === 'system' ? e : this.nameMapping[e.trim()]))
        .toString()
    },
  },
}
</script>

<style lang="scss" scoped>
.historyRecord {
  padding: 12px;
  //border-left: 1px solid #ddd;
  position: absolute;
  top: 0;
  bottom: 0;
  .leftLine {
    position: fixed;
    top: 90px;
    right: 298px;
    bottom: 50px;
    width: 1px;
    background: #ccc;
  }
  .subTitleLine {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .recordCard {
    margin-top: 20px;
    .card {
      width: 240px;
      min-height: 68px;
      box-shadow: 0px 1px 4px 1px rgba(85, 85, 85, 0.15);
      margin: 12px 0;
      border-radius: 2px;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        display: block;
        background-color: #ccc;
        height: 9px;
        width: 9px;
        border-radius: 50%;
        left: -17px;
        top: -2px;
      }
      .cardHeader {
        padding: 0 11px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        background: #f8f8f8;
        font-size: 12px;
        .operator {
          margin-left: 4px;
          width: 70px;
        }
      }
      .cardContent {
        padding: 12px;
        color: #777;
        //line-height: 36px;
      }
    }
  }
}
</style>
