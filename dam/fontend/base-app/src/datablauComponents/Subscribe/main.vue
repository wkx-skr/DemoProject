<template>
  <datablau-button
    v-if="displayType === 'icon'"
    @click.stop="subscribe"
    low-key
    type="icon"
  >
    <!--<i class="el-icon-message-solid" title="取消订阅" v-if="ed"></i>
    <i class="el-icon-bell" title="订阅" v-else></i>-->
    <i
      class="iconfont icon-dingyue ed"
      :title="$t('domain.common.cancelSubscribe')"
      v-if="ed"
    ></i>
    <i
      class="iconfont icon-dingyue"
      :title="$t('domain.common.subscription')"
      v-else
    ></i>
  </datablau-button>
  <datablau-button
    v-else-if="displayType == 'buttonWithIcon'"
    :type="ed ? 'subscribe' : 'secondary'"
    @click="subscribe"
    class="scribe-info"
  >
    <i
      class="iconfont icon-dingyue ed"
      :title="$t('domain.common.cancelSubscribe')"
      v-if="ed"
    ></i>
    <i
      class="iconfont icon-dingyue"
      :title="$t('domain.common.subscription')"
      v-else
    ></i>
    {{ ed ? $t('domain.common.subscribed') : $t('domain.common.subscription') }}
  </datablau-button>
  <datablau-button v-else size="mini" @click="subscribe" type="text">
    <!--<i class="fa fa-bullhorn" style="colour:#f7ba2a;"></i>-->
    <span style="colour: #f7ba2a">
      <span v-if="ed">{{ $t('domain.common.cancelSubscribe') }}</span>
      {{ $t('domain.common.subscription') }}
    </span>
  </datablau-button>
</template>

<script>
import SubscribeController from '../../../../base-components/http/baseController/SubscribeController'

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
    this.$getSubscribe(() => {
      this.getStatus()
    })
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
        SubscribeController.addToSubscribe({ requestBody: requestBody })
          .then(res => {
            this.$message.success(this.$t('domain.common.subscriptionSucceed'))

            this.ed = true
            this.$getSubscribe(() => {
              this.getStatus()
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        SubscribeController.deleteSubscribe({ subId: this.current.id })
          .then(res => {
            this.$message.info(this.$t('domain.common.unsubscribeSucceed'))
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
@import '~@/next/components/basic/color.sass';
.ed {
  color: $primary-color;
}
</style>
