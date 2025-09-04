<template>
  <div style="position: relative">
    <canvas id="standard-canvas" style="" width="600" height="120"></canvas>
    <div style="" id="status-label">
      <div
        class="ball"
        :class="{ current: state === 'D' }"
        style="left: 12px"
      ></div>
      <div
        class="ball"
        :class="{ current: state === 'X' }"
        style="left: 312px"
      ></div>
      <div
        class="ball"
        :class="{ current: state === 'C' }"
        style="left: 112px"
      ></div>
      <div
        class="ball"
        :class="{ current: state === 'A' }"
        style="left: 212px"
      ></div>
      <!--<div class="ball" :class="{current:state==='V'}" style="left:312px;"></div>-->

      <span class="label" style="left: 3px">开发中</span>
      <span class="label" style="left: 310px">废弃</span>
      <span class="label" style="left: 103px">待审核</span>
      <span class="label" style="left: 203px">已发布</span>
      <!--<span class="label" style="left:303px;">已确认</span>-->

      <!--<el-button type="text" size="mini" v-if="hasAccess && (state==='X' || state==='D')" style="position:absolute;left:105px;top:50px;" @click="changeState" v-html="changeLabel"></el-button>-->
      <!--<el-button
        type="text"
        size="mini"
        v-if="hasAccess && (state==='A' || state==='V')"
        style="position:absolute;left:235px;top:35px;"
        @click="changeState"
        v-html="changeLabel"></el-button>
      <el-button
        type="text"
        size="mini"
        v-if="hasAccess && state==='A'"
        style="position:absolute;top:70px;left:85px;"
        @click="updateDomain"
      ><i class="fa fa-arrow-left"></i>更新</el-button>-->
    </div>
  </div>
</template>
<script>
export default {
  props: ['details'],
  data() {
    return {
      ctx: null,
      state: this.details.state,
      domainId: this.details.domainId,
      hasAccess: this.$auth.ROLE_DOMAIN_ADMIN,
    }
  },
  mounted() {
    this.draw()
  },
  computed: {
    changeLabel() {
      switch (this.state) {
        //          case 'A':
        //            return '确认<i class="fa fa-arrow-right"></i>';
        //          case 'V':
        //            return '取消确认';
        //          case 'D':
        default:
          return '标记为废弃<span class="fa fa-arrow-right"></span>'
        //          case 'X':
        //            return '切换为开发中';
      }
    },
  },
  methods: {
    updateDomain() {
      this.$emit('updateDomain')
    },
    changeState() {
      this.$confirm(
        '确定要将当前数据标准标记为废弃吗？如果当前标准正在被更新，则处于待审核或开发中的拷贝将被删除。',
        '废弃数据标准',
        {
          type: 'warning',
        }
      )
        .then(() => {
          const targetState = 'X'
          const url = `/service/domains/${this.domainId}/states/${targetState}`
          this.$http
            .put(this.$url + url)
            .then(res => {
              this.state = targetState
              this.$bus.$emit('reloadStandard')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info('已取消执行废弃操作')
        })
    },
    draw() {
      const canvasObj = document.getElementById('standard-canvas')
      this.ctx = canvasObj.getContext('2d')
      this.ctx.strokeStyle = 'transparent'
      this.drawCircle()
    },
    drawCircle() {
      const drawArrow = (x, y, direction = 'right', dashed = false) => {
        const ctx = this.ctx
        if (dashed) {
          ctx.setLineDash([3, 2])
        } else {
          ctx.setLineDash([1, 0])
        }
        ctx.beginPath()
        const [x0, y0] = [8, 5]
        switch (direction) {
          case 'right':
            ctx.moveTo(x, y)
            ctx.lineTo(x - x0, y + y0)
            ctx.moveTo(x, y)
            ctx.lineTo(x - x0, y - y0)
            break
          case 'top':
            ctx.moveTo(x, y)
            ctx.lineTo(x + 5, y + 8)
            ctx.moveTo(x, y)
            ctx.lineTo(x - 5, y + 8)
            break
        }

        ctx.stroke()
      }
      const LINE_WIDTH = 3
      const ctx = this.ctx

      ctx.fillStyle = '#dFdFdF'
      ctx.strokeStyle = '#dFdFdF'
      ctx.lineWidth = LINE_WIDTH
      ctx.rect(20, 30, 300, LINE_WIDTH)
      ctx.arc(20, 33, 12, 0, 2 * Math.PI)
      ctx.fill()
      drawArrow(108, 32)
      drawArrow(208, 32)
      drawArrow(308, 32)
      ctx.beginPath()
      ctx.arc(120, 33, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(220, 33, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(320, 33, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(220, 33)
      ctx.setLineDash([3, 2])
      ctx.lineTo(220, 73)
      ctx.lineTo(20, 73)
      ctx.lineTo(20, 33)
      ctx.stroke()
      drawArrow(20, 48, 'top', false)
    },
  },
}
</script>
<style lang="scss" scoped>
#status-label {
  position: absolute;
  left: 0;
  top: 0;
  .label {
    position: absolute;
    width: 3em;
    top: -4px;
    color: #898989;
  }
  .ball {
    &.current {
      background: #737b9a;
    }
    top: 25px;
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 8px;
  }
}
</style>
