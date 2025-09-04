<template>
  <div>
    <div class="com-title">最新动态</div>
    <div class="demo-icons">
      <i class="fa fa-sort-amount-desc"></i>
      <i class="el-icon-more"></i>
    </div>
    <div class="table-area">
      <div class="item" v-for="i in 6" :key="i">
        <span class="circle"></span>
        <span class="name">Admin评论了<span class="blue">财务保单模型</span></span>
        <span class="date">2019-12-20 13:43</span>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .com-title {
    color:grey;
    font-size:14px;
    display:inline-block;
  }
  .table-area {
    background:#FFF;
    border-radius:10px;
    position:absolute;top:36px;bottom:0;left:0;right:0;
    overflow:auto;
  }
  .item {
    height:40px;
    line-height: 40px;
    .circle {
      display: inline-block;
      width:24px;height:24px;
      border-radius: 12px;
      background: #f0f0f0;
      vertical-align: middle;
      position:relative;top:-2px;
      margin-left:8px;
      margin-right:5px;
    }
    .name {
      font-size:12px;
    }
    .date {
      color:grey;
      float:right;
      margin-right:20px;
    }
  }
</style>
