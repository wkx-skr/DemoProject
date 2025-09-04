<template>
  <datablau-form
    ref="udpForm"
    :class="{'hide-label': hideLabel, 'no-edit-mode': !editMode}"
    :label-width="hideLabel?'0px':'85px'"
    :model="requestBody.allUdps"
  >
    <el-form-item
      v-for="k of udpMap.keys().map(item => String(item))"
      :key="k"
      class="property udp"
      :rules="{
          required: dataByType.udp.get(Number.parseInt(k)).IsRequired,
          trigger: ['blur', 'change'],
          validator: (rule, value, callback) => {
            if (dataByType.udp.get(Number.parseInt(k)).IsRequired && !requestBody.allUdps[k]) {
              callback(new Error('必填项不能为空'))
            } else {
              callback()
            }
          }
        }"
      :prop="String(k)"
      :label="dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name">
        <!--<span
          v-if="!hideLabel"
          class="label">{{ dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name }}</span>-->
        <span slot="label" style="float:right">
          <datablau-tooltip :disabled="toolTipDisabled(dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name)" effect="dark" placement="top" :content="dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name">
            <span class="title">{{dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name}}</span>
          </datablau-tooltip>
        </span>
        <span class="value" v-if="!editMode">
          <template v-if="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct && JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length && (dataByType.udp.get(Number.parseInt(k)).UdpValueType==='STRING' || dataByType.udp.get(Number.parseInt(k)).UdpValueType==='INTEGER')">
            <!--<datablau-select-weak
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              v-if="!dataByType.udp.get(Number.parseInt(k)).ExtendedEnumParentRef"
              size="mini"
              disabled
              clearable
              filterable
              :key="k"
              style="display: inline-block;"
              @change="handleChange(...arguments, k)"
              @selectAll="selectAll(...arguments, k)"
              :value="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? (requestBody.allUdps[k] && (requestBody.allUdps[k].split(',').map(item => item.trim()).filter((key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p =>p.i).includes(key))))) : JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p =>p.i).includes(requestBody.allUdps[k]) ? requestBody.allUdps[k] : ''"
              :optionsData="{
                data: !JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length ? [] : dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct) : [{i: undefined, n: '----'},...JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct)],
                key: 'i',
                value: 'i',
                label: 'n',
                showAll: JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length && dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple,
                all: allObj[k],
              }"
            ></datablau-select-weak>
            <datablau-select-weak
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              v-else
              size="mini"
              disabled
              clearable
              filterable
              :key="k"
              style="display: inline-block;"
              @change="handleChangeFilter(...arguments, k)"
              @selectAll="selectAllFilter(...arguments, k)"
              :value="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? (requestBody.allUdps[k] && (requestBody.allUdps[k].split(',').map(item => item.trim()).filter((key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).map(p =>p.i).includes(key))))) : JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p => p.i).includes(requestBody.allUdps[k]) ? requestBody.allUdps[k]: ''"
              :optionsData="{
                data: !JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).length ? [] : dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)) : [{i: undefined, n: '----'},...JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k))],
                key: 'i',
                value: 'i',
                label: 'n',
                showAll: JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).length && dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple,
                all: allObj[k],
              }"
            ></datablau-select-weak>-->
            <datablau-tooltip :content="(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct && JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).length && (dataByType.udp.get(parseInt(k)).UdpValueType === 'STRING' || dataByType.udp.get(parseInt(k)).UdpValueType === 'INTEGER')) ? dataByType.udp.get(parseInt(k)).ExtendedEnumMultiple ? (udpMap.get(k)+'').split(',').map(item => item.trim()).map(key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key) && JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key).n).filter(i => i !== undefined).join(',') : JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === udpMap.get(k)) && JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === udpMap.get(k)).n : udpMap.get(k)">
              <span :style="hideLabel?'width: 190px': 'width: auto;'" style="display:inline-block;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">{{(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct && JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).length && (dataByType.udp.get(parseInt(k)).UdpValueType === 'STRING' || dataByType.udp.get(parseInt(k)).UdpValueType === 'INTEGER')) ? dataByType.udp.get(parseInt(k)).ExtendedEnumMultiple ? (udpMap.get(k)+'').split(',').map(item => item.trim()).map(key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key) && JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).find(p => p.i === key).n).filter(i => i !== undefined).join(',') : JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === udpMap.get(k)) && JSON.parse(dataByType.udp.get(parseInt(k)).ExtendedEnumStruct).find(p => p.i === udpMap.get(k)).n : udpMap.get(k)}}</span>
            </datablau-tooltip>
          </template>
          <template v-else-if="dataByType.udp.get(Number.parseInt(k)).UdpValueType==='DATETIME'">
            {{/^\d{4}-\d{2}-\d{2}/.test(udpMap.get(k)) ? udpMap.get(k) : ''}}
          </template>
          <div v-else>
            <datablau-tooltip effect="dark" placement="top" :content="udpMap.get(k) === '[]' ? '': udpMap.get(k)">
              <span class="title">{{udpMap.get(k) === '[]' ? '': udpMap.get(k)}}</span>
            </datablau-tooltip>
          </div>
        </span>
        <span class="value" v-else>
          <template v-if="!isSourceSystem(dataByType, k) && dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct && JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length && (dataByType.udp.get(Number.parseInt(k)).UdpValueType==='STRING' || dataByType.udp.get(Number.parseInt(k)).UdpValueType==='INTEGER')">
            <datablau-select-weak
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              v-if="!dataByType.udp.get(Number.parseInt(k)).ExtendedEnumParentRef"
              size="mini"
              clearable
              filterable
              :key="k"
              style="display: inline-block;"
              @change="handleChange(...arguments, k)"
              @selectAll="selectAll(...arguments, k)"
              :value="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? (requestBody.allUdps[k] && (requestBody.allUdps[k].split(',').map(item => item.trim()).filter((key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p =>p.i).includes(key))))) : JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p =>p.i).includes(requestBody.allUdps[k]) ? requestBody.allUdps[k] : ''"
              :optionsData="{
                data: !JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length ? [] : dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct) : [{i: undefined, n: '----'},...JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct)],
                key: 'i',
                value: 'i',
                label: 'n',
                showAll: JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length && dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple,
                all: allObj[k],
              }"
            ></datablau-select-weak>
            <datablau-select-weak
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              v-else
              size="mini"
              clearable
              filterable
              :key="k"
              style="display: inline-block;"
              @change="handleChangeFilter(...arguments, k)"
              @selectAll="selectAllFilter(...arguments, k)"
              @visible-change="handleVisibleChange(requestBody.allUdps[k], k)"
              :value="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? (requestBody.allUdps[k] && (requestBody.allUdps[k].split(',').map(item => item.trim()).filter((key => JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).map(p =>p.i).includes(key))))) : JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).map(p => p.i).includes(requestBody.allUdps[k]) ? requestBody.allUdps[k]: ''"
              :optionsData="{
                data: !JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).length ? [] : dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple ? JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)) : [{i: undefined, n: '----'},...JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k))],
                key: 'i',
                value: 'i',
                label: 'n',
                showAll: JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).length && dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple,
                all: allObj[k],
              }"
            ></datablau-select-weak>
            <!--<datablau-select
              style="display: inline-block;"
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              :key="k"
              v-model="requestBody.allUdps[k]"
              v-if="!dataByType.udp.get(Number.parseInt(k)).ExtendedEnumParentRef"
              size="mini"
            >
              <el-option
                v-if="JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).length && !dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
                key="----"
                :value="null"
                label="----">
              </el-option>
              <el-option
                v-for="o in JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct)"
                :key="o.i"
                :value="o.i"
                :label="o.n"
              ></el-option>
            </datablau-select>
            <datablau-select
              style="display:inline-block;"
              :multiple="dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
              :key="k"
              v-model="requestBody.allUdps[k]"
              v-else
              size="mini"
            >
              <el-option
                v-if="JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k)).length && !dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple"
                key="----"
                :value="null"
                label="----">
              </el-option>
              <el-option
                v-for="o in JSON.parse(dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => filterUdpOption(i, k))"
                :key="o.i"
                :value="o.i"
                :label="o.n"
              ></el-option>
            </datablau-select>-->
          </template>
           <!-- 如果是来源系统，则使用全系统的下拉筛选 -->
          <template v-if="isSourceSystem(dataByType, k)">
            <datablau-select
              v-model="requestBody.allUdps[k]"
              size="mini"
              clearable
              placeholder="请选择"
              :themeBlack="themeBlack"
            >
              <el-option
                v-for="item in modelCategories"
                :key="String(item.categoryId)"
                :label="
                  item.categoryName + '(' + item.categoryAbbreviation + ')'
                "
                :value="String(item.categoryId)"
              ></el-option>
            </datablau-select>
          </template>
          <udp-validater-input
            v-else
            :key="k"
            :hideLabel="hideLabel"
            :value="requestBody.allUdps[k]"
            @update="updateUdpValue(requestBody.allUdps, k, $event)"
            :udp="dataByType.udp.get(Number.parseInt(k))"
            :themeBlack="themeBlack"
          >
          </udp-validater-input>
        </span>
    </el-form-item>
  </datablau-form>
</template>

<script>
import udpValidaterInput from '@/views/list/tables/udpValidaterInput.vue'
import LDMTypes from '@constant/LDMTypes'
export default {
  data () {
    return {
      allObj: {},
      modelCategories: [],
      Error: window.Error
    }
  },
  components: {
    udpValidaterInput
  },
  props: ['dataByType', 'requestBody', 'udpMap', 'editMode', 'type', 'currentModel', 'tableMsg', 'hideLabel', 'themeBlack'],
  beforeCreate () {
    this.$bus.$on('myValidateForm', () => {
      if (this.$refs.udpForm) {
        this.$refs.udpForm.validate((valid) => {
          this.$emit('myValidate', valid)
        })
      } else {
        this.$emit('myValidate', true)
      }
    })
  },
  mounted () {
    this.initData()
  },
  watch: {
    udpMap () {
      this.initData()
    }
  },
  methods: {
    getModelCategories () {
      this.$http.post(`/base/modelCategory/getModelCategories`)
        .then(res => {
          this.modelCategories = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    isSourceSystem (dataByType, k) {
      let name = dataByType.udp.get(Number.parseInt(k)).FriendlyName || dataByType.udp.get(Number.parseInt(k)).Name
      return name === '来源系统'
    },
    toolTipDisabled (content) {
      const span = document.createElement('span')
      $(span).css('display', 'none')
      span.innerText = content
      $(document.body).append(span)
      const width = parseInt($(span).css('width'))
      const itemWidth = 72
      if (this.$isIEAll) {
        span.removeNode(true)
      } else {
        span.remove()
      }
      return itemWidth > width
    },
    handleVisibleChange (val, k) {
      if (this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple) {
        if (this.isSame(val?.split(', '), JSON.parse(this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => this.filterUdpOption(i, k)).map(p => p.i))) {
          this.$set(this.allObj, k, true)
        } else {
          this.$set(this.allObj, k, false)
        }
      }
    },
    isSame (arr1, arr2) {
      if (arr2.every(i => arr1?.includes(i))) {
        return true
      } else {
        return false
      }
    },
    initData () {
      this.allObj = {}
      for (let k of this.udpMap.keys()) {
        let udp = this.dataByType.udp.get(Number.parseInt(k))
        if (!udp.ExtendedEnumParentRef) {
          if (udp.ExtendedEnumMultiple && udp.ExtendedEnumStruct && this.isSame(this.requestBody.allUdps[k]?.split(',').filter(item => item !== '').map(item => item.trim()).filter(key => JSON.parse(udp.ExtendedEnumStruct).map(p => p.i).includes(key)), JSON.parse(udp.ExtendedEnumStruct).map(p => p.i))) {
            // this.allObj[k] = true
            this.$set(this.allObj, k, true)
          } else {
            // this.allObj[k] = false
            this.$set(this.allObj, k, false)
          }
        } else {
          if (udp.ExtendedEnumMultiple && udp.ExtendedEnumStruct && this.isSame(this.requestBody.allUdps[k]?.split(',').filter(item => item !== '').map(item => item.trim()).filter(key => JSON.parse(udp.ExtendedEnumStruct).filter(i => this.filterUdpOption(i, k)).map(p => p.i).includes(key)), JSON.parse(udp.ExtendedEnumStruct).filter(i => this.filterUdpOption(i, k)).map(p => p.i))) {
            // this.allObj[k] = true
            this.$set(this.allObj, k, true)
          } else {
            // this.allObj[k] = false
            this.$set(this.allObj, k, false)
          }
        }
      }
      this.getModelCategories()
    },
    handleChange (val, k) {
      if (this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple) {
        if (this.isSame(val, JSON.parse(this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(p => p.i))) {
          this.$set(this.allObj, k, true)
        } else {
          this.$set(this.allObj, k, false)
        }
        this.requestBody.allUdps[k] = val.filter(item => item !== '').join(', ')
      } else {
        this.requestBody.allUdps[k] = val
      }
    },
    selectAll (flag, k) {
      this.allObj[k] = flag
      if (flag) {
        this.requestBody.allUdps[k] = JSON.parse(this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).map(item => item.i).filter(item => item !== '').join(', ')
      } else {
        this.requestBody.allUdps[k] = ''
      }
    },
    handleChangeFilter (val, k) {
      if (this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumMultiple) {
        if (this.isSame(val, JSON.parse(this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => this.filterUdpOption(i, k)).map(p => p.i))) {
          this.$set(this.allObj, k, true)
        } else {
          this.$set(this.allObj, k, false)
        }
        this.requestBody.allUdps[k] = val.filter(item => item !== '').join(', ')
      } else {
        this.requestBody.allUdps[k] = val
      }
    },
    selectAllFilter (flag, k) {
      this.allObj[k] = flag
      if (flag) {
        this.requestBody.allUdps[k] = JSON.parse(this.dataByType.udp.get(Number.parseInt(k)).ExtendedEnumStruct).filter(i => this.filterUdpOption(i, k)).map(item => item.i).filter(item => item !== '').join(', ')
      } else {
        this.requestBody.allUdps[k] = ''
      }
    },
    updateUdpValue (obj, index, value) {
      this.$set(obj, index, value)
    },
    filterUdpOption (ExtendedEnumStruct, updKey) {
      let udpNow = this.dataByType.udp.get(+updKey)
      let item = JSON.parse(udpNow.ExtendedEnumStruct).find(item => item.i === ExtendedEnumStruct.i && item.n === ExtendedEnumStruct.n)
      if (item.p !== ExtendedEnumStruct.p) { // 过滤重复的i和n（key和value），但parent不一样
        return false
      } else if (!udpNow.ExtendedEnumParentRef) {
        return true
      } else if (this.type === LDMTypes.Entity) { // 表 => 模型或表
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent?.entityType === LDMTypes.Entity) { // 表 => 表
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.ModelMart) { // 表=> 模型
          if (udpParent?.ExtendedEnumMultiple ? this.currentModel[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.currentModel[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        }
      } else if (this.type === LDMTypes.ModelMart) { // 模型
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent) {
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      } else if (this.type === LDMTypes.Diagram) { // 主题域
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent?.entityType === LDMTypes.Diagram) { // 主题域 => 主题域
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.ModelMart) { // 主题域 => 模型
          if (udpParent?.ExtendedEnumMultiple ? this.currentModel[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.currentModel[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        }
      } else if (this.type === LDMTypes.BusinessObject) { // 业务对象 => 模型或表
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent?.entityType === LDMTypes.BusinessObject) { // 业务对象 => 业务对象
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.ModelMart) { // 业务对象 => 模型
          if (udpParent?.ExtendedEnumMultiple ? this.currentModel[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.currentModel[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        }
      } else if (this.type === LDMTypes.View) { // 视图
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent?.entityType === LDMTypes.View) { // 视图 => 视图
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.ModelMart) { // 视图 => 模型
          if (udpParent?.ExtendedEnumMultiple ? this.currentModel[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.currentModel[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        }
      } else if (this.type === LDMTypes.Attribute) { // 字段
        // let udpNow = this.dataByType.udp.get(+updKey)
        let udpParent = this.dataByType.udp.get(udpNow.ExtendedEnumParentRef)
        if (udpParent?.entityType === LDMTypes.Attribute) { // 字段 => 字段
          if (udpParent?.ExtendedEnumMultiple ? this.requestBody.allUdps[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.requestBody.allUdps[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.Entity || udpParent?.entityType === LDMTypes.BusinessObject || udpParent?.entityType === LDMTypes.View) { // 字段 => 表/视图/业务对象
          if (udpParent?.ExtendedEnumMultiple ? this.tableMsg[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.tableMsg[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        } else if (udpParent?.entityType === LDMTypes.ModelMart) { // 字段 => 模型
          if (udpParent?.ExtendedEnumMultiple ? this.currentModel[udpParent.Id]?.split(', ').includes(ExtendedEnumStruct.p) : (this.currentModel[udpParent.Id] || null) === (ExtendedEnumStruct.p || null)) {
            return true
          } else {
            return false
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .title {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 30px;
  }
  .no-edit-mode .el-form.db-form .el-form-item {
    margin-bottom: 0
  }
  .datablau-select /deep/ .datablau-tooltip {
    width: auto!important;
  }
  .datablau-tooltip {
    width: 100%;
  }
  /deep/ .el-form-item__content {
    line-height: 30px;
    display: block;
  }
  /deep/ .el-form-item__label {
    line-height: 30px;
    font-weight: normal;
    line-height: 16px;
    float: left;
    .title {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 30px;
    }
  }
  .hide-label /deep/ {
    .el-form-item__label {
      display: none;
    }
    .el-input {
      vertical-align: text-bottom;
    }
  }
  .property{
    display: inline-block;
    line-height: 2em;
    &.udp {
      width: 100%;
      max-width: unset;
      margin-right: unset;
      min-height: unset;
      &:last-of-type {
        .label {
          border-bottom:1px solid #DDDDDD;
        }
      }
      .label {
        font-size: 12px;
        font-weight: 400;
        color: #555555;
        line-height: 30px;
        display: inline-block;
        vertical-align: top;
        padding-left: 10px;
        width: 200px;
        height: 34px;
        background: #F5F5F5;
        border-radius: 2px 0px 0px 0px;
        border: 1px solid #DDDDDD;
        border-bottom: unset;
      }
      .value {
        display: inline-block;
        width: 361px;
        height: 34px;
        font-size: 12px;
        .el-input {
          display: inline-block;
          width: 250px;
          height: 34px;
        }
        .el-input-number {
          width: 250px;
        }
        /deep/ .el-input__inner {
          width: 250px;
          height: 34px!important;
          line-height: 34px;
        }
        /deep/ .el-input-number__decrease {
          height: 34px;
        }
        /deep/ .el-input-number__increase {
          height: 34px;
        }
      }
    }
  }
</style>
<style lang="scss">
  .in-column-wrapper .el-form.db-form {
    height: 30px;
  }
  .in-column-wrapper .el-form.db-form .el-form-item {
    margin-bottom: 0;
  }
  /*.in-column-wrapper .el-textarea__inner {
    position: relative;
    top: -2px;
    left: -2px;
  }*/
  .in-column-wrapper .property.udp .value {
    width: 100%;
  }
  .in-column-wrapper .el-form.db-form .datablau-cascader, .in-column-wrapper .el-form.db-form .datablau-select, .in-column-wrapper .el-form.db-form .datablau-input {
    width: auto;
  }
</style>
