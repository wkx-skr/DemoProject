<template>
  <div class="file-detail-outer">
    <file-detail :fileId="fileId" v-if="fileId">
      <!-- :catalogPath="catalogPath" -->
    </file-detail>
    <!-- @back="backToFolder"
      @goToUpdate="goToUpdate"
      @editCurrent="contentStatus='write'" -->
    <!-- <scan v-if="serviceId" :service-id="serviceId" :front-end="true"></scan> -->
  </div>
</template>

<script>
import fileDetail from '@/view/fileAsset/shareFileDetailForDdc.vue'
export default {
  components: { fileDetail },
  data() {
    return {
      fileId: '',
      // filePath: '',
      catalogPath: '',
      fileData: null,
    }
  },
  beforeMount() {
    const query = this.$route.query || {}
    this.fileId = this.$route.query.id
    this.catalogPath = query.catalogPath
    // this.fileData = {
    //   id: this.fileId,
    // };
    // this.dataInit();
  },
  methods: {
    dataInit() {
      const id = this.fileId
      if (id) {
        const url = `${this.$url}/service/shareFile/folder/${id}`
        this.$http
          .get(url)
          .then(res => {
            this.fileData = res.data
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
  },
}
</script>

<style scoped lang='scss'>
.file-detail-outer {
  /* border: 1px solid red; */
  position: relative;
  width: 100%;
  height: 100%;
  /deep/ .page-container {
    padding: 0;
    padding-bottom: 20px;
    .content-nav {
      padding-left: 5px;
      margin-left: 0;
    }
  }
}
</style>
