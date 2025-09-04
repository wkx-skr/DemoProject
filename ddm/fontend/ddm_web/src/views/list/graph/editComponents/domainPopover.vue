<template>
  <div>
    <el-popover
      popper-class='domain-popover'
      placement="right"
      width="300"
      trigger="hover"
      :open-delay="600"
    >
      <div class="domain-title">
        <!--        <i class="tree-icon domain" ></i>-->
        <i class="iconfont icon-biaozhun" style="color: rgb(92, 183, 147);"></i>
        {{ item.chName }}
        <p
          v-if="!$store.state.damConnectable && !inElectron"
          style="cursor:pointer"
          @click='go2Domain(item.id)'
        >
          标准详情</p>
      </div>
      <div class="domain-disc">
        {{item.description}}
      </div>
      <div class="text-item">
        <span class="label">
            标准编号
        </span>
        <span>
            {{item.domainCode}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            英文名称
        </span>
        <span>
            {{item.enName}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            英文缩写
        </span>
        <span>
            {{item.abbrivation}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            数据类型
        </span>
        <span>
            {{item.dataType}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            长度
        </span>
        <span>
            {{item.dataScale}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            精度
        </span>
        <span>
            {{item.dataPrecision}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            路径
        </span>
        <span>
            {{item.path && item.path.join('/')}}
        </span>
      </div>
      <div class="text-item">
        <span class="label">
            关联标准代码
        </span>
        <span>
            {{item.referenceCode}}
        </span>
      </div>
      <span style="display: inline-block;width: 165px;" slot="reference"><span style="color:#4d82b8;font-weight: bold;font-size:14px;margin-right:.5em;">G</span>{{item.chName}}</span>
    </el-popover>
  </div>
</template>

<script>
import inElectron from '@/resource/utils/environment'
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      inElectron
    }
  },
  methods: {
    go2Domain (id) {
      this.$go2Domain(id)
    }
  }
}
</script>

<style lang="scss">
  .el-popover.domain-popover {
    padding: 10px;

    .tree-icon.domain {
      left: 5px;
    }

    .domain-title {
      position: relative;
      font-size: 14px;
      font-weight: 500;
      color: #555555;

      > p {
        position: absolute;
        top: 0;
        right: 17px;
        color: #4496FF;
        font-size: 12px;
      }
    }

    .domain-disc {
      margin-bottom: 7px;
      padding-left: 24px;
      font-size: 12px;
      font-weight: 400;
      text-align: left;
      color: #555555;
      line-height: 24px;
      border-bottom: 1px solid rgba(85, 85, 85, 0.10);;
    }

    .text-item {
      font-size: 12px;
      font-weight: 400;
      color: #555555;
      margin-bottom: 5px;
    }

    .label {
      margin-right: 10px;
      display: inline-block;
      width: 72px;
      text-align: right;
    }
  }
</style>
