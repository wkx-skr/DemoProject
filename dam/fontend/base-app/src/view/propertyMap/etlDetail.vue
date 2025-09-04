<template>
  <div>
    <div class="category-detail">
      <h2 class="oneline-eclipse">
        <!--<el-button type="text" style="float:right;" @click="goPreview"><i class="fa fa-plane"></i> 查看</el-button>-->
      </h2>
      <!--<h3 class="oneline-eclipse">{{basicDetail.physicalName}}</h3>-->
      <div v-for="(c, index) in content">
        <h3 class="oneline-eclipse">{{ index + 1 }}: {{ c.name }}</h3>
        <div class="item">
          <span class="label">文件名:</span>
          <span class="detail">{{ c.filename }}</span>
        </div>
        <div class="item">
          <span class="label">类型:</span>
          <span class="detail">{{ c.type }}</span>
        </div>
        <div class="item">
          <span class="label">创建时间:</span>
          <span class="detail">{{ $timeFormatter(c.timestamp) }}</span>
        </div>
        <div class="item">
          <span class="label">创建人:</span>
          <span class="detail">{{ c.creator }}</span>
        </div>
        <br />
        <br />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'etlDetail',
  props: ['detail'],
  data() {
    return {
      content: [],
    }
  },
  mounted() {
    const content = this.detail.content
    this.content = []
    this.content = this.content.concat(content)
  },
}
</script>

<style scoped lang="scss">
@import './detail.scss';
.label {
  width: 5em !important;
}
</style>
