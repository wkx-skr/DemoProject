<template>
  <div>
    <!--    <el-button
      type="text"
      size="mini"
      @click="goToStandardCode(currentDomainCode)"
    >
      {{ currentDomainCode.domainCode }}
    </el-button>-->
    <datablau-tooltip
      v-if="currentDomainCode.domainCode"
      :content="`${currentDomainCode.domainCode}`"
      :open-delay="500"
    >
      <el-button
        type="text"
        size="mini"
        @click="goToStandardCode(currentDomainCode)"
        :disabled="!$auth.STANDARD_CODE_VIEW"
      >
        <span class="buttonTip">
          {{ currentDomainCode.domainCode }}
        </span>
      </el-button>
    </datablau-tooltip>
    <el-button
      type="text"
      size="mini"
      @click="initBind"
      v-if="
        ($auth['METADATA_EDIT'] ||
          (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
        stas !== 'false' &&
        !Boolean($route.query.isAssets)
      "
    >
      <i class="icon-edit"></i>
    </el-button>
    <el-button
      v-show="currentDomainCode.domainCode"
      v-if="
        ($auth['METADATA_EDIT'] ||
          (inSystem && $auth['METADATA_EDIT_CURRENT_SYSTEM'])) &&
        !Boolean($route.query.isAssets)
      "
      type="text"
      size="mini"
      @click="preUnbind"
    >
      <i class="iconfont icon-delete"></i>
    </el-button>
  </div>
</template>
<script>
import HTTP from '@/http/main'

export default {
  props: ['objectId', 'domain', 'inSystem'],
  data() {
    return {
      currentDomainCode: {},
      hasDomainCode: false,
    }
  },
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
  mounted() {
    if (this.domain) {
      this.currentDomainCode = _.cloneDeep(this.domain)
      // if (
      //   this.domain.domains &&
      //   this.domain.domains.length &&
      //   this.domain.domains[0].referenceCode
      // ) {
      //   this.hasDomainCode = true
      //   this.$set(
      //     this.currentDomainCode,
      //     'domainCode',
      //     this.domain.domains[0].referenceCode
      //   )
      // }
    } else {
      this.currentDomainCode = {}
    }
    this.$bus.$on('domainCodeSelected', domain => {
      this.bind(domain)
    })
  },
  beforeDestroy() {
    this.$bus.$off('domainCodeSelected')
  },
  methods: {
    updateDomainCode(domainCode) {
      this.$set(this.currentDomainCode, 'domainCode', domainCode || '')
      localStorage.setItem('isUpdateDomainCode', true)
    },
    goToStandardCode(doamin) {
      let query = {
        name: 'code',
        query: {
          code: doamin.domainCode,
          isAssets: this.$route.query.isAssets,
        },
      }
      this.$skip2(query)

      /* let originData = doamin
      this.getCategoryAuth(originData.categoryId)
        .then(res => {
          if (res) {
            let query = {
              name: 'code',
              query: {
                code: originData.code || 'aerxtcfyghn',
              },
            }
            /!* if (originData.categoryId > 4) {
              query = {
                name: 'dataStandardField',
                query: {
                  domainId: originData.domainId,
                  categoryId: originData.categoryId,
                },
              }
            } *!/
            this.$skip2(query)
          } else {
            this.$datablauMessage({
              message: '您没有查看该标准代码的权限',
              type: 'info',
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        }) */
    },
    async getCategoryAuth(categoryId) {
      let bool = false
      if (categoryId < 4) {
        bool = true
      } else {
        let auth = await HTTP.getFolderAuthService({
          username: this.$user.username,
          folderId: categoryId,
        })
        if (auth.data !== 'NONE') {
          bool = true
        }
      }
      return bool
    },
    // 删除标准代码
    preUnbind() {
      this.$confirm(
        this.$t('meta.DS.tableDetail.techProperty.removeStandardCodeConfirm'),
        '',
        {
          type: 'warning',
        }
      )

        .then(() => {
          this.unbind()
        })
        .catch(() => {})
    },
    unbind() {
      this.$http
        .post(
          this.$url +
            '/service/entities/unbindDomainCode?columnId=' +
            `${this.objectId}`
        )
        .then(res => {
          this.currentDomainCode = {}
          localStorage.setItem('isUpdateDomainCode', true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initBind() {
      this.$bus.$emit('callDomainCodeSelector')
    },
    bind(domain) {
      if (!domain) {
        return
      }
      this.$http
        .post(
          this.$url +
            '/service/entities/bindDomainCode?domainCode=' +
            `${domain.code}&columnId=` +
            Number(this.objectId)
        )
        .then(res => {
          this.$message.success(
            this.$t('meta.DS.message.standardCodeBindSucceed')
          )
          this.$set(this.currentDomainCode, 'domainCode', domain.code)
          localStorage.setItem('isUpdateDomainCode', true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.el-button--text {
  //color: #409eff;
}
.datablau-tooltip {
  .buttonTip {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 314px;
    margin-right: 6px;
    height: 100%;
    vertical-align: top;
  }
}
</style>
