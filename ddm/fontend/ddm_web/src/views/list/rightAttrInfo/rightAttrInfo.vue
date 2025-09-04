<template>
  <div v-loading="loading" v-if="attrInfo">
    <datablau-meta-data-attr :operation-open="operationOpen" :width="1366">

      <!-- <extend-props
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
      ></extend-props> -->
        <p class="group-key" style="margin-top:0">
          模型信息
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.databaseType"
          :imgSrc="modelImg"
          attrValue=""
        >
            <Database-Type
                style="font-size:12px"
                 v-if="detail.modelType"
                :value="detail.modelType"
            ></Database-Type>
        </attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.branch"
          :imgSrc="branchImg"
          :attrValue="detail.branch ? detail.name : 'master' "
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.modelStatus"
          :imgSrc="publishImg"
          attrValue=""
          v-if="$store.state.featureMap.ddm_CustomStatus"
        >
        <div class="status-outer">
          <Status text-align="left" :type="detail.phase"></Status>
          <slot name="editStatus"></slot>
        </div>
        </attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="'命名模版'"
          :imgSrc="publishImg"
          attrValue=""
        >
        <div class="status-outer">
          {{entityTemplateIdName }}
          <datablau-button
            slot="editStatus"
            type="icon"
            low-key
            class="edit-status iconfont icon-bianji"
            @click="entityTemplateIdEdit"
          ></datablau-button>
        </div>
        </attr-item>

        <!--<attr-item-->
        <!--  style="margin-bottom:22px"-->
        <!--  :isOpen="isOpen"-->
        <!--  :attrKey="$store.state.$v.modelDetail.objectCount"-->
        <!--  :imgSrc="subjectImg"-->
        <!--  :attrValue="detail.objCount"-->
        <!--  :isBold="true"-->
        <!--&gt;</attr-item>-->
        <p class="group-key" style="margin-top:0">
          管理信息
        </p>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.owner"
          :imgSrc="ownerImg"
          :attrValue="detail.owner"
        ></attr-item>
        <!--<attr-item
          :isOpen="isOpen"
          attrKey="创建人"
          :imgSrc="creatorImg"
          attrValue=""
        ></attr-item>-->
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.createTime"
          :imgSrc="createTimeImg"
          :attrValue="moment(detail.createdOn).format('YYYY-MM-DD HH:mm:ss')"
        ></attr-item>
        <attr-item
          :isOpen="isOpen"
          :attrKey="$store.state.$v.modelDetail.updateTime"
          :imgSrc="updateTimeImg"
          :attrValue="moment(detail.lastModificationTimestamp).format('YYYY-MM-DD HH:mm:ss')"
        ></attr-item>
        <p class="group-key">
          自定义属性
        </p>
        <attr-item
           v-for="(u,k) in detail.udpMessage"
           :key="k"
          :isOpen="isOpen"
          v-show="detail.dataByType.udp.get(parseInt(k)).FriendlyName"
          :attrKey="detail.dataByType.udp.get(parseInt(k)).FriendlyName"
          :imgSrc="udpImg"
           :attrValue="(detail.dataByType.udp.get(parseInt(k)).ExtendedEnumStruct && JSON.parse(detail.dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).length && (detail.dataByType.udp.get(parseInt(k)).UdpValueType === 'STRING' || detail.dataByType.udp.get(parseInt(k)).UdpValueType === 'INTEGER')) ? detail.dataByType.udp.get(parseInt(k)).ExtendedEnumMultiple ? (u+'').split(',').map(item => item.trim()).map(key => JSON.parse(detail.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key) && JSON.parse(detail.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key).n).filter(i => i !== undefined).join(',') : JSON.parse(detail.dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === u) && JSON.parse(detail.dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === u).n : u"
        ></attr-item>
         <p class="group-key">
          {{$store.state.$v.modelDetail.tag}}
        </p>
        <attr-item
          :isOpen="isOpen"
          attrKey="选择标签"
          :imgSrc="tagImg"
          attrValue=""
           style="margin-bottom:9px"
        >
        <slot name="tagButton"></slot>
        </attr-item>
         <el-tag
         v-show="isOpen"
          :key="tag.id"
          size="small"
          v-for="(tag, index) in detail.tags"
          style="margin-right:1em;"
          :closable="editable"
          :disable-transitions="false"
          @close="handleClose(tag, index)">
          {{tag.name}}
        </el-tag>
    </datablau-meta-data-attr>
    <datablau-dialog
      title="编辑命名规则"
      :visible.sync="showEntityTemplateId"
      :append-to-body="true"
      width="480px"
      class="edit-synonyms-dia"
      :close-on-click-modal="false"
    >
      <div class="synonyms-dialog-body">
        <el-form
          ref="entityTemplateId"
          label-position="right"
          label-width="60px"
          size="small"
          :model="form"
        >
          <el-form-item label="命名规则"  >
            <datablau-select
                        v-model="form.entityTemplateId"
                        style="width:240px;margin-right:10px"
                        clearable
                    >
                        <el-option
                        v-for="item in templateList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                        ></el-option>
                    </datablau-select>
                    <el-checkbox
                      class="small"
                      v-model="form.forceCheckFlag"
                      :disabled="form.entityTemplateId === null || !form.entityTemplateId"
                    >设置强检查</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="synonyms-dialog-footer">
        <datablau-button size="mini" type="secondary" @click="showEntityTemplateId = false">{{$store.state.$v.modelDetail.cancel}}</datablau-button>
        <datablau-button size="mini" type="primary" @click="saveEntityTemplateId" class="" >{{$store.state.$v.modelDetail.ok}}</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
// import ExtendProps from './extendProps.vue'
import Status from '../Status.vue'
import DatabaseType from '@/components/common/DatabaseType.vue'
import moment from 'moment'
import AttrItem from './attrItem.vue'
import createTimeImg from '@/assets/images/rightAttrInfoIcons/modelDetail/createTime.svg'
import creatorImg from '@/assets/images/rightAttrInfoIcons/modelDetail/creator.svg'
import departmentImg from '@/assets/images/rightAttrInfoIcons/modelDetail/department.svg'
import ownerImg from '@/assets/images/rightAttrInfoIcons/modelDetail/owner.svg'
import tagImg from '@/assets/images/rightAttrInfoIcons/modelDetail/tag.svg'
import updateTimeImg from '@/assets/images/rightAttrInfoIcons/modelDetail/updateTime.svg'
import versionImg from '@/assets/images/rightAttrInfoIcons/modelDetail/version.svg'
import systemImg from '@/assets/images/rightAttrInfoIcons/modelDetail/system.svg'
import udpImg from '@/assets/images/rightAttrInfoIcons/modelDetail/udp.svg'
import modelImg from '@/assets/images/rightAttrInfoIcons/modelDetail/model.svg'
import branchImg from '@/assets/images/rightAttrInfoIcons/modelDetail/branch.svg'
import publishImg from '@/assets/images/rightAttrInfoIcons/modelDetail/publish.svg'
import subjectImg from '@/assets/images/rightAttrInfoIcons/modelDetail/subject.svg'
import HTTP from '@/resource/http'

// import api from '../utils/api'
export default {
  name: 'rightAttrInfo',
  components: { AttrItem, DatabaseType, Status },
  props: {
    attrs: {
      type: Object,
      default () {
        return {}
      }
    },
    currentNode: {
      type: Object,
      default () {
        return {}
      }
    },
    editable: {
      type: Boolean,
      default: false
    },
    exampleData: {
      // 组件例子
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      moment,
      modelImg,
      branchImg,
      publishImg,
      subjectImg,
      AttrItem,
      createTimeImg,
      creatorImg,
      departmentImg,
      ownerImg,
      tagImg,
      updateTimeImg,
      versionImg,
      systemImg,
      udpImg,
      editing: false,
      editingKey: '',
      detail: {
        owner: '',
        categoryPath: []
      },
      attrInfo: {},
      loading: false,
      isOpen: true,
      templateList: [],
      entityTemplateIdName: '',
      showEntityTemplateId: false,
      form: {
        entityTemplateId: null,
        forceCheckFlag: false
      }
    }
  },
  methods: {
    saveEntityTemplateId () {
      HTTP.modModelInfo({
        name: this.detail.name,
        description: this.detail.description,
        id: this.detail.id,
        entityTemplateId: this.form.entityTemplateId,
        forceCheckFlag: this.form.forceCheckFlag
      }).then(res => {
        this.$message.success('修改成功')
        this.$set(this.detail, 'entityTemplateId', this.form.entityTemplateId)
        this.$set(this.detail, 'forceCheckFlag', this.form.forceCheckFlag)
        this.showEntityTemplateId = false
        this.entityTemplateIdName = this.templateList.filter(
          i => i.id === this.form.entityTemplateId
        )[0]?.name
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    entityTemplateIdEdit () {
      this.showEntityTemplateId = true
    },
    getTemplateList () {
      this.$http.get(this.$url + '/service/entitytemplate/publish').then(res => {
        this.templateList = res.data
        this.entityTemplateIdName = res.data.filter(
          i => i.id === this.detail.entityTemplateId
        )[0]?.name
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleClose (tag, index) {
      this.$parent.handleClose(tag, index)
    },
    operationOpen (params) {
      this.isOpen = params.isOpen
    },
    formatTime (timeStr) {
      const hasT = timeStr && timeStr.indexOf('T') !== -1
      if (hasT) {
        const timeArr = timeStr.split('T')
        return `${timeArr[0]} ${timeArr[1].split('.')[0]}`
      } else {
        return timeStr
      }
    },
    formatStatus (status) {
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
    formatAuthority (auth) {
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
    edit (key) {
      this.editingKey = key
    },
    // 保存 数据权属
    saveOwnship (data) {
      api
        .updateDepartment({
          catalogId: this.currentNode.id,
          depId: data.id
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.getDirInfo()
            // this.attrInfo.ownship = data.fullName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 数据管家
    saveSteward (data) {
      api
        .updateSteward({
          catalogId: this.currentNode.id,
          butler: data.username || ''
        })
        .then(res => {
          if (res.status === 200) {
            this.$parent.$parent.getDirInfo()
            // this.attrInfo.steward = data.fullUserName
            this.editingKey = ''
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 保存 扩展属性
    saveExtendValue ({ p, idx, v, target }) {
      if (this.attrInfo.extendProps[p][idx].value.type === 'ENUM') {
        v = v.value
      }
      if (this.attrInfo.extendProps[p][idx].value.required && v === '') {
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
            value: v
          }
        ])
        .then(res => {
          this.loading = false
          if (res.status === 200) {
            this.attrInfo.extendProps[p][idx].value.value = v
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
    }
  },
  mounted () {
    this.detail = this.attrs
    this.attrInfo = this.attrs
    for (let key in this.detail.udpMessage) {
    }
    this.form.entityTemplateId = this.detail.entityTemplateId
    this.form.forceCheckFlag = this.detail.forceCheckFlag
    this.getTemplateList()
  },
  watch: {
    attrs: {
      handler (value) {
        if (value) {
          this.attrInfo = value
          this.detail = this.attrs
          this.editingKey = ''
        }
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
/deep/ .item-key {
  font-size: 12px;
}
/deep/ .item-value {
  font-size: 12px;
}
/deep/ .el-button.edit-status {
  position: relative;
  bottom: 2px;
}
.el-tag {
  color: #555;
  line-height: 24px;
  height: 24px;
  background: rgba(64,158,255,0.1);
  border-radius: 2px;
  /deep/ .el-tag .el-tag__close {
    color: #409EFF;
  }
}
.group-key {
  margin-top: 11px;
  height: 34px;
  line-height: 32px;
  font-weight: 600;
  font-size: 12px;
  overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.attr-item {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: center;

  .item-key {
    width: 140px;
    line-height: 34px;
    img {
      margin-right: 6px;
    }
  }

  .top-user {
    display: flex;
    align-items: center;

    .head-portrait {
      width: 24px;
      height: 24px;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

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
  /deep/ .tag.text-align {
    margin-right: 8px;
    display: inline-block;
    border-radius: unset;
    height: 22px;
    line-height: 22px;
    font-size: 12px;
    font-weight: 500px;
  }
}
</style>
