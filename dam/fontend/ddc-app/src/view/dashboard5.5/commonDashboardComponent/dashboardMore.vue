<template>
  <el-dropdown
    trigger="click"
    placement="bottom-start"
    @command="handleCommand"
    @click.native.stop.prevent
  >
    <span class="el-dropdown-link">
      <i v-if="$isAdmin" class="el-icon-more more" @click="edit"></i>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="left" v-if="canLeft">
        <i class="el-icon-arrow-left"></i>
        左移
      </el-dropdown-item>
      <el-dropdown-item command="right" v-if="canRight">
        <i class="el-icon-arrow-right"></i>
        右移
      </el-dropdown-item>
      <el-dropdown-item command="top" v-if="canTop">
        <i class="el-icon-arrow-up"></i>
        上移
      </el-dropdown-item>
      <el-dropdown-item command="bottom" v-if="canBottom">
        <i class="el-icon-arrow-down"></i>
        下移
      </el-dropdown-item>
      <el-dropdown-item command="remove">
        <i class="el-icon-delete"></i>
        删除模块
      </el-dropdown-item>
      <el-dropdown-item command="add">
        <i class="el-icon-plus"></i>
        新增模块
      </el-dropdown-item>
      <el-dropdown-item command="reset">
        <i class="el-icon-c-scale-to-original"></i>
        重置所有
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'dashboardMore',
  props: {
    from: {
      type: String,
    },
  },
  data() {
    return {
      canLeft: false,
      canRight: false,
      canTop: false,
      canBottom: false,
    }
  },
  methods: {
    edit() {
      this.$bus.$once(
        'edit-dashboard-layout-response',
        ({ canLeft, canRight, canTop, canBottom }) => {
          this.canLeft = canLeft
          this.canRight = canRight
          this.canTop = canTop
          this.canBottom = canBottom
        }
      )
      this.$bus.$emit('edit-dashboard-layout', this.from)
    },
    handleCommand(command) {
      this.$bus.$emit('process-dashboard-layout', {
        component: this.from,
        command: command,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.more {
  cursor: pointer;
  display: inline-block;
  visibility: hidden;
  height: 24px;
  line-height: 24px;
  margin-left: 5px;
  width: 24px;
  text-align: center;
  &:hover {
    outline: 1px dotted #494850;
    border-radius: 3px;
  }
}
.card:hover,
.box:hover,
.catalog-count-com:hover {
  .more {
    visibility: visible;
  }
}
</style>
