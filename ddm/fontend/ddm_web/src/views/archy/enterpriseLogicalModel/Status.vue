<template>
  <div class="tag status-tag" v-if="typeLabel" :style="style.containerStyle" :title="typeLabel">
    <span class="front-circle" :style="style.circleStyle"></span><span class="status-content">{{ typeLabel }}</span>
  </div>
</template>

<script>
import $const from '@/resource/const'

export default {
  props: {
    textAlign: {},
    type: {}
  },
  mounted () {
  },
  data () {
    return {
      statusMap: {
        A: {
          color: '#5CB793',
          bgc: '#EFF8E7',
          label: '已发布'
        },
        D: {
          color: '#F79B3F',
          bgc: '#FFF1E8',
          label: '待审核'
        },
        C: {
          color: '#4386F5',
          bgc: '#EBF5FF',
          label: '审核中'
        },
        X: {
          color: '#AFB4BF',
          bgc: '#F6F7F8',
          label: '已废弃'
        }
      }

    }
  },
  computed: {
    typeLabel () {
      let result = this.statusMap[this.type].label
      return result
    },
    style () {
      return {
        containerStyle: {
          color: this.statusMap[this.type].color
        },
        circleStyle: {
          backgroundColor: this.statusMap[this.type].color
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.status-tag {
  display: inline-block;
  vertical-align: middle;
  width: 50px;
  height: 24px;
  //background-color: #eef8f4;
  //color: #5db793;
  text-align: left;
  border-radius: 10px;
  line-height: 24px;
  margin: 0 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .front-circle {
    display: inline-block;
    vertical-align: top;
    margin-right: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    //border: 1px solid red;
    margin-top: 9px;
  }
}
</style>
