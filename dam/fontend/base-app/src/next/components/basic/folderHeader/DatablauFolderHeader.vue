<template>
  <div class="box">
    <div class="right-bottom-background">
      <triangle
        style="right: 19px; bottom: 0"
        color="#EDF1FE"
        :width="233.95"
        :height="48"
      ></triangle>
      <triangle
        style="right: -96.05px; bottom: 0"
        color="#EDF1FE"
        :width="290"
        :height="59.5"
      ></triangle>
      <triangle
        style="right: 19px; bottom: 0"
        color="#E5EBFD"
        :width="174.95"
        :height="35.89"
      ></triangle>
    </div>
    <div class="icon iconfont icon-file"></div>
    <datablau-tooltip
      :content="titleTitle"
      :disabled="!titleTitle"
      :open-delay="500"
    >
      <div class="title oneline-eclipse">
        {{ dataTitle }}
      </div>
    </datablau-tooltip>
    <datablau-tooltip
      :content="descriptionTitle"
      :disabled="!descriptionTitle"
      :open-delay="500"
    >
      <div class="description oneline-eclipse">
        描述: {{ dataDescription ? dataDescription : '-' }}
      </div>
    </datablau-tooltip>
    <div class="buttons">
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script>
import Triangle from './Triangle.vue'
export default {
  components: {
    Triangle,
  },
  name: 'DatablauFolderHeader',
  props: {
    dataTitle: String,
    dataDescription: String,
  },
  computed: {
    titleTitle() {
      if (this.dataTitle && this.dataTitle.length > 39) {
        return this.dataTitle
      } else {
        return null
      }
    },
    descriptionTitle() {
      if (this.dataDescription && this.dataDescription.length > 51) {
        return this.dataDescription
      } else {
        return null
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.box {
  height: 80px;
}
.right-bottom-background {
  position: relative;
  height: 80px;
  background-color: #f6f8ff;
}
.icon {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 32px;
  font-size: 32px;
  color: $primary-color;
}
.title {
  position: absolute;
  top: 20px;
  right: 250px;
  left: 60px;
  font-size: 16px;
  color: $text-default;
}
.description {
  position: absolute;
  top: 47px;
  right: 250px;
  left: 60px;
  font-size: 12px;
  color: $text-default;
}
.buttons {
  position: absolute;
  top: 24px;
  right: 20px;
}
</style>
