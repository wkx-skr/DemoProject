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
    type: {},
    showDisabled: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
  },
  data () {
    return {

    }
  },
  computed: {
    typeLabel () {
      let result = ''
      let phases = this.$store.getters.phases
      let status = {}
      phases.forEach(v => {
        if (this.showDisabled || !v.modelPhaseForbidden) {
          status[v.modelPhaseCode] = v.modelPhaseName
        }
      })
      if (status[this.type]) {
        result = status[this.type]
      }
      return result
    },
    style () {
      // 转换内置状态id
      let ids = {
        'DEV': 0, // 3C64F0
        'SIT': 1, // 02798C
        'UAT': 2, // 66BF16
        'PROD': 3, // A05EE8
        'ARC': 4, // 3AD1BF
        'VER': 5 // DB44AB
      }
      return {
        containerStyle: {
          // backgroundColor: $const.Phase.BackgroudColor[ids[this.typeLabel]],
          color: $const.Phase.Color[ids[this.typeLabel]] || $const.Phase.$primaryColor
        },
        circleStyle: {
          backgroundColor: $const.Phase.Color[ids[this.typeLabel]] || $const.Phase.$primaryColor
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
