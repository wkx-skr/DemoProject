export default {
  data() {
    return {
      agentForm: {
        host: '',
        port: '',
        username: '',
        password: '',
        // host: '',
        // port: '',
        // username: '',
        // password: '',
        agentModelId: '',
      },
      agentModels: [],
      sourceName: '',
    }
  },
  computed: {
    isAgent() {
      return this.dataSourceType === 'Agent'
    },
  },
  mounted() {
    if (this.dsEditing) {
    }
  },
  watch: {},
  methods: {
    initAgentMessage(map) {
      if (this.isAgent) {
        this.agentForm.host = map.agentHost
        this.agentForm.port = map.agentPort
        this.agentForm.agentModelId = map.agentModelId
        this.sourceName = map.sourceName
        // this.schemaSelected = map.schemaSelected
      }
    },
    getAgentList() {
      if (
        ['host', 'port' /*, 'username', 'password' */].some(k => {
          return !this.agentForm[k]
        })
      ) {
        this.$datablauMessage.warning(
          // '请正确填写服务器名称、端口号、用户名和密码'
          '请正确填写服务器名称和端口号'
        )
      } else {
        this.$http
          .post(this.$url + `/service/agent/list`, {
            host: this.agentForm.host,
            port: this.agentForm.port,
            // username: this.agentForm.username,
            // password: this.agentForm.password,
          })
          .then(res => {
            this.agentModels = res.data
            if (
              Array.isArray(this.agentModels) &&
              this.agentModels.length > 0
            ) {
              this.agentModels.sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type.localeCompare(b.type)
                } else {
                  return a.definition.localeCompare(b.definition)
                }
              })
              // this.agentForm.agentModelId = this.agentModels[0].modelId
              // this.getAgentSchemas()
            }
          })
      }
    },
    getAgentSchemas() {
      try {
        const model = this.agentModels.filter(
          i => i.modelId === this.agentForm.agentModelId
        )[0]
        const schemasString =
          model.connectionInfo.schemas || model.connectionInfo.database
        const schemas = schemasString.split(';').filter(item => item.length > 0)
        schemas.sort()
        this.schemas = schemas
        if (schemas.length > 0) {
          this.schemaSelected = [schemas[0]]
        }
      } catch (e) {
        console.error(
          `未匹配到id=${this.agentForm.agentModelId}的数据源或schema列表有误`
        )
        console.error(e)
      }
    },
    preAddDataSource() {
      let agentMessage = {}
      this.agentModels.forEach(a => {
        if (a.modelId === this.agentForm.agentModelId) {
          agentMessage = a
        }
      })
      this.$bus.$emit('agent-message', {
        agentModelId: agentMessage.modelId, // agent数据源id
        agentType: agentMessage.type, // agent的数据源类型
        sourceName: agentMessage.definition, // agent的数据源名称
        agentHost: this.agentForm.host, // agent的ip
        agentPort: this.agentForm.port, // agent的端口号
        batchSize: '3000',
      })
      this.addDataSource()
    },
  },
}
