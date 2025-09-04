<template>
  <datablau-dialog
    :title="titleMap[type]"
    :visible.sync="visible"
    :height="type === 'Property' ? '620px' : '560px'"
    width="600px"
    size="mini"
    :before-close="close"
  >
    <datablau-form
      :model="objData"
      label-width="150px"
      :rules="formRules"
      ref="objectForm"
    >
      <div class="Object-form" v-if="type === 'Object'">
        <el-form-item label="名称" prop="Name">
          <datablau-input
            placeholder="请输入名称"
            v-model="objData.Name"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="别名" prop="FriendlyName">
          <datablau-input
            placeholder="请输入别名"
            v-model="objData.FriendlyName"
            style="width: 300px"
            maxlength="30"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="Definition">
          <datablau-input
            placeholder="请输入描述"
            v-model="objData.Definition"
            style="width: 300px"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          v-if="type === 'Property'"
          label="值类型"
          prop="ValueType"
        >
          <datablau-select
            v-model="objData.ValueType"
            placeholder="请选择值类型"
            style="width: 300px"
          >
            <el-option
              v-for="type in classTypeOptions"
              :label="type"
              :value="type"
              :key="type"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item
          v-if="type === 'Property'"
          label="枚举值"
          prop="EnumValue"
        >
          <datablau-input
            v-model="objData.EnumValue"
            style="width: 300px"
            placeholder="请输入枚举值，以英文逗号相隔"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="值域" prop="Range">
          <datablau-input
            placeholder="请输入值域"
            v-model="objData.Range"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="约束" prop="ConstraintName">
          <datablau-input
            placeholder="请输入约束"
            v-model="objData.ConstraintName"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="最大出现次数" prop="MaxValue">
          <datablau-input
            placeholder="请输入最大出现次数"
            v-model="objData.MaxValue"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="默认值">
          <datablau-input
            placeholder="请输入默认值"
            v-model="objData.DefaultValue"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="长度">
          <datablau-input
            placeholder="请输入长度"
            v-model="objData.DataScale"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="精度">
          <datablau-input
            placeholder="请输入精度"
            v-model="objData.DataPrecision"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-radio-group v-model="objData.IsRequired">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否数组">
          <el-radio-group v-model="objData.IsArray">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否引用其他对象">
          <el-radio-group v-model="objData.IsReference">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="引用对象" v-if="objData.IsReference === 'true'">
          <datablau-input
            placeholder="请输入引用对象"
            v-model="objData.Reference"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否允许注册到数据资产" prop="CanRegister">
          <el-radio-group v-model="objData.CanRegister">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否可见" prop="IsVisible">
          <el-radio-group v-model="objData.IsVisible">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="控件" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.Label"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="分组名" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.Catalog"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="显示顺序号" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.OrderNumber"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
      </div>
      <div class="Property-form" v-if="type === 'Property'">
        <el-form-item label="名称" prop="Name">
          <datablau-input
            placeholder="请输入名称"
            v-model="objData.Name"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="别名" prop="FriendlyName">
          <datablau-input
            placeholder="请输入别名"
            v-model="objData.FriendlyName"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="Definition">
          <datablau-input
            placeholder="请输入描述"
            v-model="objData.Definition"
            style="width: 300px"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="值类型" prop="ValueType">
          <datablau-select
            v-model="objData.ValueType"
            placeholder="请选择值类型"
            style="width: 300px"
          >
            <el-option
              v-for="type in classTypeOptions"
              :label="type"
              :value="type"
              :key="type"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="枚举值" prop="EnumValue">
          <datablau-input
            v-model="objData.EnumValue"
            style="width: 300px"
            placeholder="请输入枚举值，以英文逗号相隔"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="值域" prop="Range">
          <datablau-input
            placeholder="请输入值域"
            v-model="objData.Range"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="约束" prop="ConstraintName">
          <datablau-input
            placeholder="请输入约束"
            v-model="objData.ConstraintName"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="最大出现次数" prop="MaxValue">
          <datablau-input
            placeholder="请输入最大出现次数"
            v-model="objData.MaxValue"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="默认值">
          <datablau-input
            placeholder="请输入默认值"
            v-model="objData.DefaultValue"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="长度">
          <datablau-input
            placeholder="请输入长度"
            v-model="objData.DataScale"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="精度">
          <datablau-input
            placeholder="请输入精度"
            v-model="objData.DataPrecision"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-radio-group v-model="objData.IsRequired">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否数组">
          <el-radio-group v-model="objData.IsArray">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否引用其他对象">
          <el-radio-group v-model="objData.IsReference">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="引用对象" v-if="objData.IsReference === 'true'">
          <datablau-input
            placeholder="请输入引用对象"
            v-model="objData.Reference"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否可见" prop="IsVisible">
          <el-radio-group v-model="objData.IsVisible">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="控件" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.Label"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="分组名" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.Catalog"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="显示顺序号" v-if="objData.IsVisible === 'true'">
          <datablau-input
            placeholder="请输入"
            v-model="objData.OrderNumber"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
      </div>
      <div class="Relation-form" v-if="type === 'Reference'">
        <el-form-item label="名称" prop="Name">
          <datablau-input
            placeholder="请输入名称"
            v-model="objData.Name"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="别名" prop="FriendlyName">
          <datablau-input
            placeholder="请输入别名"
            v-model="objData.FriendlyName"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述" prop="Definition">
          <datablau-input
            placeholder="请输入描述"
            v-model="objData.Definition"
            style="width: 300px"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="被引用模型" prop="ReferModel">
          <datablau-input
            v-model="objData.ReferModel"
            placeholder="请输入被引用模型"
            style="width: 300px"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="被引用对象" prop="ReferObject">
          <datablau-input
            v-model="objData.ReferObject"
            style="width: 300px"
            placeholder="请输入被引用对象"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="是否可见" prop="IsVisible">
          <el-radio-group v-model="objData.IsVisible">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="血缘链路" prop="IsLineage">
          <el-radio-group v-model="objData.IsLineage">
            <el-radio label="false">不映射</el-radio>
            <el-radio label="lineage_from">来源对象（from）</el-radio>
            <el-radio label="lineage_to">下游对象（to）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
    </datablau-form>
    <div slot="footer">
      <datablau-button type="info" @click="close">取消</datablau-button>
      <datablau-button type="primary" @click="confirm">确定</datablau-button>
    </div>
  </datablau-dialog>
</template>

<script>
export default {
  name: 'AddObject',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'Object',
    },
  },
  data() {
    return {
      titleMap: {
        Object: '新增对象',
        Property: '新增属性',
        Reference: '新增引用',
      },
      classTypeOptions: [
        'System.String',
        'System.Int32',
        'System.Boolean',
        'System.DateTime',
      ],
      formRules: {
        Name: {
          required: true,
          message: '请输入名称',
          trigger: 'blur',
        },
        FriendlyName: {
          required: true,
          message: '请输入别名',
          trigger: 'blur',
        },
        ReferModel: {
          required: true,
          message: '请输入被引用模型',
          trigger: 'blur',
        },
        ReferObject: {
          required: true,
          message: '请输入被引用对象',
          trigger: 'blur',
        },
      },
      objData: {
        Name: '',
        TypeId: '900002016',
        Definition: '',
        FriendlyName: '',
        IsVisible: 'true',
        CanRegister: 'false',
        ValueType: '',
        EnumValue: '',
        ReferModel: '',
        ReferObject: '',
        Range: '',
        ConstraintName: '',
        MaxValue: '',
        DefaultValue: '', // 默认值
        DataScale: '', // 长度
        DataPrecision: '', // 精度
        IsRequired: 'false', // 是否必填
        IsArray: 'false', // 是否数组
        IsReference: 'false', // 是否引用其他对象
        Reference: '', // 引用对象
        Label: '', // 控件
        Catalog: '', // 分组名
        OrderNumber: '', // 显示顺序号
        IsLineage: 'false', // 是否血缘（from）
      },
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    confirm() {
      this.$refs.objectForm.validate(valid => {
        if (valid) {
          this.$emit('confirm', { type: this.type, data: this.objData })
        }
      })
    },
  },
  mounted() {
    console.log(this.type, '000')
  },
}
</script>

<style lang="scss" scoped></style>
