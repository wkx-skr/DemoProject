<template>
  <div class="box">
    <div class="row-title">
      <!--<el-button type="primary" size="mini" class="add-btn">后退</el-button>-->
      <h2>列操作</h2>
      <i class="fa fa-close close-btn" @click="goPreview"></i>
    </div>

    <el-scrollbar class="item-box">
      <div class="item">
        <h2>移动</h2>
        <p>操作提示：直接拖拽表头即可移动该列</p>
      </div>
      <div class="item">
        <h2>转换类型</h2>
        <el-select
          v-model="newDataType"
          size="mini"
          style="width: 160px; margin-left: 2em"
        >
          <el-option value="Boolean" label="布尔值"></el-option>
          <el-option value="String" label="字符串"></el-option>
          <el-option value="Double" label="浮点型"></el-option>
          <el-option value="Integer" label="整型"></el-option>
          <el-option value="DateTime" label="日期"></el-option>
        </el-select>
        <el-button
          size="mini"
          type="text"
          style="float: right; margin-right: 22px"
          @click="updateDataType"
        >

          {{ $t('common.button.ok') }}

        </el-button>
        <br />
        <br />
      </div>
      <div class="item">
        <h2>移除</h2>
        <p>
          drop {{ column.label }}
          <el-button
            size="mini"
            type="text"
            style="float: right; margin-right: 22px"
            @click="dropColumn"
          >

            {{ $t('common.button.ok') }}

          </el-button>
        </p>
      </div>
      <div class="item">
        <h2>重命名</h2>
        <p>
          {{ column.label }} to
          <!--<span class="green">'newColumnName'</span>-->
        </p>
        <p>
          <el-input
            size="mini"
            style="width: 160px"
            v-model="newName"
            placeholder="新的列名"
          ></el-input>
          <el-button
            size="mini"
            type="text"
            style="float: right; margin-right: 22px"
            @click="rename"
          >

            {{ $t('common.button.ok') }}

          </el-button>
        </p>
      </div>
      <div class="item" v-if="showSplit">
        <h2>切割</h2>
        <p>
          用间隔符切割{{ column.label }}的数据
          <!--<span class="green">'newColumnName'</span>-->
        </p>
        <p>
          分隔符
          <el-input
            size="mini"
            style="width: 170px"
            v-model="separateSymbol"
            placeholder="作为分隔依据的字符"
          ></el-input>
        </p>
        <p>
          新列名
          <el-input
            size="mini"
            style="width: 170px"
            v-model="separateNames"
            placeholder="多个列名间用半角分号分隔"
          ></el-input>
        </p>
        <p>
          <el-button
            size="mini"
            type="text"
            style="float: right; margin-right: 22px"
            @click="split"
          >

            {{ $t('common.button.ok') }}

          </el-button>
        </p>
      </div>
      <div class="item" v-if="showRetain">
        <h2>保留</h2>
        <p>保留{{ column.label }}符合以下条件的数据</p>
        <p>
          <el-input
            size="mini"
            style="width: 230px"
            v-model="retainCondition"
            type="textarea"
            placeholder="在此输入condition语句"
          ></el-input>
        </p>
        <p>
          <el-button
            size="mini"
            type="text"
            style="float: right; margin-right: 22px"
            @click="retain"
          >

            {{ $t('common.button.ok') }}

          </el-button>
        </p>
      </div>
      <div class="item" v-if="showDerive">
        <h2>提取</h2>
        <p>从{{ column.label }}中按以下条件提取数据</p>
        <p>
          <el-input
            size="mini"
            style="width: 230px"
            v-model="deriveCondition"
            type="textarea"
            placeholder="在此输入condition语句"
          ></el-input>
        </p>

        <p>
          新列名
          <el-input
            size="mini"
            style="width: 170px"
            v-model="newDeriveColumnName"
            placeholder="在此输入新列名"
          ></el-input>
        </p>
        <p>
          <el-button
            size="mini"
            type="text"
            style="float: right; margin-right: 22px"
            @click="derive"
          >

            {{ $t('common.button.ok') }}

          </el-button>
        </p>
      </div>

      <!--<div class="item" @click="enforce('replace')">-->
      <!--<h2>替换</h2>-->
      <!--<p>source</p>-->
      <!--<p>preview</p>-->
      <!--</div>-->
      <!--<div class="item" @click="enforce('retain')">-->
      <!--<h2>保留</h2>-->
      <!--</div>-->
      <!--<div class="item" @click="enforce('new')">-->
      <!--<h2>新建列</h2>-->
      <!--</div>-->
    </el-scrollbar>
  </div>
</template>
<script>
export default {
  props: ['selectedColumns'],
  data() {
    return {
      column: {},
      newName: '',
      newDataType: '',
      separateSymbol: '',
      separateNames: '',
      retainCondition: '',
      userCondition: '',
      deriveCondition: '',
      newDeriveColumnName: '',
      type: '',
    }
  },
  mounted() {
    this.buildSuggestion()
  },
  methods: {
    buildSuggestion() {
      const columns = this.selectedColumns
      const suggestion = []
      if (columns.size === 1) {
        columns.forEach(item => {
          this.buildSingleColumnSuggestion(item)
          this.type = item.type
        })
      } else {
      }
    },
    buildSingleColumnSuggestion(msg) {
      this.column = msg
    },
    goPreview() {
      this.$bus.$emit('enforceStep', {
        stepType: 'return',
      })
    },
    dropColumn() {
      this.$bus.$emit('enforceStep', {
        column: this.column,
        single: true,
        stepType: 'drop',
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Drop</em> <ins>${this.column.label}</ins>`
      )
    },
    enforce(type) {},
    rename() {
      this.$bus.$emit('enforceStep', {
        column: this.column,
        columnName: this.column.label,
        newColumnName: this.newName,
        single: true,
        stepType: 'rename',
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Rename</em> <ins>${this.column.label}</ins> To <ins>${this.newName}</ins>`
      )
    },
    updateDataType() {
      this.$bus.$emit('enforceStep', {
        '@class': 'com.datablau.etl.action.condition.ChangeTypeCondition',
        col: this.column.index,
        columnName: this.column.label,
        newDataType: this.newDataType,
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Change</em> <ins>${this.column.label}</ins> type To <ins>${this.newDataType}</ins>`
      )
    },
    split() {
      this.$bus.$emit('enforceStep', {
        '@class': 'com.datablau.etl.action.condition.SplitCondition',
        col: this.column.index,
        columnName: this.column.label,
        separateNames: this.separateNames.split(';'),
        separators: [this.separateSymbol],
        single: true,
        timeFormat: 'YYYY-MM-DD',
        stepType: 'split',
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Split Column</em> <ins>${
          this.column.label
        }</ins> To <ins>${this.separateNames.split(';').join(', ')}</ins>`
      )
    },
    retain() {
      this.$bus.$emit('enforceStep', {
        data: {
          '@class': 'com.datablau.etl.action.condition.KeepCondition',
          userCondition: this.userCondition,
          condition: this.retainCondition,
        },
        single: true,
        stepType: 'retain',
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Keep rows If </em> <ins>${this.retainCondition}</ins>`
      )
    },
    derive() {
      if (!this.newDeriveColumnName) {
        this.newDeriveColumnName = this.column.label + '_derive'
      }
      this.$bus.$emit('enforceStep', {
        '@class': 'com.datablau.etl.action.condition.DeriveCondition',
        userCondition: this.userCondition,
        condition: this.deriveCondition,
        newColumnName: this.newDeriveColumnName,
      })
      this.$bus.$emit(
        'updateRecipe',
        `<em>Derive new Column</em> from <ins>${this.column.label}</ins>  by <ins>${this.deriveCondition}</ins>`
      )
    },
  },
  computed: {
    showSplit() {
      switch (this.type) {
        case 'Binary':
        case 'BigInteger':
        case 'Integer':
        case 'Boolean':
          return false
        default:
          return true
      }
    },
    showRetain() {
      switch (this.type) {
        case 'Binary':
          return false
        default:
          return true
      }
    },
    showDerive() {
      switch (this.type) {
        case 'Binary':
          return false
        default:
          return true
      }
    },
  },
}
</script>
<style lang="scss" scoped="scoped">
.box {
  /*background:yellow;*/
  height: 100%;
}
.item-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 40px;
  overflow: hidden;
}
.row-title {
  height: 40px;
  line-height: 38px;
  background-color: #f6f6f4;
  .add-btn {
    margin-left: 10px;
  }
  h2 {
    display: inline-block;
    /*font-weight:normal;*/
    font-size: 14px;
    color: #494850;
    margin-left:/*65px*/ 125px;
  }
  .close-btn {
    display: inline-block;
    height: 38px;
    line-height: 38px;
    margin-right: 10px;
    float: right;
    cursor: pointer;
    font-size: 16px;
  }
}
.item {
  border-radius: 3px;
  margin: 10px 10px 0;
  border: 1px solid #efeff0;
  min-height: 60px;
  /*cursor: pointer;*/
  &:hover {
    box-shadow: 0px 0px 4px #666;
  }
  h2 {
    height: 30px;
    line-height: 30px;
    background: #f6f6f4;
    font-size: 14px;
    font-weight: normal;
    color: #000;
    text-indent: 1em;
    margin-bottom: 0.5em;
  }
  p {
    min-height: 24px;
    line-height: 24px;
    text-indent: 1em;
    margin-bottom: 0.5em;
  }
  .green {
    color: #86b881;
  }
}
</style>
