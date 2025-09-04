<template>
  <div>
    <!--<div style="position:absolute;bottom:100px;color:#FFF;">{{detail}}</div>-->
    <div class="category-detail">
      <h2 class="oneline-eclipse">{{ detail.categoryName }}</h2>
      <h3 class="oneline-eclipse">{{ detail.categoryAbbreviation }}</h3>
      <p>{{ detail.description }}</p>
      <div>
        <div class="item">
          <span class="label">所属业务域:</span>
          <span class="detail">{{ detail.zone }}</span>
        </div>
        <div class="item">
          <span class="label">IT部门:</span>
          <span class="detail">{{ detail.itDepartment }}</span>
        </div>
        <div class="item">
          <span class="label">负责人:</span>
          <span class="detail">{{ detail.owner }}</span>
        </div>
        <div class="item">
          <span class="label">当前状态:</span>
          <span class="detail">{{ detail.status }}</span>
        </div>
        <div class="item">
          <span class="label">部署地:</span>
          <span class="detail">{{ detail.deployment }}</span>
        </div>
        <div class="item" v-if="detail.businessDepartment">
          <span class="label">业务部门:</span>
          <span class="detail">{{ detail.businessDepartment }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {},
  props: ['detail'],
  methods: {},
}
</script>
<style scoped lang="scss">
@import './detail.scss';
</style>
