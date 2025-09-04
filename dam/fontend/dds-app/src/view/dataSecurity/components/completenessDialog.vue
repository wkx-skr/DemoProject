<template>
  <div>
    <datablau-dialog
      :visible.sync="dialogVisible"
      :title="$t('design.completionAlg')"
      width="720px"
      height="440px"
      :before-close="handleClose"
      :modal-append-to-body="true"
    >
      <p class="tilText" v-show="muluText">
        <!--        <i class="iconfont icon-tips"></i>-->
        {{ muluText || $t('design.AlgDetail') }}
      </p>
      <div class="content" v-loading="loading">
        <div class="default">{{ formula }}：{{ textMula }}</div>
        <div class="baseline">
          <span>{{ $t('design.completionLine') }}</span>
          <datablau-input
            :disabled="!disabled"
            v-model="publishPercent"
            type="number"
            :placeholder="$t('design.def60')"
            style="width: 180px"
          ></datablau-input>
          <datablau-tooltip
            popper-class="tooltipBox"
            effect="light"
            :content="$t('design.lineDetail')"
          >
            <i class="iconfont icon-tips"></i>
          </datablau-tooltip>
        </div>
        <div
          class="mulu"
          v-for="(item, index) in currentCompletion"
          :key="item.id"
        >
          <div class="flex">
            <span>{{ $t('design.countAttr') }}</span>
            <datablau-select-weak
              clearable
              allow-create
              v-model="item.attribute"
              @focus="attributeSelect"
              @change="setTextMula(item)"
              @clear="attributeSelect"
              :ceholder="$t('design.computed')"
              style="width: 180px"
              :disabled="!disabled"
              :optionsData="{
                data: propertyNew,
                key: 'value',
                value: 'value',
                label: 'label',
              }"
            ></datablau-select-weak>
          </div>
          <div class="flex">
            <span>{{ $t('design.proportion') }}</span>
            <datablau-input
              :class="{ borderRed: muluTextFlag }"
              :disabled="!disabled"
              v-model="item.weight"
              type="number"
              :placeholder="$t('design.weight')"
              style="width: 160px"
              @input="checkInt(item, item.weight)"
              @blur="setTextMula(item)"
            ></datablau-input>
          </div>
          <div>
            <!--          v-if="disabled" v-show="!catalogType.inUse"-->
            <i class="iconfont icon-delete blu" @click="delWeight(index)"></i>
            <i
              class="iconfont icon-tianjia blu"
              v-show="currentCompletion.length - 1 === index"
              @click="addWeights"
            ></i>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose">
          {{ $t('securityModule.reset') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../util/api'
export default {
  /**
   * currentCompletion  现有完成度
   * property  完成度下拉
   * */
  // props: ['currentCompletion', 'property', 'dialogVisible'],
  props: {
    // currentCompletion: {
    //   type: Array,
    //   default: () => [],
    // },
    catalogType: {
      type: Object,
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      muluTextFlag: false, // 标红
      formula: '',
      textMula: '',
      property: [],
      propertyNew: [],
      loading: false,
      oldCurrent: [
        {
          attribute: '',
          weight: '',
          delete: false,
        },
      ],
      currentCompletion: [
        {
          attribute: '',
          weight: '',
          delete: false,
        },
      ], // 现有完成度计算
      muluText: '',
      publishPercent: 60,
      delCompletion: [],
    }
  },
  mounted() {
    this.formula = this.$t('design.defCompletionFormula')
    this.textMula = this.$t('design.AlgDetail')
    this.property = [
      { label: this.$t('securityModule.securityLevel'), value: 'DEPT' },
      {
        label: this.$t('securityModule.affectedObjects'),
        value: 'DATA_BUTLER',
      },
      {
        label: this.$t('securityModule.reach'),
        value: 'ASSETS_LIST',
      },
      {
        label: this.$t('securityModule.impactLevel'),
        value: 'KEYWORDS',
      },
      {
        label: this.$t('design.statute'),
        value: 'DESCRIPTION',
      },
      {
        label: this.$t('design.article'),
        value: 'ENGLISH_ABBREVIATION',
      },
    ]
  },
  methods: {
    handleClose() {
      this.$emit('handleClose')
    },
    propertyCorrespond(val) {
      switch (val) {
        case 'DEPT':
          return this.$t('design.dept')
        case 'DATA_BUTLER':
          return this.$t('design.butler')
        case 'ASSETS_LIST':
          return this.$t('design.assetList')
        case 'KEYWORDS':
          return this.$t('design.keywords')
        case 'DESCRIPTION':
          return this.$t('design.description')
        case 'ENGLISH_ABBREVIATION':
          return this.$t('design.english')
        default:
          return val
      }
    },
    primary() {
      let w = 0
      let flag = true
      this.currentCompletion.forEach(item => {
        if (!item.attribute && item.weight) {
          flag = false
        }
        w += Number(item.weight)
      })
      if (!flag) {
        this.muluTextFlag = true
        this.muluText = this.$t('design.attrIsNull')
        return
      } else if (w < 100 && w !== 0) {
        this.muluTextFlag = true
        this.muluText = this.$t('design.lessThan')
        return
      } else if (w > 100) {
        this.muluTextFlag = true
        this.muluText = this.$t('design.moreTha')
        return
      }
      let json = {
        // algorithms: this.currentCompletion,
        catalogType: this.catalogType,
        publishPercent: this.publishPercent,
      }
      let ary = [...this.delCompletion, ...this.currentCompletion]
      let text = ''
      if (JSON.stringify(this.oldCurrent) !== JSON.stringify(ary)) {
        json.algorithms = ary
        json.catalogType.modify = true
        this.catalogType.inUse && (text = this.$t('design.refreshTip'))
      }
      text &&
        this.$DatablauCofirm(text)
          .then(() => {
            this.$emit('primary', json)
          })
          .catch(() => {
            this.$emit('primary', json)
          })
      !text && this.$emit('primary', json)
    },
    checkInt(obj, val) {
      const reg = /[^0-9$]/g
      let number = val.replace(reg, '')
      if (number > 100) {
        number = 100
      }
      this.$set(obj, 'weight', number)
    },
    setTextMula(item) {
      if (item.attribute && item.weight) {
        this.getTextMule()
      }
    },
    delWeight(index) {
      this.$DatablauCofirm(this.$t('design.delTip'))
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
          this.textMula = ''
          this.getTextMule()
        })
        .catch(() => {})
    },
    getTextMule() {
      this.textMula = ''
      this.formula = this.$t('design.defCompletionFormula')
      this.currentCompletion.forEach(item => {
        item.attribute &&
          (this.textMula += `${this.propertyCorrespond(item.attribute)}*${
            item.weight
          }%+`)
        this.formula = this.$t('design.completionFormula')
      })
      this.textMula = this.textMula.substring(0, this.textMula.length - 1)
    },
    addWeights() {
      // this.textMula = ''
      // this.getTextMule()
      let w = 0
      this.currentCompletion.forEach(item => {
        w += Number(item.weight)
      })
      if (w === 100) {
        this.muluTextFlag = true
        this.muluText = this.$t('design.equal')
        return
      } else if (w > 100) {
        this.muluTextFlag = true
        this.muluText = this.$t('design.moreTha')
        return
      }

      this.$set(this.currentCompletion, this.currentCompletion.length, {
        attribute: '',
        weight: '',
      })
    },
    attributeSelect(val) {
      let ary = []
      this.currentCompletion.forEach(item => {
        ary.push(item.attribute)
      })
      let property = []
      this.propertyNew.forEach((item, index) => {
        if (ary.indexOf(item.value) !== -1) {
          item.disabled = true
        } else {
          item.disabled = false
        }
        property.push(item)
      })
      this.propertyNew = property
      // this.$emit('property', property)
    },
    // 拉取目录完成度算法下拉框
    getProperties(val) {
      // this.loading = true
    },
    // getAlgorithm(id) {
    //   this.loading = true
    //   HTTP.getalgorithm({ id })
    //     .then(res => {
    //       console.log(res, 'res')
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //     })
    // },
  },
  computed: {
    flag() {
      let { dialogVisible, catalogType } = this
      return { dialogVisible, catalogType }
    },
  },
  watch: {
    flag: {
      // immediate: true,
      handler(val) {
        this.currentCompletion = [{ attribute: '', weight: '', delete: false }]
        this.dialogVisible &&
          (val.catalogType.catalogTypeId || val.catalogType.id) &&
          this.getProperties(
            val.catalogType.catalogTypeId || val.catalogType.id
          )
        this.muluText = ''
        this.textMula = this.$t('design.AlgDetail')
        this.propertyNew = [...this.property]

        this.delCompletion = []
        this.publishPercent = val.catalogType.publishPercent || 60
        if (this.catalogType.algorithms) {
          this.currentCompletion = _.cloneDeep(
            this.catalogType.algorithms.filter(item => {
              return !item.delete
            })
          )
          this.delCompletion = _.cloneDeep(
            this.catalogType.algorithms.filter(item => {
              return item.delete
            })
          )
          // this.muluText = ''
          this.getTextMule()
          this.currentCompletion.length === 0 &&
            (this.currentCompletion = [
              { attribute: '', weight: '', delete: false },
            ])
        }
        // else if (this.dialogVisible && val.catalogType.id) {
        //   this.getAlgorithm(val.catalogType.catalogTypeId || val.catalogType.id)
        // }
        if (val.catalogType.udpDtoList) {
          val.catalogType.udpDtoList.forEach(item => {
            this.propertyNew.push({
              value: item.propName,
              label: item.propName || item.propCatalog,
            })
          })
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.default {
  color: #777;
  font-size: 12px;
  padding-left: 10px;
  margin-bottom: 10px;
}
.baseline {
  margin-bottom: 15px;
  span {
    margin-right: 3px;
  }
  i {
    margin-left: 8px;
  }
}
.content {
  min-height: 250px;
}
.mulu {
  margin-left: 10px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  & > div {
    margin-right: 40px;
    & > span {
      margin-right: 5px;
    }
  }
  /deep/ .datablau-input {
    margin: 0 10px;
    position: relative;
    &:after {
      content: '%';
      position: absolute;
      right: 10px;
      top: 10px;
      line-height: 14px;
      font-size: 12px;
      color: #555;
    }
  }
  i {
    margin-right: 14px;
    cursor: pointer;
  }
}
.blu {
  color: #409eff;
}
/deep/.datablau-input input::-webkit-outer-spin-button,
/deep/.datablau-input input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
}
/deep/.datablau-input input[type='number'] {
  -moz-appearance: textfield !important;
}
.flex {
  display: flex;
  align-items: center;
}
.tilText {
  color: #ff7519;
  font-size: 12px;
  position: absolute;
  top: -36px;
  left: 103px;
  i {
    color: #ff7519;
    position: relative;
    top: 1px;
  }
}
/deep/.datablau-input .el-input.is-disabled .el-input__inner,
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
</style>
