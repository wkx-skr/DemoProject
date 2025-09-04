import Vue from 'vue'
import DatabaseType from '@/components/common/DatabaseType.vue'
export default Vue.extend({
  template: `
        <div>
          <div v-if="params.options" :style="params.options.index === params.options.This.currentI? 'border: 1px solid #409EFF': ''">
            <database-type style="display: inline-block" :value="params.options.headerName"></database-type>
            <datablau-button @click="deleteColumn(params.options.index)" v-if="params.options.index" style="display: inline-block;margin-left: 5px;" type="icon" class="iconfont icon-delete"></datablau-button>
          </div>
          <div v-else>
            操作
          </div>
        </div>
    `,
  data: function () {
    return {

    }
  },
  components: {
    DatabaseType
  },
  beforeMount () {

  },
  beforeDestroy () {

  },
  mounted () {
  },
  methods: {
    deleteColumn (index) {
      this.params.options.This.deleteColumn(index)
    }
  }
})
