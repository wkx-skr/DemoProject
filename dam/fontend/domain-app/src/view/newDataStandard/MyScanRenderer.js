import vue from 'vue'
export default vue.extend({
  template: `
<div>
    <datablau-subscribe
        type-id="80010066"
        :object-name="this.params.data.path.join('/') + '/' + this.params.data.chineseName"
        :object-id="this.params.data.domainId"
        display-type="icon"
      ></datablau-subscribe>
</div>

  `,
  mounted() {},
  methods: {
    /* scan(){
      let domainId = this.params.data.domainId;
      this.$bus.$emit('goToDomain',domainId);
    } */
  },
})
