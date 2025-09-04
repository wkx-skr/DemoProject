<template>
  <div>
    <datablau-form-submit class="table-row" ref="tableOuter">
      <div class="boxNameTop detailBox">
        <!--    基本信息-->
        <datablau-detail-subtitle
          :title="$t('assets.taskManage.baseInfoTitle')"
          mt="20px"
          mb="10px"
        ></datablau-detail-subtitle>
        <el-form
          class="add-form"
          label-position="right"
          label-width="46px"
          :model="structure"
          ref="addForm"
          :rules="rules"
        >
          <!-- 当form表单中只用一个input时，敲回车键默认调用submit事件，或，刷新当前页面 -->
          <el-form-item prop="name" style="display: none">
            <datablau-input v-model="structure.name"></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('assets.directoryStructure.name')"
            prop="name"
            class="structure-name"
          >
            <datablau-input
              v-model="structure.name"
              clearable
              show-word-limit
              maxlength="100"
              @blur="propNameBlur(structure)"
              :class="{ repeatNameType: mes }"
              :placeholder="$t('common.placeholder.prefix')"
              style="width: 865px"
            ></datablau-input>
            <span v-if="mes" class="repeatNameTypeText">
              {{ $t('assets.directoryStructure.existStructure') }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('assets.directoryStructure.describe')"
            prop="description"
          >
            <datablau-input
              v-model="structure.description"
              type="textarea"
              show-word-limit
              clearable
              maxlength="1000"
              :placeholder="$t('common.placeholder.prefix')"
              style="width: 865px"
            ></datablau-input>
          </el-form-item>
        </el-form>
        <div class="flexDisplay alignItems">
          <datablau-checkbox
            :checkboxType="'single'"
            class="straightCheck"
            v-model="structure.openStatus"
            @change="changeValue(structure, 'openStatus')"
          ></datablau-checkbox>
          <div class="switchBtn">
            <span>
              {{ $t('assets.directoryStructure.openStatusWeight') }}
            </span>
            {{ $t('assets.directoryStructure.openStatus') }}
          </div>
        </div>
        <div class="flexDisplay" style="margin-top: 16px">
          <datablau-checkbox
            :checkboxType="'single'"
            class="straightCheck"
            @change="changeValue(structure, 'catalogStraightPublish')"
            v-model="structure.catalogStraightPublish"
          ></datablau-checkbox>
          <div class="switchBtn">
            <span>
              {{
                $t('assets.directoryStructure.catalogStraightPublishWeight1')
              }}
            </span>
            {{ $t('assets.directoryStructure.catalogStraightPublish1') }}
            <span>{{ $t('assets.directoryStructure.publishWeight') }}</span>
            {{ $t('assets.directoryStructure.catalogStraightPublish') }}
          </div>
        </div>
        <div class="flexDisplay" style="margin-top: 16px">
          <datablau-checkbox
            :checkboxType="'single'"
            class="straightCheck"
            @change="changeValue(structure, 'assetsStraightPublish')"
            v-model="structure.assetsStraightPublish"
          ></datablau-checkbox>
          <div class="switchBtn">
            <span>
              {{ $t('assets.directoryStructure.assetsStraightPublish') }}
            </span>
            {{ $t('assets.directoryStructure.catalogStraightPublish1') }}
            <span>{{ $t('assets.directoryStructure.publishWeight') }}</span>
            {{ $t('assets.directoryStructure.assetsStraightPublishText') }}
          </div>
        </div>
        <!--    层级管理-->
        <datablau-detail-subtitle
          :title="$t('assets.directoryStructure.levelManagement')"
          mt="20px"
          mb="10px"
        ></datablau-detail-subtitle>
        <datablau-radio
          :radioTitle="$t('assets.directoryStructure.level')"
          v-model="level"
          @change="radioChang"
          :disabled="structure.openStatus && Boolean(structure.id)"
        >
          <el-radio
            :label="item.value"
            v-for="item in propertyNew"
            :key="item.value"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </el-radio>
        </datablau-radio>
        <div class="tableOfContents">
          <div class="tableOf">
            <div class="til flexDisplay">
              <div>
                {{ $t('assets.directoryStructure.icon') }}
              </div>
              <div>{{ $t('assets.directoryStructure.dataAssetTex') }}</div>
              <div>{{ $t('assets.directoryStructure.supportDataAssets') }}</div>
            </div>
            <div
              class="tableContents flexDisplay alignItems"
              v-for="(items, index) in filter"
              :key="'structure' + index"
            >
              <div class="levelImage">
                <img :src="url + items.icon" alt="" v-if="items.icon" />
                <img :src="imgList" alt="" v-if="!items.icon" />
              </div>
              <div class="flexDisplay alignItems selectTypeBox">
                <datablau-select
                  v-model="items.catalogTypeId"
                  @change="contentsChange(items, index)"
                  @focus="optionsFocus"
                  @clear="optionsFocus"
                  :disabled="
                    items.inUse ||
                    (structure.openStatus && !structure.newLevel && items.id)
                  "
                  clearable
                  :class="[
                    'selectBox',
                    {
                      detailDtosBorderRead:
                        detailDtosBorderRead &&
                        catalogTypeErrorIndex.indexOf(index) !== -1,
                    },
                  ]"
                  style="width: 280px"
                  filterable
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
                    <div>
                      <datablau-detail-subtitle
                        :title="$t('assets.directoryStructure.extendAttr')"
                        mt="5px"
                        mb="5px"
                      ></datablau-detail-subtitle>
                      <div
                        class="flexDisplay udps"
                        v-for="v in items.udps"
                        :key="v.id"
                      >
                        <div class="propName">{{ v.propName }}</div>
                        <div class="propType">
                          {{ propertyCharacter[v.type] }}
                        </div>
                        <div>{{ v.typeData }}</div>
                      </div>
                    </div>
                    <datablau-detail-subtitle
                      :title="$t('assets.directoryStructure.completion')"
                      mt="10px"
                      mb="5px"
                    ></datablau-detail-subtitle>
                    <div>
                      {{ $t('assets.directoryStructure.formula') }}：{{
                        items.textMula
                      }}
                    </div>
                  </div>
                  <i class="iconfont icon-tips"></i>
                </el-tooltip>
              </div>
              <div>
                {{ getType(items.assetsTypes) }}
              </div>
            </div>
          </div>
        </div>
        <!--        管理信息-->
        <datablau-detail-subtitle
          :title="$t('assets.directoryStructure.management')"
          mt="20px"
          mb="10px"
        ></datablau-detail-subtitle>
        <div class="approverBox">
          <div class="flexDisplay alignItems approverDiv">
            <span class="approver">
              {{ $t('assets.directoryStructure.directoryApprover') }}
            </span>

            <datablau-select
              v-model="structure.approver"
              clearable
              filterable
              remote
              :disabled="!!(structure.openStatus && !structure.newLevel)"
              :class="['marginL10', { borderRead: borderRead }]"
              :placeholder="$t('assets.directoryStructure.pleaseChoose')"
              style="width: 255px; height: 34px"
              popper-class="popperClass"
              :popper-append-to-body="true"
              :remote-method="remoteMethod"
              @visible-change="selectFocus('')"
              @clear="selectFocus('')"
              @change="selectChange"
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
            <span class="borderReadText" v-if="borderRead">
              {{ $t('assets.generalSettings.choose') }}
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
              class="settingCom"
              :disabled="structure.openStatus && !structure.newLevel"
              :close="structure.inUse"
              :list="structure.structureManagerDto || []"
              :allSelected="allSelect || []"
              :getCallback="true"
              :width="'865px'"
              type="MANAGER"
              @primary="callback"
              @handleClose="settingClose"
            ></settingCom>
            <span class="borderReadText" v-if="manager">
              {{ $t('assets.generalSettings.choose') }}
            </span>
          </div>
          <div class="flexDisplay alignItems radioBox">
            <!--            v-model="radioValue"-->
            <datablau-radio
              :radioTitle="$t('assets.directoryStructure.publicDisplay')"
              v-model="structure.publicShow"
              :disabled="structure.openStatus && !structure.newLevel"
              @change="publicChange"
            >
              <el-tooltip
                placement="right"
                effect="light"
                popper-class="tooltipBox"
                :content="$t('assets.directoryStructure.publicDisplayText')"
              >
                <i class="iconfont icon-tips tipsIcon"></i>
              </el-tooltip>
              <el-radio :label="false">
                {{ $t('assets.directoryStructure.no') }}
              </el-radio>
              <el-radio :label="true">
                {{ $t('assets.directoryStructure.yes') }}
              </el-radio>
            </datablau-radio>
            <span v-if="publicBorderRed">
              {{ $t('assets.generalSettings.choose') }}
            </span>
          </div>
        </div>
      </div>
      <template slot="buttons">
        <div class="left-button">
          <datablau-button type="important" @click="primary" class="straight">
            {{ $t('assets.common.sure') }}
          </datablau-button>
          <datablau-button
            type="cancel"
            class="white-btn"
            @click="cancelbtn"
          ></datablau-button>
        </div>
      </template>
    </datablau-form-submit>
  </div>
</template>

<script>
import defaultLevelImg from '@/assets/images/dataAssets/leve0.png'
import settingCom from '../components/settingCom'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import HTTP from '../utils/api'
export default {
  components: {
    settingCom,
  },
  props: {
    structure: {
      type: Object,
    },
    oldStructure: {
      type: Object,
    },
    options: {
      type: Array,
    },
    structureList: {
      type: Array,
    },
    user: {
      type: Array,
    },
    listShow: {
      type: Boolean,
    },
  },
  watch: {
    listShow(val) {
      this.openStatus = false
      this.borderRead = false
      this.publicBorderRed = false
      this.detailDtosBorderRead = false
      this.catalogTypeErrorIndex = []
      this.manager = false
      this.mes = false
      this.$refs.addForm && this.$refs.addForm.clearValidate()
    },
    structure: {
      handler(val) {
        if (!this.structure.detailDtos) return
        this.user = [
          {
            ...this.structure.approverDto,
            name: this.structure.approverDto?.fullUserName,
          },
        ]
        this.propertyNew.forEach(k => {
          k.disabled = false
        })

        // 标记不能减少的层级
        if (this.oldStructure.inUse) {
          this.propertyNew.forEach(k => {
            if (k.value < this.oldStructure.detailDtos.length) {
              k.disabled = true
            } else {
              k.disabled = false
            }
          })
        }
        this.level = val.detailDtos.filter(item => !item.delete).length
        // val.detailDtos.forEach(item => {
        //   this.contentsChange(item)
        // })
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    allSelect() {
      return this.structure.structureManagerDto
    },
    filter() {
      if (this.structure.detailDtos) {
        return this.structure.detailDtos.filter(item => {
          return !item.delete
        })
      }
    },
  },
  data() {
    return {
      rules: {
        name: [
          {
            message: this.$t('assets.catalogue.inputRequired'),
            trigger: 'blur',
            required: true,
          },
        ],
      },
      level: 5,
      url: window.setting.products.dam.assetsUrl + '/config/icon/',
      imgList: defaultLevelImg,
      page: 1,
      keyWord: '',
      keywordTimeout: null,
      propertyNew: [
        {
          value: 1,
          label: this.$t('assets.directoryStructure.firstLevel'),
          disabled: false,
        },
        {
          value: 2,
          label: this.$t('assets.directoryStructure.twoLevel'),
          disabled: false,
        },
        {
          value: 3,
          label: this.$t('assets.directoryStructure.threeLevel'),
          disabled: false,
        },
        {
          value: 4,
          label: this.$t('assets.directoryStructure.fourLevel'),
          disabled: false,
        },
        {
          value: 5,
          label: this.$t('assets.directoryStructure.fiveLevel'),
          disabled: false,
        },
      ],
      propertyCharacter: {
        STRING: this.$t('assets.directoryStructure.character'),
        ENUM: this.$t('assets.directoryStructure.enum'),
        NUM: this.$t('assets.directoryStructure.num'),
      },
      mes: false,
      borderRead: false, // 审批人红框
      detailDtosBorderRead: false, // 层级管理红框
      catalogTypeErrorIndex: [],
      publicBorderRed: false, // 公开展示提示
      manager: false, // 管理员
      dataAssetTypeMap: {},
    }
  },
  methods: {
    // 判断重名
    propNameBlur(val) {
      this.mes = false
      let flag = this.structureList.some((item, i) => {
        if (i !== val.index) {
          const sameId = val.id ? item.id === val.id : false
          const sameName = item.name && item.name === val.name
          return !sameId && sameName
        }
      })
      flag && (this.mes = this.$t('assets.directoryStructure.duplicateName'))
      !flag && (this.mes = false)
    },
    // 页面保存
    primary() {
      this.saveItem(this.structure)
    },
    // 页面取消
    cancelbtn() {
      this.$emit('cancelbtn')
    },
    // 层级单选
    radioChang(val) {
      let delList = this.structure.detailDtos.filter(item => item.delete)
      let newList = this.structure.detailDtos.filter(item => !item.delete)
      let length = newList.length
      let num = Math.abs(Number(val) - length)
      for (let i = 0; i < num; i++) {
        if (newList.length < val) {
          newList.push({
            level: newList.length + 1,
            delete: false,
            inUse: false,
            typeAsset: '',
          })
        } else if (newList.length > val) {
          let pop = newList.pop()
          pop.delete = true
          pop.id && delList.push(pop)
        }
      }
      let ary = [...newList, ...delList]

      this.$set(this.structure, 'detailDtos', ary)
    },
    // 切换时查询出支持的数据资产类型
    contentsChange(item, index) {
      if (!item.catalogTypeId) {
        item.udps = {}
        item.textMula = ''
        item.assetsTypes = []
        item.icon = ''
        return
      }
      HTTP.getTypeDet(item.catalogTypeId)
        .then(res => {
          item.udps = res.data.udps
          item.icon = res.data.icon
          item.assetsTypes = res.data.assetsType.split(',')
          let textMula = ''
          let ary = [
            ...res.data.algorithmDto.staticProperties,
            ...(res.data.algorithmDto.udpDtoList || []),
          ]
          ary.forEach(item => {
            // console.log(item)
            if (item.attribute) {
              textMula += `${this.propertyCorrespond(item.attribute)}(${
                item.weight
              }%)+`
            }
            if (item.extendProp) {
              textMula += `${item.extendProp}(${item.weight}%)+`
            }
          })
          textMula = textMula.substring(0, textMula.length - 1)
          item.textMula = textMula
          this.optionsFocus()
          const errorIndex = this.catalogTypeErrorIndex.indexOf(index)
          if (errorIndex !== -1) {
            this.catalogTypeErrorIndex.splice(errorIndex, 1)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 完成度下拉框
    propertyCorrespond(val) {
      switch (val) {
        case 'DEPT':
          return this.$t('assets.directoryStructure.dept')
        case 'DATA_BUTLER':
          return this.$t('assets.directoryStructure.butler')
        case 'ASSETS_LIST':
          return this.$t('assets.directoryStructure.assetList')
        case 'KEYWORDS':
          return this.$t('assets.directoryStructure.keywords')
        case 'DESCRIPTION':
          return this.$t('assets.directoryStructure.description')
        case 'ENGLISH_ABBREVIATION':
          return this.$t('assets.directoryStructure.english')
        default:
          return val
      }
    },
    // 类型转换
    getType(ary) {
      let type = []
      ary &&
        ary.forEach(item => {
          type.push(this.typeTran(item))
        })
      return type.join('，')
    },
    typeTran(val) {
      switch (val) {
        case 'CATALOG':
          return this.$t('assets.generalSettings.none')
        case AssetsTypeEnum.TABLE:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.VIEW:
          return this.$t('assets.generalSettings.view')
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.DATA_STANDARD:
          return this.$t('assets.generalSettings.basicStandard')
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return this.$t('assets.generalSettings.standardCode')
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        default:
          return this.dataAssetTypeMap[val] || val
      }
    },
    // 选择过的类型不能再选择
    optionsFocus() {
      let selectList = []
      this.filter.forEach(item => {
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
    selectChange(val) {
      val && (this.borderRead = false)
    },
    publicChange(val) {
      if (val != false && val != true) {
        this.publicBorderRed = true
      } else {
        this.publicBorderRed = false
      }
    },
    lazyloading() {
      this.page++
      this.$emit('getAllUserPage', { page: this.page, keywords: this.keyWord })
    },
    // settingCOm 方法
    callback(ary) {
      ary.forEach(item => {
        item.firstName = item.fullName
        item.tagName = item.fullName
        this.structure.structureManagerDto.push(item)
      })
      ary.length !== 0 && (this.manager = false)
    },
    settingClose(val) {
      this.$emit('settingClose', {
        name: val,
        index: this.index,
        structure: this.structure,
      })
    },
    // 开启关闭
    changeValue(item, val) {
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
      }
    },
    // 保存目录空间
    saveItem(item, openStatus) {
      // console.log(item)
      this.borderRead = false
      this.detailDtosBorderRead = false
      this.catalogTypeErrorIndex = []
      this.publicBorderRed = false
      this.manager = false
      this.$refs.addForm.validate()
      if (!item.approver && !openStatus) {
        this.borderRead = true
        $('.row-content').scrollTop(500)
      }
      let flag = true
      const detailDtos = item.detailDtos
      detailDtos.forEach((item, index) => {
        if (!item.catalogTypeId) {
          this.catalogTypeErrorIndex.push(index)
          flag = false
        } else {
          if (
            index !== detailDtos.length - 1 &&
            item.assetsTypes.indexOf('CATALOG') === -1
          ) {
            this.catalogTypeErrorIndex.push(index)
            flag = false
            this.$blauShowFailure(
              this.$t('assets.directoryStructure.addLevelTips')
            )
          }
        }
      })
      if (!flag) {
        this.detailDtosBorderRead = true
      } else {
        this.detailDtosBorderRead = false
      }
      if (item.publicShow === undefined && !openStatus) {
        this.publicBorderRed = true
      }
      if (item.structureManagerDto.length == 0 && !openStatus) {
        this.manager = true
        $('.row-content').scrollTop(500)
      }
      flag && this.$emit('saveItem', { item, openStatus })
    },
    getMetaModelTypes() {
      HTTP.getMetaModelTypes()
        .then(res => {
          let dataAssetTypeMap = {}
          let data = res.data || []
          data.forEach(item => {
            dataAssetTypeMap[item.assetKey] = item.name
          })
          this.dataAssetTypeMap = dataAssetTypeMap
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {
    this.getMetaModelTypes()
  },
}
</script>

<style scoped lang="scss">
.table-row {
  margin-top: 45px;
}
.add-form {
  // padding-top: 35px;
  margin-left: 50px;
  & > div {
    margin-bottom: 18px;
    position: relative;
    .repeatNameTypeText {
      position: absolute;
      bottom: -26px;
      left: 2px;
      color: #ff4b53;
    }
  }
  .structure-name {
    /deep/.el-input--suffix .el-input__inner {
      padding-right: 75px;
    }
    /deep/.el-input__icon.el-icon-circle-close.el-input__clear {
      width: 18px;
    }
    /deep/.el-input .el-input__count .el-input__count-inner {
      padding-right: 3px;
      padding-left: 0;
    }
  }
}
.detailBox {
  padding-left: 20px;
  padding-bottom: 20px;
}
/deep/.datablau-radio .radioTitle {
  margin-right: 15px;
  margin-left: 58px;
  position: relative;
  top: 1px;
  &:after {
    content: '*';
    position: absolute;
    top: 0;
    left: -9px;
    color: #e8331e;
  }
}
.flexDisplay {
  /*display: flex;*/
  /*overflow: hidden;*/
  margin-left: 97px;
  &:after {
    content: '';
    display: block;
    clear: both;
  }
  & > div,
  & > span {
    float: left;
    /*line-height: 34px;*/
  }
}
.alignItems {
  align-items: center;
  .approver {
    top: 0px;
  }
}
.approver {
  line-height: 32px;
  position: relative;
  top: -4px;
}
.administrator {
  position: relative;
  .approver {
    top: 2px;
  }
  .borderReadText {
    position: absolute;
    left: 56px;
    bottom: -15px;
    color: #ff4b53;
  }
}
.approverBox .settingCom {
  margin-top: -17px;
}
.levelImage {
  width: 32px;
  height: 32px;
  /*border: 1px solid rgba(64, 158, 255, 0.2);*/
  border-radius: 32px;
  text-align: center;
  line-height: 32px;
  img {
    width: 20px;
    height: 20px;
    margin-top: -3px;
  }
}
.tableOfContents {
  /*border-radius: 10px;*/
  /*background: #f8f8f8;*/
  border: 1px solid #dddddd;
  padding-top: 13px;
  padding-bottom: 16px;
  margin-left: 97px;
  width: 900px;
  margin-top: 26px;
  .flexDisplay {
    margin-left: 16px;
  }
  .til {
    border-bottom: 1px solid #dddddd;
    padding: 0 45px 10px 24px;
    font-weight: bold;
    & > div:nth-child(1) {
      margin-right: 34px;
    }
    & > div:nth-child(2) {
      margin-right: 292px;
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
    padding: 0px 30px 0 20px;
    line-height: 34px;
    & > div {
      margin-top: 13px;
    }
    & > div:nth-child(1) {
      margin-right: 22px;
    }
    & > div:nth-child(2) {
      margin-right: 39px;
    }
    .selectBox {
      margin: 0 8px 0 6px;
    }
    .iconBox span {
      margin-right: 14px;
      color: #409eff;
      cursor: pointer;
    }
  }
}
.tipCon {
  width: 100%;
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
/deep/.el-textarea .el-input__count {
  bottom: 1px !important;
}
/deep/.el-textarea__inner {
  padding-bottom: 20px;
}
/deep/.el-switch {
  padding-top: 3px;
}
/deep/.datablau-select .el-select .el-input input {
  height: 100% !important;
}
.radioBox {
  position: relative;
  /deep/ .datablau-radio .radioTitle {
    margin-left: 10px;
    margin-right: 0;

    &:after {
      top: 0px;
      left: -8px;
      color: #ff4b53;
      font-size: 12px;
    }
  }
  & > span {
    color: #ff4b53;
    position: absolute;
    bottom: -17px;
    left: 55px;
  }
}
.tipsIcon {
  position: relative;
  top: 1px;
  margin-right: 10px;
}
/deep/.datablau-switch .textdesc .el-switch__label.is-active {
  top: 1px;
}
/deep/ .repeatNameType .el-input__inner {
  border-color: #ff4b53;
}
/*.repeatNameType {
  position: relative;
  &::after {
    content: '已有该类型';
    position: absolute;
    bottom: -17px;
    font-size: 12px;
    color: #ff4b53;
    left: 0;
    top: 24px;
  }
}*/
.selectTypeBox {
  margin-left: 0;
}
</style>
<style lang="scss">
.detailDtosBorderRead.datablau-select .el-select .el-input input {
  border-color: #ff4b53;
  &:hover {
    border-color: #ff4b53;
  }
}
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
.udps div {
  margin-right: 10px;
}
.approverBox {
  // padding-left: 23px;
  .flexDisplay {
    margin-left: 50px;
  }
  .marginL10 {
    margin: 0 10px;
  }
  & > div {
    margin-top: 16px;
  }
  .approverDiv {
    min-width: 50%;
    max-width: 100%;
    line-height: 34px;
    position: relative;
    .borderReadText {
      position: absolute;
      left: 59px;
      bottom: -25px;
      color: #ff4b53;
    }
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
    font-size: 12px;
    position: relative;
    top: 0px;
  }
}
.switchBtn {
  line-height: 21px;
  span {
    font-weight: bold;
  }
}
.propName {
  width: 96px;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.propType {
  // width: 40px;
  margin: 0 20px;
}
</style>
