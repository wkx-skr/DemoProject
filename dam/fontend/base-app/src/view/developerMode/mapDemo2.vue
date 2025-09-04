<template>
  <div id="myNetwork" style="width: 800px; height: 600px"></div>
</template>
<script>
import vis from 'vis'
const nodes = new vis.DataSet([
  { id: 1, label: 'Node 1' },
  //        {id: 2, label: 'Node 2'},
  { id: 3, label: 'Node 3' },
  { id: 4, label: 'Node 4' },
  { id: 5, label: 'Node 5' },
])

// create an array with edges
const edges = new vis.DataSet([
  { from: 1, to: 3 },
  /* {from: 1, to: 2},
     {from: 2, to: 4},
     {from: 2, to: 5},
     {from: 3, to: 3} */
])
export default {
  mounted() {
    // create an array with nodes

    // create a network
    const container = document.getElementById('myNetwork')
    const data = {
      nodes: nodes,
      edges: edges,
    }
    const options = {}
    const network = new vis.Network(container, data, options)
    setTimeout(() => {
      nodes.add([
        { id: 111, label: '111' },
        { id: 2, label: '222' },
      ])
    }, 1000)
    setTimeout(() => {
      edges.add({ from: 111, to: 2 })
    }, 2000)
  },
}
</script>
