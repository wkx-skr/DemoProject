<template>
  <div id="relation-domain-list">
    <el-tag
      @click="go2Domain(item)"
      style="
        margin-right: 10px;
        margin-top: 3px;
        margin-bottom: 2px;
        cursor: pointer;
        background-color: #e6f1ec;
        color: #57a07f;
      "
      v-for="(item, idx) in relationDomainList"
      :key="item.domainId"
      :closable="editMode"
      @close="handleClose(item, idx)"
      disable-transitions
    >
      <datablau-tooltip
        :content="item.state === 'X' ? '已废弃' : ''"
        placement="bottom-start"
        :disabled="!(item.state === 'X')"
      >
        <span
          :class="{
            XStyle: item.state === 'X',
          }"
        >
          {{ item.chineseName }}
        </span>
      </datablau-tooltip>
    </el-tag>
    <slot name="add"></slot>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  props: {
    domainCodes: {
      type: Array,
      default() {
        return []
      },
    },
    categoryTypeId: {
      type: Number,
      default: 1,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    relationDomainState: {
      type: Object,
    },
  },
  data() {
    return {
      relationDomainList: [],
      isAssets: '',
    }
  },
  mounted() {
    if (this.$route.query.isAssets) {
      this.isAssets = this.$route.query.isAssets
    }
    console.log(this.relationDomainState)
  },
  methods: {
    dataInit() {
      HTTP.getDomainDetailByCode(this.domainCodes)
        .then(res => {
          const data = res.data
          if (data && Array.isArray(data)) {
            this.relationDomainList = data
            console.log(this.relationDomainList, 'this.relationDomainList')
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    go2Domain(obj) {
      this.$skip2Domain(obj.domainId, this.isAssets)
      // let url = location.pathname
      // if (this.categoryTypeId === 5) {
      //   window.open(`${url}#/main/indexDefinition?id=${obj.domainId}`)
      // } else if (obj.categoryId === 1) {
      //   window.open(
      //     `${url}#${
      //       this.$damEnabled ? '/main/dataStandard' : '/ddm/main/dataStandard'
      //     }?domain=${obj.domainId}`
      //   )
      // } else if (obj.categoryId === 2) {
      //   window.open(`${url}#/main/index?domain=${obj.domainId}`)
      // }
    },
    handleClose(item, idx) {
      this.domainCodes.splice(idx, 1)
    },
  },
  watch: {
    domainCodes: {
      deep: true,
      immediate: true,
      handler: function () {
        this.$nextTick(this.dataInit)
        this.$emit('clear-form-validator')
      },
    },
  },
}
</script>

<style lang="scss" scoped>
#relation-domain-list {
  position: relative;
  top: -3px;
  .table-container {
    max-height: 500px;
    margin-top: 10px;
  }
  .noresult {
    height: 56px;
    .noresult-img {
      img {
        width: auto;
        height: 56px;
      }
    }
  }
}
.XStyle {
  text-decoration: line-through;
}
</style>
