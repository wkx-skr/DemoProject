<template>
  <div>
    <!--    <el-button type="text" size="mini" @click="goToStandard(currentDomain)">
      {{ currentDomain.domainCode }} {{ currentDomain.chineseName }}
    </el-button>-->
    <datablau-tooltip
      v-if="currentDomain.domainCode || currentDomain.chineseName"
      :content="`${currentDomain.domainCode} ${currentDomain.chineseName}`"
      :open-delay="500"
    >
      <el-button type="text" size="mini" @click="goToStandard(currentDomain)">
        <span class="buttonTip">
          {{ currentDomain.domainCode }} {{ currentDomain.chineseName }}
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
      v-show="currentDomain.domainId"
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
      currentDomain: {},
    }
  },
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
  mounted() {
    if (this.domain) {
      this.currentDomain = _.cloneDeep(this.domain)
    } else {
      this.currentDomain = {}
    }
    this.$bus.$on('domainSelected', domain => {
      this.bind(domain)
    })
  },
  beforeDestroy() {
    this.$bus.$off('domainSelected')
  },
  methods: {
    goToStandard(doamin) {
      let originData = doamin
      this.getCategoryAuth(originData.categoryId)
        .then(res => {
          if (res) {
            let query = {
              name: 'dataStandard',
              query: {
                domainId: originData.domainId,
                blank: true,
                // isAssets: this.$route.query.isAssets,
              },
            }
            /*
            如果是数据指标，跳转到新版指标页面
             */
            if (originData.categoryId === 2) {
              query.name = 'index'
              query.query.id = originData.domainId
            }
            if (originData.categoryId > 4) {
              query = {
                name: 'dataStandardField',
                query: {
                  domainId: originData.domainId,
                  categoryId: originData.categoryId,
                  // isAssets: this.$route.query.isAssets,
                },
              }
            }
            this.$skip2(query)
          } else {
            this.$datablauMessage({
              message: '您没有查看该数据标准的权限',
              type: 'info',
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
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
    preUnbind() {
      this.$DatablauCofirm(
        this.$t('meta.DS.tableDetail.techProperty.removeStandardConfirm'),
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
        .delete(
          `${this.$meta_url}/service/domains/${this.currentDomain.domainId}/columns/${this.objectId}`
        )
        .then(res => {
          this.currentDomain = {}
          this.$emit('updateDomainCode')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initBind() {
      this.$bus.$emit('callDomainSelector')
    },
    handleBind(domain, body) {
      this.$http
        .post(this.$meta_url + '/service/domains/entities', body)
        .then(res => {
          this.$message.success(
            this.$t('meta.DS.tableDetail.techProperty.domainBindSuccess')
          )
          this.currentDomain = domain
          this.$emit('updateDomainCode', domain.referenceCode)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    bind(domain) {
      if (!domain) {
        return
      }
      const body = {
        domainId: domain.domainId,
        objectId: this.objectId,
        bindRefCode: false,
      }
      if (domain.referenceCode) {
        setTimeout(() => {
          this.$DatablauCofirm(
            '是否绑定该标准的标准代码?',
            this.$t('meta.dataSource.edit.tips'),
            {
              confirmButtonText: this.$t('meta.common.true'),
              cancelButtonText: this.$t('meta.common.false'),
              type: 'warning',
            }
          )
            .then(() => {
              body.bindRefCode = true
              this.handleBind(domain, body)
            })
            .catch(() => {
              body.bindRefCode = false
              this.handleBind(domain, body)
            })
        }, 500)
      } else {
        this.handleBind(domain, body)
      }
      //        this.$http.put()
    },
  },
}
</script>
<style lang="scss" scoped>
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
.XStyle {
  .buttonTip {
    text-decoration: line-through;
  }
}
</style>
