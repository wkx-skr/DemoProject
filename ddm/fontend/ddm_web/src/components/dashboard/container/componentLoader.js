import { componentsOfVue as components } from '../api/components'
import _ from 'lodash'
import $ from 'jquery'
import Controller from './controller.vue'
import H5Container from '../html/container.vue'
export default {
  mixins: [components],
  props: {
    data: Object,
    editMode: Boolean,
    rootData: Object
  },
  beforeMount () {
    // console.log(this.data)
  },
  created () {
    // console.log(this.data)
  },
  components: {
    Controller,
    H5Container
  },
  render (createElement) {
    let componentObject
    if (
      this.data.data &&
      this.data.data.fromOuter &&
      !this.rootData.hasOwnProperty(this.data.component)
    ) {
      return createElement(
        'div',
        {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          }
        },
        [
          createElement(
            'div',
            {
              // domProps: {
              //   innerText: this.data.title
              // },
              style: {
                height: '100%',
                textAlign: 'center',
                fontSize: '14px',
                marginTop: '50px'
              }
            }
            /* [
              createElement('span', this.data.title),
              createElement(
                'el-button',
                {
                  props: {
                    type: 'text',
                    size: 'mini',
                    // plain: true,
                    circle: true
                  },
                  class: ['el-icon-more', 'drag-cancel'],
                  style: {
                    marginLeft: '10px'
                  }
                }
              ),
              createElement(
                'el-button',
                {
                  props: {
                    type: 'text',
                    size: 'mini',
                    // plain: true,
                    circle: true
                  },
                  class: ['el-icon-delete', 'drag-cancel'],
                  style: {
                    marginLeft: '2px'
                  },
                  domProps: {
                    // innerText: '删除'
                  }
                }
              )
            ] */
          )
        ]
      )
    } else {
      componentObject = {
        props: {
          rootData: this.rootData[this.data.component]
        }
      }
    }
    let componentTagName = this.data.component
    if (this.data.isH5) {
      if (!window.echarts) {
        $(document.body).append(
          '<script src="./static/js/echarts.common.min.js"></script>'
        )
      }
      componentTagName = 'h5-container'
      componentObject.props.dataId = this.data.component
    }
    if (this.editMode) {
      return createElement(
        'div',
        {
          class: 'edit',
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          }
        },
        [
          createElement(
            componentTagName,
            _.assign(
              {
                style: {
                  // opacity: 0.75
                  height: '100%'
                }
              },
              componentObject
            )
          ),
          createElement(
            'div',
            {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0
              }
            } /*,
            [
              createElement(
                'div',
                {
                  // domProps: {
                  //   innerText: this.data.title
                  // },
                  style: {
                    height: '100%',
                    textAlign: 'center',
                    fontSize: '14px',
                    marginTop: '50px'
                  }
                }
                /!* [
                  createElement('span', this.data.title),
                  createElement(
                    'el-button',
                    {
                      props: {
                        'type': 'text',
                        'size': 'mini',
                        // plain: true,
                        circle: true
                      },
                      'class': ['el-icon-more', 'drag-cancel'],
                      style: {
                        marginLeft: '10px'
                      },
                    }
                  ),
                  createElement(
                    'el-button',
                    {
                      props: {
                        'type': 'text',
                        'size': 'mini',
                        // plain: true,
                        circle: true
                      },
                      'class': ['el-icon-delete', 'drag-cancel'],
                      style: {
                        marginLeft: '2px'
                      },
                      domProps: {
                        // innerText: '删除'
                      }
                    }
                  )
                ] *!/
              )
            ] */
          )
        ]
        // [
        //   createElement(
        //     'el-button',
        //     {
        //       props: {
        //         'type': 'primary',
        //         'size': 'small'
        //       }
        //     },
        //     '编辑'
        //   )
        // ]
      )
    } else {
      return createElement(
        'div',
        {
          class: 'edit',
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
          }
        },
        [
          createElement(
            componentTagName,
            _.assign(
              {
                style: {
                  height: '100%'
                }
              },
              componentObject
            )
          )
        ]
      )
    }
  },
  data () {
    return {}
  }
}
