<template>
  <div class="basic-upload">
    <h1>Upload上传</h1>
    <div class="item-box">
      <div class="item">
        <h3>示例</h3>
        <div class="card">
          <div class="title">图片点击上传</div>
          <div class="intro">只能上传jpg，png格式的图片</div>
          <datablau-upload
            :isEdit="true"
            :action="action"
            :show-file-list="false"
            :imageList="imageList"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :accept="accept"
            @resetImageList="resetImageList"
          >
            <slot>
              <i slot="default" class="el-icon-plus"></i>
            </slot>
          </datablau-upload>
          <div class="title" style="margin-top: 20px">文件拖拽上传</div>
          <datablau-upload
            :isEdit="true"
            :drag="true"
            :action="action"
            :show-file-list="true"
            :imageList="imageList"
            list-type="text"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload2"
            :accept="accept"
            @resetImageList="resetImageList"
          >
            <slot>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
            </slot>

            <div class="el-upload__tip" slot="tip">
              文件大小不超过
              <span>{{ size }}</span>
              kb
            </div>
          </datablau-upload>
          <br />
          <div class="title" style="margin-top: 20px">小图标</div>
          <datablau-upload
            :isEdit="true"
            :drag="true"
            :action="action"
            :show-file-list="true"
            :imageList="imageList"
            list-type="text"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload3"
            :accept="accept"
            :mini="true"
            @resetImageList="resetImageList"
          >
            <i class="iconfont icon-upload"></i>
            <span>点击上传</span>
          </datablau-upload>
        </div>
        <h3>代码</h3>
        <div class="pre">
          <pre><code>{{code}}
</code></pre>
        </div>
        <h2>接口</h2>
        <h3>标签名称</h3>
        datablau-upload
        <h3>属性</h3>
        组件继承el-upload中的属性，方法和事件。
        <el-table style="width: 800px" class="datablau-table" :data="data">
          <el-table-column label="属性名称" prop="name"></el-table-column>
          <el-table-column
            label="说明"
            width="240"
            prop="explain"
          ></el-table-column>
          <el-table-column label="属性类型" prop="type"></el-table-column>
          <el-table-column label="可选值" prop="candidate"></el-table-column>
          <el-table-column label="必填" prop="isRequired"></el-table-column>
          <el-table-column label="默认值" prop="default"></el-table-column>
        </el-table>
        <h3>事件</h3>
        <el-table style="width: 800px" class="datablau-table" :data="eventData">
          <el-table-column label="事件名称" prop="name"></el-table-column>
          <el-table-column label="参数" prop="parameter"></el-table-column>
          <el-table-column label="描述" prop="description"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      accept: '',
      action: '', // 上传地址
      size: 128,
      imageList: [],
      limit: 5,
      multiple: true,
      code: ` <datablau-upload
    :isEdit="true"
    :drag="true"
    :action="action"
    :show-file-list="true"
    :imageList="imageList"
    list-type="text"
    :on-success="handleUploadSuccess"
    :on-error="handleUploadError"
    :before-upload="beforeUpload3"
    :accept="accept"
    :mini="true"
    @resetImageList="resetImageList"
  ></datablau-upload>`,
      data: [],
      eventData: [],
    }
  },
  mounted() {
    $('#main-content').css('zIndex', 'auto')
    this.action = `${this.$url}/service/files/upload`
    this.data = [
      {
        name: 'mini',
        explain: '当list-type为text时，mini为true显示小图标上传',
        type: '布尔值',
        candidate: 'true/false',
        isRequired: '否',
        default: 'false',
      },
      {
        name: 'isEdit',
        explain: '当前是否可编辑',
        type: '布尔值',
        candidate: 'true/false',
        isRequired: '否',
        default: 'false',
      },
      {
        name: 'fileListZip',
        explain:
          '如果为zip包解析并且要展示包内容需传入此list，并且调用组件时如删除当前上传文件需要在on-remove时清空此list；注：只支持单个上传',
        type: '数组',
        candidate: '',
        isRequired: '否',
        default: '',
      },
    ]
    this.eventData = [
      {
        name: 'resetImageList',
        parameter: '-',
        description: '当可编辑时，删除图片的回调',
      },
    ]
    // this.imageList = ['25e1fd6454594b63b11a9f823ed7b77f']
  },
  methods: {
    beforeUpload(file) {
      if (this.$attrs.listType !== 'text') {
        const isJPG = file.type === 'image/jpeg'
        const isPNG = file.type === 'image/png'
        if (!isJPG && !isPNG) {
          this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
        }
        return isJPG || isPNG
      }
      if (this.size) {
        const isOutSize = file.size / 1024 < this.size // 单位时KB
        if (!isOutSize) {
          this.$message.error(`上传图片大小不能超过 ${this.size}KB!`)
        }
        return isOutSize
      }
    },

    beforeUpload2(file) {
      if (this.size) {
        const isOutSize = file.size / 1024 < this.size // 单位时KB
        if (!isOutSize) {
          this.$message.error(`上传文件大小不能超过 ${this.size}KB!`)
        }
        return isOutSize
      }
    },

    beforeUpload3(file) {
      if (this.size) {
        const isOutSize = file.size / 1024 < this.size // 单位时KB
        if (!isOutSize) {
          this.$message.error(`上传文件大小不能超过 ${this.size}KB!`)
        }
        return isOutSize
      }
    },
    handleUploadError(e) {
      this.$showUploadFailure(e)
    },
    handleUploadSuccess(res) {
      const fileId = res.fileId
      this.imageList.push(fileId)
      // this.addList.push(fileId)
    },
    resetImageList(e) {
      this.imageList = e
    },
  },
}
</script>

<style scoped lang="scss">
@import '../base.scss';
.basic-upload {
  .item-box {
    .brief {
      line-height: 18px;
      font-size: 12px;
      color: #555555;
    }
    p {
      line-height: 20px;
    }
    .card {
      margin-top: 20px;
      border: 1px solid #ebebeb;
      border-radius: 3px;
      transition: 0.2s;
      background-color: #fff;
      padding: 30px;
      .title {
        font-size: 14px;
        margin-bottom: 20px;
      }
      .intro {
        font-size: 12px;
        margin-bottom: 20px;
      }
    }
  }
}
</style>
