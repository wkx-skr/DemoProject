import vue from 'vue'
export default vue.extend({
  template: `
    <div>
      <b style="cursor:pointer;color:#811717;" v-if="params.data.type === 'Index'" type="text" size="mini" @click="jumpToDdc">{{params.valueFormatted}}</b>
      <span v-else>{{params.valueFormatter}}</span>
  </div>`,
  mounted() {},
  methods: {
    jumpToDdc() {
      const objectId = this.params.value
      window.open(
        `${location.origin}${location.pathname}#/indexForDdc?code=${objectId}`
      )
    },
  },
})
