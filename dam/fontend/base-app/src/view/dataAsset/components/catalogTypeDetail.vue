<template>
  <div>
    <datablau-form-submit class="table-row" ref="tableOuter">
      <div class="detailBox">
        <el-form
          class="add-form"
          label-position="right"
          label-width="180px"
          :model="typeDetailData"
          ref="addForm"
          :rules="rules"
        >
          <el-form-item
            :label="$t('assets.generalSettings.typeName')"
            prop="name"
          >
            <!--            :class="{
                repeatName: typeDetailData.mes,
                empty: typeDetailData.class,
              }"-->
            <datablau-input
              v-model="typeDetailData.name"
              @blur="propNameBlur(typeDetailData)"
              :class="{ repeatNameType: mes }"
              clearable
              maxlength="20"
              :placeholder="$t('assets.generalSettings.placeholder')"
              style="width: 530px"
            ></datablau-input>
            <!--            <div class="" v-else>{{ typeDetailData.name }}</div>-->
            <span v-if="mes" class="repeatNameTypeText">
              {{ $t('assets.generalSettings.typeAlready') }}
            </span>
          </el-form-item>
          <el-form-item
            :label="$t('assets.generalSettings.add')"
            prop="assetsType"
          >
            <datablau-select-weak
              :class="[{ empty: typeDetailData.class }, 'typeSelect']"
              popper-class="eloption"
              multiple
              allow-create
              clearable
              @focus="setItemOptions(typeDetailData)"
              v-model="typeDetailData.assetsType"
              @change="setModify(typeDetailData)"
              :placeholder="$t('assets.generalSettings.please')"
              style="width: 530px"
              @selectAll="k => selectAll(k, typeDetailData)"
              :optionsData="{
                data: options,
                key: 'value',
                value: 'value',
                label: 'label',
                showAll: true,
                all: typeDetailData.all,
              }"
            ></datablau-select-weak>
          </el-form-item>
        </el-form>
        <!-- 扩展属性 -->
        <div class="completeness udps">
          <datablau-detail-subtitle
            :title="$t('assets.generalSettings.extended')"
            mt="8px"
            mb="16px"
          ></datablau-detail-subtitle>
          <p>
            <i class="iconfont icon-tips"></i>
            {{ $t('assets.generalSettings.directoryType') }}
          </p>
        </div>
        <div class="udpsBox">
          <div
            class="detailFlex alignItem marginB20"
            v-for="(item, index) in udpsList"
            :key="item.id"
          >
            <div class="detailFlex inputbox">
              <div class="repeatNameBox">
                <datablau-input
                  v-model="item.propName"
                  :disabled="
                    (typeDetailData.inUse && typeDetailData.publishStatus) ||
                    typeDetailData.underReviewStatus ||
                    item.inUse ||
                    item.algoInuse
                  "
                  :placeholder="$t('assets.generalSettings.within8')"
                  @blur="udpsNameBlur(item, index)"
                  :class="{ error: item.mes }"
                  maxlength="8"
                  style="width: 160px"
                ></datablau-input>
                <span v-if="item.mes" class="repeatNameText">
                  {{ item.mes }}
                </span>
              </div>
              <div style="position: relative">
                <datablau-select-weak
                  clearable
                  :disabled="
                    (typeDetailData.inUse && typeDetailData.publishStatus) ||
                    typeDetailData.underReviewStatus ||
                    item.inUse ||
                    item.algoInuse
                  "
                  allow-create
                  class="udpsSelect"
                  :class="{ error: item.typeError }"
                  @change="typeChang(item, index)"
                  v-model="item.type"
                  style="width: 140px; height: 34px"
                  :placeholder="$t('assets.generalSettings.pleasePropType')"
                  :optionsData="{
                    data: propertyCharacter,
                    key: 'value',
                    value: 'value',
                    label: 'label',
                  }"
                ></datablau-select-weak>
                <span v-if="item.typeError" class="error-msg">
                  {{ item.typeError }}
                </span>
              </div>
            </div>
            <div v-show="item.type === 'ENUM'">
              <div style="position: relative">
                <datablau-input
                  :disabled="
                    (typeDetailData.inUse && typeDetailData.publishStatus) ||
                    typeDetailData.underReviewStatus ||
                    item.inUse ||
                    item.algoInuse
                  "
                  v-model="item.typeData"
                  @change="handleTypeDataChange(item, index)"
                  :placeholder="$t('assets.generalSettings.semicolons')"
                  style="width: 240px"
                  :class="{ error: item.enumError }"
                ></datablau-input>
                <span v-if="item.enumError" class="error-msg">
                  {{ item.enumError }}
                </span>
              </div>
            </div>
            <div class="checkBox detailFlex alignItem">
              <datablau-checkbox
                :checkboxType="'single'"
                v-model="item.required"
                :disabled="
                  (typeDetailData.inUse && typeDetailData.publishStatus) ||
                  typeDetailData.underReviewStatus ||
                  item.inUse ||
                  item.algoInuse
                "
              >
                {{ $t('assets.generalSettings.required') }}
              </datablau-checkbox>
            </div>
            <div class="iconbox">
              <!--           v-show="udpsList.length - 1 !== 0"-->
              <span v-show="!item.algoInuse">
                <i
                  :class="{
                    iconfont: true,
                    'icon-delete': true,
                    blu: !item.inUse,
                    clor9: item.inUse || udpsFlag,
                  }"
                  v-show="
                    !typeDetailData.publishStatus &&
                    !typeDetailData.underReviewStatus
                  "
                  @click="udpsDelWeight(index, item)"
                ></i>
              </span>

              <!--              v-show="currentCompletion.length - 1 === index"-->
              <span
                v-show="
                  !typeDetailData.publishStatus &&
                  !typeDetailData.underReviewStatus
                "
              >
                <i
                  class="iconfont icon-tianjia blu"
                  @click="udpsAddWeights"
                  v-show="udpsList.length - 1 === index"
                ></i>
                <i class="zhanw blu" v-show="udpsList.length - 1 !== index"></i>
              </span>
            </div>
          </div>
        </div>
        <!-- 完成度 -->
        <div class="completeness">
          <datablau-detail-subtitle
            :title="$t('assets.directoryStructure.completion')"
            mt="8px"
            mb="4px"
          ></datablau-detail-subtitle>
          <p class="textMula">
            {{ $t('assets.generalSettings.calculationFormula') }}：
            <span>
              <span
                v-for="(item, index) in validCompletion.length
                  ? validCompletion
                  : textMula"
                :key="item.key"
                class="completion-item"
              >
                <span>
                  <is-show-tooltip
                    :content="
                      propertyCorrespond(item.attribute) + ' ' + item.weight
                    "
                    :open-delay="200"
                    placement="top"
                  ></is-show-tooltip>
                </span>
                {{
                  index ===
                  (validCompletion.length ? validCompletion : textMula).length -
                    1
                    ? ''
                    : '+'
                }}
              </span>
              =
              <span
                class="weightNum"
                :class="weightNum > 100 ? 'superNum' : ''"
              >
                {{ weightNum }}%
              </span>
            </span>
          </p>
        </div>
        <div class="compleInputBox">
          <div class="baseline">
            <span>{{ $t('assets.generalSettings.baseline') }}</span>
            <datablau-input
              v-model="typeDetailData.publishPercent"
              type="number"
              :placeholder="$t('assets.generalSettings.default60')"
              @input.native="numberMax"
              class="default60"
              style="width: 140px"
            ></datablau-input>
            <i class="iconfont icon-tips"></i>
            <div class="complete-tips">
              完成度到达一定基数，允许目录提交发布审批流程
            </div>
          </div>
          <div
            class="mulu detailFlex"
            v-for="(item, index) in currentCompletion"
            :key="item.id"
          >
            <div class="detailFlex">
              <span>
                {{ $t('assets.generalSettings.calculationProperties') }}
              </span>

              <datablau-select-weak
                clearable
                allow-create
                v-model="item.attribute"
                @change="setTextMula(item)"
                @focus="attributeSelect"
                @clear="attributeSelect"
                :ceholder="$t('assets.generalSettings.computed')"
                style="width: 180px"
                :class="{ borderRed: attributeFlag && !item.attribute }"
                :optionsData="{
                  data: propertyNew,
                  key: 'value',
                  value: 'value',
                  label: 'label',
                }"
              ></datablau-select-weak>
              <!--         propertyNew  --- 加过逻辑以后的完成度下拉框   -->
            </div>
            <div class="detailFlex">
              <span>{{ $t('assets.generalSettings.proportionofweight') }}</span>
              <datablau-input
                :class="['weight', { borderRed: muluTextFlag && !item.weight }]"
                v-model="item.weight"
                @mousewheel.native.prevent
                :placeholder="$t('assets.generalSettings.weight')"
                style="width: 140px"
                @input="checkInt(item, item.weight)"
                @blur="setTextMula(item)"
              ></datablau-input>
            </div>
            <div>
              <i
                :class="['iconfont icon-delete blu', { clor9: compleFlag }]"
                @click="delWeight(item, index)"
              ></i>
              <i
                class="iconfont icon-tianjia blu"
                v-show="currentCompletion.length - 1 === index"
                @click="addWeights"
              ></i>
              <i
                class="zhanw blu"
                v-show="currentCompletion.length - 1 !== index"
              ></i>
            </div>
          </div>
        </div>
      </div>
      <template slot="buttons">
        <div class="left-button">
          <datablau-button type="important" @click="primary">
            {{ $t('assets.directoryStructure.saves') }}
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
import HTTP from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  props: {
    typeDetailData: {
      type: Object,
    },
    areas: {
      type: Array,
    },
    options: {
      type: Array,
    },
    old: {
      type: Object,
    },
    typeDetail: {
      type: Boolean,
    },
  },
  components: { isShowTooltip },
  watch: {
    typeDetail: {
      handler(val) {
        if (val && this.typeDetailData) {
          this.muluTextFlag = false
          this.attributeFlag = false
          this.mes = false
          this.$refs.addForm && this.$refs.addForm.clearValidate()
          this.udpsList =
            this.typeDetailData.udps && this.typeDetailData.udps.length != 0
              ? this.typeDetailData.udps
              : _.cloneDeep(this.udpsListOld)
          // 完成度下拉
          this.setPropertyNew()
          // 完成度
          if (this.typeDetailData.algorithms) {
            this.currentCompletion = [
              ...(this.typeDetailData.algorithms.udpDtoList || []),
              ...(this.typeDetailData.algorithms.staticProperties || []),
            ]
            this.currentCompletion.length === 0 &&
              (this.currentCompletion = _.cloneDeep(this.currentCompletionOld))
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      addForm: {},
      mes: false,
      rules: {
        name: [
          {
            message: this.$t('assets.generalSettings.typeNameRequired'),
            trigger: 'blur',
            required: true,
          },
        ],
        assetsType: [
          {
            message: this.$t('assets.generalSettings.assetsTypeRequired'),
            trigger: ['blur', 'change'],
            required: true,
          },
        ],
      },
      udpRules: {},
      textMula: [
        {
          attribute: '数据权属',
          weight: 25,
        },
        {
          attribute: '资产清单',
          weight: 20,
        },
        {
          attribute: '数据管家',
          weight: 20,
        },
        {
          attribute: '关键字',
          weight: 10,
        },
        {
          attribute: '描述',
          weight: 15,
        },
        {
          attribute: '英文简称',
          weight: 10,
        },
      ],
      publishPercent: 60,
      currentCompletion: [],
      currentCompletionOld: [
        {
          attribute: '',
          weight: '',
          delete: false,
        },
      ], // 现有完成度计算
      propertyNew: [],
      muluTextFlag: false, // 标红
      attributeFlag: false, // 标红
      udpsList: [],
      udpsListOld: [
        {
          propName: '',
          type: '',
          delete: false,
          typeData: null,
          required: false,
        },
      ],
      propertyCharacter: [
        { value: 'STRING', label: this.$t('assets.generalSettings.character') },
        { value: 'ENUM', label: this.$t('assets.generalSettings.enum') },
        { value: 'NUM', label: this.$t('assets.generalSettings.num') },
      ],
      property: [
        { label: this.$t('assets.generalSettings.dept'), value: 'DEPT' },
        {
          label: this.$t('assets.generalSettings.butler'),
          value: 'DATA_BUTLER',
        },
        {
          label: this.$t('assets.generalSettings.assetList'),
          value: 'ASSETS_LIST',
        },
        {
          label: this.$t('assets.generalSettings.keywords'),
          value: 'KEYWORDS',
        },
        {
          label: this.$t('assets.generalSettings.description'),
          value: 'DESCRIPTION',
        },
        {
          label: this.$t('assets.generalSettings.english'),
          value: 'ENGLISH_ABBREVIATION',
        },
      ],
      delCompletion: [], // 完成度删除的数据集
      delUdpsList: [], // 扩展属性删除的数据集
      // weightNum: '100',
    }
  },
  methods: {
    numberMax(e) {
      // console.log(val)
      // let isNumber = /^\d*$/.test(e.target.value)
      e.target.value = e.target.value.replace(/\D/g, '')
      this.typeDetailData.publishPercent =
        (e.target.value >= 0 &&
          e.target.value <= 100 &&
          e.target.value.match(/^\d*/g)[0]) ||
        ''
      // this.typeDetailData.publishPercent = ''
    },
    // 资产类型
    getText(val) {
      let valAry = val
      if (typeof val === 'string') {
        valAry = val.split(',')
      }
      let ary = valAry.map(item => {
        return this.dataText(item)
      })
      if (ary.length === 7) return this.$t('assets.generalSettings.allType')
      return ary.join(',')
    },
    dataText(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        // case AssetsTypeEnum.DATA_COLLECTION: // 后端改完后删除
        //   return AssetsTypeEnum.DATA_COLLECTION
        case AssetsTypeEnum.TABLE:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.VIEW:
          return this.$t('assets.generalSettings.view')
        // case AssetsTypeEnum.DOMAIN:
        //   return 'DOMAIN'
        case AssetsTypeEnum.DATA_STANDARD:
          return this.$t('assets.generalSettings.basicStandard')
        case AssetsTypeEnum.DATA_STANDARD_CODE:
          return this.$t('assets.generalSettings.standardCode')
        // case 'DOCUMENT':
        //   return '本地文档'
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        case AssetsTypeEnum.DATA_SERVICE:
          return this.$t('assets.generalSettings.service')
        case 'CATALOG':
          return this.$t('assets.generalSettings.none')
      }
    },
    // 判断扩展属性重名
    udpsNameBlur(val, index) {
      val.mes = null
      let flag = this.udpsList.some((item, i) => {
        item.mes = null
        if (i !== index) {
          return item.propName && item.propName === val.propName
        }
      })
      flag && (val.mes = '已有该属性')
      this.$set(this.udpsList, index, val)
    },
    // 判断重名
    propNameBlur(val) {
      this.mes = null
      let flag = this.areas
        .filter(item => {
          return !item.delete
        })
        .some((item, i) => {
          // item.mes = null
          if (i !== val.index) {
            return item.name && item.name === val.name
          }
        })
      flag && (this.mes = '已有该属性')
      !flag && (this.mes = false)
    },
    // 判断下拉是否全选
    setModify(item) {
      if (item.id) {
        item.modify = true
        this.$set(this.areas, item.index, item)
      }
      item.assetsType.length === this.options.length
        ? (item.all = true)
        : (item.all = false)
      if (item.assetsType.length) {
        this.$refs.addForm.clearValidate('assetsType')
      }
    },
    // 设置下拉禁止取消选择
    setItemOptions(item) {
      this.options.forEach(item => {
        item.disabled = false
      })
      const inUse = this.areas[item.index] && this.areas[item.index].inUse
      const assetsType = this.old ? this.old.assetsType : []
      if (inUse) {
        this.options.forEach(k => {
          if (assetsType.indexOf(k.value) !== -1) {
            k.disabled = true
          }
        })
      }
      this.$set(this.areas, item.index, item)
    },
    // 全选
    selectAll(flag, item) {
      item.all = flag
      // item.assetsType = item.assetsType || []
      if (flag) {
        this.options.forEach(k => {
          item.assetsType.indexOf(k.value) === -1 &&
            item.assetsType.push(k.value)
        })
      } else {
        item.assetsType = []
        this.options.forEach(k => {
          k.disabled && item.assetsType.push(k.value)
        })
      }
    },
    setPropertyNew() {
      this.udpsList.forEach(item => {
        item.value = item.propName
        item.label = item.propName
      })
      this.propertyNew = [...this.property, ...this.udpsList].filter(
        item => item.label
      )
    },
    attributeSelect(val) {
      this.setPropertyNew()
      let ary = []
      this.currentCompletion.forEach(item => {
        ary.push(item.attribute || item.extendProp)
      })
      let property = []
      this.propertyNew.forEach((item, index) => {
        if (ary.indexOf(item.value) !== -1) {
          item.disabled = true
        } else if (item.propName && item.type === '') {
          item.disabled = true
        } else if (
          item.propName &&
          item.type === 'ENUM' &&
          item.typeData === ''
        ) {
          item.disabled = true
        } else {
          item.disabled = false
        }
        property.push(item)
      })
      this.propertyNew = property
    },
    setTextMula(item) {
      this.attributeSelect()
      let attr = item.extendProp || item.attribute
      let ary = this.currentCompletion.map(item => item.attribute)
      this.udpsList.forEach(item => {
        if (item.propName && ary.indexOf(item.propName) !== -1) {
          item.inUse = true
        } else {
          item.inUse = false
        }
      })
    },
    // 只能输入数字
    checkInt(obj, val) {
      const reg = /[^0-9$]/g
      let number = val.replace(reg, '')
      if (number == 0 || ['e', 'E', '+', '-'].includes(val)) {
        number = ''
      }
      if (number > 100) {
        number = number.slice(0, -1)
      }
      this.$set(obj, 'weight', number)
    },
    // 完成度下拉框
    propertyCorrespond(val) {
      switch (val) {
        case 'DEPT':
          return this.$t('assets.generalSettings.dept')
        case 'DATA_BUTLER':
          return this.$t('assets.generalSettings.butler')
        case 'ASSETS_LIST':
          return this.$t('assets.generalSettings.assetList')
        case 'KEYWORDS':
          return this.$t('assets.generalSettings.keywords')
        case 'DESCRIPTION':
          return this.$t('assets.generalSettings.description')
        case 'ENGLISH_ABBREVIATION':
          return this.$t('assets.generalSettings.english')
        default:
          return val
      }
    },
    // 删除完成度
    delWeight(item, index) {
      this.muluTextFlag = false
      this.attributeFlag = false
      if (this.compleFlag) {
        return
      }
      if (!Object.values(item).some(item => item)) {
        this.currentCompletion.splice(index, 1)
        return
      }
      this.$DatablauCofirm(
        this.$t('assets.generalSettings.irreversible'),
        this.$t('assets.generalSettings.hint'),
        {
          cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
          confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
        }
      )
        .then(() => {
          let delitem = this.currentCompletion.splice(index, 1)
          if (this.currentCompletion.length === 0) {
            this.currentCompletion.push({
              attribute: '',
              weight: '',
              delete: false,
            })
          }
          if (delitem[0].id) {
            delitem[0].delete = true
            this.delCompletion.push(delitem[0])
          }
        })
        .catch(() => {})
    },
    addWeights() {
      this.muluTextFlag = false
      this.attributeFlag = false
      let w = 0
      this.currentCompletion.forEach(item => {
        w += Number(item.weight)
      })
      this.$set(this.currentCompletion, this.currentCompletion.length, {
        attribute: '',
        weight: '',
      })
    },
    // 扩展属性添加
    udpsAddWeights() {
      this.$set(this.udpsList, this.udpsList.length, {
        attributesName: '',
        attributesType: '',
        delete: false,
        typeData: null,
        required: false,
      })
    },
    // 扩展属性是否重名
    searchSome() {
      for (let k = 0; k < this.udpsList.length; k++) {
        this.udpsList[k].mes = ''
        if (
          this.udpsList[k + 1] &&
          this.udpsList[k].propName === this.udpsList[k + 1].propName
        ) {
          this.udpsList[k + 1].mes = '已有该属性'
        }
      }
    },
    // 删除扩展属性
    udpsDelWeight(index, item) {
      if (this.udpsFlag) return
      this.searchSome()
      if (item.inUse) return
      if (item.publishStatus) return
      if (item.underReviewStatus) return
      let text = ''
      if (this.typeDetailData.inUse)
        text = this.$t('assets.generalSettings.alsoBeDeleted')
      this.typeDetailData.inUse &&
        this.$DatablauCofirm(text, this.$t('assets.generalSettings.hint'), {
          cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
          confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
        })
          .then(() => {
            this.splic(index)
          })
          .catch(() => {})
      !this.typeDetailData.inUse && this.splic(index)
    },
    splic(index) {
      let delitem = this.udpsList.splice(index, 1)
      if (this.udpsList.length === 0) {
        this.udpsList.push({
          propName: '',
          type: '',
          delete: false,
          typeData: null,
          required: false,
        })
      }
      if (delitem[0].id) {
        delitem[0].delete = true
        this.delUdpsList.push(delitem[0])
      }
    },
    typeChang(item, index) {
      item.typeData = ''
      if (item.type) {
        item.typeError = ''
      } else {
        item.typeError = '属性类型是必填项'
      }
      this.$set(this.udpsList, index, item)
    },
    handleTypeDataChange(item, index) {
      if (item.typeData) {
        item.enumError = ''
      } else {
        item.enumError = '属性枚举值不可为空'
      }
      this.$set(this.udpsList, index, item)
    },
    // 页面提交
    primary() {
      this.$refs.addForm.validate()
      if (!this.typeDetailData.name) {
        return
      }
      if (
        this.typeDetailData.assetsType &&
        this.typeDetailData.assetsType.length == 0
      ) {
        return
      }
      if (this.mes) {
        return
      }
      // 完成度判断
      let w = 0
      let flag = true
      let ary = []
      this.currentCompletion.forEach(item => {
        if (!item.attribute && item.weight) {
          flag = false
          this.attributeFlag = true
        }
        if (item.attribute && !item.weight) {
          flag = false
          this.muluTextFlag = true
        }
        if (item.attribute && item.weight) {
          ary.push(item)
        }
        w += Number(item.weight)
      })
      if (!flag) {
        this.$blauShowSuccess(
          this.$t('assets.generalSettings.notEmpty'),
          'warning'
        )
        return
      } else if (w < 100 && w !== 0) {
        this.muluTextFlag = true
        this.$blauShowSuccess(
          this.$t('assets.generalSettings.lessThan'),
          'warning'
        )
        return
      } else if (w > 100) {
        this.muluTextFlag = true
        this.$blauShowSuccess(
          this.$t('assets.generalSettings.moreTha'),
          'warning'
        )
        return
      }
      // 扩展属性判断
      let sameName = true
      let typeData = true
      let message = ''
      this.udpsList
        .filter(item => {
          return !item.delete
        })
        .some((item, index) => {
          if (item.typeData) {
            item.typeData = item.typeData.replace(/；/gi, ';')
            let ary = [...new Set(item.typeData.split(';'))]
            item.typeData = ary.join(';')
          }
          if (item.type === 'ENUM' && !item.typeData) {
            typeData = false
            item.enumError = '属性枚举值不可为空'
            message = this.$t('assets.generalSettings.enumRequired')
          } else if (!item.propName && item.type) {
            typeData = false
            item.mes = '属性名不能为空'
            message = this.$t('assets.generalSettings.noEmpty')
          } else if (!item.type && item.propName) {
            typeData = false
            item.typeError = '属性类型是必填项'
            // message = this.$t('assets.generalSettings.typeEmpty')
          }
          if (item.mes) {
            sameName = false
          }
          !typeData && this.$set(this.udpsList, index, item)
        })
      // !typeData && this.$blauShowSuccess(message, 'warning')
      !sameName &&
        this.$blauShowSuccess(
          this.$t('assets.generalSettings.duplicateName'),
          'warning'
        )
      if (!typeData || !sameName) return
      this.currentCompletion.forEach(item => {
        if (this.propertyCorrespond(item.attribute) === item.attribute) {
          item.extend = true
        } else {
          item.extend = false
        }
      })
      let udps = []
      this.udpsList.forEach(item => {
        if (item.propName && item.type) {
          udps.push(item)
        }
      })
      this.typeDetailData.algorithms = [...ary, ...this.delCompletion]
      this.typeDetailData.udps = [...udps, ...this.delUdpsList]
      this.typeDetailData.assetsType =
        this.typeDetailData.assetsType &&
        this.typeDetailData.assetsType.join(',')
      HTTP.saveType(this.typeDetailData)
        .then(res => {
          this.$blauShowSuccess(
            this.$t('assets.generalSettings.typeSavedSuccessfully')
          )
          this.$emit('cancelbtn', 'save')
        })
        .catch(e => {
          this.$emit('cancelbtn', 'save')
          this.$showFailure(e)
        })
    },
    // 页面取消
    cancelbtn() {
      this.$emit('cancelbtn')
    },
  },
  computed: {
    compleFlag() {
      let flag = Object.values(this.currentCompletion[0]).some(item => item)
      return this.currentCompletion.length === 1 && !flag
    },
    udpsFlag() {
      let flag = Object.values(this.udpsList[0]).some(item => item)
      return this.udpsList.length === 1 && !flag
    },
    weightNum() {
      return (
        this.validCompletion.reduce(
          (a, b) => Number(a) + Number(b.weight),
          0
        ) || 100
      )
    },
    validCompletion() {
      return this.currentCompletion.filter(
        item => item.attribute !== '' && item.weight !== '' && !item.delete
      )
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.detailBox {
  width: 750px;
  padding-bottom: 20px;
}
.detailFlex {
  /*display: flex;*/
  /*overflow: auto;*/

  & > div,
  & > span {
    display: inline-block;
  }
  & > span {
    line-height: 34px;
  }
}
.table-row {
  margin-top: 40px;
}
.add-form {
  padding-top: 25px;
  & > div {
    position: relative;
    .repeatNameTypeText {
      position: absolute;
      bottom: -25px;
      left: 1px;
      color: #ff4b53;
    }
  }
}
/deep/.el-select__tags {
  /*margin-top: 3px;*/
}
.typeSelect /deep/.el-input__suffix {
  right: -5px;
}
.completeness {
  position: relative;
  padding-left: 20px;
  p {
    color: #777777;
    font-size: 12px;
    position: absolute;
    top: 10px;
    // white-space: nowrap;
    display: inline-block;
    margin-left: 5px;
    &.textMula {
      display: block;
      position: relative;
      top: 0;
      .completion-item {
        span {
          display: inline-block;
          width: 85px;
          background-color: #f5f5f5;
          border-radius: 12px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          font-size: 12px;
          color: #555;
          margin-bottom: 5px;
          padding: 5px 8px;
          /deep/.text-tooltip {
            display: block;

            line-height: 1;
          }
        }
      }
    }
  }
}
.udps {
  p {
    i {
      margin-right: 3px;
      margin-left: 0;
    }
  }
}
.compleInputBox {
  padding-left: 120px;
  margin-top: 8px;
  padding-right: 35px;
  .complete-tips {
    display: inline-block;
    margin-left: 8px;
    border: 1px solid #ddd;
    position: relative;
    border-radius: 4px;
    padding: 3px 8px;
    color: #777;
  }
  .complete-tips:after,
  .complete-tips:before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-right-color: #ddd;
    top: 50%;
    margin-top: -5px;
    left: -10px;
  }
  .complete-tips:after {
    border-right-color: #fff;
    left: -9px;
  }
}
.baseline {
  span {
    color: #555;
    margin-right: 6px;
  }
}
.blu {
  color: #409eff;
  cursor: pointer;
}
.clor9 {
  color: #999;
  cursor: not-allowed;
}
.mulu {
  margin-left: 10px;
  align-items: center;
  /*margin-bottom: 10px;*/
  & > div {
    margin-top: 16px;
    margin-right: 24px;
    align-items: center;
    span {
      margin-right: 8px;
    }
  }
  & > div:last-child {
    text-align: right;
    margin-right: 0;
    float: right;
    line-height: 34px;
    i {
      margin-left: 14px;
    }
    .zhanw {
      margin-left: 30px;
    }
  }
}
.weight {
  position: relative;
  &:after {
    content: '%';
    position: absolute;
    top: 8px;
    right: 13px;
  }
}
/deep/ .error .el-input__inner,
/deep/ .repeatNameType .el-input__inner {
  border-color: #ff4b53;
}
.repeatNameBox {
  position: relative;
  .repeatNameText {
    position: absolute;
    bottom: -18px;
    left: 1px;
    color: #ff4b53;
  }
}
.error-msg {
  position: absolute;
  bottom: -18px;
  left: 1px;
  color: #ff4b53;
}
.udpsBox {
  padding-left: 30px;
  padding-right: 35px;
}
.inputbox {
  & > div {
    margin-right: 10px;
  }
}
.marginB20 {
  margin-bottom: 16px;
}
.alignItem {
  align-items: center;
}
.checkBox {
  margin-left: 10px;
}
.udpsBox .iconbox {
  float: right;
  line-height: 34px;
  text-align: right;
  i {
    margin-left: 14px;
  }
  .zhanw {
    width: 16px;
    display: inline-block;
  }
}
/deep/ .datablau-select[data-v-9dbd5db0] .el-select .el-input input {
  height: 100% !important;
}

/deep/.datablau-input .el-input.is-disabled .el-input__inner,
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
/deep/.add-form > div {
  margin-bottom: 16px;
}
.default60 /deep/ input::placeholder {
  color: #555;
}
.weightNum {
  display: inline-block;
  color: #66bf15;
  width: 51px;
  height: 24px;
  border-radius: 12px;
  line-height: 24px;
  text-align: center;
  background: rgba(102, 191, 21, 0.2);
}
.superNum {
  color: #f56c6c;
  display: inline-block;
  width: 51px;
  height: 24px;
  border-radius: 12px;
  line-height: 24px;
  text-align: center;
  background: rgba(245, 108, 108, 0.2);
}
</style>
<style lang="scss">
.complete-tips {
  &.el-tooltip__popper.is-light {
    border: 1px solid #ddd;
    color: #777;
  }
  &.el-tooltip__popper.is-light[x-placement^='right'] .popper__arrow {
    border-right-color: #ddd;
  }
}
</style>
