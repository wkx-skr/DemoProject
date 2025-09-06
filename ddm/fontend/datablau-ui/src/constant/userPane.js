export default {
  data() {
    return {
      applyTypesMap: {
        数据权限申请: {
          label: this.$t('userPane.userPane.label_数据权限申请'),
          value: this.$t('userPane.userPane.数据权限申请'),
          businessType: 'shujuquanxian',
        },
        数据标准: {
          label: this.$t('userPane.userPane.label_数据标准'),
          value: this.$t('userPane.userPane.数据标准'),
          businessType: 'shujubiaozhun',
        },
        数据申请: {
          label: this.$t('userPane.userPane.label_数据申请'),
          value: this.$t('userPane.userPane.数据申请'),
          businessType: 'shujushenqing',
        },
        标准代码: {
          label: this.$t('userPane.userPane.label_标准代码'),
          value: this.$t('userPane.userPane.标准代码'),
          businessType: 'biaozhundaima',
        },
        指标权限申请: {
          label: this.$t('userPane.userPane.label_指标权限申请'),
          value: this.$t('userPane.userPane.指标权限申请'),
          businessType: 'zhibiaoquanxian',
        },
        发布目录申请: {
          label: this.$t('userPane.userPane.label_发布目录申请'),
          value: 'CATALOG_PUBLISH_APPLY',
          businessType: 'zichanmulu',
        },
        下线目录申请: {
          label: this.$t('userPane.userPane.label_下线目录申请'),
          value: 'CATALOG_OFFLINE_APPLY',
          businessType: 'zichanmulu',
        },
        变更目录申请: {
          label: this.$t('userPane.userPane.label_变更目录申请'),
          value: 'CATALOG_CHANGE_APPLY',
          businessType: 'zichanmulu',
        },
        资产发布申请: {
          label: this.$t('userPane.userPane.label_资产发布申请'),
          value: 'ASSET_PUBLISH_APPLY',
          businessType: 'shujuzichan',
        },
        资产下线申请: {
          label: this.$t('userPane.userPane.label_资产下线申请'),
          value: 'ASSET_OFFLINE_APPLY',
          businessType: 'shujuzichan',
        },
        资产目录权限申请: {
          label: this.$t('userPane.userPane.label_资产目录权限申请'),
          value: this.$t('userPane.userPane.资产目录权限申请'),
          businessType: 'zichanmulu',
        },
        指标标准: {
          label: this.$t('userPane.userPane.label_指标标准'),
          value: this.$t('userPane.userPane.指标标准'),
          businessType: 'zhibiaobiaozhun',
        },
        领域数据标准: {
          label: this.$t('userPane.userPane.label_领域数据标准'),
          value: this.$t('userPane.userPane.领域数据标准'),
          businessType: 'lingyushujubioazhun',
        },
        领域标准代码: {
          label: this.$t('userPane.userPane.label_领域标准代码'),
          value: this.$t('userPane.userPane.领域标准代码'),
          businessType: 'lingyubiaozhundaima',
        },
        技术规则: {
          label: this.$t('userPane.userPane.label_技术规则'),
          value: this.$t('userPane.userPane.技术规则'),
          businessType: 'jishuguize',
        },
      },
      resultMap: {
        审核通过: {
          label: this.$t('userPane.userPane.label_审核通过'),
          value: this.$t('userPane.userPane.审核通过'),
          resultType: 4,
        },
        审核中: {
          label: this.$t('userPane.userPane.label_审核中'),
          value: this.$t('userPane.userPane.审核中'),
          resultType: 2,
        },
        审核不通过: {
          label: this.$t('userPane.userPane.label_审核不通过'),
          value: this.$t('userPane.userPane.审核不通过'),
          resultType: 5,
        },
        已撤销: {
          label: this.$t('userPane.userPane.label_已撤销'),
          value: this.$t('userPane.userPane.已撤销'),
          resultType: 7,
        },
        待审核: {
          label: this.$t('userPane.userPane.label_待审核'),
          value: this.$t('userPane.userPane.待审核'),
          resultType: 3,
        },
      },
      messageTypeMap: {
        1: this.$t('userPane.userPane.messageType_1'),
        1000: this.$t('userPane.userPane.messageType_1000'),
        1001: this.$t('userPane.userPane.messageType_1001'),
        1002: this.$t('userPane.userPane.messageType_1002'),
        1003: this.$t('userPane.userPane.messageType_1003'),
        1100: this.$t('userPane.userPane.messageType_1100'),
        1200: this.$t('userPane.userPane.messageType_1200'),
        1300: this.$t('userPane.userPane.messageType_1300'),
        1400: this.$t('userPane.userPane.messageType_1400'),
        1500: this.$t('userPane.userPane.messageType_1500'),
        1600: this.$t('userPane.userPane.messageType_1600'),
        9999: this.$t('userPane.userPane.messageType_9999'),
      },
    }
  },
}
