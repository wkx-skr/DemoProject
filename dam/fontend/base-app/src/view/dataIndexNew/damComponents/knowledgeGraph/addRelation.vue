<template>
  <div>
    <datablau-button @click="newRelation(null)">创建关系</datablau-button>
    <common-selector
      ref="assetSelector"
      @finish="handleFinishSelect"
    ></common-selector>
    <datablau-dialog
      title="创建关系"
      size="l"
      :height="500"
      :visible.sync="visible"
    >
      <datablau-form label-width="6em" :model="json" ref="form" :rules="rules">
        <el-form-item label="关系类型">
          <datablau-select v-model="json.relationshipType">
            <el-option label="自定义类型" value="自定义类型"></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="源类型">
          <datablau-select v-model="json.sourceTypeId">
            <el-option
              v-for="(v, k) in typeNameArr"
              :label="v"
              :value="parseInt(k)"
              :key="k"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="源对象" prop="sourceId">
          <datablau-input
            :value="sourceObject"
            @click.native="setSource"
          ></datablau-input>
          <datablau-button type="text" @click="setSource">
            {{ $t('meta.DS.tableDetail.security.set') }}
          </datablau-button>
        </el-form-item>
        <el-form-item label="目标类型">
          <datablau-select
            v-model="json.targetTypeId"
            @change="handleTargetTypeIdChange"
          >
            <el-option
              v-for="(v, k) in typeNameArr"
              :label="v"
              :value="parseInt(k)"
              :key="k"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="目标对象" prop="targetId">
          <datablau-input
            :value="targetObject"
            @click.native="setTarget"
          ></datablau-input>
          <datablau-button type="text" @click="setTarget">
            {{ $t('meta.DS.tableDetail.security.set') }}
          </datablau-button>
        </el-form-item>
        <el-form-item label="关系说明">
          <datablau-input
            v-model="json.relationshipDescription"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-footer" style="text-align: right">
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="primary" @click="handleSubmit">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>
<script>
import CommonSelector from './CommonSelector.vue'
import LDMTypes from '@constant/LDMTypes'
export default {
  components: {
    CommonSelector,
  },
  props: {
    typeNameArr: {},
  },
  mounted() {},
  data() {
    return {
      LDMTypes: LDMTypes,
      baseElement: null,
      visible: false,
      sourceObject: '',
      targetObject: '',
      json: {
        sourceId: null,
        sourceTypeId: LDMTypes.Entity,
        sourceType: null,
        targetId: null,
        targetTypeId: LDMTypes.Entity,
        targetType: null,
        relationshipDescription: '',
        relationshipType: '自定义类型',
      },
      rules: {
        sourceId: {
          required: true,
          message: '源对象是必选的',
        },
        targetId: {
          required: true,
          message: '目标对象是必选的',
        },
      },
      current: null, // 正在处理的对象
    }
  },
  methods: {
    clearForm() {
      this.json.sourceId = null
      this.json.targetId = null
      this.json.sourceTypeId = LDMTypes.Entity
      this.json.sourceType = LDMTypes.MetadataObject
      this.json.targetTypeId = LDMTypes.Entity
      this.json.targetType = LDMTypes.MetadataObject
      this.sourceObject = ''
      this.targetObject = ''
      this.json.relationshipDescription = ''
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    newRelation(element, reverse) {
      this.clearForm()
      this.baseElement = element
      if (this.baseElement) {
        if (reverse) {
          this.json.targetTypeId = parseInt(this.baseElement.typeId)
          this.json.targetType = this.baseElement.Type
          this.json.targetId = this.baseElement.Id
          this.targetObject = this.baseElement.Name
        } else {
          this.json.sourceTypeId = parseInt(this.baseElement.typeId)
          this.json.sourceType = this.baseElement.Type
          this.json.sourceId = this.baseElement.Id
          this.sourceObject = this.baseElement.Name
        }
        // } else {
        //   throw new Error('为未处理类型创建关系')
        // }
      }
      this.visible = true
    },
    handleTargetTypeIdChange() {},
    setSource() {
      this.current = 'source'
      this.$refs.assetSelector.init(this.json.sourceTypeId)
    },
    setTarget() {
      this.current = 'target'
      this.$refs.assetSelector.init(this.json.targetTypeId)
    },
    handleFinishSelect({ id, name, Type }) {
      if (this.current === 'source') {
        this.json.sourceId = id
        this.json.sourceType = Type
        this.sourceObject = name
      } else if (this.current === 'target') {
        this.json.targetId = id
        this.json.targetType = Type
        this.targetObject = name
      } else {
        throw new Error('未指定类型')
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const json = _.clone(this.json)
          json.sourceTypeId = json.sourceType
          json.targetTypeId = json.targetType
          delete json.sourceType
          delete json.targetType
          this.$http
            .post(this.$graph_url + `/graph/addCustomizedRelation`, json)
            .then(res => {
              this.$emit('update-graph', this.json)
              this.handleClose()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    handleClose() {
      this.visible = false
    },
  },
  computed: {},
}
</script>
<style lang="scss" scoped>
.block {
  position: absolute;
  left: 20px;
  top: 90px;
  height: 310px;
  width: 320px;
  /*outline: 1px solid blue;*/
  &.r {
    left: 459px;
    /*outline: 1px solid pink;*/
  }
}
</style>
