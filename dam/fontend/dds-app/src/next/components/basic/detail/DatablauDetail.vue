<template>
  <div class="datablau-detail">
    <el-form
      class="detail-form"
      ref="form"
      v-bind="$attrs"
      v-on="$listeners"
      :label-position="labelPosition"
      :label-width="labelWidth"
      label-suffix=" :"
    >
      <slot></slot>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'DatablauDetail',
  props: {
    labelWidth: {
      type: String,
      default: '180px',
    },
    labelPosition: {
      type: String,
      default: 'right',
    },
    column: {
      type: Number,
      default: 1,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      color: '#000',
      itemWidth: '',
    }
  },
  mounted() {
    this.setWidth()
  },
  methods: {
    setWidth() {
      this.itemWidth = (100 / this.column).toFixed(4) + '%'
      let item = this.$refs.form.$el.getElementsByClassName('el-form-item')
      let itemCon = this.$refs.form.$el.getElementsByClassName(
        'el-form-item__content'
      )
      if (Array.isArray(item)) {
        item.forEach((i, idx) => {
          item[idx].style.width = this.itemWidth
          if (idx % this.column === 0) {
            if (idx > 0) {
              item[idx - 1].style.paddingRight = 0
            }
          }
        })
      }
      if (Array.isArray(itemCon)) {
        if (this.column === 1) {
          itemCon.forEach((item, idx) => {
            itemCon[idx].style.width = '500px'
          })
        }
        if (this.fullWidth && this.column === 1) {
          itemCon.forEach((item, idx) => {
            itemCon[idx].style.width = 'auto'
          })
        }
      }
    },
  },
}
</script>
<style lang="scss">
@import '../../basic/color.sass';
.datablau-detail {
  .detail-form {
    padding: 0 20px;
    .el-form-item {
      margin-bottom: 6px;
      padding-right: 40px;
      display: inline;
      display: inline-block;
      vertical-align: top;
      .el-form-item__label {
        font-weight: bold;
        min-height: 26px;
        line-height: 18px;
        margin-top: 8px;
        color: #555;
        padding-right: 4px;
      }
      .el-form-item__content {
        min-height: 26px;
        line-height: 18px;
        margin-top: 8px;
        .el-tag {
          margin-top: -2px;
        }
      }
    }
  }
}
</style>
