<template>
  <div>
    <datablau-form :class="{'not-edit': !isEdit}" ref="formRef" class="udp-detail-wrapper" label-width="120px" :model="itemObject" :rules="rules">
      <h2>自定义</h2>
      <el-form-item v-for="(udp, index) in udpArr" :key="index" :prop="udp.udpId + ''">
        <div slot="label" class="form-item-head">
          <datablau-icon class="icon-item" :data-type="'udp'" icon-type="svg" :size="24" ></datablau-icon>
          <span-with-tooltip
            class="name"
            :content="udp.name"
            :placement="'bottom'"
            :widthStr="'60px'"
            :classString="'span-with-tooltip'"
          ></span-with-tooltip>
        </div>
        <div v-if="isEdit">
          <datablau-input v-if="udp.valueType === 'LONGTEXT'" style="width: 230px;" v-model="itemObject[udp.udpId]"></datablau-input>
          <datablau-select style="width: 230px;" v-model="itemObject[udp.udpId]" clearable v-else-if="udp.valueType === 'STRING'">
            <el-option v-for="item in udp.enumValues" :key="item.i" :label="item.i" :value="item.i"></el-option>
          </datablau-select>
        </div>
        <div v-else>
          <div v-if="udp.valueType === 'LONGTEXT'">
            <span-with-tooltip
              class="name"
              :content="itemObject[udp.udpId]"
              :placement="'bottom'"
              :widthStr="'230px'"
              :classString="'span-with-tooltip'"
            ></span-with-tooltip>
          </div>
          <div v-else-if="udp.valueType === 'STRING'">
            <span-with-tooltip
              class="name"
              :content="itemObject[udp.udpId]"
              :placement="'bottom'"
              :widthStr="'230px'"
              :classString="'span-with-tooltip'"
            ></span-with-tooltip>
          </div>
        </div>
      </el-form-item>
    </datablau-form>
  </div>
</template>

<script>
import DatablauSelect from '@/next/components/basic/select/DatablauSelect.vue'
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'

export default {
  components: { spanWithTooltip, DatablauSelect },
  props: {
    itemObject: {
      type: Object,
      required: true
    },
    udpArr: {
      type: Array,
      required: true
    },
    isEdit: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    rules () {
      let newObj = {}
      this.udpArr.forEach((item, index) => {
        newObj[item.udpId] = {
          required: item.needed,
          trigger: ['blur', 'change'],
          message: '请输入UDP值'
        }
      })
      return newObj
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.form-item-head {
  text-align: left;
  float: left;
  .icon-item {
    vertical-align: middle;
    margin-right: 6px;
  }
  .name {
    display: inline-block;
    vertical-align: middle;
  }
  .add-btn {
    float: right;
    position: relative;
    top: 5px;
  }
}
.udp-detail-wrapper {
  h2 {
    color: #777;
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 7px;
    margin-top: 15px;
  }
}
.not-edit .el-form-item.is-required /deep/ .el-form-item__label:before {
  display: none;
}
</style>
