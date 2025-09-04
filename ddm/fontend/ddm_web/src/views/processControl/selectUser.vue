<template>
  <div>
    <el-select
      v-model="selectedUserId"
      style="width: 450px"
      placeholder="请选择用户"
      filterable
    >
      <el-option
        v-for="role in allUsers"
        :key="role.userId"
        :label="
          role.username +
          ' ( ' +
          (role.firstName ? role.firstName : '') +
          (role.lastName ? role.lastName.toString() : '') +
          ' )'
        "
        :value="role.userId"
      ></el-option>
    </el-select>
    <el-button type="primary" size="small" style="float: right" @click="submit">
      确定
    </el-button>
    <!--<el-button class="white-btn" size="small" style="float:right;clear:right;" @click="submit('cancel')">取消</el-button>-->
  </div>
</template>

<script>
import HTTP from '@/resource/http.js'
export default {
  props: {
    selected: {
      default: '',
    },
  },
  mounted() {
    // this.selectedUserId = _.clone(this.selected);
    this.getAllUsers()
  },
  data() {
    return {
      selectedUserId: '',
      allUsers: [],
      userMap: {},
    }
  },
  methods: {
    submit() {
      //
      const user = this.userMap[this.selectedUserId] || {}
      this.$emit('choosedUser', user)
    },
    getAllUsers(callback) {
      HTTP.getAllUserList()
        .then(res => {
          const rawDataMap = res.data
          const userMap = {}
          this.allUsers = []
          for (const user in rawDataMap) {
            const item = rawDataMap[user]
            item.name = item.username
            this.allUsers.push(item)
            // userMap[item.name] = item;
          }
          this.userMap = rawDataMap
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style></style>
