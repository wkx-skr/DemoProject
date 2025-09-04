<template>
  <div class="bg-white bg-image">
    <h2>{{ title }}</h2>
    <div :class="['data-panel', typeClass]">
      <p :class="showLevelClass">{{ value }}</p>
      <div class="name">
        {{ showName }}
        <span v-if="/^L/.test(name)" class="hint">{{ showLevel }}</span>
      </div>
      <a v-if="id !== -1" @click="showDetail(id)">
        查看详情
        <i class="icon el-icon-arrow-right"></i>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: null,
      name: null,
      id: null,
      value: null,
    }
  },
  props: {
    obj: {
      type: Object,
      required: true,
    },
  },
  computed: {
    typeClass() {
      return /^L/.test(this.name) ? this.name.slice(0, 2) : ''
    },
    showName() {
      return /^L/.test(this.name)
        ? this.name.replace(/^L[0-9]+-/g, '')
        : this.name
    },
    showLevel() {
      return '等级' + this.name.match(/^L[0-9]+/g)
    },
    showLevelClass() {
      return this.name.match(/^L[0-9]+/g)
    },
  },
  watch: {
    obj: {
      handler() {
        let { title, name, id, value } = this.obj
        this.title = title
        this.name = name
        this.id = id
        this.value = value
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    showDetail(id) {
      this.$router.push('/main/dataLevel?tagId=' + id)
    },
  },
}
</script>

<style lang="scss" scoped>
.bg-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background: #fff;
  border-radius: 2px;
  box-sizing: border-box;
  h2 {
    position: absolute;
    top: 17px;
    left: 16px;
    font-size: 14px;
    line-height: 1;
    color: #555;
    border-left: 4px solid #409eff;
    padding-left: 6px;
  }
}
.bg-image {
  background: url('../../assets/images/security-bg.png') no-repeat center #fff;
  background-size: 40% auto;
}
.data-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  p {
    font-size: 50px;
    color: #444;
  }
  &.L6,
  &.L5 {
    p {
      color: #ff8484;
    }
  }
  &.L3,
  &.L4 {
    p {
      color: #e9b265;
    }
    .name {
      .hint {
        background: #e9b265;
      }
    }
  }
  &.L2,
  &.L1 {
    p {
      color: #52cbf0;
    }
    .name {
      .hint {
        background: #52cbf0;
      }
    }
  }
  .name {
    margin-top: 12px;
    position: relative;
    display: inline-block;
    font-size: 20px;
    line-height: 1;
    color: #444;
    .hint {
      position: absolute;
      top: -24px;
      right: -60px;
      padding: 6px 8px;
      border-radius: 10px 10px 10px 0px;
      background: #ff8484;
      font-size: 12px;
      line-height: 1;
      color: #fff;
      white-space: nowrap;
    }
  }
  a {
    display: block;
    margin-top: 24px;
    color: #409eff;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    .icon {
      margin-left: -2px;
    }
  }
}
</style>
