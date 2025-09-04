<template>
  <div class="ball-container">
    <div v-for="(ball, index) in balls" :key="index">
      <transition
        name="drop"
        @before-enter="beforeDrop"
        @enter="dropping"
        @after-enter="afterDrop"
      >
        <div class="ball" v-show="ball.show">
          <div class="inner inner-hook"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      balls: [
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
      ],
      dropBalls: [],
      targetPosition: {
        top: '',
        right: '',
      },
    }
  },
  props: {
    target: {
      type: Object,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    drop(el) {
      // 触发一次事件就会将所有小球进行遍历
      for (let i = 0; i < this.balls.length; i++) {
        const ball = this.balls[i]
        if (!ball.show) {
          // 将false的小球放到dropBalls
          ball.show = true
          ball.el = el // 设置小球的el属性为一个dom对象
          this.dropBalls.push(ball)
          return
        }
      }
    },

    beforeDrop(el) {
      // 这个方法的执行是因为这是一个vue的监听事件
      let count = this.balls.length
      while (count--) {
        const ball = this.balls[count]
        if (ball.show) {
          const rect = ball.el.getBoundingClientRect() // 获取小球的相对于视口的位移(小球高度)
          // 设置起点位置
          let x = ''
          let y = ''
          if (this.targetPosition.right) {
            // x = (to) 40px - (from) 80px
            x = this.targetPosition.right - (window.innerWidth - rect.right)
            y = rect.top - this.targetPosition.top
          } else {
            x = 180 - (window.innerWidth - rect.right)
            y = rect.top - 20
          }
          el.style.display = '' // 清空display
          el.style.webkitTransform = `translate3d(0,${y}px,0)`
          el.style.transform = `translate3d(0,${y}px,0)`
          // 处理内层动画
          const inner = el.getElementsByClassName('inner-hook')[0] // 使用inner-hook类来单纯被js操作
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`
          inner.style.transform = `translate3d(${x}px,0,0)`
        }
      }
    },

    dropping(el, done) {
      // 这个方法的执行是因为这是一个vue的监听事件
      /* eslint-disable no-unused-vars */
      const rf = el.offsetHeight // 触发重绘html
      this.$nextTick(() => {
        // 让动画效果异步执行,提高性能
        el.style.webkitTransform = 'translate3d(0,0,0)'
        el.style.transform = 'translate3d(0,0,0)'
        // 处理内层动画
        const inner = el.getElementsByClassName('inner-hook')[0] // 使用inner-hook类来单纯被js操作
        inner.style.webkitTransform = 'translate3d(0,0,0)'
        inner.style.transform = 'translate3d(0,0,0)'
        el.addEventListener('transitionend', done) // Vue为了知道过渡的完成，必须设置相应的事件监听器。
      })
    },

    afterDrop(el) {
      // 这个方法的执行是因为这是一个vue的监听事件
      const ball = this.dropBalls.shift() // 完成一次动画就删除一个dropBalls的小球
      if (ball) {
        ball.show = false
        el.style.display = 'none' // 隐藏小球
      }
    },

    dataInit() {
      // TODO
      if (this.target && false) {
        const obj = this.target[0]
        const rect =
          obj && obj.getBoundingClientRect ? obj.getBoundingClientRect() : ''
        if (rect) {
          const right = window.innerWidth - rect.right
          const top = rect.top
          this.targetPosition = {
            right: right,
            top: top,
          }
          $('.ball').css(this.targetPosition)
        }
      }
    },
  },
  watch: {},
}
</script>

<style lang="sass">
.ball-container
  .ball
    position: fixed
    //小球动画必须脱离html布局流
    top: 20px;
    right: 180px;
    z-index: 200
    transition: all 0.4s cubic-bezier(.14, .66, .76, 1.28)

    .inner
      width: 16px
      height: 16px
        border-radius: 50%
        background: rgb(0, 160, 220)
        transition: all 0.4s linear
</style>
