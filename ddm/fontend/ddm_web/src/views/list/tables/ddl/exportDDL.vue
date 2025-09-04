<template>
  <div class="export-ddl" >
    <datablau-dialog
      append-to-body
      :title="'DDL' + $store.state.$v.dataEntity.setting"
      width="900px"
      height="665"
      :visible.sync="showSettingDialog"
      custom-class="setting"
      :blackTheme="typeDataWareHouse"
    >
      <ddl-setting
        ref="ddlSetting"
        v-if="option"
        :default-option="option"
        :options="options"
        height="538"
        @close="showSettingDialog=false"
        :typeDataWareHouse="typeDataWareHouse"
      ></ddl-setting>
      <span slot="footer">
        <!--<div class="warn">-->
        <!--  <i class="iconfont icon-tips" style="margin-right:4px;font-size:14px"></i>选择一个版本产生CREATE脚本，两个版本产生ALTER脚本-->
        <!--</div>-->
        <datablau-button :themeBlack="typeDataWareHouse" type="cancel" @click="showSettingDialog = false"> </datablau-button>
        <datablau-button :themeBlack="typeDataWareHouse" type="normal" @click="saveOption" v-if="modelAdmin">
          保存配置
        </datablau-button>
        <datablau-button :themeBlack="typeDataWareHouse" type="primary" @click="getScript" >
          产生CREATE脚本
        </datablau-button>
    </span>
    </datablau-dialog>
    <!-- <div class="table-box">
      <el-table
        ref="multipleTable"
        :data="tableData"
        height="100%"
        row-class-name="row-can-click"
        @row-click="toggleSelection"
        @selection-change="handleSelectionChange"
        class="datablau-table">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="name" label="版本"></el-table-column>
        <el-table-column label="发布者" prop="creator"></el-table-column>
        <el-table-column prop="timestamp" label="时间" :formatter="$timeFormatter"></el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
      </el-table>
    </div> -->
    <div>
      <!-- <datablau-button  type="important" size="small" @click="getScript">{{$store.state.$v.dataEntity.generateCreateScript}}</datablau-button> -->
      <!-- <el-button type="primary" size="small" @click="getScript" :disabled="multipleSelection.length!==2">产生ALTER脚本</el-button> -->
      <!-- <datablau-button type="secondary" size="small" @click="callSetting"><i class="el-icon-setting"></i> {{$store.state.$v.dataEntity.typeFilter}}</datablau-button> -->
      <!-- <br><br>{{scriptTitle}} -->
    </div>
    <div class="wrapper" v-if="incrementalScript" :key="scriptKey">
      <div
        class="sql-container" :class="{'sql-container-black':$route.path.indexOf('sql_editor') !== -1}">
        <div class="sql-content">
          <pre><code class="language-sql"><p v-html="incrementalScript"></p></code></pre>
        </div>
      </div>
      <datablau-button :themeBlack="typeDataWareHouse" type="secondary" size="small" class="el-icon-download" @click="downloadScript"> {{$store.state.$v.dataEntity.output}}</datablau-button>
      <datablau-button :themeBlack="typeDataWareHouse" type="secondary" size="small" class="el-icon-document-copy" @click="copyScript"> {{$store.state.$v.dataEntity.copy}}</datablau-button>
    </div>
  </div>
</template>

<script>
import exportDDL from './exportDDL.js'
export default exportDDL
</script>

<style scoped>
.table-box {
  min-height:100px;
  height:300px;
  max-height:300px;
}
pre {
  /* height:300px;
  overflow:auto; */
}
</style>
<style lang="scss">
.el-button {
  span {
    font-family: Sansc;
  }
}
.setting {
  .el-dialog__footer {
    box-shadow: 0px -2px 4px 0px rgba(0,0,0,0.1);
  }
  .warn {
    line-height: 32px;
    float: left;
    font-size: 12px;
    font-weight: 400;
    color: #FF7519;
  }
}
.sql-container-black{
  .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string, .token.variable{
    background: transparent;
  }
}
</style>
