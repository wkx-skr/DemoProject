<template>
  <div>
    <div class="til">资产图谱</div>
    <div class="graphWrap">
      <div class="assetGraph" @click="flag = true"></div>
      <div class="assetGraph" @click="flag = true"></div>
      <div class="assetGraph" @click="flag = true"></div>

      <div class="addBox" @click="addMapFlag = true">+</div>
    </div>
    <model-graph-aryh :flag="flag" @close="flag = false"></model-graph-aryh>
    <datablau-dialog class="company-info-edit-wrapper" width="500px" :before-close='cancel' :visible.sync="addMapFlag" title="添加知识图谱">
      <datablau-form ref="from" :rules="rules" :model="from" label-position="left" label-width="60px" class="fromBox">
        <el-form-item label="图谱名称" prop="name">
          <el-input type="text" v-model="from.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="des">
          <el-input type="textarea" v-model="from.des"></el-input>
        </el-form-item>
        <el-form-item label='类型' prop="type">
          <el-select v-model="from.type" placeholder="请选择">
            <el-option
              v-for="item in optionsType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label='来自主题' prop="type">
          <el-select v-model="from.type" placeholder="请选择">
            <el-option
              v-for="item in optionsType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label='缩略图' prop="type">
          <el-select v-model="from.type" placeholder="请选择">
            <el-option
              v-for="item in optionsType"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </datablau-form>
      <div slot="footer" class="dialog-footer">
        <datablau-button size="medium" type="primary" @click="save">确定</datablau-button>
        <datablau-button size="medium"  @click="cancel">取消</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import ModelGraphAryh from '../component/modelGraphAryh'
export default {
  components: { ModelGraphAryh },
  data () {
    return {
      flag: false,
      addMapFlag: false,
      from: {},
      rules: { },
      optionsType: []
    }
  },
  methods: {
    save () {},
    cancel () {
      this.addMapFlag = false
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  .graphWrap{
    display: flex;
    margin-top: 10px;
  }
  .assetGraph{
    width: 141px;
    height: 95px;
    margin-right: 10px;
    background: #ccc;
  }
  .til{
    font-weight: bold;
    /*margin-top: 10px;*/
    font-size: 14px;
  }
  .addBox{
    width: 100px;
    height: 95px;
    background: #169BD5;
    border-radius: 15px;
    color: #fff;
    font-size: 38px;
    text-align: center;
    line-height: 95px;
    cursor: pointer;
  }
</style>
