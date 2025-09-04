<template>
  <div class="page-title-row">
    <span class="menu font-medium" style="font-size: 16px">
      {{ name }}
      <slot></slot>
      <!--        {{parentName}}{{name}}-->
    </span>
    <div class="refresh" v-if="refreshCallback" @click="refreshCallback">
      <i class="el-icon-refresh"></i>
    </div>
    <!--    <span class="gun">|</span>-->
    <!--    <span class="item">{{name}}</span>-->
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    parentName: {},
    name: {},
    refreshCallback: {
      type: Function,
      required: false,
    },
  },
}
</script>

<style scoped lang="scss">
.page-title-row {
  //background-color:#FFF;
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  color: #555;
  .gun {
    position: relative;
    top: 3px;
  }
  .menu {
    display: inline-block;
    margin-left: 20px;
    vertical-align: middle;
    font-size: 18px;
  }
  .item {
    font-size: 14px;
    vertical-align: middle;
  }
}
.refresh {
  display: inline-block;
  height: 24px;
  width: 24px;
  border-radius: 4px;
  text-align: center;
  vertical-align: middle;
  line-height: 24px;
  font-size: 16px;
  font-weight: bold;
  margin-left: 6px;
  color: #afb4bf;
  transition: background 0.3s, color 0.3s;
  &:hover {
    cursor: pointer;
    color: initial;
    background: #f0f0f0;
  }
}
</style>
