import Vue from 'vue'
export default Vue.extend({
  template: `
    <span>1<br>"{{value}}"</span>
    `,
  data() {
    return {
      value: null,
    }
  },
  mounted() {
    this.value = this.params.value
  },
})
