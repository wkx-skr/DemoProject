<template>
  <div class="attr-item">
    <span class="item-key">
      <img data-v-d87ec1fe="" :src="imgSrc" alt="" />

      <is-show-tooltip
        :content="attrKey"
        :open-delay="200"
        placement="top"
        v-if="isOpen"
        style="width: 90px"
      >
        <span>{{ attrKey }}</span>
      </is-show-tooltip>
    </span>
    <data-ownship
      v-if="isOwnship && isOpen"
      class="item-value"
      :editable="editable"
      v-bind="$attrs"
      v-on="$listeners"
      :ownship="attrValue"
    ></data-ownship>
    <data-steward
      v-else-if="isSteward && isOpen"
      class="item-value"
      :editable="editable"
      v-bind="$attrs"
      v-on="$listeners"
      :steward="attrValue"
    ></data-steward>
    <template v-else-if="isOpen">
      <span
        v-if="editConfig.editing"
        style="display: inline-block; width: calc(100% - 140px)"
      >
        <template v-if="editConfig.type === 'STRING'">
          <datablau-input
            size="mini"
            v-model="editValue"
            style="width: 120px; display: inline-block"
          ></datablau-input>
        </template>
        <template v-if="editConfig.type === 'NUM'">
          <el-input-number
            size="mini"
            v-model="editValue"
            style="width: 120px; display: inline-block"
          ></el-input-number>
        </template>
        <template v-if="editConfig.type === 'BOOL'">
          <datablau-select
            v-model="editValue"
            style="width: 120px; display: inline-block"
          >
            <el-option :value="$t('assets.summaryInfo.yes')">
              {{ $t('assets.summaryInfo.yes') }}
            </el-option>
            <el-option :value="$t('assets.summaryInfo.no')">
              {{ $t('assets.summaryInfo.no') }}
            </el-option>
          </datablau-select>
        </template>
        <template v-if="editConfig.type === 'ENUM'">
          <datablau-select
            v-model="editValue"
            style="width: 120px; display: inline-block"
          >
            <el-option
              v-for="i in editConfig.typeData"
              :key="i.value"
              :value="i.value"
              :label="i.label"
            ></el-option>
          </datablau-select>
        </template>
        <img
          src="/static/images/dataAssets/right.svg"
          style="margin-left: 10px; width: 16px"
          alt=""
          @click="save"
        />
        <img
          src="/static/images/dataAssets/false.svg"
          style="width: 16px; margin-left: 10px"
          alt=""
          @click="cancelEdit"
        />
        <!-- <datablau-button
          type="text"
          
          style="padding: 0 2px; margin: 0"
        >

        </datablau-button> -->
        <!-- <datablau-button
          type="text"
          style="padding: 0 2px; margin: 0"
          @click="editing = false"
        >
          取消
        </datablau-button> -->
      </span>
      <span v-else class="item-value">
        <!-- {{ attrValue }} -->
        <is-show-tooltip
          :content="attrValue"
          :open-delay="200"
          placement="top"
          style="float: left; margin-top: 8px"
        >
          <span>{{ attrValue }}</span>
        </is-show-tooltip>
        <el-button
          v-if="editable"
          @click="edit"
          type="text"
          icon="iconfont icon-bianji"
          style="color: #999; font-size: 20px; padding: 0; margin-left: 5px"
        ></el-button>
      </span>
    </template>
  </div>
</template>

<script>
import DataOwnship from './dataOwnship.vue'
import DataSteward from './dataSteward.vue'
import isShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'AttrItem',
  props: {
    isOwnship: {
      type: Boolean,
      default: false,
    },
    isSteward: {
      type: Boolean,
      default: false,
    },
    imgSrc: {
      type: String,
      default: '/static/images/metadataIcon/assetstatus.svg',
    },
    attrKey: {
      type: String,
      default: '',
    },
    attrValue: [String, Boolean, Number],
    editConfig: {
      editing: false,
      type: Object,
      default() {
        return {}
      },
    },
    editable: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  components: { DataOwnship, DataSteward, isShowTooltip },
  data() {
    return {
      editing: false,
      editValue: null,
    }
  },
  methods: {
    edit() {
      this.$emit('edit', this.attrKey)
      this.editValue = this.attrValue
    },
    cancelEdit() {
      this.$emit('edit', '')
    },
    save() {
      const { type, typeData } = this.editConfig
      let data
      if (type === 'ENUM') {
        data = typeData.find(d => d.value === this.editValue)
      } else {
        data = this.editValue
      }
      this.$emit('save', data)
      this.editing = false
    },
  },
}
</script>

<style lang="scss" scoped>
.attr-item {
  width: 100%;
  height: 34px;
  display: inline-block;

  .item-key {
    width: 140px;
    padding-right: 20px;
    float: left;
    padding-top: 8px;
    img {
      margin-right: 6px;
      margin-top: -9px;
    }
  }

  .item-value {
    float: left;
    // display: inline-block;
    max-width: calc(100% - 140px);
    // margin-top: 7px;
    /deep/ .el-tooltip {
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .top-user {
    float: left;
    .head-portrait {
      width: 24px;
      height: 24px;
      border-radius: 100%;

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

<style>
.attr-item .datablau-input .el-input__inner,
.attr-item .datablau-select .el-select .el-input input,
.attr-item .datablau-select .el-select .el-input span i {
  height: 28px;
  line-height: 28px;
}
</style>
