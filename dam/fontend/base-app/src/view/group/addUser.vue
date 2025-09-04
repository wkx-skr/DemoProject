<template>
  <div style="height: 80px">
    <el-select
      v-model="selectedUserIds"
      multiple
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
      关闭
    </el-button>
    <!--<el-button class="white-btn" size="small" style="float:right;clear:right;" @click="submit('cancel')">取消</el-button>-->
  </div>
</template>

<script>
export default {
  props: ['selected', 'allUsers'],
  mounted() {
    this.selectedUserIds = _.clone(this.selected)
  },
  data() {
    return {
      selectedUserIds: [],
    }
  },
  methods: {
    submit() {
      if (arguments[0] !== 'cancel') {
        this.$bus.$emit('addUserToGroup', this.selectedUserIds)
      } else {
        this.$bus.$emit('closeAddUserToGroup')
      }
    },
  },
}
</script>

<style></style>
