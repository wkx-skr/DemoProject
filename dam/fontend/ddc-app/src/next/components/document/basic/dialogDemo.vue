<template>
  <div>
    <h1>Dialog 对话框</h1>
    <h3>示例</h3>
    <datablau-button @click="open">打开DIALOG</datablau-button>
    <datablau-dialog
      :visible.sync="dialogVisible"
      title="提示"
      width="450px"
      :size="size"
      :before-close="handleClose"
      append-to-body
    >
      <div class="content">
        <el-form
          :label-position="labelPosition"
          label-width="80px"
          :model="formLabelAlign"
        >
          <el-form-item label="名称">
            <datablau-input v-model="formLabelAlign.name"></datablau-input>
          </el-form-item>
          <el-form-item label="活动区域">
            <datablau-input v-model="formLabelAlign.region"></datablau-input>
          </el-form-item>
          <el-form-item label="活动形式">
            <datablau-input v-model="formLabelAlign.type"></datablau-input>
          </el-form-item>
          <el-form-item label="名称">
            <datablau-input v-model="formLabelAlign.name"></datablau-input>
          </el-form-item>
          <el-form-item label="活动区域">
            <datablau-input v-model="formLabelAlign.region"></datablau-input>
          </el-form-item>
          <el-form-item label="活动形式">
            <datablau-input v-model="formLabelAlign.type"></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <!-- <span slot="footer">
        <datablau-button @click="dialogVisible = false"  type="secondary">取 消</datablau-button>
        <datablau-button type="primary" @click="dialogVisible = false">
          确 定
        </datablau-button>
      </span> -->
      <div class="dialog-bottom">
        <datablau-button @click="dialogVisible = false" type="secondary">
          取 消
        </datablau-button>
        <datablau-button type="important" @click="dialogVisible = false">
          确 定
        </datablau-button>
      </div>
    </datablau-dialog>
    <h3>代码</h3>
    <div class="pre">
      效果一
      <pre><code>{{code}}</code></pre>
      效果二
      <pre><code>{{code1}}</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-dialog
    <h3>属性</h3>
    组件继承el-dialog中的属性，方法和事件；弹框最大高度不要超过600。

    <datablau-table style="width: 1000px" :data="data">
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column
        label="说明"
        width="240"
        prop="explain"
      ></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
    </datablau-table>
    <h3>属性</h3>
    size属性对应弹框宽度大小，高度自适应，屏幕高度大于600，最高75%；小于600，最高85%；高度最小值200px；
    <br />
    当设置height属性时，高度固定
    <datablau-table style="width: 1000px" :data="sizeData">
      <el-table-column label="s" prop="name1" align="center"></el-table-column>
      <el-table-column label="m" prop="name2" align="center"></el-table-column>
      <el-table-column label="l" prop="name3" align="center"></el-table-column>
      <el-table-column label="xl" prop="name4" align="center"></el-table-column>
    </datablau-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      labelPosition: 'right',
      formLabelAlign: {
        name: '',
        region: '',
        type: '',
      },
      title: 'name',
      size: 'l',
      dialogVisible: false,
      num: 3,
      code: `<datablau-dialog
    :visible.sync="dialogVisible"
    title="提示"
    width="450px"
    :before-close="handleClose"
    append-to-body
  >
    <div class="content">
      <div class="list" v-for="index in num" :key="index">{{ index }}</div>
    </div>
    <span slot="footer">
      <datablau-button @click="dialogVisible = false">取 消</datablau-button>
      <datablau-button type="primary" @click="dialogVisible = false">
        确 定
      </datablau-button>
    </span>
  </datablau-dialog>`,
      code1: `<datablau-dialog
    :visible.sync="dialogVisible"
    title="提示"
    width="450px"
    :before-close="handleClose"
    append-to-body
    :height='400'
  >
    <div class="content">
      <div class="list" v-for="index in num" :key="index">{{ index }}</div>
      <div class="dialog-bottom">
        <datablau-button @click="dialogVisible = false">取 消</datablau-button>
        <datablau-button type="primary" @click="dialogVisible = false">
          确 定
        </datablau-button>
      </div>
    </div>
  </datablau-dialog>`,
      data: [],
      sizeData: [],
    }
  },
  created() {},
  mounted() {
    this.data = [
      {
        name: 'dialog-bottom',
        explain: `class名字；当底部button在默认的slot里面时，slot='footer'没有效果；添加此class名，button效果如slot='footer'`,
        type: '字符串',
        candidate: '',
        isRequired: '否',
        default: '',
      },
      {
        name: 'height',
        explain: `当有height属性时，弹框高度固定，不再自适应`,
        type: '数字或字符串',
        candidate: '',
        isRequired: '否',
        default: '',
      },
      {
        name: 'size',
        explain: `目前支持"s,m,l,xl",4中宽度不同的弹框，当size为"s,m,l,xl"时，弹框宽高固定（size的权限大于width属性）`,
        type: '字符串',
        candidate: 's,m,l,xl',
        isRequired: '否',
        default: '',
      },
    ]
    this.sizeData = [
      {
        name1: '560',
        name2: '640',
        name3: '800',
        name4: '960',
      },
    ]
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
  },
}
</script>

<style scoped lang="scss">
.list {
  line-height: 32px;
}
/deep/ .db-table {
  height: auto;
}
/deep/ .datablau-input {
  width: 100%;
}
</style>
