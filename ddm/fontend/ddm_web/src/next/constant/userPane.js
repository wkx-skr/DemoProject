export default {
  data() {
    return {
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
        // 待审核: {
        //   label: this.$t('userPane.userPane.label_待审核'),
        //   value: this.$t('userPane.userPane.待审核'),
        //   resultType: 3,
        // },
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
