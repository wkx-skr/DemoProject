<template>
  <div>
    <h1>用户信息</h1>
    <h2>示例</h2>
    <p>
      和服务板块的其他示例一样，本示例的UI仅为展示用户信息服务的js代码功能，不应被直接应用于实际应用场景。
    </p>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <p>
        <datablau-button type="primary" @click="appendUser">
          用户选择
        </datablau-button>
        <datablau-button @click="clearUser">清空</datablau-button>
      </p>
      <p>
        <datablau-tag
          class="no-loading-text"
          v-for="(u, idx) in userNames"
          :key="u"
          style="margin-right: 10px"
          closable
          @close="handleClose(idx)"
          v-loading="!userMap[u]"
        >
          {{ userMap[u] }}
        </datablau-tag>
      </p>
    </div>
    <h2>代码示例</h2>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <pre>
import UserInformationService from '@service/UserInformationService'
UserInformationService.getUsernames(this.userNames).then(map => {
  map.forEach((item, index) => {
    this.$set(this.userMap, index, item)
  })
})
</pre
      >
    </div>
  </div>
</template>
<script>
import UserInformationService from '@service/UserInformationService'
export default {
  data() {
    return {
      userNames: ['admin', 'weikai'],
      userMap: {},
    }
  },
  mounted() {
    this.addUser()
  },
  methods: {
    appendUser() {
      this.$utils.staffSelect.open([], false).then(res => {
        const usernames = res.map(i => i.username)
        usernames.forEach(item => {
          if (!this.userNames.includes(item)) {
            this.userNames.push(item)
          }
        })
        this.addUser()
      })
    },
    handleClose(idx) {
      this.userNames.splice(idx, 1)
    },
    addUser() {
      UserInformationService.getUsernames(this.userNames).then(map => {
        map.forEach((item, key) => {
          this.$set(this.userMap, key, item)
        })
      })
    },
    clearUser() {
      this.userNames.length = 0
      UserInformationService.clearUsername()
      this.userMap = {}
    },
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';

div {
}

p {
  margin-bottom: 20px;
}
</style>
