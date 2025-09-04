<template>
  <div
    class="focus-switch-btn"
    :style="{ width: $i18n.locale === 'zh' ? '80px' : '120px' }"
    :class="{ inactive: syncValue, disabled: disabled }"
    @click="handleClick"
  >
    <i v-if="icon" :class="icon" class="icon-container"></i>
    <span class="inner-text">
      {{ label }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'focusSwitchButton',
  data() {
    return {}
  },
  props: {
    label: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    tooltip: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    syncValue: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      // console.log("dataInit");
    },
    handleClick() {
      if (this.disabled) return
      this.$emit('change')
      // this.syncValue = !this.syncValue;
    },
  },
  watch: {
    // syncValue(newVal) {
    //   this.$emit('change', newVal);
    // }
  },
}
</script>

<style lang="scss" scoped>
.focus-switch-btn {
  box-sizing: border-box;
  display: inline-block;
  width: 80px;
  height: 34px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  //border-radius: 2px;
  line-height: 32px;
  text-align: center;
  color: #20293b;
  cursor: pointer;
  transition: border 0.5s linear;

  &:first-child {
    border-radius: 2px 0px 0px 2px;
  }

  &:last-child {
    border-radius: 0px 2px 2px 0px;
  }

  .icon-container {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin: 7px 0 0 10px;
    position: relative;
    top: -1px;

    &.system {
      background-image: url('../../../../../assets/images/modelTree/system.png');
    }

    &.lineage {
      background-image: url('../../../../../assets/images/search/lineage-lineage-default.png');
    }

    &.effect {
      background-image: url('../../../../../assets/images/search/lineage-effect-default.png');
    }

    &.database {
      background-image: url('../../../../../assets/images/search/lineage-database-default.png');
    }

    &.column {
      background-image: url('../../../../../assets/images/search/lineage-column-default.png');
    }
  }

  //, &:hover
  &.inactive {
    .icon-container {
      &.lineage {
        background-image: url('../../../../../assets/images/search/lineage-lineage-hover.png');
      }

      &.effect {
        background-image: url('../../../../../assets/images/search/lineage-effect-hover.png');
      }

      &.database {
        background-image: url('../../../../../assets/images/search/lineage-database-hover.png');
      }

      &.column {
        background-image: url('../../../../../assets/images/search/lineage-column-hover.png');
      }
    }
  }

  .inner-text {
    display: inline-block;
    height: 100%;
    vertical-align: top;
    //margin-left: 13px;
  }

  &:hover {
    border: 1px solid #4386f5;
  }

  &.inactive {
    background: #edf4ff;
    border: 1px solid #4386f5;
    color: #4386f5;
  }

  &.disabled {
    cursor: not-allowed;
  }
}
</style>
