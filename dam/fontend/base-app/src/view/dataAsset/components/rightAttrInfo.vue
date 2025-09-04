// 资产属性
<template>
  <div v-loading="loading" style="width: 100%; height: 100%">
    <datablau-meta-data-attr
      :operation-open="operationOpen"
      style="height: 100%; z-index: 999"
    >
      <p class="group-key">{{ $t('assets.summaryInfo.organInfoTitle') }}</p>
      <attr-item
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        :isOwnship="true"
        :attrKey="$t('assets.summaryInfo.ownershipText')"
        :imgSrc="'/static/images/metadataIcon/dataOwnership.svg'"
        :attrValue="attrInfo.ownship"
        @saveOwnship="saveOwnship"
        :isOpen="isOpen"
      ></attr-item>
      <attr-item
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        :isSteward="true"
        :attrKey="$t('assets.summaryInfo.stewardText')"
        :imgSrc="'/static/images/metadataIcon/dataStewardship.svg'"
        :attrValue="attrInfo.steward"
        @saveSteward="saveSteward"
        :isOpen="isOpen"
      ></attr-item>
      <div class="attr-item">
        <span class="item-key">
          <img src="/static/images/metadataIcon/topUser.svg" alt="" />
          <span v-if="isOpen">
            {{ $t('assets.summaryInfo.topUserText') }}
          </span>
        </span>
        <div class="item-value top-user" v-if="isOpen">
          <el-tooltip
            placement="bottom"
            effect="light"
            v-for="(user, index) in attrInfo.topUsers"
            :key="index"
          >
            <template v-if="user">
              <div slot="content">
                <p style="color: #20293b; padding-bottom: 10px">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.usernameText') }}：
                  </span>
                  {{ user.username }}
                </p>
                <p style="color: #20293b; padding-bottom: 10px">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.fullnameText') }}：
                  </span>
                  {{ user.username }}
                </p>
                <p style="color: #20293b">
                  <span
                    style="
                      color: #7d8493;
                      font-size: 12px;
                      width: 50px;
                      display: inline-block;
                    "
                  >
                    {{ $t('assets.summaryInfo.visitCountText') }}：
                  </span>
                  {{ user.visitCount || 0 }}
                </p>
              </div>
              <div class="head-portrait">
                {{ user.username.slice(0, 1) }}
              </div>
            </template>
          </el-tooltip>
        </div>
      </div>
      <extend-props
        :isOpen="isOpen"
        :extendProps="attrInfo.extendProps"
        :editingKey="editingKey"
        v-bind="$attrs"
        :editable="
          editable &&
          currentNode.status !== 'PUBLISHED' &&
          currentNode.status !== 'UNDER_REVIEW'
        "
        @saveExtendValue="saveExtendValue"
        @edit="edit"
      ></extend-props>
      <template v-if="attrInfo.generalSetting">
        <p class="group-key">
          {{ $t('assets.summaryInfo.generalPropTitle') }}
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.statusText')"
          :imgSrc="'/static/images/metadataIcon/assetstatus.svg'"
          :attrValue="formatStatus(attrInfo.generalSetting.publishStatus)"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.dirTypeText')"
          :imgSrc="'/static/images/metadataIcon/assetType.svg'"
          :attrValue="attrInfo.generalSetting.catalogTypeName"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.approverText')"
          :imgSrc="'/static/images/metadataIcon/dataApprover.svg'"
          :attrValue="attrInfo.generalSetting.approver"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.authorityText')"
          :imgSrc="'/static/images/metadataIcon/directoryRight.svg'"
          :attrValue="formatAuthority(attrInfo.generalSetting.authType)"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="'关键词'"
          :imgSrc="'/static/images/metadataIcon/keyword.svg'"
          :attrValue="attrInfo.generalSetting.keyword"
        ></attr-item>
      </template>
      <template v-if="attrInfo.systemSetting">
        <p class="group-key">
          {{ $t('assets.summaryInfo.systemPropTitle') }}
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.creatorText')"
          :imgSrc="'/static/images/metadataIcon/creator.svg'"
          :attrValue="attrInfo.systemSetting.creator"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.createTimeText')"
          :imgSrc="'/static/images/metadataIcon/creationTime.svg'"
          :attrValue="attrInfo.systemSetting.createTime"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.lastTimeText')"
          :imgSrc="'/static/images/metadataIcon/modifyTime.svg'"
          :attrValue="formatTime(attrInfo.systemSetting.modifyTime)"
        ></attr-item>
        <attr-item
          v-if="attrInfo.systemSetting.publishTime"
          :isOpen="isOpen"
          :attrKey="$t('assets.summaryInfo.publishTimeText')"
          :imgSrc="'/static/images/dataAssets/publishTime.svg'"
          :attrValue="formatTime(attrInfo.systemSetting.publishTime)"
        ></attr-item>
      </template>
    </datablau-meta-data-attr>
  </div>
</template>

<script>
import ExtendProps from './extendProps.vue'
import AttrItem from './attrItem.vue'
// import secImg from './static/images/metadataIcon/assetstatus.svg'
// import authImg from './static/images/metadataIcon/directoryRight.svg'
// import publishImg from './static/images/dataAssets/publishTime.svg'
// import createImg from './static/images/metadataIcon/creationTime.svg'
// import creatorImg from './static/images/metadataIcon/creator.svg'
// import approverImg from './static/images/metadataIcon/dataApprover.svg'
// import dirTypeImg from './static/images/metadataIcon/assetType.svg'
// import statusImg from './static/images/metadataIcon/assetstatus.svg'
// import ownImg from './static/images/metadataIcon/dataOwnership.svg'
// import stewardImg from './static/images/metadataIcon/dataStewardship.svg'
// import lastImg from './static/images/metadataIcon/modifyTime.svg'
// import keywordImg from './static/images/metadataIcon/keyword.svg'
import api from '../utils/api'
export default {
  name: 'rightAttrInfo',
  components: { ExtendProps, AttrItem },
  props: {
    attrs: {
      type: Object,
      default() {
        return {}
      },
    },
    currentNode: {
      type: Object,
      default() {
        return {}
      },
    },
    editable: {
      type: Boolean,
      default: false,
    },
    exampleData: {
      // 组件例子
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      editing: false,
      // secImg,
      // authImg,
      // publishImg,
      // createImg,
      // creatorImg,
      // approverImg,
      // dirTypeImg,
      // statusImg,
      // ownImg,
      // stewardImg,
      // lastImg,
      // keywordImg,
      editingKey: '',
      attrInfo: {
        ownship: '',
        steward: '',
        topUsers: [],
        extendProps: {},
        generalSetting: {},
        systemSetting: {},
      },
      loading: false,
      isOpen: true,
    }
  },
  methods: {
    operationOpen(params) {
      this.isOpen = params.isOpen
    },
    formatTime(timeStr) {
      const hasT = timeStr && timeStr.indexOf('T') !== -1
      if (hasT) {
        const timeArr = timeStr.split('T')
        return `${timeArr[0]} ${timeArr[1].split('.')[0]}`
      } else {
        return timeStr
      }
    },
    formatStatus(status) {
      let statusText = ''
      switch (status) {
        case 0:
          statusText = this.$t('assets.common.unpublishText')
          break
        case 1:
          statusText = this.$t('assets.common.reviewText')
          break
        case 2:
          statusText = this.$t('assets.common.publishedText')
          break
        case 3:
          statusText = this.$t('assets.common.offlineText')
          break
      }
      return statusText
    },
    formatAuthority(auth) {
      let authText = ''
      switch (auth) {
        case 'MANAGER':
          authText = this.$t('assets.common.managePermissions')
          break
        case 'EDIT':
          authText = this.$t('assets.common.editPermissions')
          break
        case 'READ':
          authText = this.$t('assets.common.visitPermissions')
          break
        default:
          authText = ''
      }
      return authText
    },
    edit(key) {
      // console.log(key)
      this.editingKey = key
    },
    // 保存 数据权属
    saveOwnship(data) {
      // console.log(data)
      api
        .updateDepartment({
          catalogId: this.currentNode.id,
          bm: data.bm,
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.updateDirAttr()
            // this.attrInfo.ownship = data.fullName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 数据管家
    saveSteward(data) {
      // console.log(data)
      api
        .updateSteward({
          catalogId: this.currentNode.id,
          butler: data.username || '',
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.updateDirAttr()
            // this.attrInfo.steward = data.fullUserName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 扩展属性
    saveExtendValue({ p, idx, v, target }) {
      // console.log(p, idx, v, target)
      // console.log(this.attrInfo.extendProps[p][idx])
      if (this.attrInfo.extendProps[p][idx].value.type === 'ENUM' && v) {
        v = v.value
      }
      if (this.attrInfo.extendProps[p][idx].value.required && !(v === 0 || v)) {
        this.$showFailure(this.$t('assets.udp.isRequired'))
        return
      }
      this.loading = true
      api
        .editUDPValue([
          {
            catalogId: this.currentNode.id,
            catalogName: this.currentNode.name,
            valId: Number(target.value.valId),
            udpId: target.value.id,
            udpName: target.value.name,
            value: v,
          },
        ])
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.attrInfo.extendProps[p][idx].value.value = v
            this.$parent.$parent.updateDirAttr()
            this.editingKey = ''
            return true
          } else {
            this.$showFailure(res.errorMessage)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // console.log(this.extendProps[p])
    },
  },
  mounted() {
    this.attrInfo = this.attrs
  },
  watch: {
    attrs: {
      handler(value) {
        if (value) {
          this.attrInfo = value
          this.editingKey = ''
        }
      },
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.group-key {
  height: 24px;
  line-height: 24px;
  font-weight: 600;
  color: #444;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.attr-item {
  width: 100%;
  height: 34px;

  .item-key {
    width: 140px;
    line-height: 34px;
    float: left;
    padding-right: 20px;
    img {
      margin-right: 6px;
    }
  }

  .top-user {
    float: left;
    margin-top: 5px;
    .head-portrait {
      width: 24px;
      height: 24px;
      border-radius: 100%;
      text-align: center;
      line-height: 22px;
      float: left;

      &:nth-of-type(1) {
        background: #e0d5da;
      }

      &:nth-of-type(2) {
        background: #fff0f7;
        margin: 0 10px;
      }

      &:nth-of-type(3) {
        background: #d0e4ef;
      }
    }
  }
}
</style>
