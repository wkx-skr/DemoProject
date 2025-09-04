<template>
  <div>
    <h1>颜色</h1>
    <h2>使用说明</h2>
    <p>
      如下所示的颜色色值，禁止在组件和页面中直接使用，请务必引入color.sass文件
    </p>
    <p>
      目的包括但不限于 1. 防止色值填写错误 2. 便于统一修改优化 3.
      为后续系统主题色提供方便。一旦遵守了约定，则组件开发者和使用者不再需要关注主题
    </p>
    <h2>品牌主色</h2>
    <p>
      datablau主要品牌色是科技、友好的蓝色。
      品牌色是体现产品特性和传播理念最直观的视觉元素之一。在色彩选取时，需先了解品牌色在界面中的使用场景及选色范围。以政务产品网页组件的默认样式为例，品牌色主要体现在关键行动点及操作状态、重要信息高亮等场景。
      注：图形插画和 logo 可以不必遵循色板，但需保持相近的色系。
    </p>
    <div
      v-for="(c, idx) in colors.slice(0, 5)"
      :key="idx"
      class="color-box"
      :class="[c.class]"
    >
      <span class="alias">{{ c.alias }}</span>
      {{ c.name }}
      <br />
      {{ c.color }}
      <br />
      ${{ c.class }}
      <span v-if="c.otherVar">
        <br />
        ${{ c.otherVar }}
      </span>
      <br />
    </div>
    <h2>辅助功能色的应用</h2>
    <p>
      在界面设计中，除了主色外的场景色，需要在不同的场景中使用（例如危险色表示危险的操作）。
      比较稳定的色彩除了中性色外还有具备特定含义的功能色，这类色彩起到传递功能信息、代表某种状态等作用。主要应用于消息通知、反馈提醒、表单校验这类场景中的成功、出错、失败、提醒、链接等状态。
    </p>
    <div
      v-for="(c, idx) in colors.slice(5, 9)"
      :key="idx + 5"
      class="color-box"
      :class="[c.class]"
    >
      <span class="alias">{{ c.alias }}</span>
      {{ c.name }}
      <br />
      {{ c.color }}
      <br />
      ${{ c.class }}
      <span v-if="c.otherVar">
        <br />
        ${{ c.otherVar }}
      </span>
      <br />
    </div>
    <h2>中性色的应用</h2>
    <p>
      中性色用于文本、背景和边框颜色。通过运用不同的中性色，来表现层次结构。
      灰色（Gray）作为中性色在datablau产品中B端设计中被大量使用到，它的使用有利于关键内容的衬托和功能的引导。这类色彩主要体现在导航框架、表格标题、背景底色、描边、或次级操作等等。
    </p>
    <div
      v-for="(c, idx) in colors.slice(9)"
      :key="idx + 9"
      class="color-box"
      :class="[c.class]"
    >
      <span class="alias">{{ c.alias }}</span>
      <!--      {{c.name}} <br>-->
      {{ c.color }}
      <br />
      ${{ c.class }}
      <span v-if="c.otherVar">
        <br />
        ${{ c.otherVar }}
      </span>
      <br />
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      colors: [
        {
          class: 'primary-color',
          alias: '品牌色',
          name: 'Blue',
          color: '#409EFF',
          otherVar: '',
        },
        {
          class: 'table-hover-color',
          alias: '表格悬浮背景色',
          name: 'Blue',
          color: '#409EFF 10%',
          otherVar: 'light-color-1',
        },
        {
          class: 'table-click-color',
          alias: '表格点击背景色',
          name: 'Blue',
          color: '#409EFF 20%',
          otherVar: 'light-color-2',
        },
        {
          class: 'hover-color',
          alias: '按钮悬停色',
          name: 'Blue',
          color: '#409EFF 90%',
          otherVar: 'light-color-3',
        },
        {
          class: 'click-color',
          alias: '按钮点击色',
          name: 'Blue',
          color: '#0084FF',
          otherVar: 'light-color-4',
        },
        {
          class: 'primary-color',
          alias: '连接/说明色',
          name: 'Blue',
          color: '#409EFF',
        },
        {
          class: 'green',
          alias: '成功色',
          name: 'Green',
          color: '#66BF16',
        },
        {
          class: 'yellow',
          alias: '告警色',
          name: 'Yellow',
          color: '#FF7519',
        },
        {
          class: 'red',
          alias: '失败色',
          name: 'Blue',
          color: '#F2220A',
        },
        {
          class: 'black',
          alias: '基础黑色',
          color: '#000',
        },
        {
          class: 'text-default',
          alias: '默认文字',
          color: '#555555',
          otherVar: 'grey-1',
        },
        {
          class: 'text-message',
          alias: '信息提示文字',
          color: '#777777',
          otherVar: 'grey-2',
        },
        {
          class: 'text-disabled',
          alias: '默认图标/禁止文字色',
          color: '#999999',
          otherVar: 'grey-3',
        } /*
        {
          class: 'text-placeholder',
          alias: '默认提示文字',
          color: '#bbbbbb',
          otherVar: 'grey-7',
        }, */,
        {
          class: 'border-color',
          alias: '分割线/边框色',
          color: '#dddddd',
          otherVar: 'grey-4',
        },
        {
          class: 'component-divide-color',
          alias: '只读背景色',
          color: '#EFEFEF',
          otherVar: 'grey-5',
        },
        {
          class: 'read-only',
          alias: '只读背景色',
          color: '#F5F5F5',
          otherVar: 'grey-6',
        },
        {
          class: 'white',
          alias: '基础白色',
          color: '#FFF',
        },
      ],
    }
  },
}
</script>
<style lang="scss" scoped>
@import '../base.scss';
@import '../../basic/color.sass';

.color-box {
  display: inline-block;
  width: 200px;
  height: 90px;
  margin-top: 10px;
  margin-right: 10px;
  border-right: 4px;
  padding: 10px;
  vertical-align: bottom;

  .alias {
    opacity: 0.7;
    float: right;
  }

  &.primary-color {
    background: $primary-color;
    color: #fff;
  }

  &.table-hover-color {
    background: $table-hover-color;
    color: #555;
  }

  &.table-click-color {
    background: $table-click-color;
    color: #555;
  }

  &.hover-color {
    background: $hover-color;
    color: #fff;
  }

  &.click-color {
    background: $click-color;
    color: #fff;
  }

  &.green {
    background: $green;
    color: #fff;
  }

  &.yellow {
    background: $yellow;
    color: #fff;
  }

  &.red {
    background: $red;
    color: #fff;
  }

  &.text-default {
    background: $text-default;
    color: #fff;
  }

  &.text-message {
    background: $text-message;
    color: #fff;
  }

  &.text-disabled {
    background: $text-disabled;
    color: #fff;
  }
  &.text-placeholder {
    background: $text-placeholder;
    color: #fff;
  }

  &.border-color {
    background: $border-color;
    color: #555;
  }

  &.component-divide-color {
    background: $component-divide-color;
    color: #555;
  }

  &.read-only {
    background: $read-only;
    color: #555;
  }

  &.white {
    background: $white;
    color: #555;
  }

  &.black {
    background: $black;
    color: #fff;
  }
}
</style>
