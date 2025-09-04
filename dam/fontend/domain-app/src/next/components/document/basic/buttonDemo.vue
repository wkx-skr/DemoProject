<template>
  <div>
    <h1>Button 按钮</h1>
    <h3>示例</h3>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <p>
        <span style="margin-right: 1em">主要按钮</span>
        <datablau-button
          type="important"
          @click="handleClick"
          :disabled="isDisabled"
          tooltip-content="确定按钮"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="handleClick"
          :disabled="isDisabled"
          class="iconfont icon-wenti"
        >
          主要按钮1
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">增强按钮</span>
        <datablau-button
          type="strong"
          @click="handleClick"
          :disabled="isDisabled"
        >
          增强按钮
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">订阅按钮</span>
        <datablau-button
          type="subscribe"
          @click="handleClick"
          :disabled="isDisabled"
        >
          订阅按钮
        </datablau-button>
        暂不使用
      </p>
      <p>
        <span style="margin-right: 1em">普通按钮</span>
        <datablau-button
          type="normal"
          @click="handleClick"
          :disabled="isDisabled"
        >
          普通按钮
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">次要按钮</span>
        <datablau-button
          type="secondary"
          @click="handleClick"
          :disabled="isDisabled"
        >
          次要按钮
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">取消按钮</span>
        <datablau-button
          type="cancel"
          @click="handleClick"
          :disabled="isDisabled"
        ></datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">删除按钮</span>
        <datablau-button type="danger" class="iconfont icon-delete">
          {{ $t('common.button.delete') }}
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">确定按钮</span>
        <datablau-button
          type="confirm"
          @click="handleClick"
          :disabled="isDisabled"
        ></datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">文字按钮</span>
        <datablau-button
          type="text"
          @click="handleClick"
          :disabled="isDisabled"
        >
          文字按钮
        </datablau-button>
      </p>
      <p>
        <span style="margin-right: 1em">图标按钮</span>
        <datablau-button
          type="icon"
          @click="handleClick"
          :disabled="isDisabled"
        >
          <span class="icon iconfont icon-bianji"></span>
        </datablau-button>
        <datablau-button
          type="icon"
          @click="handleClick"
          :disabled="isDisabled"
          low-key
        >
          <i class="el-icon-error"></i>
        </datablau-button>
      </p>
      <el-card header="控制面板">
        <el-switch
          v-model="isDisabled"
          inactive-text="启用按钮"
          active-text="禁用按钮"
        ></el-switch>
      </el-card>
      <el-card header="细节描述" style="margin-top: 10px">
        渐变效果：淡入淡出 0.2s 最小宽度固定，边距10px 圆角2px
      </el-card>
    </div>

    <h2>代码</h2>
    <div
      class="component-box"
      style="padding: 20px; height: auto; width: 600px"
    >
      <pre><code>{{ code }}
</code></pre>
    </div>
    <h2>接口</h2>
    <h3>标签名称</h3>
    datablau-button
    <h3>属性</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'type',
          type: '字符串',
          description: '按钮类型',
          candidate: 'important或primary/normal/secondary/text/icon/danger',
          isRequired: '否',
          default: 'normal',
        },
        {
          name: 'disabled',
          description: '禁用',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'low-key',
          description:
            '弱化图标按钮。即当非悬浮状态时，颜色显示为灰色而非主题色',
          type: '布尔值',
          candidate: 'true/false',
          isRequired: '否',
          default: 'false',
        },
        {
          name: 'tooltip-content',
          description: `tooltip 文本内容，默认为空，此时没有 tooltip，当有内容时，显示 tooltip`,
          type: '字符串',
          candidate: '-',
          isRequired: '否',
          default: '-',
        },
        {
          name: 'tooltip-options',
          description: `tooltip 配置属性, 支持 effect, placement, openDelay, hideAfter, popperClass`,
          type: '对象',
          candidate: '-',
          isRequired: '否',
          default: `{
            effect: 'dark',
            placement: 'bottom',
            openDelay: 0,
            hideAfter: 0,
            popperClass: ''
          }`,
        },
      ]"
    >
      <el-table-column label="属性名称" prop="name"></el-table-column>
      <el-table-column label="属性类型" prop="type"></el-table-column>
      <el-table-column label="可选值" prop="candidate"></el-table-column>
      <el-table-column label="必填" prop="isRequired"></el-table-column>
      <el-table-column label="默认值" prop="default"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
    </el-table>
    <h3>事件</h3>
    <el-table
      style="width: 800px"
      class="datablau-table"
      :data="[
        {
          name: 'click',
          parameter: '默认是$event',
          description: '普通点击事件',
        },
      ]"
    >
      <el-table-column label="事件名称" prop="name"></el-table-column>
      <el-table-column label="参数" prop="parameter"></el-table-column>
      <el-table-column label="描述" prop="description"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  mounted() {},
  data() {
    return {
      isDisabled: false,
      code: `<datablau-button
  type="important"
  @click="handleClick"
  :disabled="isDisabled"
>{{ $t('common.button.ok') }}</datablau-button>\n
<datablau-button
  type="important"
  @click="handleClick"
  :disabled="isDisabled"
    >主要按钮</datablau-button>\n
<datablau-button
  type="normal"
  @click="handleClick"
  :disabled="isDisabled"
>普通按钮</datablau-button>\n
<datablau-button
  type="secondary"
  @click="handleClick"
  :disabled="isDisabled"
>次要按钮</datablau-button>\n
<datablau-button
  type="cancel"
  @click="handleClick"
  :disabled="isDisabled"
></datablau-button> \n
<datablau-button
  type="confirm"
  @click="handleClick"
  :disabled="isDisabled"
></datablau-button> \n
<datablau-button
  type="text"
  @click="handleClick"
  :disabled="isDisabled"
>文字按钮</datablau-button>\n
<datablau-button type="danger" class="iconfont icon-delete">
  删除
</datablau-button>\n
<datablau-button
  type="icon"
  @click="handleClick"
  :disabled="isDisabled"
>
  <i class="el-icon-success"></i>
</datablau-button>\n
<datablau-button
  type="icon"
  @click="handleClick"
  :disabled="isDisabled"
  low-key
>
  <i class="el-icon-error"></i>
</datablau-button>`,
    }
  },
  methods: {
    handleClick($event) {
      console.log('handleClick')
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../base.scss';

div {
}

p {
  margin-bottom: 20px;
}
</style>
