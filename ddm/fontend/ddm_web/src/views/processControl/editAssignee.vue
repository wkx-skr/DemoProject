<template>
  <div class="content-area edit-assignee">
    <div class="top-title">{{ currentProcessName }}审批人管理</div>
    <el-card
      v-loading.lock="loading"
      v-for="(v, i) in assignee"
      :key="i"
      style="width: 480px; margin-top: 1em"
    >
      <div slot="header">
        <span>第{{ figureLabel(i) }}级</span>
        <el-button
          type="text"
          style="float: right; margin-top: -5px"
          size="mini"
          icon="el-icon-delete"
          @click="handleDelete(i)"
        >
          删除
        </el-button>
      </div>
      <el-form label-position="right" label-width="5em" size="mini">
        <el-form-item :rules="{ required: true }" label="审批人">
          <el-select
            ref="selection"
            v-model="v.assignee"
            filterable
            @change="selectChanged"
          >
            <el-option
              v-for="u in usersObj"
              :key="u.value"
              :label="u.label"
              :value="u.value"
              :disabled="u.disabled"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input
            clearable
            maxlength="100"
            style="width: 193px"
            v-model="v.department"
          ></el-input>
        </el-form-item>
      </el-form>
    </el-card>
    <el-button
      type="primary"
      style="margin-top: 1em; margin-right: 0.3em"
      size="mini"
      @click="handleSave"
      :disabled="!canSave"
    >
      保存
    </el-button>
    <el-button
      @click="append"
      type="primary"
      size="mini"
      style="margin-top: 1em"
      :disabled="!canAppend"
    >
      增加审核人
    </el-button>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
export default {
  data() {
    return {
      currentProcessName: '',
      // old
      process: null,
      requestBody: {
        name: '模型报告',
        proDefId: null,
        proDefName: null,
        assignee: null,
      },
      assignee: [
        {
          assignee: '',
          department: '',
        },
      ],
      isEdit: [true],
      users: [],
      usersObj: [],
      loading: true,
    }
  },
  props: {
    processData: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.currentProcessName = this.processData.name
    this.getWorkflowProcess()
    this.getUsers()
  },
  methods: {
    getUsers() {
      HTTP.getAllUserList().then(res => {
        const data = res.data
        const arr = []
        for (const key in data) {
          arr.push(data[key])
        }
        this.users = arr.map(item => item.username).sort()
        this.users.forEach((item, index) => {
          this.usersObj.push({
            value: index,
            label: item,
            disabled: false,
          })
        })
      })
    },
    getWorkflowProcess() {
      HTTP.getWorkflowProcess()
        .then(res => {
          const data = res

          data.forEach(item => {
            if (item.name === this.currentProcessName) {
              this.process = item
              this.requestBody.name = this.currentProcessName
              this.requestBody.proDefName = item.name
              this.requestBody.proDefId = item.id
              this.getConfiguration()
            }
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getConfiguration() {
      const name = this.processData.name
      HTTP.getProcessBindConfig(name)
        .then(res => {
          //
          const data = res.data || {}
          if (data) {
            this.requestBody.assignee = data.assignee
            if (data.assignee && Array.isArray(data.assignee)) {
              this.assignee = data.assignee.map(item => JSON.parse(item))
            }
          } else {
          }
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setConfiguration() {
      const assignee = []
      this.assignee.forEach(item => {
        assignee.push(JSON.stringify(item))
      })
      this.requestBody.assignee = assignee
      //
      // return;
      HTTP.setProcessBindConfig(this.requestBody)
        .then(res => {
          this.$message.success('修改成功')
          this.$emit('removeTab')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    append() {
      this.assignee.push({
        assignee: '',
        department: '',
      })
      this.isEdit.push(true)
    },
    handleDelete(i) {
      this.assignee.splice(i, 1)
    },
    handleEdit(i) {
      this.$set(this.isEdit, i, true)
    },
    handleSave() {
      this.setConfiguration()
    },
    figureLabel(i) {
      switch (i) {
        case 0:
          return '一'
        case 1:
          return '二'
        case 2:
          return '三'
        case 3:
          return '四'
        case 4:
          return '五'
      }
    },
    selectChanged(value) {
      this.usersObj.forEach((goods, index) => {
        this.usersObj[index].disabled = false
      })
      this.$nextTick(() => {
        this.$refs.selection.forEach(item => {
          this.usersObj.forEach((obj, index) => {
            if (item.selectedLabel === obj.label) {
              this.usersObj[index].disabled = true
            }
          })
        })
      })
    },
  },
  computed: {
    canSave() {
      return this.assignee.every(item => !!item.assignee)
    },
    canAppend() {
      return this.assignee.length < 5
    },
  },
}
</script>

<style scoped lang="scss">
.edit-assignee {
  left: 0;
  padding-left: 20px;
  .top-title {
    font-size: 18px;
    min-height: 24px;
    padding: 10px 0;
  }
  .table-container {
    top: 60px;
    bottom: 50px;
  }
}
</style>
