<template>
  <el-container>
    <el-main>
      <el-alert>
        element文档请移步 https://element.eleme.cn/2.11/#/zh-CN/component/layout
        <br />
        设计稿请移步 //192.168.1.155/share/byx
        <br />
        本文档是基于设计稿编写的部分类和方法的部分参考,
        未尽的地方需要参考已有的页面（如数据质量等）
        <br />
        文档编写需要大家都参与进来，写了什么组件的话，可以注册为全局组件，然后在这里面简单介绍一下。全局组件位于src/datablauComponents,已有部分例子。
        <br />
        编写样式表，vue组件，以及修改文档的时候一定要注意向前兼容。可以标注@deprecated，原则上不允许废弃已被套用的样式
      </el-alert>
      <div class="d-upper-title">文字</div>
      <div id="text">
        <el-row :gutter="20" style="width: 600px">
          <el-col :span="6">
            <span class="d-title">.d-title</span>
          </el-col>
          <el-col :span="6">
            <span class="d-title">栏目标题</span>
          </el-col>
          <el-col :span="4">
            <span class="d-title">思源黑体</span>
          </el-col>
          <el-col :span="4">
            <span class="d-title">16px</span>
          </el-col>
          <el-col :span="4">
            <span class="d-title">#20293B</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="width: 600px">
          <el-col :span="6">
            <span class="d-vice-title">.d-vice-title</span>
          </el-col>
          <el-col :span="6">
            <span class="d-vice-title">副标题</span>
          </el-col>
          <el-col :span="4">
            <span class="d-vice-title">思源黑体</span>
          </el-col>
          <el-col :span="4">
            <span class="d-vice-title">14px</span>
          </el-col>
          <el-col :span="4">
            <span class="d-vice-title">#20293B</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="width: 600px">
          <el-col :span="6">
            <span class="d-figure">.d-figure</span>
          </el-col>
          <el-col :span="6">
            <span class="d-figure">导航/tab/按纽</span>
          </el-col>
          <el-col :span="4">
            <span class="d-figure">思源黑体</span>
          </el-col>
          <el-col :span="4">
            <span class="d-figure">13px</span>
          </el-col>
          <el-col :span="4">
            <span class="d-figure">#20293B</span>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="width: 600px">
          <el-col :span="6">
            <span class="d-text">.d-text</span>
          </el-col>
          <el-col :span="6">
            <span class="d-text">正文内容</span>
          </el-col>
          <el-col :span="4">
            <span class="d-text">思源黑体</span>
          </el-col>
          <el-col :span="4">
            <span class="d-text">12px</span>
          </el-col>
          <el-col :span="4">
            <span class="d-text">#20293B</span>
          </el-col>
        </el-row>
      </div>
      <div class="d-upper-title">图标</div>
      <el-alert>
        图标的普通调用方法为 &lt;span
        class=&quot;icon-i-domain&quot;&gt;&lt;/span&gt;
        <br />
        部分图标包含多个path，调用方法为 &lt;span
        class=&quot;icon-i-user&quot;&gt; &lt;span
        class=&quot;path1&quot;&gt;&lt;/span&gt; &lt;span
        class=&quot;path2&quot;&gt;&lt;/span&gt; &lt;/span&gt;
      </el-alert>

      <div id="icon">
        <div class="d-vice-title">产品功能</div>
        <div
          class="icon-box"
          v-for="(i, index) in icon"
          :key="index"
          :class="{ menu: !i.c }"
        >
          <div v-if="i.c">
            <span :class="'icon-i-' + i.c">
              <span v-for="p in i.p" :class="'path' + p" :key="p"></span>
            </span>
            <div class="label">{{ i.l }}</div>
            <div class="class-label">.icon-i-{{ i.c }}</div>
            <div class="class-label" v-if="i.p">
              <span style="color: #f46565">{{ i.p }}</span>
              paths
            </div>
          </div>
          <div v-else>
            <div class="d-vice-title">{{ i.l }}</div>
          </div>
        </div>
      </div>
      <div class="d-upper-title">颜色</div>
      <div class="d-vice-title">主色</div>
      <div class="color">
        <li class="box d-bg-blue">.d-bg-blue</li>
        <li class="box d-bg-light-blue">.d-bg-light-blue</li>
        <br />
        <br />
        <li class="box d-bg-black">.d-bg-black</li>
        <li class="box d-bg-grey-4">.d-bg-grey-4</li>
        <li class="box d-bg-grey-3">.d-bg-grey-3</li>
        <li class="box d-bg-grey-2">.d-bg-grey-2</li>
        <li class="box d-bg-grey-1">.d-bg-grey-1</li>
      </div>
      <div class="d-vice-title">辅助色</div>
      <div class="color">
        <li class="box d-bg-color-1">.d-bg-color-1</li>
        <li class="box d-bg-color-2">.d-bg-color-2</li>
        <li class="box d-bg-color-3">.d-bg-color-3</li>
        <li class="box d-bg-color-4">.d-bg-color-4</li>
        <li class="box d-bg-color-5">.d-bg-color-5</li>
        <li class="box d-bg-color-6">.d-bg-color-6</li>
        <li class="box d-bg-color-7">.d-bg-color-7</li>
        <li class="box d-bg-color-8">.d-bg-color-8</li>
        <br />
        <br />
        <li class="box d-bg-color-11">.d-bg-color-11</li>
        <li class="box d-bg-color-12">.d-bg-color-12</li>
        <li class="box d-bg-color-13">.d-bg-color-13</li>
        <li class="box d-bg-color-14">.d-bg-color-14</li>
        <li class="box d-bg-color-15">.d-bg-color-15</li>
        <li class="box d-bg-color-16">.d-bg-color-16</li>
        <li class="box d-bg-color-17">.d-bg-color-17</li>
        <li class="box d-bg-color-18">.d-bg-color-18</li>
      </div>
      <div id="button">
        <div class="d-upper-title">按钮</div>
        <div class="d-vice-title">基本/文字</div>
        <br />
        <span class="d-figure">主要按纽</span>
        <el-button type="primary" size="small">添加数据源</el-button>
        &lt;el-button type=&quot;primary&quot;
        size=&quot;small&quot;&gt;添加数据源&lt;/el-button&gt;
        <br />
        <br />
        <span class="d-figure">次要按纽</span>
        <el-button size="small">{{ $t('common.button.cancel') }}</el-button>
        &lt;el-button size=&quot;small&quot;&gt;取消&lt;/el-button&gt;
        <br />
        <br />
        <span class="d-figure">switch</span>
        <el-switch v-model="button.switch"></el-switch>
        &lt;el-switch&gt;&lt;/el-switch&gt;
        <br />
        <br />
      </div>
    </el-main>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      button: {
        switch: true,
      },
      icon: [
        {
          c: 'domain',
          l: '基础标准',
          p: 0,
        },
        {
          c: 'index',
          l: '指标体系',
          p: 0,
        },
        {
          c: 'domain-land',
          l: '标准落地',
          p: 0,
        },
        {
          c: 'metadata',
          l: '元数据',
          p: 0,
        },
        {
          c: 'business-process',
          l: '业务流程',
          p: 0,
        },
        {
          c: 'intel',
          l: '数据智能',
          p: 0,
        },
        {
          c: 'resource',
          l: '数据资源',
          p: 0,
        },
        {
          c: 'quality',
          l: '数据质量',
          p: 0,
        },
        {
          c: 'manage',
          l: '系统管理',
          p: 0,
        },
        {
          c: '',
          l: '产品功能-系统管理',
          p: 0,
        },
        {
          c: 'super-user',
          l: '超级用户',
          p: 3,
        },
        {
          c: 'user',
          l: '普通用户',
          p: 2,
        },
        {
          c: 'setting',
          l: '系统设置',
          p: 6,
        },
        {
          c: 'remote',
          l: '远程服务',
          p: 4,
        },
        {
          c: 'synonym',
          l: '同义词',
          p: 3,
        },
        {
          c: 'process',
          l: '流程中心',
          p: 3,
        },
        {
          c: '',
          l: '产品功能-个人工作台',
          p: 0,
        },
        {
          c: 'message-unread',
          l: '未读消息',
          p: 3,
        },
        {
          c: 'message',
          l: '已读消息',
          p: 7,
        },
        {
          c: 'message-sent',
          l: '发送成功',
          p: 5,
        },
        {
          c: '',
          l: '产品功能-元数据',
          p: 0,
        },
        {
          c: 'tag-has-rule',
          l: '标签有规则',
          p: 0,
        },
        {
          c: 'tag',
          l: '标签无规则',
          p: 0,
        },
        {
          c: '',
          l: '产品功能-数据质量',
          p: 0,
        },
        {
          c: 'business-rule',
          l: '业务规则',
          p: 3,
        },
        {
          c: 'technology-rule',
          l: '技术规则',
          p: 4,
        },
        {
          c: 'examine-job',
          l: '检查任务',
          p: 3,
        },
        {
          c: 'repair-job',
          l: '修复任务',
          p: 2,
        },
        {
          c: 'knowledge',
          l: '知识库',
          p: 3,
        },
        {
          c: '',
          l: '树/按钮',
          p: 0,
        },
        {
          c: 'folder',
          l: '文件夹',
          p: 2,
        },
        {
          c: 'fold',
          l: '折叠',
          p: 0,
        },
        {
          c: 'search',
          l: '搜索',
          p: 0,
        },
        {
          c: 'delete',
          l: '删除',
          p: 0,
        },
        {
          c: 'refresh',
          l: '刷新',
          p: 0,
        },
        {
          c: 'edit',
          l: '编辑',
          p: 0,
        },
        {
          c: 'more',
          l: '更多',
          p: 0,
        },
        {
          c: 'download',
          l: '下载',
          p: 0,
        },
        {
          c: 'return',
          l: '返回',
          p: 0,
        },
        {
          c: 'compare',
          l: '版本对比',
          p: 0,
        },
        {
          c: 'subscribe',
          l: '订阅',
          p: 0,
        },
        {
          c: 'start',
          l: '开始',
          p: 0,
        },
        {
          c: 'examine',
          l: '审核',
          p: 0,
        },
        {
          c: 'self',
          l: '自己',
          p: 0,
        },
        {
          c: 'others',
          l: '其他人',
          p: 0,
        },
        {
          c: 'test',
          l: '测试',
          p: 0,
        },
        {
          c: 'derive',
          l: '派生',
          p: 0,
        },
        {
          c: 'list',
          l: '列表模式',
          p: 0,
        },
        {
          c: 'block',
          l: '区块模式',
          p: 0,
        },
        {
          c: 'tree',
          l: '树形模式',
          p: 0,
        },
        {
          c: 'run',
          l: '运行-动态',
          p: 0,
        },
        {
          c: 'date',
          l: '日期',
          p: 0,
        },
        {
          c: 'change',
          l: '切换',
          p: 0,
        },
        {
          c: 'clear',
          l: '清除',
          p: 0,
        },
        {
          c: 'bell',
          l: '消息',
          p: 0,
        },
        {
          c: 'version',
          l: '版本',
          p: 0,
        },
        {
          c: 'error',
          l: '错误信息',
          p: 0,
        },
      ],
    }
  },
}
</script>

<style scoped lang="scss">
.el-main {
  background: #fff;
}
.el-container {
  overflow: auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
@import './main';
</style>
