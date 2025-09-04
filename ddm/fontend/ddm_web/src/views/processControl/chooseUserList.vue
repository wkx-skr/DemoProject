<template>
  <div class="process-user-list">
    <el-form
      ref="userList"
      label-position="right"
      label-width="10px"
      size="small"
    >
      <el-form-item v-for="(item, index) in userArr" :key="index">
        <!-- <el-select
          :placeholder="`请选择`"
          v-model="userArr[index]"
          filterable
        >
          <el-option
            v-for="value in item.enumSelect"
            :key="value"
            :value="value"
            :label="value"
            ></el-option>
          </el-select> -->
        <el-select
          v-model="userArr[index]"
          style="width: 450px"
          placeholder="请选择用户"
          filterable
        >
          <el-option
            v-for="role in userOptions"
            :key="role.id"
            :label="role.label"
            :value="role.name"
            :disabled="choosedMap[role.name]"
          ></el-option>
        </el-select>
        <span class="control-icon">
          <el-button
            size="mini"
            type="text"
            icon="fa fa-plus-square-o"
            @click="addUserList(index)"
            v-if="userArr.length < 5"
          ></el-button>
          <el-button
            size="mini"
            type="text"
            icon="fa fa-minus-square-o"
            @click="removeUserList(index)"
            v-if="userArr.length > 1"
          ></el-button>
        </span>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="saveChoosedUser"
          class=""
          :disabled="disabledSave"
        >
          确 定
        </el-button>
        <el-button @click="cancelSave">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
export default {
  data () {
    return {
      userArr: [],
      userOptions: []
      // resultUserArr: [],
      // choosedMap: {},
    }
  },
  props: {
    choosedUser: {
      default () {
        return []
      }
    }
  },
  components: {},
  computed: {
    choosedMap () {
      const map = {}
      this.userArr.forEach(item => {
        map[item] = true
      })

      return map
    },
    disabledSave () {
      let bool = true
      this.userArr.forEach(item => {
        if (item) {
          bool = false
        }
      })
      return bool
    }
  },
  mounted () {
    let userArr = _.cloneDeep(this.choosedUser)
    if (!userArr || !Array.isArray(userArr)) {
      userArr = []
    }
    if (userArr.length < 5) {
      userArr.push('')
    }
    this.userArr = userArr

    const userOptions = []
    // userOptions.push({
    //   id: '${ownerUser}',
    //   name: '${ownerUser}',
    //   label: '数据所有者'
    // })
    HTTP.getAllUser()
      .then(res => {
        //
        const data = res.data
        for (const key in data) {
          if (data[key]) {
            const obj = {
              name: data[key].username,
              id: data[key].userId,
              label: data[key].username
            }
            userOptions.push(obj)
          }
        }

        this.userOptions = userOptions
      })
      .catch(e => {
        this.$showFailure(e)
      })
  },
  methods: {
    addUserList (index) {
      this.userArr.splice(index + 1, 0, '')
    },
    removeUserList (index) {
      this.userArr.splice(index, 1)
    },
    saveChoosedUser () {
      const resultUserArr = []
      this.userArr.forEach(item => {
        if (item) {
          resultUserArr.push(item)
        }
      })
      this.$emit('saveChoosedUser', resultUserArr)
      this.userArr = []
    },
    cancelSave () {
      this.$emit('cancelSave')
    }
  },
  watch: {}
}
</script>

<style lang="scss">
.process-user-list {
  .control-icon {
    // padding-top: 3px;
    display: inline-block;
    vertical-align: middle;

    i {
      font-size: 20px;
      margin-left: 10px;
      color: #606266;
      line-height: 33px;
      cursor: pointer;
    }
  }
}
</style>
