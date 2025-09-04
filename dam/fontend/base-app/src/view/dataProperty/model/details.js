import ResizeHorizontal from '../../../components/common/ResizeHorizontal'
import ObjectSelector from './objectSelector.vue'
import AddObject from './addObject.vue'
import { UUID } from 'uuidjs'
import axios from 'axios'
import { Props } from '@/view/dataProperty/model/Enum.ts'
let LDM = null
export default {
  name: 'ModelDetails',
  components: { ObjectSelector, AddObject },
  props: {
    id: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      addType: 'Object', // 添加对象类型（Object/Property）
      bindType: 'Object', // 绑定对象类型（Object/Property)
      objectSelectorOptions: [], // 绑定对象或属性时，
      currentOperateObject: null,
      properties: [],
      associations: [], // 对象-属性 关系
      aggregations: [], // 对象-对象 关系
      objects: [],
      associationsMaxId: 0, // 【对象-属性】关系类最大id
      objectsMaxId: 0, // 对象类最大id
      aggregationsMaxId: 0, // 【对象-对象】关系类最大id
      propertiesMaxId: 0, // 属性类最大id
      modelId: '',
      objectsMap: {},
      treeMap: {},
      allTreeKeys: [],
      treeData: [],
      defaultProps: {
        children: 'SubNodes',
        label: 'Label',
      },
      defaultExpandList: [],
      currentObject: null,
      displayProps: [
        { label: 'ID', id: '90000002' },
        { label: 'GUID', id: '90000006' },
        { label: '名称', id: '90000003' },
        { label: '别名', id: '90000015' },
        { label: '描述', id: '90000004' },
        { label: '数据类型', id: '90000005' },
        { label: '枚举值', id: '90000009' },
      ],
      classTypeOptions: [
        'System.String',
        'System.Int32',
        'System.Boolean',
        'System.DateTime',
      ],
      autoSaveTimer: null,
      showObjectSelectorDialog: false,
      showAddObjectDialog: false,
      modelDetails: null,
      dialogImageUrl: '',
      imageDialogVisible: false,
      imageFileList: [],
    }
  },
  mounted() {
    this.initModel()
  },
  methods: {
    async initModel() {
      if (this.id) {
        const res = await axios.post(`/metadata/mm/getMetaModel`, this.id, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        this.handleModelData(res)
      }
    },
    handleModelData(res) {
      this.modelDetails = res.data
      LDM = JSON.parse(res.data.definition)
      if (LDM) {
        // console.log(LDM)
        clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = null
        this.initResizeHorizontal()
        this.initData()
      }
    },
    // 初始化，将模型json数据格式化成目录树结构
    initData() {
      // console.log(LDM)
      const allObjects = LDM.Model.Object
        ? LDM.Model.Object instanceof Array
          ? LDM.Model.Object
          : [LDM.Model.Object]
        : []
      // 对象集合
      let objects = []
      // 属性集合
      let properties = []
      // 对象关联属性集合
      let associations = []
      // 对象关联对象集合
      let aggregations = []
      allObjects.forEach(element => {
        this.objectsMap[element.Id] = {
          ...element,
          Label: element.Property.find(prop => prop.Id == Props.Name).Value,
        }
        const elementPropertis = element.Property
        const typePropItem = elementPropertis.find(
          item => item.Id == Props.TypeId
        )
        if (String(typePropItem.Value) === Props.AssociationType) {
          if (parseInt(element.Id) > this.associationsMaxId) {
            this.associationsMaxId = parseInt(element.Id)
          }
          associations.push(element)
        }
        if (String(typePropItem.Value) === Props.AggregationType) {
          if (parseInt(element.Id) > this.aggregationsMaxId) {
            this.aggregationsMaxId = parseInt(element.Id)
          }
          aggregations.push(element)
        }
        if (typePropItem.Value == '90002032') {
          if (parseInt(element.Id) > this.propertiesMaxId) {
            this.propertiesMaxId = parseInt(element.Id)
          }
          properties.push({
            ...element,
            TreeKey: element.Id,
            Label: element.Property.find(prop => prop.Id == '90000015') ? element.Property.find(prop => prop.Id == '90000003').Value + '(' + element.Property.find(prop => prop.Id == '90000015').Value + ')' : element.Property.find(prop => prop.Id == '90000003').Value,
          })
        }
        if (typePropItem.Value === '90002016') {
          if (parseInt(element.Id) > this.objectsMaxId) {
            this.objectsMaxId = parseInt(element.Id)
          }
          objects.push({ ...element, TreeKey: element.Id })
        }
      })
      this.properties = properties
      this.aggregations = aggregations
      this.associations = associations
      // console.log(objects)
      this.objects = objects
      this.formatTreeData(objects, properties)
      // 每隔 1 分钟，自动保存模型数据
      this.autoSaveTimer = setInterval(() => {
        this.autoSaveDataToLocal()
      }, 60 * 1000)
    },
    formatTreeData(objects, properties) {
      this.allTreeKeys = []
      // 格式化object的subNodes
      this.setSubNodes(objects)
      // 格式化顶级对象
      const modelId = LDM.Model.Property.find(
        prop => prop.Id === '90000002'
      ).Value
      const modelObject = [
        {
          Id: modelId,
          TreeKey: modelId,
          Icon: 'iconfont icon-shujuyuan',
          Property: LDM.Model.Property,
        },
      ]
      this.modelId = modelId
      this.objectsMap[modelId] = {
        Id: modelId,
        TreeKey: modelId,
        Icon: 'iconfont icon-shujuyuan',
        Property: LDM.Model.Property,
        Seed: LDM.Model.Seed,
        SeedMax: LDM.Model.SeedMax,
        Type: LDM.Model.Type,
      }
      // console.log('modelObject====', modelObject)
      this.setSubNodes(modelObject)
      // 至此，顶级对象，objects 和 properties 组合完毕

      const treeData = modelObject
        .concat([
          {
            Id: 'objects',
            Label: 'Objects',
            TreeKey: 'OBJECTS',
            Icon: 'iconfont icon-ziliao',
            SubNodes: objects.sort((a, b) =>
              a.Label[0].localeCompare(b.Label[0])
            ),
          },
        ])
        .concat([
          {
            Id: 'property',
            TreeKey: 'PROPERTY',
            Label: 'Properties',
            Icon: 'iconfont icon-menu-gzcs',
            SubNodes: properties.sort((a, b) =>
              a.Label[0].localeCompare(b.Label[0])
            ),
          },
        ])
      this.treeData = treeData
      // console.log(this.defaultExpandList.push(modelId, 'OBJECTS', 'PROPERTY'))
      this.defaultExpandList.push(modelId, 'OBJECTS', 'PROPERTY')
      // this.defaultExpandList = [
      //   ...new Set(this.defaultExpandList.push(modelId, 'OBJECTS', 'PROPERTY')),
      // ]
      // console.log(treeData)
    },
    // 为每个对象节点设置子节点，同时通过treeKey区分不同目录树节点
    setSubNodes(objects, parentTreeKey = '') {
      objects.forEach(o => {
        // console.log(o)
        const subProperties = this.associations
          .filter(
            a =>
              a.Property.find(prop => prop.Id === String(Props.OwnerRef))
                .Value === o.Id
          )
          .map(
            item =>
              this.objectsMap[
                item.Property.find(prop => prop.Id === String(Props.OwneeRef))
                  .Value
              ]
          )
        const subObjects = this.aggregations
          .filter(
            a =>
              a.Property.find(prop => prop.Id === String(Props.OwnerRef))
                .Value === o.Id
          )
          .map(
            item =>
              this.objectsMap[
                item.Property.find(prop => prop.Id === String(Props.OwneeRef))
                  .Value
              ]
          )
          .filter(i => !!i)
        if (subObjects.length) {
          // console.log(subObjects)
          this.setSubNodes(subObjects, o.Id)
        }
        o.Label = o.Property.find(prop => prop.Id == '90000015') ? o.Property.find(prop => prop.Id == String(Props.Name)).Value + '(' + o.Property.find(prop => prop.Id == '90000015')?.Value + ')' : o.Property.find(prop => prop.Id == String(Props.Name)).Value
        o.SubNodes = subProperties
          .concat(subObjects)
          .filter(i => !!i)
          .map(item => {
            const TreeKey = parentTreeKey
              ? `${parentTreeKey}-${o.Id}-${item.Id}`
              : `${o.Id}-${item.Id}`
            const Label = item.Property.find(prop => prop.Id == '90000015') ? item.Property.find(prop => prop.Id == '90000003').Value + '(' + item.Property.find(prop => prop.Id == '90000015')?.Value + ')' : item.Property.find(prop => prop.Id == '90000003').Value
            this.allTreeKeys.push(TreeKey)
            return {
              ...item,
              TreeKey,
              Label,
            }
          })
          .sort((a, b) => a.Label[0].localeCompare(b.Label[0]))
      })
    },
    goBack() {
      this.$emit('back')
    },
    handleObjectSelectorClose() {
      this.showObjectSelectorDialog = false
    },
    // 打开关联对象弹窗
    toBindObject(data) {
      this.bindType = 'Object'
      const bindedObjects = this.aggregations
        .filter(
          a => a.Property.find(prop => prop.Id === '90000010').Value == data.Id
        )
        .map(obj => obj.Property.find(prop => prop.Id === '90000011').Value)
      // 与当前节点有关的对象
      const relatedList = this.allTreeKeys.filter(
        key =>
          key
            .split('-')
            .reverse()
            .findIndex(i => i == data.Id) === 0
      )
      // 这里的 bindedObjects 包含上游父节点，及下游子节点 和 属性
      const bindedIds = Array.from(
        new Set(
          relatedList.reduce((pre, cur) => {
            pre = pre.concat(cur.split('-'))
            return pre
          }, bindedObjects)
        )
      )
      // console.log(relatedList, bindedObjects)
      // 对象关联对象时，过滤掉已绑定的对象，以及其所有父级对象（避免循环引用）
      this.objectSelectorOptions = this.objects.filter(
        obj => bindedIds.findIndex(objId => objId == obj.Id) == -1
      )
      // this.$bus.$on(
      //   'handleObjectSelectorConfirm',
      //   this.handleObjectSelectorConfirm
      // )
      this.showObjectSelectorDialog = true
    },
    // 打开绑定属性弹窗
    toBindProperty(data) {
      this.bindType = 'Property'
      const bindedProperties = this.associations
        .filter(
          a => a.Property.find(prop => prop.Id === '90000010').Value == data.Id
        )
        .map(obj => obj.Property.find(prop => prop.Id === '90000011').Value)

      this.objectSelectorOptions = this.properties.filter(
        prop => bindedProperties.findIndex(propId => propId == prop.Id) === -1
      )
      // this.$bus.$on(
      //   'handleObjectSelectorConfirm',
      //   this.handleObjectSelectorConfirm
      // )
      this.showObjectSelectorDialog = true
    },
    async handleObjectSelectorConfirm({ type, checkedNodes, callback }) {
      // 遍历 checkedNodes，创建父子关系（has）
      // console.log(checkedNodes)
      try {
        let addRes = await this.$http.post(`/metadata/mm/addElement`, {
          ...this.modelDetails,
          element: checkedNodes.map(child => {
            const GUID = UUID.generate()
            return JSON.stringify({
              Id: null,
              Type: 'Datablau.LDM.ObjectX',
              Property: [
                {
                  Id: '90000011',
                  Type: 'System.Int32',
                  Value: child.Id,
                },
                {
                  Id: '90000010',
                  Type: 'System.Int32',
                  Value: this.currentOperateObject.Id,
                },
                {
                  Id: '90000006',
                  Type: 'System.Guid',
                  Value: GUID,
                },
                {
                  Id: '90000001',
                  Type: 'System.Int32',
                  Value: type == 'Object' ? '90002024' : '90002048',
                },
                {
                  Id: '90000003',
                  Type: 'System.String',
                  Value:
                    type === 'Object'
                      ? `${this.currentOperateObject.Label}_owns_${child.Label}`
                      : `${this.currentOperateObject.Label}_has_${child.Label}`,
                },
                {
                  Id: '90000002',
                  Type: 'System.Int32',
                  Value: null,
                },
              ],
            })
          }),
        })
        if (addRes) {
          this.modelDetails = addRes.data
          LDM = JSON.parse(addRes.data.definition)
          if (LDM) {
            clearInterval(this.autoSaveTimer)
            this.autoSaveTimer = null
            this.initData()
          }
        }
        // this.formatTreeData(this.objects, this.properties)
        this.showObjectSelectorDialog = false
        callback && callback()
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },

    dataOptionsFunction(data) {
      // console.log(data)
      this.currentOperateObject = data
      if (data.Property) {
        // 节点类型 9000001
        const nodeType = data.Property.find(
          prop => prop.Id === '90000001'
        ).Value
        switch (nodeType) {
          // 抽象数据库
          case '90000000':
            return [
              {
                icon: 'iconfont icon-tianjia',
                label: `关联子对象`,
                callback: () => {
                  this.toBindObject(data)
                },
              },
              {
                icon: 'iconfont icon-tianjia',
                label: `关联子属性`,
                callback: () => {
                  this.toBindProperty(data)
                },
              },
            ]
          // 对象
          case '90002016':
            return [
              {
                icon: 'iconfont icon-tianjia',
                label: `关联对象`,
                callback: () => {
                  this.toBindObject(data)
                },
              },
              {
                icon: 'iconfont icon-tianjia',
                label: `关联属性`,
                callback: () => {
                  this.toBindProperty(data)
                },
              },
              data.TreeKey?.split('-').length > 1
                ? {
                    icon: 'iconfont icon-unbind',
                    label: `解除关联`,
                    callback: () => {
                      this.unbindAggregation(data)
                    },
                  }
                : null,
              {
                icon: 'iconfont icon-delete',
                label: `删除`,
                callback: () => {
                  this.toDeleteObject(data)
                },
              },
            ].filter(i => !!i)
          // 属性
          case '90002032':
            return [
              data.TreeKey?.split('-').length > 1 &&
              data.Id !== '90000004' &&
              data.Id !== '90000002' &&
              data.Id !== '80100005' &&
              data.Id !== '90000003'
                ? {
                    icon: 'iconfont icon-unbind',
                    label: `解除关联`,
                    callback: () => {
                      this.unbindAssociation(data)
                    },
                  }
                : null,
              data.Id !== '90000004' &&
              data.Id !== '90000002' &&
              data.Id !== '80100005' &&
              data.Id !== '90000003'
                ? {
                    icon: 'iconfont icon-delete',
                    label: `删除`,
                    callback: () => {
                      this.toDeleteObject(data)
                    },
                  }
                : null,
            ].filter(i => !!i)

          default:
            return []
        }
      }
      if (data.TreeKey === 'OBJECTS') {
        return [
          {
            icon: 'iconfont icon-tianjia',
            label: `新增对象`,
            callback: () => {
              this.toAddObject(data)
            },
          },
        ]
      }
      if (data.TreeKey === 'PROPERTY') {
        return [
          {
            icon: 'iconfont icon-tianjia',
            label: `新增属性`,
            callback: () => {
              this.toAddProperty(data)
            },
          },
          {
            icon: 'iconfont icon-tianjia',
            label: `新增引用`,
            callback: () => {
              this.toAddReference(data)
            },
          },
        ]
      }
    },
    // 打开新增对象弹窗
    toAddObject(data) {
      this.addType = 'Object'
      this.showAddObjectDialog = true
    },
    toAddProperty() {
      this.addType = 'Property'
      this.showAddObjectDialog = true
    },
    toAddReference() {
      this.addType = 'Reference'
      this.showAddObjectDialog = true
    },
    // 新增对象 - 取消
    handleAddObjectClose() {
      this.addType = ''
      this.showAddObjectDialog = false
    },
    // 新增对象 - 确定
    async handleAddObjectConfirm({ type, data }) {
      // console.log(type, data)
      const GUID = UUID.generate()
      let objParams = {
        Id: null,
        Property: [
          {
            Id: '90000004',
            Type: 'System.String',
            Value: data.Definition,
          },
          {
            Id: '90000015',
            Type: 'System.String',
            Value: data.FriendlyName,
          },
          {
            Id: '90000012',
            Type: 'System.Boolean',
            Value: data.IsVisible,
          },
          {
            Id: '90000006',
            Type: 'System.Guid',
            Value: GUID,
          },
          {
            Id: '90000001',
            Type: 'System.Int32',
            Value: type === 'Object' ? '90002016' : '90002032',
          },
          {
            Id: '90000003',
            Type: 'System.String',
            Value: data.Name,
          },
          {
            Id: '90000002',
            Type: 'System.Int32',
            Value: null,
          },
        ],
        Type: `Datablau.${this.modelDetails.type}.ObjectX`,
      }
      if (type === 'Property') {
        objParams.Property.push({
          Id: '90000005', // ValueType
          Type: 'System.RuntimeType',
          Value: data.ValueType,
        })

        objParams.Property.push({
          Id: '90000009', // ValueType
          Type: 'System.String',
          Value: data.EnumValue,
        })
        objParams.Property.push({
          Id: Props.Range,
          Type: 'System.String',
          Value: data.Range,
        })
        objParams.Property.push({
          Id: Props.ConstraintName,
          Type: 'System.String',
          Value: data.ConstraintName,
        })
        objParams.Property.push({
          Id: Props.MaxValue,
          Type: 'System.String',
          Value: data.MaxValue,
        })
        objParams.Property.push({
          Id: Props.DefaultValue,
          Type: 'System.String',
          Value: data.DefaultValue,
        })
        objParams.Property.push({
          Id: Props.DataScale,
          Type: 'System.Int32',
          Value: data.DataScale,
        })
        objParams.Property.push({
          Id: Props.DataPrecision,
          Type: 'System.Int32',
          Value: data.DataPrecision,
        })
        objParams.Property.push({
          Id: Props.IsRequired,
          Type: 'System.Boolean',
          Value: data.IsRequired,
        })
        objParams.Property.push({
          Id: Props.IsArray,
          Type: 'System.Boolean',
          Value: data.IsArray,
        })
        objParams.Property.push({
          Id: Props.IsReference,
          Type: 'System.Boolean',
          Value: data.IsReference,
        })
        objParams.Property.push({
          Id: Props.Reference,
          Type: 'System.Int32',
          Value: data.Reference,
        })
        objParams.Property.push({
          Id: Props.Label,
          Type: 'System.String',
          Value: data.Label,
        })
        objParams.Property.push({
          Id: Props.Catalog,
          Type: 'Datablau.LDM.Catalog',
          Value: data.Catalog,
        })
        objParams.Property.push({
          Id: Props.OrderNumber,
          Type: 'System.Int32',
          Value: data.OrderNumber,
        })
      }
      if (type === 'Object') {
        objParams.Property.push({
          Id: '90000033', // ValueType
          Type: 'System.Boolean',
          Value: data.CanRegister,
        })
        objParams.Property.push({
          Id: Props.Range,
          Type: 'System.String',
          Value: data.Range,
        })
        objParams.Property.push({
          Id: Props.ConstraintName,
          Type: 'System.String',
          Value: data.ConstraintName,
        })
        objParams.Property.push({
          Id: Props.MaxValue,
          Type: 'System.String',
          Value: data.MaxValue,
        })
        objParams.Property.push({
          Id: Props.DefaultValue,
          Type: 'System.String',
          Value: data.DefaultValue,
        })
        objParams.Property.push({
          Id: Props.DataScale,
          Type: 'System.Int32',
          Value: data.DataScale,
        })
        objParams.Property.push({
          Id: Props.DataPrecision,
          Type: 'System.Int32',
          Value: data.DataPrecision,
        })
        objParams.Property.push({
          Id: Props.IsRequired,
          Type: 'System.Boolean',
          Value: data.IsRequired,
        })
        objParams.Property.push({
          Id: Props.IsArray,
          Type: 'System.Boolean',
          Value: data.IsArray,
        })
        objParams.Property.push({
          Id: Props.IsReference,
          Type: 'System.Boolean',
          Value: data.IsReference,
        })
        objParams.Property.push({
          Id: Props.Reference,
          Type: 'System.Int32',
          Value: data.Reference,
        })
        objParams.Property.push({
          Id: Props.Label,
          Type: 'System.String',
          Value: data.Label,
        })
        objParams.Property.push({
          Id: Props.Catalog,
          Type: 'Datablau.LDM.Catalog',
          Value: data.Catalog,
        })
        objParams.Property.push({
          Id: Props.OrderNumber,
          Type: 'System.Int32',
          Value: data.OrderNumber,
        })
      }
      if (type === 'Reference') {
        objParams.Property.push({
          Id: '90000036', // ValueType
          Type: 'System.String',
          Value: data.ReferObject,
        })
        objParams.Property.push({
          Id: '90000037', // ValueType
          Type: 'System.String',
          Value: data.ReferModel,
        })
        objParams.Property.push({
          Id: '90000038', // ValueType
          Type: 'System.String',
          Value: data.IsLineage === 'lineage' ? data.IsLineage : '',
        })
      }
      // console.log(objParams)
      try {
        const addRes = await this.$http.post(`/metadata/mm/addElement`, {
          ...this.modelDetails,
          definition: undefined,
          element: [JSON.stringify(objParams)],
        })
        if (addRes) {
          this.handleModelData(addRes)
          this.showAddObjectDialog = false
        }
      } catch (error) {
        this.$blauShowFailure(error)
      }
    },
    // 解除 对象-属性 关联关系
    async unbindAssociation(data) {
      const parentId = data.TreeKey.split('-').at(-2)
      // console.log(data.TreeKey.split('-'), parentId)
      const association = this.associations.find(
        ass =>
          ass.Property.find(prop => prop.Id === '90000010').Value ===
            parentId &&
          ass.Property.find(prop => prop.Id === '90000011').Value === data.Id
      )
      if (association) {
        try {
          const res = await this.$http.post(`/metadata/mm/deleteElement`, {
            ...this.modelDetails,
            element: [
              JSON.stringify({
                Id: association.Id,
                Property: association.Property,
                Type: association.Type,
              }),
            ],
          })
          if (res) {
            this.handleModelData(res)
          }
        } catch (error) {
          this.$blauShowFailure(error)
        }
      }
    },
    // 解除 对象-对象 关联关系
    async unbindAggregation(data) {
      const parentId = data.TreeKey.split('-').at(-2)
      // console.log(parentId)
      const aggregation = this.aggregations.find(
        agg =>
          agg.Property.find(prop => prop.Id === '90000010').Value ===
            parentId &&
          agg.Property.find(prop => prop.Id === '90000011').Value === data.Id
      )
      if (aggregation) {
        try {
          const res = await this.$http.post(`/metadata/mm/deleteElement`, {
            ...this.modelDetails,
            element: [
              JSON.stringify({
                Id: aggregation.Id,
                Property: aggregation.Property,
                Type: aggregation.Type,
              }),
            ],
          })
          if (res) {
            this.handleModelData(res)
          }
        } catch (error) {
          this.$blauShowFailure(error)
        }
      }
    },
    // 删除对象
    async toDeleteObject(data) {
      // 1. 删除对象本省 2. 删除与该对象相关的关系
      const relatedAgg = this.aggregations.filter(
        agg =>
          agg.Property.find(prop => prop.Id === '90000011').Value == data.Id ||
          agg.Property.find(prop => prop.Id === '90000010').Value == data.Id
      )
      const relatedAss = this.associations.filter(
        ass =>
          ass.Property.find(prop => prop.Id === '90000011').Value == data.Id ||
          ass.Property.find(prop => prop.Id === '90000010').Value == data.Id
      )
      const res = await this.$http.post(`/metadata/mm/deleteElement`, {
        ...this.modelDetails,
        definition: undefined,
        element: [
          JSON.stringify({
            Id: data.Id,
            Type: data.Type,
            Property: data.Property,
          }),
          ...relatedAgg.map(agg =>
            JSON.stringify({
              Id: agg.Id,
              Type: agg.Type,
              Property: agg.Property,
            })
          ),
          ...relatedAss.map(ass =>
            JSON.stringify({
              Id: ass.Id,
              Type: ass.Type,
              Property: ass.Property,
            })
          ),
        ],
      })
      if (res) {
        this.handleModelData(res)
      }
    },
    // 删除属性
    toDeleteProperty(data) {},
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal({
          leftDom: $('.tree-content'),
          middleDom: $('.middle-line'),
          outerDom: $('.page-content'),
          rightDom: $('.prop-content'),
          noCrack: true,
          minWith: { leftMinWidth: 280 },
          // callback: this.treeListDragCallback,
        })
      }, 1000)
    },
    // 将模型数据自动保存至localStorage中
    autoSaveDataToLocal() {
      // console.log('auto save')
      const date = new Date()
      const modelData = this.formatModelData()
      // console.log(modelData)
      localStorage.setItem(
        'metaModel',
        JSON.stringify({ [`${date.getTime()}`]: modelData })
      )
    },
    // 格式化成json格式，以便本地存储或接口调用
    formatModelData() {
      const modelObject = this.objectsMap[this.modelId]
      const allObjects = []
      Object.keys(this.objectsMap)
        .filter(key => key !== this.modelId)
        .forEach(objKey => {
          const obj = this.objectsMap[objKey]
          allObjects.push({
            Id: obj.Id,
            Type: obj.Type,
            Property: obj.Property,
          })
        })
      return {
        Model: {
          ...modelObject,
          Object: allObjects,
        },
      }
    },
    // 点击 应用 按钮时，更新对象属性
    updateProps() {
      this.objectsMap[this.currentObject.Id].Property.forEach(prop => {
        prop.Value = this.currentObject.properties[prop.Id]
        if (prop.Id === '90000038') {
          if (prop.Value !== 'lineage_from' && prop.Value !== 'lineage_to') {
            prop.Value = ''
          }
        }
        // if (prop.Id === '90000038' && prop.Value !== 'lineage') {
        //   prop.Value = ''
        // }
      })
      this.$http
        .post(`/metadata/mm/updateElement`, {
          ...this.modelDetails,
          element: [
            JSON.stringify({
              Id: this.currentObject.Id,
              Type: this.objectsMap[this.currentObject.Id].Type,
              Property: this.objectsMap[this.currentObject.Id].Property,
            }),
          ],
        })
        .then(async res => {
          this.modelDetails = res.data
          LDM = JSON.parse(res.data.definition)
          if (LDM) {
            clearInterval(this.autoSaveTimer)
            this.autoSaveTimer = null
            this.initData()
            setTimeout(() => {
              this.$refs.modelTree.setCurrentKey(this.currentObject.TreeKey)
            }, 0)
            this.$message.success('修改成功')
          }
        })
    },
    // 更新目录树
    updateTreeData(nodes = this.treeData) {
      nodes.forEach(node => {
        if (node.Id == this.currentObject.Id) {
          node.Label = this.currentObject.properties[90000003]
        }
        if (node.SubNodes) {
          this.updateTreeData(node.SubNodes)
        }
      })
    },
    // 目录树节点回调函数
    handleNodeClick(data) {
      let currentType = ''
      data.Property.forEach(item => {
        if (String(item.Id) === Props.TypeId) {
          if (String(item.Value) === Props.ObjectType) {
            currentType = 'ObjectType'
            this.displayProps = [
              { label: 'ID', id: '90000002' },
              { label: 'GUID', id: '90000006' },
              { label: '名称', id: '90000003' },
              { label: '别名', id: '90000015' },
              { label: '描述', id: '90000004' },
              { label: '数据类型', id: '90000005' },
              { label: '枚举值', id: '90000009' },
              { label: '值域', id: String(Props.Range) },
              { label: '约束', id: String(Props.ConstraintName) },
              { label: '最大出现次数', id: String(Props.MaxValue) },
            ]
          } else if (String(item.Value) === Props.AggregationType) {
            currentType = 'AggregationType'
            this.displayProps = [
              { label: 'ID', id: '90000002' },
              { label: 'GUID', id: '90000006' },
              { label: '名称', id: '90000003' },
              { label: '别名', id: '90000015' },
              { label: '描述', id: '90000004' },
              { label: '数据类型', id: '90000005' },
              { label: '枚举值', id: '90000009' },
            ]
          } else if (String(item.Value) === Props.PropertyType) {
            currentType = 'PropertyType'
            this.displayProps = [
              { label: 'ID', id: '90000002' },
              { label: 'GUID', id: '90000006' },
              { label: '名称', id: '90000003' },
              { label: '别名', id: '90000015' },
              { label: '描述', id: '90000004' },
              { label: '数据类型', id: '90000005' },
              { label: '枚举值', id: '90000009' },
              { label: '值域', id: String(Props.Range) },
              { label: '约束', id: String(Props.ConstraintName) },
              { label: '最大出现次数', id: String(Props.MaxValue) },
            ]
          } else if (String(item.Value) === Props.AssociationType) {
            currentType = 'AssociationType'
            this.displayProps = [
              { label: 'ID', id: '90000002' },
              { label: 'GUID', id: '90000006' },
              { label: '名称', id: '90000003' },
              { label: '别名', id: '90000015' },
              { label: '描述', id: '90000004' },
              { label: '数据类型', id: '90000005' },
              { label: '枚举值', id: '90000009' },
            ]
          }
        }
      })
      if (parseInt(data.Id)) {
        const currentObject = {
          ...this.objectsMap[data.Id],
          TreeKey: data.TreeKey,
        }
        const objProps = {}
        currentObject.Property.forEach(prop => {
          if (
            [
              '90000012',
              '90000016',
              '90000014',
              '90000020',
              '90000021',
              '90000024',
            ].includes(prop.Id)
          ) {
            objProps[prop.Id] = prop.Value?.toLowerCase() === 'true'
          } else {
            objProps[prop.Id] = prop.Value
          }
          if (
            '90000038' == prop.Id
          ) {
            objProps[prop.Id] = prop.Value ? prop.Value : 'false'
          }
        })
        if (objProps[90000001] == '90002016') {
          this.imageFileList = [
            {
              url: `/metadata/mm/${this.modelDetails.code}/${currentObject.Id}`,
            },
          ]
        }
        this.currentObject = { ...currentObject, properties: objProps }
        if (this.currentObject?.properties[90000001] == '90002016') {
          this.currentObject.properties[90000033] =
            this.currentObject.properties[90000033] === 'true' ||
            this.currentObject.properties[90000033] === 'True' ||
            this.currentObject.properties[90000033] === true
          this.currentObject.properties[90000026] =
            this.currentObject.properties[90000026] === 'true' ||
            this.currentObject.properties[90000026] === 'True' ||
            this.currentObject.properties[90000026] === true
        }
        if (this.currentObject?.properties[90000001] == '90002032') {
          this.currentObject.properties[90000026] =
            this.currentObject.properties[90000026] === 'true' ||
            this.currentObject.properties[90000026] === 'True' ||
            this.currentObject.properties[90000026] === true
        }
        // console.log(objProps)
      }
    },
    dataIconFunction(node) {
      // console.log(node)
      if (node.Icon) return node.Icon
      const ReferObject = node.Property.find(prop => prop.Id === '90000036')
      const ReferModel = node.Property.find(prop => prop.Id === '90000037')
      const isRefer = node.Property.find(prop => prop.Id === '90000014')
      const typeId = node.Property.find(prop => prop.Id === '90000001').Value
      if (node && (!!ReferObject || !!ReferModel || isRefer?.Value === 'true')) {
        return 'iconfont icon-layouta'
      } else {
        switch (typeId) {
          case '90002048':
            return 'iconfont icon-branch'
          case '90002032':
            return 'iconfont icon-menu-gzcs'
          case '90002024':
            return 'iconfont icon-menu-yylb'
          case '90002016':
            return 'iconfont icon-ziliao'
          default:
            break
        }
      }
      return 'iconfont icon-file'
    },
    handleImageUploadChange(file) {
      if (file.status === 'success') {
      } else {
        this.imageFileList = [file]
      }
    },
    handleImageRemove(file) {
      // console.log(file, this.modelDetails.code, this.currentObject)
      this.$http
        .post(
          `/metadata/mm/${this.modelDetails.code}/${this.currentObject.Label}/delete`
        )
        .then(res => {
          this.imageFileList = []
        })
    },
    handleImagePreview(file) {
      this.dialogImageUrl = file.url
      this.imageDialogVisible = true
    },
  },
  beforeDestroy() {
    clearInterval(this.autoSaveTimer)
    this.autoSaveTimer = null
  },
}
