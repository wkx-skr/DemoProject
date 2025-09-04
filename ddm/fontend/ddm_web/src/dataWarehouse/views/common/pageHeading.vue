<template>
  <div class="page-heading">
    <img v-if="customerId==='datablau'" class="datablau-logo"  id="logo" :src="'/static/logo/blue_logo.svg'" alt="logo" style="cursor:pointer;" @click="goToIndex" />
    <Menu></Menu>
    <div class="right">
      <datablau-tooltip :content="$v.about.versionInfo" :hide-after="1000" effect="light">
        <img :src="icon.version" alt="" class="top-icon" @click="showInfo">
      </datablau-tooltip>
      <el-dropdown
        trigger="click"
        @command="handleCommand"
      >
        <span class="el-dropdown-link">
          <!-- <img :src="portraitSrc" class="portrait" alt=""> -->
          <i class="iconfont icon-schema"></i>
          <span class="text oneline-eclipse">{{$store.state.user.username}}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown" >
          <!--<el-dropdown-item command="version">
            版本信息
          </el-dropdown-item>-->
          <!--<el-dropdown-item
            command="update"
            v-if="$store.state.user.isAdmin"
          >产品更新</el-dropdown-item>-->
          <el-dropdown-item command="user">
            个人工作台
          </el-dropdown-item>
          <el-dropdown-item command="token" v-if="!$isEng">
            {{$v.pageHead.getDynamicPd}}
          </el-dropdown-item>
          <el-dropdown-item command="changeProduct" v-if="gatewayEnable && damEnabled && otherProduct">
            切换产品
          </el-dropdown-item>
          <el-dropdown-item command="logout">
            {{$v.pageHead.logout}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import Menu from '@/dataWarehouse/components/Menu'
import string from '@/resource/utils/string'
export default {
  components: { Menu },
  data () {
    return {
      damEnabled: window.setting.damEnabled !== 'false' && window.setting.damEnabled !== false,
      gatewayEnable: window.setting.gatewayEnable,
      otherProduct: false,
      icon: {
        // version: this.$customSetting.enable ? require('./navIcon/version1.svg') : require('./navIcon/version.svg')
        version: require('./navIcon/version.svg')
      }
    }
  },
  computed: {
    customerId () {
      return this.$customerId || 'datablau'
    }
  },
  mounted () {
    if (window.setting.servicesAlive) {
      this.otherProduct = window.setting.servicesAlive.ddd || window.setting.servicesAlive.dam
    } else {
      this.otherProduct = true
    }
  },
  methods: {
    goToIndex () {
      this.$router.push('/')
    },
    handleCommand (command) {
      if (command === 'logout') {
        HTTP.logout('ddd')
      } if (command === 'changeProduct') {
        HTTP.changeProduct()
      } else if (command === 'version') {
        this.showInfo()
      } else if (command === 'update') {
        this.$router.push('update').catch(e => {
          this.$message.info(this.$v.pageHead.tip_1)
        })
      } else if (command === 'token') {
        HTTP.getWebToken({
          successCallback: (token) => {
            if (token) {
              console.log(token)
              const h = this.$createElement
              this.$msgbox({
                title: this.$v.pageHead.dynamicPd,
                showCancelButton: true,
                cancelButtonText: this.$v.pageHead.comfirm,
                confirmButtonText: this.$v.pageHead.copy,
                message: h('textarea', {
                  attrs: {
                    'readonly': 'readonly'
                  },
                  style: {
                    width: '350px',
                    height: '80px',
                    resize: 'none'
                  }
                }, token),
                closeOnClickModal: false
              }).then(() => {
                string.setClipBoard(token)
                this.$message.success(this.$v.pageHead.copySuccsee)
              }).catch(() => {

              })
            }
          }
        })
      } else if (command === 'user') {
        this.$router.push({ name: 'userModal' })
      }
    },
    showInfo () {
      this.$bus.$emit('showVersionMessage')
    }
  }
}
</script>
<style scoped lang="scss">
  @import './pageHeading.scss';
</style>
