export default {
  data() {
    return {
      resultMap: {
        PASS: {
          label: this.$t('userPane.userPane.label_审核通过'),
          value: 'PASS',
          resultType: 4,
        },
        APPLY: {
          label: this.$t('userPane.userPane.label_审核中'),
          value: 'APPLY',
          resultType: 2,
        },
        REJECT: {
          label: this.$t('userPane.userPane.label_审核不通过'),
          value: 'REJECT',
          resultType: 5,
        },
        REVOKE: {
          label: this.$t('userPane.userPane.label_已撤销'),
          value: 'REVOKE',
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
