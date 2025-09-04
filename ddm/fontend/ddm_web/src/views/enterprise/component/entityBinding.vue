<template>
  <div>

    <datablau-dialog class="company-info-edit-wrapper" :visible.sync="binFlag" width="500px" height="350px" :before-close="close" :title="dataJson.bindTil">
      <div v-loading="loadings">
        <datablau-form :model="binForm" label-width="80px" ref="objectEditForm" v-show="!treeShow">
          <el-form-item label="模型" prop="name" class="chooseModel">
            <el-input v-model="binForm.name" placeholder="请点击右侧按钮选择模型" size="small"></el-input>
            <el-button size="small" @click="chooseModel" class="selectMode">选择模型</el-button>
          </el-form-item>
          <el-form-item :label="tableName" prop="elementId" class="chooseModel">
            <el-select v-model="binForm.elementId">
              <el-option v-for="t in elementList" :key="t.combinedId" :value="t.combinedId" :label="t.alias ? t.name+'('+t.alias+')': t.name" />
            </el-select>
            <el-button @click="chooseTable" class="maringL10">确认</el-button>
          </el-form-item>

        </datablau-form>
        <div class="listBox"  v-show="!treeShow">
          <p>* 请选择要绑定的表，点击确认按钮</p>
          <h5>要绑定的{{tableName}}：</h5>
          <el-tag
            :key="tag.label"
            v-for="tag in bingList"
            closable
            effect="plain"
            :hit="false"
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag.label}}
          </el-tag>
        </div>
      </div>
      <div slot="footer" class="dialog-footer" v-show="!treeShow">
        <datablau-button size="small" @click="bindBtn">绑定</datablau-button>
      </div>
      <div class="treeBox" v-show="treeShow">
        <datablau-tree
          v-loading="loading"
          ref="treeList"
          :data="menu"
          node-key="id"
          :props="defaultProps"
          default-expand-all
          highlight-current
          :data-icon-function="dataIconFunction"
          @node-click="nodeClick"
          :expand-on-click-node="false">
        </datablau-tree>
      </div>
      <div class="dialog-footer" slot="footer" >
        <datablau-button size="small" @click="selectBtn" :disabled="disabled" v-show="treeShow" class="treeSelectBtn">确定</datablau-button>
        <datablau-button size="small" @click="cancel" v-show="treeShow" class="treeSelectBtn">取消</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'

export default {
  props: {
    dataJson: {
      type: Object,
      default: () => {
        return {
          bindTil: '',
          id: ''
        }
      }
    },
    binFlag: {
      type: Boolean,
      default: () => false
    },
    flagClear: {
      type: Boolean,
      default: () => false
    }
  },
  watch: {
    flagClear () {
      this.binForm = {
        name: '',
        elementId: ''
      }
      // this.bingList = []
      this.$refs.objectEditForm.clearValidate()
      this.treeShow = false
    },
    dataJson: {
      handler (val) {
        val.id && this.getBingC()
      },
      deep: true
    }
  },
  computed: {
    tableName () {
      let name = '物理表'
      if (this.dataJson.bindTil === `绑定C'` || this.dataJson.bindTil === `绑定实体`) {
        name = '逻辑表'
      }
      return name
    }
  },
  data () {
    return {
      binForm: {
        name: '',
        elementId: ''
      },
      elementList: [],
      treeShow: false,
      menu: [],
      loading: false,
      loadings: false,
      defaultProps: {
        label: 'name',
        children: 'child',
        id: 'id'
      },
      disabled: true,
      bingList: []
    }
  },
  methods: {
    // 查询绑定的C`
    getBingC () {
      this.bingList = []
      this.loadings = true
      if (this.dataJson.bindTil === `绑定C'`) {
        HTTP.getBingC({ entityId: this.dataJson.id }).then(res => {
          if (res.length === 0) {
            this.logicalTree('', 'ModelCA')
            return
          }
          res.forEach(item => {
            item.aliasName = JSON.parse(item.alias).alias
            item.definition = JSON.parse(item.alias).definition
            item.parentObject = JSON.parse(item.alias).parentObject
            this.logicalTree(item, 'ModelCA')
          })
        }).catch(e => {})
      } else if (this.dataJson.bindTil === `C'绑定物理表`) {
        HTTP.getCphysic({ entityId: this.dataJson.id }).then(res => {
          if (res.length === 0) {
            this.logicalTree('', 'ModelD')
            return
          }
          res.forEach(item => {
            item.aliasName = JSON.parse(item.alias).alias
            item.definition = JSON.parse(item.alias).definition
            item.parentObject = JSON.parse(item.alias).parentObject
            this.logicalTree(item, 'ModelD')
          })
        }).catch(e => {})
      } else if (this.dataJson.bindTil === `绑定实体`) {
        HTTP.getBindEntity({ businessObjectId: this.dataJson.id }).then(res => {
          if (res.length === 0) {
            this.logicalTree('', 'ModelC')
            return
          }
          res.forEach(item => {
            item.aliasName = JSON.parse(item.alias).alias
            item.definition = JSON.parse(item.alias).definition
            item.parentObject = JSON.parse(item.alias).parentObject
            this.logicalTree(item, 'ModelC')
          })
        }).catch(e => {})
      } else {
        HTTP.getEntity({ entityId: this.dataJson.id }).then(res => {
          if (res.length === 0) {
            this.logicalTree('', 'ModelD')
            return
          }
          res.forEach(item => {
            item.aliasName = JSON.parse(item.alias).alias
            item.definition = JSON.parse(item.alias).definition
            item.parentObject = JSON.parse(item.alias).parentObject
            this.logicalTree(item, 'ModelD')
          })
        }).catch(e => {})
      }
    },
    close () {
      this.$emit('close')
    },
    // 选择模型按钮
    chooseModel () {
      this.treeShow = true
      this.disabled = true
      if (this.dataJson.bindTil === `绑定C'`) {
        // this.logicalTree()
        this.loading = false
      } else {
        // this.physicsTree()
        this.loading = false
      }
    },
    // 绑定C`查询逻辑树
    logicalTree (item = {}, model) {
      this.loading = true
      HTTP.getRelationModelTree(model).then(res => {
        this.dataEach([res], item)
        this.menu = [res]
      }).catch(e => {
        this.loading = false
      })
    },
    dataEach (val, obj) {
      val.forEach(item => {
        item.models && item.models.length !== 0 && item.child.push(...item.models)
        if (item.child) {
          // item.childCategories.push(...item.child)
          item.child.forEach(items => {
            if (obj && items.id === Number(obj.modelId)) {
              obj.label = `${items.name} - ${obj.aliasName ? obj.name + '(' + obj.aliasName + ')' : obj.name}`
              let flag = true
              this.bingList.some(i => {
                if (i.combinedId === obj.combinedId) {
                  flag = false
                }
              })
              flag && this.bingList.push(obj)
            }
          })
        }
        if (item.child && item.child.length !== 0) {
          this.dataEach(item.child, obj)
        }
      })
      this.loadings = false
    },
    chooseTable () {
      let tableName = ''
      let obj = {}
      let flag = true
      this.bingList.some(item => {
        if (item.combinedId === this.binForm.elementId) {
          flag = false
          return false
        }
      })
      if (!flag || this.binForm.elementId === '') {
        return
      }
      this.elementList.forEach(item => {
        if (item.combinedId === this.binForm.elementId) {
          tableName = item.alias ? item.name + '(' + item.alias + ')' : item.name
        }
      })
      obj = {
        label: `${this.binForm.name} - ${tableName}`,
        combinedId: this.binForm.elementId
      }
      this.bingList.push(obj)
    },
    // 绑定按钮
    bindBtn () {
      let dependerIds = []
      this.bingList.forEach(item => {
        dependerIds.push(item.combinedId)
      })
      // if (dependerIds.length === 0) {
      //   this.$message.error('请先选择要绑定的物理表')
      //   return
      // }
      let mess = ''
      dependerIds.length !== 0 ? mess = '绑定成功' : mess = '解绑成功'
      if (this.dataJson.bindTil === `绑定C'`) {
        // dataJson
        HTTP.bingC({ ownerId: this.dataJson.id, dependerIds }).then(res => {
          this.$message.success(mess)
          this.$emit('close')
        }).catch(e => {
        })
      } else if (this.dataJson.bindTil === `C'绑定物理表`) {
        HTTP.bindPhysicC({ ownerId: this.dataJson.id, dependerIds }).then(res => {
          this.$message.success(mess)
          this.$emit('close')
        }).catch(e => {
        })
      } else if (this.dataJson.bindTil === `绑定实体`) {
        HTTP.bindEntity({ ownerId: this.dataJson.id, dependerIds }).then(res => {
          this.$message.success(mess)
          this.$emit('close')
        }).catch(e => {
        })
      } else {
        HTTP.bingEntityTable({ ownerId: this.dataJson.id, dependerIds }).then(res => {
          this.$message.success(mess)
          this.$emit('close')
        }).catch(e => {
        })
      }
    },
    // 树中的确定按钮
    selectBtn () {
      this.binForm.elementId = ''
      this.treeShow = false
      this.loadings = true
      if (this.dataJson.bindTil === `绑定C'` || this.dataJson.bindTil === `绑定实体`) {
        HTTP.logicalEntity({ modelId: this.binForm.id }).then(res => {
          this.elementList = res
          this.loadings = false
        }).catch(e => {
          this.elementList = []
          this.loadings = false
        })
      } else {
        HTTP.getEntityTable({ modelId: this.binForm.id }).then(res => {
          this.elementList = res
          this.loadings = false
        }).catch(e => {
          this.elementList = []
          this.loadings = false
        })
      }
    },
    dataIconFunction (data) {
      if (!data.categoryId) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-shujuyuan'
      }
    },
    //  节点点击
    nodeClick (obj, node) {
      if (obj.categoryId) {
        this.binForm.name = obj.name
        this.binForm.id = obj.id
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    cancel () {
      this.treeShow = !this.treeShow
      this.binForm.name = ''
      this.binForm.id = ''
    },
    // tag删除
    handleClose (tag) {
      this.bingList.splice(this.bingList.indexOf(tag), 1)
    }
  },
  mounted () {
  }
}
</script>

<style scoped lang='scss'>
  .colorF{
    color: #409eff;
  }
  /deep/.chooseModel > div{
    display: flex;
    align-item:center;
  }
  /deep/ button.selectMode{
    margin-left: 10px;
    height: 32px;
    position: relative;;
    top: 5px;
  }
  .treeBox{
    /*height: 235px;*/
    overflow: auto;
  }
  /deep/.el-dialog .el-dialog__body{
    div {
      padding: 0 20px 22px;
      text-align: right;
    }
  }
  .butBox{
    text-align: right;
    padding-right: 30px;
    /*right: 30px;*/
  }
  .bindBtnBox{
    text-align: right;
  }
  .maringL10{
    margin-left: 10px;
    width: 91px;
  }
  .listBox{
    p{
      color: #999;
      font-size: 10px;
      margin-bottom: 5px;
    }
    h5{
      margin-bottom: 5px;
    }
    /deep/ .el-tag{
      border:0;
      display: flex;
      width: 90%;
      height: 20px;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
