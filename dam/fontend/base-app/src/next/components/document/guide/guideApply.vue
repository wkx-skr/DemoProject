<template>
  <div>
    <h1>组件应用指南（试行）</h1>
    <h2>1. 开发管理</h2>
    <p>
      蓝湖链接:元数据
      <datablau-button type="text" @click="openLanhu">
        https://lanhuapp.com/url/qKCXj-A9lkEj
      </datablau-button>
    </p>
    <p>
      DAM功能列表（2-4月）
      <datablau-button type="text" @click="openExcel">
        https://docs.qq.com/sheet/DTG9sSHRYckZwamto?tab=zkdc9a
      </datablau-button>
    </p>
    <p>
      禅道
      <datablau-button type="text" @click="openZentao">
        内网链接
      </datablau-button>
      <datablau-button type="text" @click="openZentaoOuter">
        外网链接（不在北京的同学使用）
      </datablau-button>
    </p>
    <h2>沟通</h2>
    <p>
      1）每天适时召开站会沟通
      <br />
      2）每周五进行成果演示和进度同步
      <br />
      3）根据敏捷开发原则，所有会议对外公开，会有不固定的观察者。观察者不能在站会上发言，但是可以在成果演示会上畅所欲言（跑题的情况会被主持人制止）
      <br />
      4）紧急问题不需要等待会议，随时向相关人员求证，宜早不宜迟
    </p>
    <br />
    <h2>2. 开发流程</h2>
    <p style="height: 300px">
      <el-steps direction="vertical">
        <el-step
          title="了解任务"
          status="process"
          description='开发请先行浏览"DAM功能列表（2-4月）",了解自己的工期计划和主要功能点。'
        ></el-step>
        <el-step
          title="接收任务"
          status="process"
          description='开发请访问禅道项目地址查看自己的任务。任务标题为"功能列表"中的一级目录。请在领到的所有任务中预先填写预计工时。预计工时会涉及到项目燃尽图和报表，请合理填写。预计工时被判定为异常值时会进行全体评审，需开发进行答辩。'
        ></el-step>
        <el-step
          title="开发"
          status="process"
          description="遵循开发规范，有图的按照蓝湖的设计图进行100%还原度的代码开发，没有图的参考相似页面，理解方面有问题尽早与设计人员沟通。开发的功能点随开发进度录入禅道的“任务描述”中。"
        ></el-step>
        <el-step
          title="完成"
          status="process"
          description="任务开发、自查完毕后指派给所属任务的设计人员进行验证，设计人员查验后转产品经理"
        ></el-step>
      </el-steps>
    </p>
    <h2>3. 开发原则</h2>
    <br />
    1)
    遇到已有组件不便使用或需要扩展时，及时提出，评审后由组件作者进行迭代。不要自行采取强制覆盖样式、覆盖功能或修改组件默认行为、甚至不使用已有组件等方式来“解决”问题。
    <br />
    <br />
    2) 需要新组件时，及时提出。经过评审后，会优先安排组件开发供开发者使用。
    <br />
    <br />
    3)
    有图的页面按图开发。无图的页面，能够参照类似页面的，进行参照开发。确有困难或疑义的，及时向所属模块的设计人员提出。
    <br />
    <br />
    4) 注意修改时不要造成功能退化和全局作用域污染。
  </div>
</template>

<script>
export default {
  methods: {
    openLanhu() {
      window.open(`https://lanhuapp.com/url/qKCXj-A9lkEj`)
    },
    openExcel() {
      window.open(`https://docs.qq.com/sheet/DTG9sSHRYckZwamto?tab=zkdc9a`)
    },
    openZentao() {
      window.open(` http://192.168.1.16/zentao/project-task-97.html`)
    },
    openZentaoOuter() {
      window.open(`http://office.datablau.cn:42222/zentao/project-task-97.html`)
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../base.scss';
</style>
