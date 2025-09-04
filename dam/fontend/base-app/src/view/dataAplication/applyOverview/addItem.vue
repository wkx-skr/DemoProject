<template>
  <div class="add-item">
    <!--<staff-select  v-if="$store.state.showStaffSelect"></staff-select>-->
    <datablau-form
      class="st-page-form"
      label-position="right"
      label-width="90px"
      ref="searchForm"
      :model="addData"
      :rules="rules"
    >
      <el-form-item label="应用名称" prop="applicationName">
        <datablau-input
          v-model="addData.applicationName"
          width="400px"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        class="message-info"
        label="应用简称"
        prop="applicationAbbr"
      >
        <datablau-input
          v-model="addData.applicationAbbr"
          width="400px"
        ></datablau-input>
      </el-form-item>
      <el-form-item class="message-info" label="应用描述" prop="description">
        <datablau-input
          v-model="addData.description"
          width="400px"
        ></datablau-input>
      </el-form-item>
      <el-form-item class="message-info" label="所有者" v-if="editData.id">
        <datablau-input
          v-model="addData.applicationOwner"
          @focus="openStaff"
        ></datablau-input>
        <!-- <el-select class="select-style" filterable clearable v-model="addData.applicationOwner">
          <el-option v-for="item in ownerOption" :key="item" :value="item" :label="item">
          </el-option>
        </el-select> -->
      </el-form-item>
      <el-form-item label="应用状态">
        <el-switch
          v-model="addData.status"
          :active-value="actVal"
          :inactive-value="inactiveVal"
        ></el-switch>
      </el-form-item>
    </datablau-form>

    <div class="dialog-bottom">
      <datablau-button type="secondary" @click="cancelItem">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="important"
        :disabled="btnDisable"
        @click="confirmItem"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </div>
</template>
<script>
import HTTP from '../ddsHTTP.js'
import staffSelect from '@/components/common/staffSelect/staffSelect'
export default {
  props: ['editData'],
  components: { staffSelect },
  mounted() {
    this.initData()
  },
  computed: {
    btnDisable() {
      let bool = true
      if (this.addData.applicationName && this.addData.applicationAbbr) {
        bool = false
      }
      return bool
    },
  },
  data() {
    return {
      ownerOption: [],
      inactiveVal: 0,
      actVal: 1,
      addData: {
        applicationName: '',
        applicationAbbr: '',
        applicationOwner: '',
        description: '',
        status: 0,
        appId: null,
      },
      rules: {
        applicationName: [
          { required: true, message: '请输入应用名称', trigger: 'blur' },
          { max: 100, message: '长度不超过100个字符', trigger: 'blur' },
        ],
        applicationAbbr: [
          { required: true, message: '请输入应用简称', trigger: 'blur' },
          { max: 50, message: '长度不超过50个字符', trigger: 'blur' },
        ],
        description: [
          { max: 200, message: '长度不超过200个字符', trigger: 'blur' },
        ],
      },
      statusOpt: [
        {
          label: '启用',
          value: '1',
        },
        {
          label: '禁用',
          value: '0',
        },
      ],
    }
  },
  methods: {
    openStaff() {
      // this
      this.$utils.staffSelect
        .open([], true)
        .then(data => {
          if (data && Array.isArray(data) && data.length === 1) {
            this.addData.applicationOwner = data[0].username
          }
        })
        .catch(e => {
          console.log(e)
        })
      // this.$store.commit('changeShowStaffSelect', true)
      // this.$store.commit('changeStaffIsOne', true)
    },
    getOwnerOption() {
      HTTP.getAppUsers()
        .then(res => {
          this.ownerOption = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initData() {
      if (this.editData.id) {
        this.getOwnerOption()
        if (!this.editData.appId) {
          // 管理应用
          this.addData.appId = this.editData.id
          this.addData.status = this.editData.status
          this.addData.applicationOwner = this.editData.applicationOwner
        } else {
          // 我的应用
          this.addData.appId = this.editData.appId
          this.addData.status = this.editData.appStatus
          this.addData.applicationOwner = this.editData.authCreator
        }
        this.addData.description = this.editData.description
        this.addData.applicationName = this.editData.applicationName
        this.addData.applicationAbbr = this.editData.applicationAbbr || ''
        // console.log(this.editData, this.addData, 'gjm123')
      }
    },
    confirmItem() {
      this.$refs.searchForm.validate(valid => {
        if (valid) {
          let newPromise
          const obj = {}
          const objkey = Object.keys(this.addData)
          objkey.forEach(item => {
            const val = this.addData[item]
            if (typeof val === 'string') {
              obj[item] = val.trim()
            } else {
              obj[item] = val
            }
          })
          if (this.addData.appId) {
            newPromise = HTTP.editApply(this.addData.appId, obj)
          } else {
            newPromise = HTTP.addApply(obj)
          }
          newPromise
            .then(() => {
              this.$emit('editSuccess')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          return true
        }
      })
    },
    cancelItem() {
      this.$emit('cancelItem')
    },
  },
  watch: {
    // '$store.state.staffData':{
    //   deep:true,
    //   handler(newval){
    //     this.addData.applicationOwner=newval[0].fullUserName
    // }
    // }
  },
}
</script>
<style lang="scss" scoped>
.add-item {
  // position: relative;
  // height: 400px;
  /* width: 100%; */
  border-top: 1px solid rgba(0, 0, 0, 0);
  background-color: white;
  .st-page-form {
    .el-form-item {
      margin-top: 14px;
      margin-bottom: 0;
    }
  }
  .datablau-input {
    width: 400px;
  }

  .message-info {
    margin-top: 22px;
  }

  .bottom-info {
    float: right;
    margin-top: 80px;
  }
}

.select-style {
  width: 20%;
  /* margin-left:6px; */
}
</style>
