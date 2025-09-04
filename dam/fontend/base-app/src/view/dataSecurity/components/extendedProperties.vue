<template>
  <div>
    <datablau-dialog
      :visible.sync="extendVisible"
      title="扩展属性"
      width="720px"
      :before-close="handleClose"
      :modal-append-to-body="true"
    >
      <p class="tilText">
        <i class="iconfont icon-tips"></i>
        扩展属性只对当前目录类型生效
      </p>
      <div class="content" v-loading="loading">
        <div
          class="flex alignItem marginB20"
          v-for="(item, index) in udpsList"
          :key="item.id"
        >
          <div class="flex inputbox">
            <datablau-input
              v-model="item.propName"
              :disabled="
                (catalogType.inUse && publishStatus) ||
                !disabled ||
                item.inUse ||
                item.algoInuse
              "
              placeholder="支持8位以内属性名称"
              @blur="propNameBlur(item, index)"
              :class="{ repeatName: item.mes }"
              maxlength="8"
              style="width: 145px"
            ></datablau-input>
            <datablau-select-weak
              clearable
              :disabled="
                (catalogType.inUse && publishStatus) ||
                !disabled ||
                item.inUse ||
                item.algoInuse
              "
              allow-create
              @change="typeChang(item)"
              v-model="item.type"
              style="width: 80px"
              :optionsData="{
                data: property,
                key: 'value',
                value: 'value',
                label: 'label',
              }"
            ></datablau-select-weak>
          </div>
          <div v-show="item.type === 'ENUM'">
            <datablau-input
              :disabled="
                (catalogType.inUse && publishStatus) ||
                !disabled ||
                item.inUse ||
                item.algoInuse
              "
              v-model="item.typeData"
              placeholder="以分号分割"
              style="width: 160px"
            ></datablau-input>
          </div>
          <div class="checkBox flex alignItem">
            <datablau-checkbox :checkboxType="'single'" v-model="item.required">
              必填
            </datablau-checkbox>
          </div>
          <!--          未被引用，可以删除 !catalogType.inUse
                        被引用 --- 没有发布   可以删除  catalogType.inUse  && !publishStatus
                        被引用 --- 发布   不删除  catalogType.inUse  && publishStatus   ---不显示
                        完成度中引用----不可删除
 -->
          <div class="iconbox" v-if="disabled">
            <!--    v-show="catalogType.inUse && !publishStatus"       v-show="udpsList.length - 1 !== 0" v-show="!item.algoInuse"-->
            <span>
              <i
                :class="{
                  iconfont: true,
                  'icon-delete': true,
                  blu: !item.inUse,
                  clor9: item.inUse,
                }"
                @click="delWeight(index, item)"
              ></i>
            </span>

            <!--    v-show="!publishStatus"          v-show="currentCompletion.length - 1 === index"-->
            <span>
              <i
                class="iconfont icon-tianjia blu"
                @click="addWeights"
                v-show="udpsList.length - 1 === index"
              ></i>
            </span>
          </div>
        </div>
      </div>
      <span slot="footer">
        <datablau-button @click="handleClose">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="primary">
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../util/api'
export default {
  props: {
    extendVisible: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: true,
    },
    catalogType: {
      type: Object,
    },
  },
  computed: {
    flag() {
      let { extendVisible, catalogType } = this
      return { extendVisible, catalogType }
    },
  },
  watch: {
    flag: {
      // immediate: true,
      deep: true,
      handler(val) {
        if (!val.extendVisible) {
          return
        }
        this.publishStatus = val.catalogType.publishStatus
        console.log(val.catalogType)
        this.udpsList = [
          { propName: '', type: '', delete: false, typeData: null },
        ]
        if (val.catalogType.udpVo) {
          this.udpsList = _.cloneDeep(
            val.catalogType.udpVo.filter(item => {
              return !item.delete
            })
          )
          this.delUdpsList = _.cloneDeep(
            val.catalogType.udpVo.filter(item => {
              return item.delete
            })
          )
          this.udpsList.length === 0 &&
            (this.udpsList = [
              { propName: '', type: '', delete: false, typeData: null },
            ])
        }
        // else {
        //   val.extendVisible &&
        //     val.catalogType.id &&
        //     this.getUdps(val.catalogType.catalogTypeId || val.catalogType.id)
        // }
        if (val.catalogType.algorithms) {
          let ary = []
          val.catalogType.algorithms.forEach(item => {
            ary.push(item.attribute)
          })
          this.udpsList.forEach(item => {
            if (ary.indexOf(item.propName) !== -1) {
              item.algoInuse = true
            }
          })
        }
      },
    },
  },
  data() {
    return {
      property: [
        { value: 'STRING', label: '字符串' },
        { value: 'ENUM', label: '枚举' },
        { value: 'NUM', label: '数值' },
      ],
      checkBoxValueTrue: '',
      loading: false,
      udpsList: [
        {
          attributesName: '',
          attributesType: 'STRING',
          delete: false,
          typeData: null,
        },
      ],
      oldudp: [
        {
          attributesName: '',
          attributesType: 'STRING',
          delete: false,
          typeData: null,
        },
      ],
      delUdpsList: [],
      publishStatus: false,
    }
  },
  methods: {
    typeChang(item) {
      item.typeData = ''
    },
    handleClose() {
      this.$emit('handleClose')
    },
    propNameBlur(val, index) {
      val.mes = null
      let flag = this.udpsList.some((item, i) => {
        item.mes = null
        if (i !== index) {
          return item.propName && item.propName === val.propName
        }
      })
      flag && (val.mes = '已重名')
      this.$set(this.udpsList, index, val)
    },
    primary() {
      let json = {
        catalogType: this.catalogType,
      }
      let ary = [
        ...this.delUdpsList,
        ...this.udpsList.filter(item => item.propName),
      ]
      ary.length === 0 && (ary = null)
      JSON.stringify(this.oldudp) !== JSON.stringify(ary) && (json.udpVo = ary)
      JSON.stringify(this.oldudp) !== JSON.stringify(ary) &&
        (json.catalogType.modify = true)
      let sameName = true
      let typeData = true
      let message = ''
      this.udpsList
        .filter(item => {
          return !item.delete
        })
        .some(item => {
          // console.log(item)
          if (item.typeData) {
            item.typeData = item.typeData.replace(/；/gi, ';')
            let ary = [...new Set(item.typeData.split(';'))]
            item.typeData = ary.join(';')
          }
          // console.log(item.required, item.required == undefined)
          if (item.type === 'ENUM' && !item.typeData) {
            typeData = false
            message = '扩展属性类型为枚举时，属性值必填'
          } else if (
            !item.propName &&
            (item.type || item.required !== undefined)
          ) {
            typeData = false
            message = '扩展属性名称不能为空！'
          } else if (
            !item.type &&
            (item.propName || item.required !== undefined)
          ) {
            typeData = false
            message = '扩展属性类型不能为空！'
          }
          if (item.mes) {
            sameName = false
          }
        })
      !typeData && this.$message.error(message)
      typeData && sameName && this.$emit('primary', json)
    },
    searchSome() {
      for (let k = 0; k < this.udpsList.length; k++) {
        this.udpsList[k].mes = ''
        if (
          this.udpsList[k + 1] &&
          this.udpsList[k].propName === this.udpsList[k + 1].propName
        ) {
          this.udpsList[k + 1].mes = '已重名'
        }
      }
    },
    delWeight(index, item) {
      this.searchSome()
      if (item.inUse) return
      if (item.publishStatus) return
      console.log(item)
      let text = '该删除是不可逆的，确定删除该目录类型的扩展属性吗？'
      if (item.id) text = `该扩展属性被删除之后，目录拥有的该属性也会被删除`
      this.$DatablauCofirm(text, this.$t('assets.generalSettings.hint'), {
        cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
        confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
      })
        .then(() => {
          let delitem = this.udpsList.splice(index, 1)
          if (this.udpsList.length === 0) {
            this.udpsList.push({
              propName: '',
              type: '',
              delete: false,
            })
          }
          if (delitem[0].id) {
            delitem[0].delete = true
            this.delUdpsList.push(delitem[0])
          }
          // console.log(delitem, this.udpsList, this.udpsList)
        })
        .catch(() => {})
    },
    addWeights() {
      this.$set(this.udpsList, this.udpsList.length, {
        attributesName: '',
        attributesType: '',
        delete: false,
        typeData: null,
      })
    },
    // getUdps(id) {
    //   this.loading = true
    //   HTTP.getExtended({ id })
    //     .then(res => {
    //       res.data.length !== 0 && (this.udpsList = res.data)
    //       res.data.length === 0 &&
    //         (this.udpsList = [
    //           {
    //             propName: '',
    //             type: '',
    //             delete: false,
    //             typeData: null,
    //             required: false,
    //           },
    //         ])
    //       this.oldudp = JSON.parse(JSON.stringify(this.udpsList))
    //       this.loading = false
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //       this.loading = false
    //     })
    // },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.tilText {
  color: #999;
  font-size: 12px;
  position: absolute;
  top: -34px;
  left: 90px;
  i {
    color: #999;
    position: relative;
    top: 1px;
  }
}
.flex {
  display: flex;
  width: 100%;
}
.inputbox {
  width: 245px;
  /*justify-content: space-between;*/
  & > div {
    margin-right: 10px;
  }
}
.iconbox {
  width: 50px;
  margin-right: 20px;
  float: right;
  i {
    margin-left: 14px;
    color: #409eff;
    cursor: pointer;
  }
  .clor9 {
    color: #999;
    cursor: not-allowed;
  }
}
.checkBox {
  flex: 1;
  margin-left: 10px;
}
.content {
  min-height: 250px;
}
.alignItem {
  align-items: center;
}
.marginB10 {
  margin-bottom: 10px;
}
.marginB20 {
  margin-bottom: 16px;
}
/deep/.datablau-input .el-input.is-disabled .el-input__inner,
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
/deep/ .repeatName .el-input__inner {
  border-color: #ff4b53;
}
.repeatName {
  position: relative;
  &::after {
    content: '已有该属性';
    position: absolute;
    bottom: -17px;
    font-size: 12px;
    color: #ff4b53;
    left: 0;
  }
}
/deep/.datablau-radio .el-radio {
  margin-right: 15px;
}
</style>
