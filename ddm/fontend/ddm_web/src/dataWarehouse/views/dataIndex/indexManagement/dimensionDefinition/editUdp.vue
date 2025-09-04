<template>
  <div>
    <div class="top-border"></div>
    <el-form size="mini" :model="body" label-width="7em" :rules="editRules" ref="editRules">
      <el-form-item :label="$t('meta.DS.udp.udpName')" prop="name">
        <datablau-input
          v-model="body.name"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
      <!-- <el-form-item label="属性分组" prop="udpGroup">
        <datablau-select-weak
          :optionsData="optionsData"
          v-model="body.catalog"
          placeholder="请选择"
          clearable
          filterable
          @blur="selectBlur"
          @clear="selectClear"
          @change="selectChange"
        ></datablau-select-weak>
      </el-form-item>
      <el-form-item label="属性类型" prop="type">
        <datablau-select v-model="body.type" style="width: 205px">
          <el-option value="STRING" label="字符串"></el-option>
          <el-option value="NUM" label="数值"></el-option>
          <el-option value="NUM_RANGE" label="数值范围"></el-option>
          <el-option value="BOOL" label="布尔值"></el-option>
          <el-option value="ENUM" label="枚举值"></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item label="枚举项" v-show="body.type === 'ENUM'">
        <datablau-input
          type="textarea"
          :row="4"
          v-model="body.typeData"
          placeholder="请输入备选值，以分号分隔"
        ></datablau-input>
      </el-form-item> -->
      <el-form-item :label="$t('meta.DS.udp.desc')">
        <datablau-input
          type="textarea"
          class="max-textarea"
          maxlength="200"
          :minRow="3"
          :maxRows="5"
          style="max-height: 100px; width: 100%"
          v-model="body.description"
          show-word-limit
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div
      class="dialog-bottom"
      style="margin-top: 20px; overflow: auto; text-align: right"
    >
      <datablau-button class="white-btn" type="secondary" @click="close">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        type="important"
        @click="beforeSave"
        :disabled="disabledSave"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['typeId', 'currentRow', 'maxOrder', 'dupUdpNamMap'],
  data () {
    const nameValidate = (rule, value, callback) => {
      value = _.trim(value)
      if (!value) {
        callback(new Error(this.$t('meta.DS.udp.validate.nameRequired')))
      } else if (this.dupUdpNamMap[value] && this.oldName !== value) {
        callback(
          new Error(
            this.$t('meta.DS.udp.validate.nameDuplicateTips', { name: value })
          )
        )
      } else {
        callback()
      }
    }
    return {
      body: {
        name: '',
        udpOrder: this.maxOrder + 1,
        desc: '',
        type: 'STRING', // STRING, NUM, NUM_RANGE, ENUM, BOOL
        typeData: '',
        catalog: '',
        category: this.typeId
      },
      oldName: '',
      editRules: {
        name: {
          validator: nameValidate,
          required: true,
          trigger: 'change'
        },
        udpGroup: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'change'
          }
        ],
        type: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'change'
          }
        ]
      },
      udpGroupOptions: [],
      addUdpGroup: '',
      optionsData: {}
    }
  },
  mounted () {
    if (this.currentRow) {
      // this.oldName = this.currentRow.name
      // if (this.currentRow.typeData) {
      //   this.currentRow.typeData = this.currentRow.typeData.replace(/\n/g, ';')
      // }
      this.body = this.currentRow
      this.$nextTick(() => {
        this.$refs.editRules.clearValidate() // 只清除清除验证
      })
    }
    // this.getUdpList()
  },
  computed: {
    disabledSave () {
      const name = _.trim(this.body.name)
      return !name
    }
  },
  methods: {
    beforeSave () {
      if (!this.body.name) {
        this.$message.error(this.$t('meta.DS.message.nameRequired'))
        return
      }
      if (this.body.name.length > 127) {
        this.$message.error(this.$t('meta.DS.message.nameLenTooLong'))
        return
      }
      const requestBody = _.cloneDeep(this.body)
      if (this.currentRow) {
        this.$http
          .post(`${this.$domains}dimension/udp/update`, requestBody)
          .then(res => {
            this.$emit('refresh')
            this.$emit('close')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$http
          .post(`${this.$domains}dimension/udp/create`, requestBody)
          .then(res => {
            this.$emit('refresh')
            this.$emit('close')
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    // createOrUpdateUdp() {
    //   const requestBody = _.cloneDeep(this.body)
    //   if (requestBody.type !== 'ENUM') {
    //     delete requestBody.typeData
    //   } else {
    //     requestBody.typeData = requestBody.typeData.replace(/;/g, '\n')
    //     requestBody.typeData = requestBody.typeData.replace(/；/g, '\n')
    //   }
    //   this.$http
    //     .post(this.$damUrl + `/service/entities/udps/${this.typeId}`, requestBody)
    //     .then(res => {
    //       this.$emit('refresh')
    //       this.$emit('close')
    //     })
    //     .catch(e => {
    //       this.$showFailure(e)
    //     })
    // },
    close () {
      this.$emit('close')
      this.$emit('refresh')
    }
  }
}
</script>

<style lang="scss" scoped>
$border-color: #dddddd;
.top-border {
  width: 800px;
  height: 1px;
  background-color: $border-color;
  // margin-left: -20px;
  // margin-right: 20px;
  margin: -10px -4px 10px -20px;
  overflow: hidden;
}
.el-form-item {
  min-width: 500px;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
}
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
</style>
