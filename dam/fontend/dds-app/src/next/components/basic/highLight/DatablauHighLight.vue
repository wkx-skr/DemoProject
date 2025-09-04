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
        const rightX = '奣'
        const leftX = '忈'
        let strList = this.keyword.split(' ').filter(item => item)
        strList = [...new Set(strList)]
        strList.map(item => {
          if (str.includes(item)) {
            // str = str.replace(new RegExp(item, 'g'), `<em>${item}</em>`)
            str = str.replace(new RegExp(item, 'g'), `${rightX}${item}${leftX}`)
          }
        })
        str = str.replace(new RegExp(rightX, 'g'), `<em>`)
        str = str.replace(new RegExp(leftX, 'g'), `</em>`)
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
