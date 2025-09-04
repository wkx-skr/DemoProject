<template>
  <div v-loading.lock="loading" id="workflow" class="content-area">
    <div class="top-header-info-panel-wrapper marginBottom30">
      <b>{{$v.process.processManagement}}</b>
      <i class="el-icon-refresh" @click="refresh"></i>
    </div>
    <div class="row" v-for="(item,idx) in assignee" :key="idx">
      <div class="box" :style="`width:${(item.parallelNode.length + 2) * 440}px`">
        <el-card class="box-card">
          <div slot="header">
            <span class="left-color" :style={background:figuColor(idx)}></span>
            <span>{{figureLabel(idx) + ' '+ $v.process.stage}} - 1</span>
            <el-button type="text" style="float:right;margin-top:-5px;" size="mini" icon="el-icon-delete" @click="handleDelete(idx,assignee)">{{$v.process.DeleteEntireRow}}</el-button>
            <!-- <el-button :disabled="item.parallelNode.length >= 4" type="text" style="float:right;margin-top:-5px;margin-right:5px" size="mini"  @click="append(idx)">{{$v.process.AddApprovalModule}}</el-button> -->
            <!--<el-button v-if="!isEdit[i]" type="text" style="float:right;margin-top:-5px;margin-right:2em;" size="mini" icon="el-icon-edit" @click="handleEdit(i)">编辑</el-button>-->
          </div>
          <el-form
            :model="item"
            label-position="right"
            label-width="8em"
            size="mini"
            ref="forms"
          >
            <el-form-item
              prop="assignees"
              :rules="{ type: 'array', required: true, message: $v.process.PleaseselectOneApprover, trigger: 'change' }"
              :label="$v.process.Approver">
              <el-select
                multiple
                v-model="item.assignees"
                filterable
                :filter-method="usersFilter"
                style="width:260px;"
              >
                <el-option
                  v-for="u in usersShow"
                  :key="u.userId"
                  :label="u.labelName"
                  :value="userValueFormatter(u)"
                ></el-option>
                <el-option disabled v-if="showSize < users.length" :value="-1" :key="-1" @click.native.stop="showMore">
                  <a style="display: block;text-align: center;color: #4386f5;cursor: pointer">{{$v.process.more}}</a>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$v.process.department">
              <el-input
                style="width:260px;"
                v-model="item.department"></el-input>
            </el-form-item>
            <el-form-item
              prop="title"
              :rules="{ type: 'string', required: true, message: $v.process.TitleCannotbeEmpty, trigger: 'change' }"
              :label="$v.process.title">
              <el-input
                maxlength="32"
                style="width:260px;"
                v-model="item.title"></el-input>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card
          class="box-card"
          v-loading.lock="loading"
          v-for="(v, i) in item.parallelNode"
          :key="i"
          >
          <div slot="header">
            <span class="left-color" :style={background:figuColor(idx)}></span>
            <span>{{figureLabel(idx) + ' ' + $v.process.stage}} - {{i + 2}}</span>
            <el-button type="text" style="float:right;margin-top:-5px;" size="mini" icon="el-icon-delete" @click="handleDelete(i,item.parallelNode)">{{$v.process.delete}}</el-button>
            <!--<el-button v-if="!isEdit[i]" type="text" style="float:right;margin-top:-5px;margin-right:2em;" size="mini" icon="el-icon-edit" @click="handleEdit(i)">编辑</el-button>-->
          </div>
          <el-form
            :model="v"
            label-position="right"
            label-width="8em"
            size="mini"
            ref="forms">
            <el-form-item
              prop="assignees"
              :rules="{ type: 'array', required: true, message: $v.process.PleaseselectOneApprover, trigger: 'change' }"
              :label="$v.process.Approver">
              <el-select
                multiple
                v-model="v.assignees"
                filterable
                :filter-method="usersFilter"
                style="width:260px;"
              >
                <el-option
                  v-for="u in usersShow"
                  :key="u.userId"
                  :label="u.labelName"
                  :value="userValueFormatter(u)"
                ></el-option>
                <el-option disabled v-if="showSize < users.length" :value="-1" :key="-1" @click.native.stop="showMore">
                  <a style="display: block;text-align: center;color: #4386f5;cursor: pointer;">{{$v.process.more}}</a>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$v.process.department">
              <el-input
                style="width:260px;"
                v-model="v.department"></el-input>
            </el-form-item>
            <el-form-item
              prop="title"
              :rules="{ type: 'string', required: true, message: $v.process.TitleCannotbeEmpty, trigger: 'change' }"
              :label="$v.process.title">
              <el-input
                maxlength="32"
                style="width:260px;"
                v-model="v.title"></el-input>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card class="box-card" v-if="item.parallelNode.length < 4">
          <div class="textItem">
            <p class="addModel-P">{{figureLabel(idx) + ' ' + $v.process.stage +'-'+ (item.parallelNode.length+2)}}</p>
            <el-button :disabled="item.parallelNode.length >= 4" type="primary" style="margin-left:110px;margin-top:10px;" size="small" icon="el-icon-circle-plus-outline" @click="append(idx)">
              {{$v.process.AddApprovalModule}}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
    <div class="saveButton">
       <el-button type="primary" style="margin-top:1em;margin-right:.3em;" size="mini" @click="handleSave">{{$v.process.preservation}}</el-button>
       <el-button :disabled="assignee.length > 4"  @click="addModel" type="primary" size="mini" style="margin-top:1em;" icon="el-icon-circle-plus-outline">{{$v.process.AddAuditModule}}</el-button>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
import sort from '@/resource/utils/sort'
import _ from 'lodash'
import PinyinMatch from 'pinyin-match'
export default {
  mounted () {
    this.getWorkflowProcess()
    // this.getConfiguration()
    this.getUsers()
  },
  beforeDestroy () {
    this.loading = true
  },
  data () {
    return {
      // test: [1, 2, 3],
      process: null,
      requestBody: {
        name: this.$v.process.modelReport, // '模型报告'
        proDefId: null,
        proDefName: null,
        assignee: null
      },
      assignee: [{
        assignees: [],
        department: '',
        parallelNode: [],
        title: ''
      }],
      isEdit: [true],
      users: [],
      loading: false,
      usersShow: [],
      showSize: 20,
      Index: 0
    }
  },
  inject: ['refresh'],
  methods: {
    showMore () {
      this.showSize += 20
      this.usersFilter()
    },
    usersFilter (query) {
      if (query !== '' && query) {
        this.usersShow = this.users.filter(user => PinyinMatch.match(user.labelName, query))
      } else {
        this.usersShow = this.users.slice(0, this.showSize)
      }
    },
    getUsers () {
      HTTP.getUsers({
        successCallback: data => {
          sort.sort(data, 'username')
          this.users = data
          this.users.forEach(user => {
            const fullName = _.toString(user.firstname) + _.toString(user.lastname)
            if (fullName) {
              user.labelName = user.username + ` (${fullName})`
            } else {
              user.labelName = user.username
            }
          })
          this.usersShow = this.users.slice(0, this.showSize)
        }
      })
    },
    getWorkflowProcess () {
      this.loading = true
      HTTP.getWorkflowProcess({
        successCallback: data => {
          data.forEach(item => {
            if (item.name.indexOf(this.$v.process.modelReport) > -1) {
              this.process = item
              this.requestBody.name = this.$v.process.modelReport
              this.requestBody.proDefName = item.name
              this.requestBody.proDefId = item.id
              this.getConfiguration()
            }
          })
        },
        failureCallback: err => {
          console.error(err)
        }
      })
    },
    getConfiguration () {
      HTTP.getWorkflowProcessConfiguration({
        successCallback: data => {
          if (data && data.assignee) {
            let assignee = data.assignee
            this.requestBody.assignee = assignee
            this.assignee = assignee
          }
          this.loading = false
        },
        failureCallback: err => {
          console.error(err)
        }
      })
    },
    setConfiguration () {
      this.requestBody.assignee = this.assignee
      HTTP.setWorkflowProcessConfiguration({
        requestBody: this.requestBody,
        successCallback: () => {
          this.$message.success(this.$v.process.ModifiedSuccessfully)
        }
      })
    },
    append (idx) {
      this.assignee[idx].parallelNode.push({
        assignees: [],
        department: '',
        parallelNode: [],
        title: ''
      })
      this.isEdit.push(true)
    },
    addModel () {
      this.assignee.push({
        assignees: [],
        department: '',
        parallelNode: [],
        title: ''
      })
    },
    handleDelete (i, arr) {
      arr.splice(i, 1)
    },
    handleEdit (i) {
      this.$set(this.isEdit, i, true)
    },
    handleSave () {
      if (this.checkForms()) {
        this.setConfiguration()
      }
    },
    figureLabel (i) {
      switch (i) {
        case 0: return 'First'
        case 1: return 'Second'
        case 2: return 'Third'
        case 3: return 'Fourth'
        case 4: return 'Fifth'
      }
    },
    figuColor (i) {
      switch (i) {
        case 0: return '#4386F5'
        case 1: return '#D282FF'
        case 2: return '#FFC282'
        case 3: return '#79D275'
        case 4: return '#FF9AC5'
      }
    },
    figureLevel (i) {
      let num = i + 2
      // this.Index = num
      return num
    },
    userLabelFormatter (user) {
      const fullName = _.toString(user.firstname) + _.toString(user.lastname)
      if (fullName) {
        return user.username + ` (${fullName})`
      } else {
        return user.username
      }
    },
    userValueFormatter (user) {
      const fullName = _.toString(user.firstname) + _.toString(user.lastname)
      return user.username
    },
    checkForms () {
      let flag = true
      this.$refs['forms'].forEach(v => {
        v.validate(valid => {
          // 有未通过验证的表单则 flag设置为false
          if (!valid) {
            flag = false
          }
        })
      })
      return flag
    }
  },
  computed: {
    // canSave () {
    //   return this.assignee[0].parallelNode.every(item => item.assignees.length > 0)
    // },
    // canAppend () {
    //   return this.assignee[0].parallelNode.length < 4
    // }
  }
}
</script>
<style lang="scss" scoped>
#workflow {
  .row {
     overflow-x: auto;
     float: left;
     border-bottom: 1px solid #DDDDDD;;
     padding-bottom:10px;
    //  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
     margin-bottom:10px;
    .box {
      float: left;
      margin-bottom:10px;
    }
  }
  .marginBottom30{
    margin-bottom:30px;
  }
  .saveButton{
    position:absolute;
    top:10px;
    right:40px;
  }
  .box-card{
    float: left;
  }
  .left-color{
    float:left;
    margin-left:-20px;
    width: 6px;
    height: 18px;
    background: #4386F5;
  }
}
</style>
<style lang="scss">
#workflow {
  .el-select-dropdown__item.is-disabled {
    cursor: pointer;
  }
  &.content-area {
    left:0;
    overflow: auto;
  }
   .el-card {
    margin-right:0px;
    width: 420px;
    margin-left:15px;
    margin-top: 1em;
    display: inline-block;
    height: 240px;
    overflow-y: auto;
  }
  .el-card__header {
    padding: 15px 20px;
    border-bottom:none;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #555555;
  }
  .el-card__body {
    padding: 10px 0 5px 10px;
    // height: 200px;
  }
  .el-select__tags-text {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
  }
  .el-select .el-tag__close.el-icon-close {
    right: -4px;
    top: -5px;
  }
  .el-select-dropdown__item.is-disabled {
    color: #C0C4CC;
    cursor: pointer !important;
  }
  .addModel-P{
    margin-top:80px;
    margin-left:108px;
    height: 20px;
    font-size: 16px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 500;
    color: #555555;
    line-height: 20px;
    font-size: 16px;
  }

}
</style>
