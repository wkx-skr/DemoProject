<template>
  <div class="quality-problem-list-dialog">
    <el-tabs v-model="activeName">
      <el-tab-pane
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.title')"
        name="problem"
      >
        <problem-list
          :tableDetail="tableDetail"
          v-if="tableDetail"
          key="problemList"
        ></problem-list>
      </el-tab-pane>
      <el-tab-pane
        :label="$t('meta.DS.tableDetail.lineage.qualityProblem.changeInfo')"
        name="change"
      >
        <change-list
          :tableDetail="tableDetail"
          v-if="tableDetail"
          key="changeList"
        ></change-list>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import changeList from './changeList'
import problemList from './problemList'
// import HTTP from '@/http/main'
import HTTP from '@/dataWarehouse/resource/http.js'
export default {
  name: 'qualityProblem',
  data () {
    return {
      activeName: 'problem',
      tableDetail: null
    }
  },
  props: {
    objectId: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    changeList,
    problemList
  },
  mounted () {},
  methods: {
    dataInit () {
      // console.log(this.objectId, 'this.objectId')
      HTTP.getQualityInfo({ objectId: this.objectId })
        .then(res => {
          // console.log(res, 'res')

          this.tableDetail = res.data
        })
        .catch(e => {
          this.tableDetail = {
            questList: [],
            modifyList: []
          }
          // this.tableDetail = {
          //   dateType: 80000004, // 数据类型
          //   status: null, // 资产状态
          //   categoryNames: [
          //     // 资产分类
          //     'test-lsh',
          //     '011',
          //   ],
          //   domains: [
          //     // 相关指标
          //     'wqqqq',
          //   ],
          //   lineageFrom: {
          //     // 血缘分析
          //     systemCounts: 1, // 系统个数
          //     entityCounts: 1, // 实体个数
          //     modifyCounts: 1, // 近一月变更次数
          //     qualityCounts: 2, // 问题数量
          //   },
          //   lineageEffect: {
          //     // 影响分析
          //     systemCounts: 1, // 系统个数
          //     entityCounts: 1, // 实体个数
          //   },
          //   questList: [
          //     // 质量问题
          //     {
          //       type: 1, // 1是当前实体，2是血缘实体
          //       questId: 5, // 问题id
          //       questName: 'test-17-01-test-17-01-2022010700001', // 问题名称
          //       questCounts: 1, // 问题数量
          //     },
          //     {
          //       type: 2,
          //       questId: 5,
          //       questName: 'test-17-01-test-17-01-2022010700001',
          //       questCounts: 1,
          //     },
          //   ],
          //   modifyList: [
          //     // 变更信息
          //     {
          //       type: 1, // 1是当前实体，2是血缘实体
          //       modifyId: 5102, // 实体id
          //       modifyTime: '2021-12-31', // 变更时间
          //       modifyInfo: 'id,name,age,address', // 变更字段
          //       modifyCounts: 4, // 变更个数
          //       version: 2, // 变更版本信息
          //       modelId: 5100, // 模型ID
          //     },
          //     {
          //       type: 2,
          //       modifyId: 5102,
          //       modifyTime: '2021-12-31',
          //       modifyInfo: 'id,name,age,address',
          //       modifyCounts: 4,
          //       version: 2,
          //       modelId: 5100,
          //     },
          //   ],
          // }
          this.$showFailure(e)
        })
    }
  },
  watch: {
    objectId: {
      immediate: true,
      handler: function () {
        // console.log('watch')
        this.dataInit()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .quality-problem-list-dialog {
    /deep/ .el-tabs__content {
      .el-tab-pane {
        padding: 10px 0;
      }
    }
  }
</style>
