<template>
  <div class="container" ref="div" v-html="form.result">HTML5</div>
</template>

<script>
export default {
  props: {
    dataId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      form: {
        name: '',
        html: '',
        css: '',
        js: ''
      }
    }
  },
  mounted () {
    this.getDetail()
  },
  methods: {
    getDetail () {
      this.$http
        .get(this.$url + `/service/dashboard/widgets?id=${this.dataId}`)
        .then(res => {
          this.form = JSON.parse(res.data.content)
          this.form.result = this.form.html + `<style>${this.form.css}</style>`
          this.$nextTick(() => {
            // eslint-disable-next-line no-useless-escape
            $(this.$refs.div).append(`<script>${this.form.js}<\/script>`)
          })
        })
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #fff;
}
</style>
