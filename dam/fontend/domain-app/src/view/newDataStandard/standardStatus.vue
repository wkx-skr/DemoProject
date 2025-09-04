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

      <span class="label" style="left: 3px">
        {{ $version.domain.status.developing }}
      </span>
      <span class="label" style="left: 310px">
        {{ $version.domain.status.deprecated }}
      </span>
      <span class="label" style="left: 103px">
        {{ $version.domain.status.toBeAudited }}
      </span>
      <span class="label" style="left: 203px">
        {{ $version.domain.status.adopted }}
      </span>

      <el-button
        type="text"
        size="mini"
        v-if="hasAccess && (state === 'A' || state === 'V')"
        style="position: absolute; left: 235px; top: 35px"
        @click="changeState"
        v-html="changeLabel"
      ></el-button>
      <el-button
        type="text"
        size="mini"
        v-if="hasAccess && state === 'A'"
        style="position: absolute; top: 70px; left: 85px"
        @click="updateDomain"
      >
        <i class="fa fa-arrow-left"></i>
        {{ $version.domain.status.update }}
      </el-button>
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
        //            return '<i class="fa fa-arrow-right"></i>';
        //          case 'V':
        //            return '';
        //          case 'D':
        default:
          return (
            this.$version.domain.status.abandon +
            '<span class="fa fa-arrow-right"></span>'
          )
        //          case 'X':
        //            return '';
      }
    },
  },
  methods: {
    updateDomain() {
      this.$emit('updateDomain')
    },
    changeState() {
      this.$DatablauCofirm(this.$version.domain.status.abandonMessage, {
        type: 'warning',
      })
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
          this.$message.info(this.$version.common.operationCancelled)
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
