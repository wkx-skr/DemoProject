<template>
  <el-button
    v-if="displayType === 'icon'"
    size="mini"
    @click.stop="subscribe"
    type="text"
    class="btn-in-table"
  >
    <!--<i class="el-icon-message-solid" title="取消订阅" v-if="ed"></i>
    <i class="el-icon-bell" title="订阅" v-else></i>-->
    <i class="icon-i-subscribe ed" title="取消订阅" v-if="ed"></i>
    <i class="icon-i-subscribe" title="订阅" v-else></i>
  </el-button>
  <el-button
    v-else-if="displayType == 'buttonWithIcon'"
    :type="ed ? 'primary' : 'info'"
    size="mini"
    @click="subscribe"
    plain
  >
    <i class="icon-i-subscribe ed" title="取消订阅" v-if="ed"></i>
    <i class="icon-i-subscribe" title="订阅" v-else></i>
    订阅
  </el-button>
  <el-button v-else size="mini" @click="subscribe" type="text">
    <!--<i class="fa fa-bullhorn" style="colour:#f7ba2a;"></i>-->
    <span style="colour: #f7ba2a">
      <span v-if="ed">取消</span>
      订阅
    </span>
  </el-button>
</template>

<script>
export default {
  name: 'Subscribe',
  props: [
    'typeId',
    'objectId',
    'objectName',
    'flag',
    'displayType',
    'domainFolderId',
  ],
  data() {
    return {
      ed: false,
      current: null,
    }
  },
  beforeMount() {
    this.getStatus()
  },
  mounted() {},
  methods: {
    getStatus() {
      let key = this.objectId + this.typeId
      if (this.flag) {
        key += this.flag
      } else {
        key += '0'
      }
      if (this.$subscribeMap.has(key)) {
        this.ed = true
        this.current = this.$subscribeMap.get(key)
      }
    },
    subscribe() {
      if (!this.ed) {
        const requestBody = {
          objId: this.objectId.toString(),
          typeId: Number.parseInt(this.typeId),
          objectName: this.objectName,
          flag: 0,
          domainFolderId: this.domainFolderId,
        }
        if (this.flag) {
          requestBody.flag = this.flag
        }
        this.$http
          .post(this.$url + '/service/subscribe/', requestBody)
          .then(res => {
            this.$message.success('订阅成功')

            this.ed = true
            this.$getSubscribe(() => {
              this.getStatus()
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .delete(this.$url + '/service/subscribe/' + this.current.id)
          .then(res => {
            this.$message.info('已取消订阅')
            this.ed = false
            this.$getSubscribe()
            this.current = null
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
  },
}
</script>

<style scoped lang="scss">
i {
  &:before {
    color: #b0b5c0;
  }
}
i.ed {
  &:before {
    color: #4386f5;
  }
}

.el-button--primary {
  width: 83px;
  padding: 7px;
  &.is-plain:active,
  &.is-plain:hover,
  &.el-button.is-plain:focus {
    color: #409eff;
    background: #ecf5ff;
    border-color: #b3d8ff;
  }
}
.el-button--info.is-plain {
  width: 83px;
  padding: 7px;
  &.is-plain:active,
  &.is-plain:hover,
  &.el-button.is-plain:focus {
    color: #909399;
    background: #f4f4f5;
    border-color: #d3d4d6;
  }
}
</style>
