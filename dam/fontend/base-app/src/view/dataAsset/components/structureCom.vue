<template>
  <div v-loading="loading">
    <!--      目录空间-->
    <div class="structureBox">
      <div class="flexDisplay spaceBetween alignItems">
        <div>
          <datablau-detail-subtitle
            :title="structure.name"
            mt="20px"
            mb="20px"
          ></datablau-detail-subtitle>
          <span>
            <datablau-tooltip
              placement="bottom"
              effect="dark"
              popper-class="tooltipBox"
              :content="$t('assets.directoryStructure.edit')"
            >
              <i
                class="iconfont icon-bianji marginL15"
                @click="addStructures(structure)"
                v-if="structure.name !== '资产目录管理'"
                v-show="structure.newLevel || !structure.openStatus"
              ></i>
            </datablau-tooltip>
          </span>
        </div>
        <div class="flexDisplay alignItems">
          <!--            v-if="structure.name !== '资产目录管理'"-->

          <!--          <datablau-tooltip-->
          <!--            placement="bottom"-->
          <!--            effect="dark"-->
          <!--            popper-class="tooltipBox"-->
          <!--            :content="$t('assets.directoryStructure.delete')"-->
          <!--          >-->
          <!--            <i-->
          <!--              class="iconfont icon-delete blue marginL15 delete"-->
          <!--              v-if="structure.name !== '资产目录管理'"-->
          <!--              v-show="structure.newLevel || !structure.openStatus"-->
          <!--              @click="delet(index, structure)"-->
          <!--            ></i>-->
          <!--          </datablau-tooltip>-->
          <datablau-tooltip
            placement="bottom"
            effect="dark"
            popper-class="tooltipBox"
            :content="$t('assets.directoryStructure.saves')"
          >
            <i
              class="icon iconfont blue icon-save saveIcon"
              @click="saveItem(structure)"
              v-show="structure.newLevel || !structure.openStatus"
            ></i>
          </datablau-tooltip>
          <div
            class="flexDisplay switchBox alignItems marginL10"
            v-show="structure.newLevel || structure.openStatus"
          >
            <span class="clor77">
              {{ $t('assets.directoryStructure.approvalProcess') }}
            </span>
            <datablau-switch
              v-model="structure.catalogStraightPublish"
              @change="changeValue(structure, 'catalogStraightPublish')"
              :active-text="$t('assets.directoryStructure.enable')"
              :inactive-text="$t('assets.directoryStructure.disableds')"
              type="innerText"
            ></datablau-switch>
          </div>
          <div
            class="flexDisplay switchBox alignItems marginLR10"
            v-show="structure.newLevel || structure.openStatus"
          >
            <span class="clor77">
              {{ $t('assets.directoryStructure.dataAsset') }}
            </span>
            <datablau-switch
              v-model="structure.assetsStraightPublish"
              @change="changeValue(structure, 'assetsStraightPublish')"
              :active-text="$t('assets.directoryStructure.enable')"
              :inactive-text="$t('assets.directoryStructure.disableds')"
              type="innerText"
            ></datablau-switch>
          </div>
          <div class="switch flexDisplay switchBox alignItems">
            <span class="clor77">
              {{ $t('assets.directoryStructure.structureStatus') }}
            </span>
            <datablau-switch
              v-model="structure.openStatus"
              @change="changeValue(structure, 'openStatus')"
              :active-text="$t('assets.directoryStructure.enable')"
              :inactive-text="$t('assets.directoryStructure.disableds')"
              type="innerText"
            ></datablau-switch>
          </div>
        </div>
      </div>
      <el-collapse-transition>
        <div v-show="!structure.allPutAway">
          <div class="tableOfContents">
            <div class="tableOf">
              <div class="til flexDisplay">
                <div>
                  {{ $t('assets.directoryStructure.assetCatalog') }}
                  <el-tooltip
                    placement="right"
                    effect="light"
                    popper-class="tooltipBox"
                  >
                    <div slot="content">
                      <datablau-detail-subtitle
                        :title="$t('assets.directoryStructure.properties')"
                        mt="5px"
                      ></datablau-detail-subtitle>
                      <ul class="tipCon">
                        <li>
                          {{ $t('assets.directoryStructure.directory') }}
                        </li>
                        <li>
                          {{ $t('assets.directoryStructure.abbreviation') }}
                        </li>
                        <li>
                          {{ $t('assets.directoryStructure.ownership') }}
                        </li>
                        <li>
                          {{ $t('assets.directoryStructure.approver') }}
                        </li>
                        <li>
                          {{ $t('assets.directoryStructure.keywords') }}
                        </li>
                        <li>
                          {{ $t('assets.directoryStructure.describe') }}
                        </li>
                      </ul>
                    </div>
                    <i class="iconfont icon-tips"></i>
                  </el-tooltip>
                  <span v-show="structure.name === '资产目录管理'">
                    （{{ $t('assets.directoryStructure.cannotBeModified') }}）
                  </span>
                </div>
                <div>{{ $t('assets.generalSettings.add') }}</div>
                <div>
                  {{ $t('assets.directoryStructure.setUP') }}
                </div>
                <div>{{ $t('assets.directoryStructure.icon') }}</div>
              </div>
              <div
                class="tableContents flexDisplay alignItems"
                v-for="(items, index) in filter"
                :key="'structure' + index"
              >
                <div class="flexDisplay alignItems">
                  <span>
                    {{ propertyNew(items.level) }}
                  </span>
                  <datablau-select
                    v-model="items.catalogTypeId"
                    @change="contentsChange(items)"
                    @focus="optionsFocus"
                    @clear="optionsFocus"
                    :disabled="
                      structure.name === '资产目录管理' ||
                      items.inUse ||
                      (structure.openStatus && !structure.newLevel)
                    "
                    clearable
                    class="selectBox"
                    style="width: 300px"
                  >
                    <!--                      v-if="index < structure.detailDtos.length - 1"-->
                    <el-option
                      v-for="k in options"
                      :key="k.id"
                      :disabled="
                        k.disabled ||
                        (index < filter.length - 1 &&
                          k.assetsType.indexOf('CATALOG') === -1)
                      "
                      :label="k.name"
                      :value="k.id"
                    ></el-option>
                  </datablau-select>
                  <div class="blue"></div>
                </div>
                <div>
                  {{ items.typeAsset }}
                </div>
                <div class="iconBox">
                  <datablau-tooltip
                    placement="bottom"
                    effect="dark"
                    popper-class="tooltipBox"
                    :content="$t('assets.directoryStructure.completion')"
                  >
                    <span @click="completion(items)">
                      {{ $t('assets.generalSettings.comple') }}
                    </span>
                  </datablau-tooltip>
                  <datablau-tooltip
                    placement="bottom"
                    effect="dark"
                    popper-class="tooltipBox"
                    :content="
                      $t('assets.directoryStructure.propertiesExtended')
                    "
                  >
                    <span @click="properties(items)">
                      {{ $t('assets.generalSettings.extended') }}
                    </span>
                  </datablau-tooltip>
                </div>
                <div class="levelImage">
                  <img :src="url + items.icon" alt="" v-if="items.icon" />
                  <img :src="imgList" alt="" v-if="!items.icon" />
                </div>
              </div>
            </div>
          </div>
          <div class="approverBox">
            <div class="flexDisplay alignItems approverDiv">
              <span class="approver">
                {{ $t('assets.directoryStructure.directoryApprover') }}
              </span>
              <!--            :disabled="
                structure.name === '资产目录管理' || structure.openStatus
              "-->
              <datablau-select
                v-model="structure.approver"
                clearable
                filterable
                remote
                :disabled="structure.openStatus && !structure.newLevel"
                class="marginL10"
                :placeholder="$t('assets.generalSettings.choose')"
                style="width: 255px"
                popper-class="popperClass"
                :popper-append-to-body="true"
                :remote-method="remoteMethod"
                @focus="selectFocus(structure.approver)"
                @clear="selectFocus('')"
                v-selectLazyLoad="lazyloading"
              >
                <el-option
                  v-for="items in user"
                  :key="'user' + items.id"
                  :label="items.name + '（' + items.username + '）'"
                  :value="items.username"
                >
                  <span>{{ items.name }}</span>
                  <span class="clor77">（{{ items.username }}）</span>
                </el-option>
              </datablau-select>
              <span class="color99 marginL10">
                {{ $t('assets.directoryStructure.approvers') }}：{{
                  structure.approver
                }}
              </span>
            </div>
            <div class="flexDisplay alignItems administrator">
              <span class="approver">
                {{ $t('assets.directoryStructure.directoryManager') }}
              </span>
              <!--            :disabled="
                structure.name === '资产目录管理' || structure.openStatus
              "-->
              <settingCom
                class="marginL10"
                :disabled="structure.openStatus && !structure.newLevel"
                :close="structure.inUse"
                :list="structure.structureManagerDto || []"
                :allSelected="allSelect || []"
                :getCallback="true"
                :width="'500px'"
                type="MANAGER"
                :currentNode="currentNode"
                @primary="callback"
                @handleClose="settingClose"
              ></settingCom>
            </div>
          </div>
        </div>
      </el-collapse-transition>
    </div>
    <!--      目录空间-->
    <!--    完成度算法-->
    <completenessDialog
      :dialogVisible="dialogVisible"
      :catalogType="catalogType"
      @handleClose="handleClose"
      @primary="handleClose"
      :disabled="false"
    ></completenessDialog>
    <!--   扩展属性 -->
    <extendedProperties
      :extendVisible="extendVisible"
      :catalogType="catalogType"
      @handleClose="handleClose"
      @primary="handleClose"
      :disabled="false"
    ></extendedProperties>
    <!--    修改资产目录-->
    <addStructrure
      :addStructure="addStructure"
      :cataItem="cataItem"
      :structureList="structureList"
      :title="`${$t('assets.directoryStructure.assetDirectory')}`"
      @handleClose="handleCloseStru"
      @primary="reviseStruc"
    ></addStructrure>
  </div>
</template>

<script>
import settingCom from '../components/settingCom'
import completenessDialog from '../components/completenessDialog'
import extendedProperties from '../components/extendedProperties'
import addStructrure from './addStructrure'
// import level0 from '/static/images/dataAssets/leve0.png'
import HTTP from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
export default {
  name: 'StructureCom',
  components: {
    settingCom,
    completenessDialog,
    extendedProperties,
    addStructrure,
  },
  props: {
    structure: {
      type: Object,
    },
    structureList: {
      type: Array,
    },
    user: {
      type: Array,
    },
    index: {
      type: Number,
    },
    options: {
      type: Array,
    },
  },
  computed: {
    allSelect() {
      return this.structure.structureManagerDto
    },
    filter() {
      return this.structure.detailDtos.filter(item => {
        return !item.delete
      })
    },
  },
  watch: {
    structure: {
      handler(val) {
        val.detailDtos.forEach(item => {
          this.contentsChange(item)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      // turnOn: false, // 开关
      modelValueSingle: '', // 目录类型
      // options: {}, // 选中目录类型下拉
      // user: [], // 审批人下拉
      topLevel: { propertyValue: 'admin' }, // 默认审批人
      managers: [], // settingCom已经绑定的
      currentNode: {}, // 父级
      // allPutAway: false,
      url: window.setting.restApiPathName + '/service/ddc/config/icon/',
      dialogVisible: false,
      extendVisible: false,
      addStructure: false,
      catalogType: {},
      cataItem: {},
      loading: false,
      imgList: '/static/images/dataAssets/leve0.png',
      page: 1,
      keyWord: '',
      // upDown: '收起',
    }
  },
  methods: {
    settingClose(val) {
      this.$emit('settingClose', {
        name: val,
        index: this.index,
        structure: this.structure,
      })
    },
    reviseStruc(val) {
      this.addStructure = false
      this.$emit('reviseStruc', val)
    },
    addStructures(item) {
      this.cataItem = item
      this.cataItem.index = this.index
      this.addStructure = true
    },
    handleCloseStru() {
      this.addStructure = false
    },
    propertyNew(val) {
      switch (val) {
        case 1:
          return this.$t('assets.directoryStructure.firstLevel')
        case 2:
          return this.$t('assets.directoryStructure.twoLevel')
        case 3:
          return this.$t('assets.directoryStructure.threeLevel')
        case 4:
          return this.$t('assets.directoryStructure.fourLevel')
        case 5:
          return this.$t('assets.directoryStructure.fiveLevel')
      }
    },
    // 开启关闭
    changeValue(item, val) {
      if (item.id) {
        if (!item.approver) {
          this.$message.error(this.$t('assets.directoryStructure.save'))
          item[val] = false
          return
        } else if (item.structureManagerDto.length == 0) {
          this.$message.error(this.$t('assets.directoryStructure.saveAgain'))
          item[val] = false
          return
        } else {
          let flag = true
          item.detailDtos.forEach(item => {
            if (!item.catalogTypeId) {
              flag = false
            }
          })
          if (!flag) {
            this.$message.error(
              this.$t('assets.directoryStructure.selectAdirectory')
            )
            item[val] = false
            return
          }
        }
      }
      if (!item[val]) {
        //  要禁用
        if (val === 'catalogStraightPublish' && item.catalogUnderReview) {
          this.$message.error(this.$t('assets.directoryStructure.disabled'))
          item[val] = true
          return
        } else if (val === 'assetsStraightPublish' && item.assetsUnderReview) {
          this.$message.error(this.$t('assets.directoryStructure.disabled2'))
          item[val] = true
          return
        } else if (
          val === 'openStatus' &&
          (item.assetsUnderReview || item.catalogUnderReview)
        ) {
          let mes = item.catalogUnderReview
            ? this.$t('assets.directoryStructure.disabled')
            : this.$t('assets.directoryStructure.disabled2')
          this.$message.error(mes)
          item[val] = true
          return
        }
      }
      if (item.id) {
        let params = {
          id: item.id,
          obj: {
            key: val,
            value: item[val],
          },
        }
        this.loading = true
        HTTP.updataStructure(params)
          .then(res => {
            this.$message.success(
              this.$t('assets.directoryStructure.modifiedSuccessfully')
            )
            this.loading = false
            if (val === 'openStatus' && item[val]) {
              this.saveItem(item, 'openStatus')
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // settingCOm 方法
    callback(ary) {
      ary.forEach(item => {
        item.firstName = item.fullName
        item.tagName = item.fullName
        this.structure.structureManagerDto.push(item)
      })
    },
    properties(item) {
      // item.id = item.catalogTypeId
      let itemval = this.options.filter(k => {
        return k.id === item.catalogTypeId
      })
      this.catalogType = itemval.length === 0 ? item : itemval[0]
      this.extendVisible = true
    },
    completion(item) {
      // item.id = item.catalogTypeId
      let itemval = this.options.filter(k => {
        return k.id === item.catalogTypeId
      })
      this.catalogType = itemval.length === 0 ? item : itemval[0]
      this.dialogVisible = true
    },
    // 切换时查询出支持的数据资产类型
    contentsChange(item) {
      let itemval = this.options.filter(k => {
        return k.id === item.catalogTypeId
      })
      itemval.length !== 0 && (item.icon = itemval[0].icon)
      let ary = []
      itemval.length !== 0 &&
        itemval[0].assetsType.forEach(k => {
          ary.push(this.typeTran(k))
        })
      item.typeAsset = ary.join('，')
    },
    // 选择过的类型不能再选择
    optionsFocus() {
      let selectList = []
      this.structure.detailDtos.forEach(item => {
        item.catalogTypeId && selectList.push(item.catalogTypeId)
      })
      let newOpt = []
      this.options.forEach(item => {
        if (selectList.indexOf(item.id) !== -1) {
          item.disabled = true
        } else {
          item.disabled = false
        }
        newOpt.push(item)
      })
      this.$emit('setOptions', newOpt)
    },
    typeTran(val) {
      switch (val) {
        case 'CATALOG':
          return this.$t('assets.generalSettings.none')
        case AssetsTypeEnum.DATA_COLLECTION:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        case AssetsTypeEnum.DOMAIN:
          return this.$t('assets.generalSettings.standard')
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        case AssetsTypeEnum.DATA_SERVICE:
          return this.$t('assets.generalSettings.service')
      }
    },
    handleClose() {
      this.dialogVisible = false
      this.extendVisible = false
    },
    upAwayClick(item) {
      item.allPutAway = !item.allPutAway
      if (!item.allPutAway) {
        item.upDown = this.$t('assets.directoryStructure.putAway')
      } else {
        item.upDown = this.$t('assets.directoryStructure.expand')
      }
      this.$emit('setAway')
    },
    delet(index, item) {
      this.$emit('delet', { index, item })
    },
    // 保存目录空间
    saveItem(item, openStatus) {
      this.upDown = this.$t('assets.directoryStructure.putAway')
      this.allPutAway = false
      this.$emit('saveItem', { item, openStatus })
    },
    remoteMethod(val) {
      this.page = 1
      this.keyWord = val
      clearTimeout(this.keywordTimeout)
      this.keywordTimeout = setTimeout(() => {
        this.$emit('getAllUserPage', { page: this.page, keywords: val })
      }, 300)
    },
    selectFocus(keywords) {
      this.page = 1
      this.keyWord = keywords
      this.$emit('getAllUserPage', { page: this.page, keywords })
    },
    lazyloading() {
      this.page++
      this.$emit('getAllUserPage', { page: this.page, keywords: this.keyWord })
    },
  },
  mounted() {
    // this.getAlluser()
  },
}
</script>
<style lang="scss">
.tooltipBox.el-tooltip__popper.is-light {
  border: 0 !important;
  box-shadow: 0 0 6px #ccc;
}
.tooltipBox {
  .popper__arrow {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
}

.datablau-option {
  max-width: 99vw;
}
</style>
<style scoped lang="scss">
.flexDisplay {
  display: flex;
}
.blue {
  color: #409eff;
  cursor: pointer;
}
.upAway {
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
i {
  cursor: pointer;
}
.spaceBetween {
  justify-content: space-between;
}
.alignItems {
  align-items: center;
}
.marginL15 {
  margin-left: 15px;
}
.structureBox {
  position: relative;
  .color99 {
    color: #999;
  }
  .delete {
    position: relative;
    margin-right: 10px;
  }
  .saveIcon {
    margin-right: 10px;
  }
  .switchBox {
    /*margin-right: 10px;*/
    span {
      margin-right: 5px;
    }
  }
  .marginLR10 {
    margin-left: 10px;
  }
  .switch {
    padding: 0 10px;
    margin-left: 10px;
    position: relative;
    &:after {
      content: '';
      display: block;
      height: 21px;
      width: 1px;
      background: #ddd;
      position: absolute;
      left: 0px;
      top: 0;
    }
    /*&:before {*/
    /*  content: '';*/
    /*  display: block;*/
    /*  height: 21px;*/
    /*  width: 1px;*/
    /*  background: #ddd;*/
    /*  position: absolute;*/
    /*  right: 0;*/
    /*  top: 0;*/
    /*}*/
  }
  .tableOfContents {
    /*border-radius: 10px;*/
    /*background: #f8f8f8;*/
    border: 1px solid #dddddd;
    padding-top: 13px;
    padding-bottom: 16px;
    margin-left: 10px;
    .til {
      border-bottom: 1px solid #dddddd;
      padding: 0 45px 10px 40px;
      & > div:nth-child(1) {
        width: 378px;
        margin-right: 50px;
      }
      & > div:nth-child(2) {
        width: 389px;
        margin-right: 69px;
      }
      & > div:nth-child(3) {
        margin-right: 69px;
      }
      span {
        color: #ff7519;
        margin-left: 10px;
      }
      b {
        font-weight: normal;
        margin-left: 88px;
      }
    }
    .tableContents {
      padding: 0px 30px 0 40px;
      & > div {
        margin-top: 13px;
      }
      & > div:nth-child(1) {
        width: 378px;
        margin-right: 30px;
      }
      & > div:nth-child(2) {
        width: 353px;
        margin-right: 90px;
      }
      .selectBox {
        margin: 0 20px 0 6px;
      }
      .iconBox span {
        margin-right: 14px;
        color: #409eff;
        cursor: pointer;
      }
    }
  }
  .marginL10 {
    margin-left: 10px;
  }
  .approverBox {
    padding-left: 33px;
    & > div {
      margin-top: 16px;
    }
    .approverDiv {
      min-width: 50%;
      max-width: 100%;
    }
    .administrator {
      margin-top: 8px;

      /deep/ .el-tag {
        display: inline-block;
        max-width: calc(100% - 20px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .approver:before {
      content: '*';
      color: #e8331e;
      font-size: 19px;
      position: relative;
      top: 7px;
    }
  }
}
.tipCon {
  width: 248px;
  overflow: auto;
  margin-top: -10px;
  li {
    float: left;
    padding: 6px 10px;
    background: rgba(85, 85, 85, 0.05);
    margin-bottom: 10px;
    margin-right: 10px;
    font-size: 12px;
    border-radius: 2px;
    &:nth-child(3n) {
      margin-right: 0;
    }
  }
}
.clor77 {
  color: #777;
}
.icon-bianji {
  color: #999;
  &:hover {
    color: #409eff;
  }
}
.levelImage {
  margin-left: 19px;
  img {
    width: 16px;
    height: 16px;
  }
}
</style>
