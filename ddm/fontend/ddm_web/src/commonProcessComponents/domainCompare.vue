<template>
  <!--  <standard-scan
    v-if="domainId && udps"
    :domain-id="domainId"
    :udps="udps"
    @updating-domain-id="setUpdatingDomainId"
    @base-dom="setBaseDom"
  ></standard-scan>-->
  <div>
    <el-row :gutter="10" style="padding-top: 10px">
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            background: #f5f5f5;
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.beforeChange') }}
        </div>
        <standard-scan
          v-if="commonData.processInstanceId && udps"
          :processInstanceId="commonData.processInstanceId"
          :label-text="labelText()"
          :udps="udps"
          @updating-domain-id="setUpdatingDomainId"
          @base-dom="setBaseDom"
        ></standard-scan>
      </el-col>
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            color: #66bf16;
            background: rgba(102, 191, 22, 0.1);
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.afterChange') }}

          <!--<div
            class="green-checkbox"
            style="
              font-size: 12px;
              position: relative;
              top: -34px;
              right: -168px;
            "
          >
            <el-checkbox v-model="checkBoxValueTrue"></el-checkbox>
            仅显示修改
          </div>-->
        </div>
        <standard-scan
          v-if="domainId && udps"
          :domain-id="domainId"
          :label-text="labelText()"
          :udps="udps"
          :base-dom="baseDom"
        ></standard-scan>
      </el-col>
    </el-row>
    <div class="form-outer"></div>
  </div>
</template>
<script>
import HTTP from '@/resource/http'
import standardScan from './domainDetailPages/standardScanBasic.vue'
export default {
  data() {
    return {
      udps: {},
      domainId: '',
      updatingDomainId: '',
      baseDom: null,
    }
  },
  components: {
    standardScan,
  },
  props: {
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  mounted() {
  },
  watch: {
    commonData: {
      handler(val) {
        if (val.processInstanceId) {
          this.getId()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getId() {
      this.$http
        .post(
          `/domain/flow/getIdByProcessInstanceId?processInstanceId=${this.commonData.processInstanceId}`
        )
        .then(res => {
          this.domainId = res.data
        })
    },
    // todo --zl
    setUpdatingDomainId(domainId) {
      this.updatingDomainId = domainId
    },
    setBaseDom(dom) {
      this.baseDom = dom
    },
    labelText() {
      let obj = {
        typeName: '数据标准',
        standard: this.$version.domain.propertyType.standard,
        domainCode: this.$version.domain.property.domainCode,
        status: '标准状态',
        name: '标准名称',
        nameAbbr: '标准',
      }

      return obj
    },
  },
}
</script>
