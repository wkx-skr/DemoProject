<template>
  <div class="datablau-heigh-light">
    <span v-html="formatAlias(content)"></span>
  </div>
</template>

<script>
export default {
  name: 'DatablauHighLight',
  props: {
    keyword: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    bg: {
      type: String,
      default: '#fdff9d',
    },
    color: {
      type: String,
      default: 'red',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    formatAlias(str) {
      if (!str) {
        return ''
      }
      if (this.keyword) {
        const strList = this.keyword.split(' ').filter(item => item)
        strList.map(item => {
          if (str.includes(item)) {
            str = str.replace(
              new RegExp(item, 'g'),
              `<em :style="{--color: ${this.color}}, --background-color: ${this.bg}">${item}</em>`
            )
          }
        })
        return str
      } else {
        return str
      }
    },
  },
}
</script>

<style lang="scss">
.datablau-heigh-light {
  display: inline-block;
  span {
    vertical-align: top;
    em {
      font-style: normal;
      color: red;
      background-color: #fdff9d;
    }
  }
}
</style>
