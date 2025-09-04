<template>
  <div class="source-select-outer">
    <el-input
      class="keyword-input"
      :placeholder="$t('common.placeholder.normal')"
      size="mini"
      v-model="keyword"
      clearable
    ></el-input>
    <div class="source-tree-outer">
      <el-tree
        class="light-blue-tree"
        :data="sourceData"
        ref="sourceTree"
        node-key="id"
        :props="defaultProps"
        :default-expand-all="autoExpand"
        @node-click="sourceUpdated"
        :filter-node-method="filterNode"
        :render-content="renderContent"
        :default-expanded-keys="defaultExpandedKeys"
      ></el-tree>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sourceData: [],
      sourcesByDepartment: {},
      keyword: '',
      keywordLast: null,
      loading: true,
      props: {
        isLeaf: 'leaf',
      },
      defaultProps: {
        label: 'name',
        children: 'subNodes',
      },
      categoryMessage: {},
      noDepartmentLabel: this.$t('meta.lineageManage.graph.noDep'),
      defaultExpandedKeys: [],
      treeKey: 0,
      timeout: null,
      modelCatMap: {},
      modelMap: {},
      idCount: 1,
    }
  },
  props: {
    isSelf: Boolean,
    classifyType: {
      type: String,
      default: 'itDepartment',
    },
    defaultChoosed: Object,
  },
  mounted() {
    const self = this
    this.loading = true
    Ps.initialize($('.source-tree-outer')[0])
    this.getData(() => {
      if (this.defaultChoosed.damModelId) {
        const obj = this.defaultChoosed
        this.defaultExpandedKeys.push(obj.modelCategorylId, obj.damModelId)
        this.$nextTick(() => {
          const data = this.modelMap[obj.damModelId]
          const node =
            this.$refs.sourceTree &&
            this.$refs.sourceTree.getNode(obj.damModelId + '')
          if (data && node) {
            this.$refs.sourceTree.setCurrentKey(obj.damModelId)
            this.sourceUpdated(data, node)
          }
        })
      }
    })
  },
  watch: {
    keyword(value, oldValue) {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.$refs.sourceTree.filter(value.trim())
      }, 400)
      //      if(value){
      //      }else{
      //        this.defaultExpandedKeys = [];
      //        this.treeKey++;
      //      }
    },
    classifyType() {
      this.getData()
    },
  },
  computed: {
    autoExpand() {
      return false
    },
  },
  methods: {
    getData(callback) {
      if (this.classifyType === 'itDepartment' || !this.classifyType) {
        this.$http
          .get(this.$meta_url + '/models/modeltree')
          .then(res => {
            const root = res.data
            this.getModCatMap(root)
            let arr = []
            arr = this.treeSort(root)
            this.sourceData = arr
            callback && callback()
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        this.$getUserModelCategory(null, this.classifyModel)
      }
    },
    getModCatMap(node) {
      if (!node) return
      node.id = node.id || 'noId' + this.idCount++
      this.modelMap[node.id] = node
      if (node.type === 'MODEL_CATEGORY') {
        this.modelCatMap[node.id + ''] = node
      }
      if (
        node &&
        node.subNodes &&
        Array.isArray(node.subNodes) &&
        node.subNodes.length > 0
      ) {
        const arr = node.subNodes
        arr.forEach(item => {
          this.getModCatMap(item)
        })
      }
    },
    classifyModel() {
      const arr = []
      const map = {} // name => modle
      const others = {
        name: this.$t('meta.lineageManage.graph.others'),
        subNodes: [],
        id: 'others',
        type: 'catlog',
      }
      let idCnt = 1
      this.$modelCategories.forEach(item => {
        const prop = this.classifyType
        const obj = this.modelCatMap[item.categoryId + '']
        let par = null
        if (!item[prop]) {
          // 该属性为 null
          if (!map.others) {
            map.others = others
            arr.push(others)
          }
          par = map.others
        } else if (!map[item[prop]]) {
          // 该属性有值, 但第一次出现
          const catlog = {
            name: item[prop],
            subNodes: [],
            id: 'catId' + idCnt++,
            type: 'catlog',
          }
          map[catlog.name] = catlog
          arr.push(catlog)
          par = catlog
        } else {
          par = map[item[prop]]
        }
        if (par.subNodes && Array.isArray(par.subNodes)) {
          par.subNodes.push(obj)
        }
      })
      const root = {
        name: 'root',
        id: 'root',
        type: 'root',
        subNodes: arr,
      }
      this.sourceData = this.treeSort(root)
    },
    treeSort(root) {
      const t = root.subNodes
      if (t != null) {
        this.sortByName(root)
        t.forEach(item => {
          this.sortByName(item)
        })
        // this.sourceData = t;
      }
      const index = t.findIndex(item => {
        return item.id === 'others'
      })
      if (index !== -1) {
        const others = t.splice(index, 1)
        t.push(others[0])
      }
      return t
    },
    sortByName(node) {
      const departments = node.subNodes
      this.$utils.sort.sortConsiderChineseNumber(departments)
    },
    filterNode(value, data, node) {
      if (!value) return true
      if (!data.name) return false
      let hasValue = false
      let current = node
      do {
        if (
          current.data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          (typeof current.data.alias === 'string' &&
            current.data.alias.toLowerCase().indexOf(value.toLowerCase()) !==
              -1)
        ) {
          hasValue = true
        }
        current = current.parent
      } while (current && !Array.isArray(current.data))
      return hasValue
    },
    renderContent(h, { node, data, store }) {
      if (data.type === 'MODEL') {
        return (
          <span class="tree-item-outer" data-code={data.code}>
            <span>
              <span class="tree-icon database"></span>
              <span oneline-eclipse>{node.label}</span>
            </span>
          </span>
        )
      } else {
        return (
          <span class="tree-item-outer">
            <span>
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span oneline-eclipse>{node.label}</span>
            </span>
          </span>
        )
      }
    },
    //		  getSourcesData(){
    //		    let categories = this.$modelCategories;
    //		    categories.forEach((category,index)=>{
    //		      setTimeout(()=>{
    //		        this.getSourceBySystem(category,list=>{
    //            list.forEach(item=>{
    //              item.id=item.modelId;
    //              item.label=item.definition;
    //              item.type="model";
    //            });
    //            this.sourceData.push({
    //              label:category.categoryName,
    //              abbr:category.categoryAbbreviation,
    //              id:category.categoryId,
    //              children:list
    //            });
    //            if(index == categories.length-1){
    //              this.loading = false;
    //              Ps.update($('.source-tree-outer')[0]);
    //            }
    //          });
    //		      },index*10);
    //      });
    //		  },
    //		  getSourceBySystem(category,callback){
    //		    let getUrl = this.$url + '/service/models/category/' + category.categoryId + '/simple';
    //		    this.$http.get(getUrl).then(res=>{
    //		      if(callback){
    //          callback(res.data);
    //        }
    //		    });
    //		  },
    //			getSourceData(){
    //				const self = this;
    //				this.$http.get(this.$url+'/service/entities/models').then(res=>{
    //					var resultType = [];
    //					var result = [];
    //					res.data.forEach(item=>{
    //						switch(item.type){
    //							case 'ORACLE':
    //								item.type = 'Oracle'
    //								break
    //							case 'MYSQL':
    //								item.type = 'MySQL'
    //								break
    //
    //						}
    //					})
    //					res.data.forEach(item=>{
    //						var i = resultType.indexOf(item.type);
    //						if(i == -1){
    //							resultType.push(item.type);
    //							i = resultType.length-1;
    //							result[i] = [];
    //						}
    //						result[i].push({
    //							label:item.definition,
    //							id:item.modelId,
    //							type:'model'
    //						});
    //					});
    //					result.forEach((item,index)=>{
    //						self.sourceData.push({
    //							label:resultType[index],
    //							id:resultType[index],
    //							children:item
    //						});
    //					});
    //				}).catch(err=>{
    //					self.$notify.error({
    //						title: '错误',
    //			          	message: '读取数据源列表失败'
    //					});
    //				});
    //			},
    sourceUpdated(data, node) {
      const node2 =
        this.$refs.sourceTree && this.$refs.sourceTree.getNode(data.id)
      this.$emit('sourceUpdated')
      this.$parent.checkedSourcesDetail = data
      this.$parent.$parent.checkedSourcesDetail = data
      //				if(typeof data.id == 'number' && data.leaf && data.definition){
      if (data.type == 'MODEL') {
        data.categoryMessage = node.parent.data
        data.categoryMessage.categoryId = node.parent.data.id
        this.$bus.$emit('loadSourceDetail', data)
        this.$parent.checkedSources = data.id
        this.$parent.$parent.checkedSources = data.id
      } else if (data.id == null) {
        this.$parent.checkedSources = null
        this.$parent.$parent.checkedSources = null
      } else {
        //				  this.categoryMessage = data;
      }
    },
    handleNodeExpand(data, node) {
      if (data.categoryId) {
        this.loadSources(data, node)
      }
    },
    loadSources(data, node) {
      const getUrl =
        this.$url +
        '/service/models/category/' +
        node.data.categoryId +
        '/simple'
      this.$http
        .get(getUrl)
        .then(res => {
          const models = res.data
          node.childNodes = []
          res.data.forEach(item => {
            item.id = item.modelId
            item.label = item.definition
            item.type = 'model'
            item.leaf = true
            this.$refs.sourceTree.append(item, node)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    scrollToTop() {
      // $('.source-tree-outer')[0].scrollTop();
      $('.source-tree-outer')[0].scrollTop = 0
      Ps.update($('.source-tree-outer')[0])
    },
  },
}
</script>
<style lang="scss" scoped>
.source-tree-outer {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  /*overflow:auto;*/
}
.keyword-input {
  width: 93%;
  display: block;
  margin: 0 auto;
}
</style>
