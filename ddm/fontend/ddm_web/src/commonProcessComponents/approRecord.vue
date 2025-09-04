<template>
  <div>
    <datablau-table :data="tableData">
      <!-- <el-table-column width="20"></el-table-column> -->
      <el-table-column
        :label="$t('userPane.myTodo.taskName')"
        prop="taskName"
        column-key="taskName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.approver')"
        prop="assignee"
        column-key="assignee"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <!--                {{ userMap[scope.row.assignee] }}-->
          {{ scope.row.assigneeDisplayName }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.startTime')"
        prop="startTime"
        column-key="startTime"
        show-overflow-tooltip
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.endTime')"
        prop="endTime"
        column-key="endTime"
        show-overflow-tooltip
        :formatter="$timeFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.approStatus')"
        prop="endTime"
        column-key="endTime"
        show-overflow-tooltip
        :formatter="statusFormatter"
      ></el-table-column>
      <el-table-column
        :label="$t('userPane.myTodo.ApproOpinion')"
        prop="endTime"
        column-key="endTime"
        show-overflow-tooltip
        :formatter="opinionFormatter"
      ></el-table-column>
    </datablau-table>
    <div v-if="commonData.processType === '数据模型评审'">
      <div class="task-assign-list" style="margin-bottom: 10px">
        <div
          v-for="item in formDetails"
          :key="item.code"
          style="margin-top: 10px"
        >
          <span>
            {{
              item.code === 'modelName'
                ? '模型名称'
                : item.code === 'projectName'
                  ? '项目名称'
                  : '表名'
            }}：
          </span>
          <span v-if="item.code === 'modelName' || item.code === 'projectName'">
            {{ item.value && JSON.parse(item.value)[0] }}
          </span>
          <span v-else>
            {{ item.value && JSON.parse(item.value).join('，') }}
          </span>
        </div>
      </div>
      <datablau-button @click="viewDetails" size="small" class="viewDetails">
        查看详情
      </datablau-button>
    </div>
    <div v-if="commonData.processType === '项目版本发布'">
      <datablau-button @click="viewDetails" size="small" class="viewDetails">
        查看详情
      </datablau-button>
      <datablau-button
        @click="descriptionDown('')"
        size="small"
        class="viewDetails"
        v-show="
          commonData.result === '审核中' ||
          commonData.result === '审核通过' ||
          parseInt(commonData.requestType) === 2
        "
      >
        版本文档
      </datablau-button>
      <datablau-button
        @click="descriptionDown('descrip')"
        size="small"
        class="viewDetails"
        v-show="
          commonData.result === '审核中' ||
          commonData.result === '审核通过' ||
          parseInt(commonData.requestType) === 2
        "
      >
        审批内容文档
      </datablau-button>
    </div>
  </div>
</template>
<script>
import UserInformationService from '@service/UserInformationService'
import HTTP from '@/resource/http'

export default {
  props: {
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
    commonData: {
      type: Object,
      default() {
        return {}
      },
    },
    formDetails: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      tableData: [],
    }
  },
  watch: {
    getDetailData: {
      handler(val) {
        if (val) {
          let tempDetail = _.cloneDeep(val)
          // 通过登录名获取姓名
          Array.isArray(tempDetail.taskDtos) &&
          tempDetail.taskDtos.forEach(t => {
            let assignee = t.assignee && t.assignee.split(',')
            let name = []
            Array.isArray(assignee) &&
            assignee.forEach(a => {
              UserInformationService.getUsernames([a]).then(map => {
                if (map.has(a)) {
                  name.push(map.get(a))
                  this.$set(t, 'assigneeDisplayName', name.join(','))
                }
              })
            })
          })
          this.tableData = tempDetail.taskDtos || []
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
  },
  methods: {
    statusFormatter(row, column, cellValue, index) {
      let result = ''
      if (row.endTime) {
        if (row.param && row.param.result) {
          result = row.param.result
        } else {
          result = '通过'
        }
      } else {
        if (row.startTime) {
          result = '审批中'
        } else {
          result = '待审批'
        }
      }
      return result
    },
    opinionFormatter(row, column, cellValue, index) {
      let result = ''
      if (row.endTime) {
        if (row.param && row.param.opinion) {
          result = row.param.opinion
        } else {
          result = ''
        }
      }
      return result
    },
    viewDetails() {
      // let tag = /\((\w*)\)/
      // let branch = this.applyDetailData?.itemName
      // let branchName = branch.match(tag) ? branch.match(tag)[1] : ''
      let projectId = this.commonData.projectId
      if (projectId) {
        let pageUrl = this.BaseUtils.RouterUtils.getFullUrl('sqlEditor', {
          projectId: projectId,
        })
        window.open(pageUrl)
      } else {
        this.$datablauMessage.warning('找不到projectId')
      }
    },
    // 下载文档
    descriptionDown(val) {
      let obj = this.commonData.dataModelType
      let ary = obj && JSON.parse(obj)
      let url =
        val === 'descrip'
          ? `${this.$ddd_url}/version/approval/${ary[0]}`
          : `${this.$ddd_url}/version/document/${ary[0]}`
      let name = val === 'descrip' ? 'attachment.zip' : 'change_list.json'
      this.$http({
        url: url,
        method: 'POST',
        responseType: 'blob',
      })
        .then(res => {
          const blob = res.data
          let link = document.createElement('a')
          link.href = URL.createObjectURL(
            new Blob([blob], { type: 'application/x-msdownload' })
          )
          link.download = name
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
