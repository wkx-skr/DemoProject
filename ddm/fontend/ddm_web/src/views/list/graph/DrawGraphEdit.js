import $ from 'jquery'
import _ from 'lodash'
import xss from 'xss'
if (!window.mxGraph) {
  // $(document.body).append(`<script src="${location.pathname !== '/' ? location.pathname : '/'}static/libs/mxgraph/mxClient.min.js"></script>`)
//  $(document.body).append('<script src="./static/libs/mxgraph/mxClient.js"></script>');
}
const MxPoint = mxPoint
const MxGraph = mxGraph
const MxHierarchicalLayout = mxHierarchicalLayout
const MxRectangle = mxRectangle
const MxFastOrganicLayout = mxFastOrganicLayout
const MxRubberband = mxRubberband
const MxOutline = mxOutline
const MxEditor = mxEditor
const shapeMap = {
  'Datablau.ERD.ShapeEclipse': 'ellipse',
  'Datablau.ERD.ShapeTriangle': 'triangle;direction=north',
  'Datablau.ERD.ShapeDiamond': 'rhombus',
  'Datablau.ERD.ShapeRectangle': 'rectangle',
  'Datablau.ERD.ShapePentagon': 'hexagon',
  'Datablau.ERD.ShapeHexagon': 'hexagon'
}

function bfsToSplitGroups (cellGroups) {
  var result = []
  var checkedNode = {}
  for (var i = 0; i < cellGroups.length; i++) {
    var group = cellGroups[i]

    var newGroup = bfsSearch(group, cellGroups, checkedNode)
    if (newGroup) {
      var flattenGroup = []
      for (let k in newGroup) {
        if (k) { flattenGroup.push(k) }
      }

      result.push(flattenGroup)

      for (let k = 0; k < flattenGroup.length; k++) {
        cellIdToGroup[flattenGroup[k]] = flattenGroup
      }
    }
  }

  return result
}

function bfsSearch (currentGroup, cellGroups, checkedNode) {
  var result = {}

  if (checkedNode[currentGroup.id]) {
    return null
  }

  checkedNode[currentGroup.id] = true
  result[currentGroup.id] = true

  for (var i = 0; i < currentGroup.group.length; i++) {
    var toSearchGroup = findGroupById(currentGroup.group[i], cellGroups)

    if (toSearchGroup) {
      var temp = bfsSearch(toSearchGroup, cellGroups, checkedNode)
      if (temp != null) {
        for (var k in temp) {
          result[k] = true
        }
      }
    }
  }

  return result
}

function findGroupById (id, cellGroups) {
  for (var i = 0; i < cellGroups.length; i++) {
    if (parseInt(id) === parseInt(cellGroups[i].id)) {
      return cellGroups[i]
    }
  }
  return null
}

function doLayout (graph, array, pos) {
  for (let i = 0; i < array.length; i++) {
    var cell = array[i]
    var newPos = pos[cell.id]

    if (newPos) {
      var geo = mxUtils.clone(cell.geometry)
      geo.x = newPos.x
      geo.y = newPos.y

      graph.getModel().setGeometry(cell, geo)
    }
  }
}

function layoutNoConnectionCells (startX, startY, cells, cellsPositions) {
  var maxHeight = 0
  var maxWidth = 0
  // iterate cells and get the max height and width
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i]
    maxWidth = Math.max(cell.geometry.width, maxWidth)
    maxHeight = Math.max(cell.geometry.height, maxHeight)
  }
  // 假设每个cell都是相同大小，拥有最大的高度和最大的宽度
  // 然后我们尽可能把他们摆成一个方形，那么我们就先算出来
  // 这N个方块的面积，然后取根号，得到单边长，然后算出n，n = 单边长/maxWidth + 1，这样算出来每一行摆多少个，然后
  // 一行一行摆。
  var square = maxHeight * maxWidth * cells.length
  var areaWidth = Math.sqrt(square)
  var horNum = Math.ceil(areaWidth / maxWidth)

  var cx = startX // 当前方块的起始x轴
  var cy = startY // 当前方块的起始y轴
  var hn = 0 // 当前方块是这一行的第几个，当达到horNum需要换行。

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i]
    if (hn === horNum) {
      cx = startX
      cy = cy + maxHeight
      hn = 0
    }

    var cellHeight = cell.geometry.height
    var cellWidth = cell.geometry.width

    var deltaH = (maxWidth - cellWidth) / 2
    var deltaV = (maxHeight - cellHeight) / 2

    var newX = cx + deltaH
    var newY = cy + deltaV

    cellsPositions[cell.id] = {
      x: newX,
      y: newY
    }

    cx = cx + maxWidth
    hn++
  }
}

// 基本原则是，以从中心往外面发散的方式绘制。
function layoutHasConnectionsCells (graph, cells, cellsPositions) {
  // 画过的cell的id和位置大小信息
  var caledCells = {}
  // 按照bfs来走，避免下一个热度高的节点和当前热度高的节点在两个完全不相干的区域，导致绘制线困难
  // 比如A有123456， B有6789， 当A不在计算过的节点里会以A当前位置作为中心，同样在绘制B的时候会以B为中心画，
  // 这样A和B的相对位置可能很怪导致在B连6节点的时候异常困难。所以我们用BFS的方式来绘制
  bfsLayoutCell(graph, cells[0], cells, caledCells)
  for (var k in caledCells) {
    cellsPositions[k] = caledCells[k]
  }
}

function bfsLayoutCell (graph, currentCellGroup, cellGroups, caledCells) {
  // 如果这个cellgroup所有的节点都已经算过了，就不再计算了，否则会陷入无限循环
  if (checkIfAllCaled(currentCellGroup, caledCells)) {
    return
  }
  // 以当前点作为中心来计算它自己和关联的节点位置
  innerLayoutHasConnectionCell(graph, currentCellGroup, caledCells)
  // 对和它关联的节点按照关联节点热度排序，这样保证和当前节点有关联的热度高的节点先画
  currentCellGroup.group.sort(function (o1, o2) {
    var cellGroup1 = findGroupCellByCellId(cellGroups, o1)
    var cellGroup2 = findGroupCellByCellId(cellGroups, o2)

    return cellGroup1.group.length - cellGroup2.group.length
  })
  // 递归画所有的节点
  for (var i = 0; i < currentCellGroup.group.length; i++) {
    var nextCellGroup = findGroupCellByCellId(cellGroups, currentCellGroup.group[i])
    bfsLayoutCell(graph, nextCellGroup, cellGroups, caledCells)
  }
}

function checkIfAllCaled (currentCellGroup, caledCells) {
  if (!caledCells[currentCellGroup.id]) { return false }

  for (var i = 0; i < currentCellGroup.group.length; i++) {
    if (!caledCells[currentCellGroup.group[i]]) { return false }
  }

  return true
}

function findGroupCellByCellId (cellGroups, cellId) {
  for (var i = 0; i < cellGroups.length; i++) {
    var cellGroup = cellGroups[i]
    if (cellGroup.id === cellId) {
      return cellGroup
    }
  }
}

function innerLayoutHasConnectionCell (graph, centerCell, caledCells) {
  // 中心的节点
  var mainCell = graph.getModel().getCell(centerCell.id)
  // 中心节点的几何参数
  var coreGeo = mainCell.geometry
  // 跟此中心节点有关联的节点
  var cells = []
  for (var i = 0; i < centerCell.group.length; i++) {
    cells.push(graph.getModel().getCell(centerCell.group[i]))
  }
  // 按照大小排序，大的排前面，先画
  // 而且已经画过的节点我们也排在前面
  cells.sort(function (o1, o2) {
    var square1 = o1.geometry.height * o1.geometry.width
    var square2 = o2.geometry.height * o2.geometry.width

    if (caledCells[o1.id]) { square1 += 99999999 } // 当节点已经计算过位置了，那么给面积加上一个巨大的基数值使他能尽可能往前排
    if (caledCells[o2.id]) { square2 += 99999999 }
    return square1 - square2
  })

  var level = 1
  // 在中心的周围画
  for (let i = 0; i < cells.length; i++) {
    var cell = cells[i]
    // 如果已经画了的
    if (caledCells[cell.id]) {
      // 并且核心已经画了，我们就不管了
      if (caledCells[mainCell.id]) {
        continue
      } else {
        // 否则我们根据这个已经画的节点画核心节点
        level = findSuitableLocation(level, caledCells[cell.id], coreGeo, cell.id, caledCells)
      }
    } else {
      if (i === 0 && !caledCells[mainCell.id]) {
        console.debug('set pos of ' + mainCell.id)
        caledCells[mainCell.id] = mxUtils.clone(mainCell.geometry)
      }

      // 如果此节点是没有画过的，那么我们就通过核心节点来找一个合适的位置放它
      level = findSuitableLocation(level, caledCells[mainCell.id], cell.geometry, cell.id, caledCells)
    }
  }
}

// 每往外扩大一圈应该扩大的幅度，此值越大，那么越稀疏
var LEVEL_MARGIN = 100
// 每个实体间应该留多少空
var ENTITY_MARGIN = 60
// 每个区间中间留的空缺大小，此区域不允许画东西用来走线
var AREA_GAP = 50
var ENTITY_PERIMETER = 50

function findSuitableLocation (startLevel, baseCellGeo, toAddCellGeo, toAddCellId, caledCells) {
  // 首先尝试上下左右四个方向能不能直接放下
  var newGeo = tryPlaceInFourDirection(startLevel, baseCellGeo, toAddCellGeo, caledCells)
  if (newGeo) {
    console.debug('set direct pos of ' + toAddCellId)
    caledCells[toAddCellId] = newGeo
    return startLevel
  }

  // 以此cell为中心，一层一层往外面找可以放核心的地方
  // 把一个矩形的4边分成8个扇形部分，西北，北西， 北东， 东北， 东南， 南东， 西南
  // 每个区间中间需要留一个空缺用来走线。

  for (var i = 1, level = startLevel; i <= 8; i++) {
    var area = getPlaceableArea(baseCellGeo, level, i)
    var placeablePos = tryPlaceCell(toAddCellGeo, area, i, caledCells)

    if (placeablePos != null) {
      console.debug('set pos of ' + toAddCellId)
      caledCells[toAddCellId] = {
        x: placeablePos.x,
        y: placeablePos.y,
        height: toAddCellGeo.height,
        width: toAddCellGeo.width
      }
      return level
    }

    if (i === 8) {
      // 如果这一层找不到，往外扩散一层
      i = 1
      level++
    }
  }
}

function tryPlaceInFourDirection (startLevel, baseCellGeo, toAddCellGeo, caledCells) {
  var newGeo = {
    height: toAddCellGeo.height,
    width: toAddCellGeo.width
  }
  newGeo.x = baseCellGeo.x - startLevel * LEVEL_MARGIN - toAddCellGeo.width
  newGeo.y = baseCellGeo.y - (toAddCellGeo.height - baseCellGeo.height) / 2

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x - (toAddCellGeo.width - baseCellGeo.width) / 2
  newGeo.y = baseCellGeo.y - startLevel * LEVEL_MARGIN - toAddCellGeo.height

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x + baseCellGeo.width + startLevel * LEVEL_MARGIN
  newGeo.y = baseCellGeo.y - (toAddCellGeo.height - baseCellGeo.height) / 2

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  newGeo.x = baseCellGeo.x - (toAddCellGeo.width - baseCellGeo.width) / 2
  newGeo.y = baseCellGeo.y + baseCellGeo.height + startLevel * LEVEL_MARGIN

  if (!hasOverlap(newGeo, caledCells)) { return newGeo }

  return null
}

function tryPlaceCell (toAddCellGeo, area, direction, caledCells) {
  var geo = toAddCellGeo

  if (direction === 1) {
    for (var i = area.endy; i >= area.starty; i -= ENTITY_MARGIN) {
      var newGeo = {
        x: area.x - geo.width,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 2) {
    for (let i = area.endx; i >= area.startx; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y - geo.height,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 3) {
    for (let i = area.startx; i <= area.endx - geo.width; i += ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y - geo.height,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 4) {
    for (let i = area.endy; i >= area.starty; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 5) {
    for (let i = area.starty; i <= area.endy - geo.height; i += ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 6) {
    for (let i = area.startx; i <= area.endx; i += ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 7) {
    for (let i = area.endx; i >= area.startx; i -= ENTITY_MARGIN) {
      let newGeo = {
        x: i,
        y: area.y,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  } else if (direction === 8) {
    for (let i = area.starty; i <= area.endy; i += ENTITY_MARGIN) {
      let newGeo = {
        x: area.x,
        y: i,
        width: geo.width,
        height: geo.height
      }

      if (!hasOverlap(newGeo, caledCells)) {
        return newGeo
      }
    }
  }

  return null
}

function getPlaceableArea (baseCellGeo, level, direction) {
  // 西北 - 1，北西 - 2， 北东 - 3， 东北 - 4， 东南 - 5， 南东 - 6， 南西 - 7, 西南 - 8
  var result = {}
  var geo = baseCellGeo
  var margin = level * LEVEL_MARGIN
  if (direction === 1) {
    result.x = geo.x - margin
    result.starty = geo.y - margin
    result.endy = geo.y + (geo.height - AREA_GAP) / 2
  } else if (direction === 2) {
    result.startx = geo.x - margin
    result.endx = geo.x + (geo.width - AREA_GAP) / 2
    result.y = geo.y - margin
  } else if (direction === 3) {
    result.startx = geo.x + (geo.width + AREA_GAP) / 2
    result.endx = geo.x + geo.width + margin
    result.y = geo.y - margin
  } else if (direction === 4) {
    result.x = geo.x + geo.width + margin
    result.starty = geo.y - margin
    result.endy = geo.y + (geo.height + AREA_GAP) / 2
  } else if (direction === 5) {
    result.x = geo.x + geo.width + margin
    result.starty = geo.y + (geo.height - AREA_GAP) / 2
    result.endy = geo.y + geo.height + margin
  } else if (direction === 6) {
    result.startx = geo.x + (geo.width + AREA_GAP) / 2
    result.endx = geo.x + geo.width + margin
    result.y = geo.y + geo.height + margin
  } else if (direction === 7) {
    result.startx = geo.x - margin
    result.endx = geo.x + (geo.width - AREA_GAP) / 2
    result.y = geo.y + geo.height + margin
  } else if (direction === 8) {
    result.x = geo.x - margin
    result.starty = geo.y + (geo.height + AREA_GAP) / 2
    result.endy = geo.y + geo.height + margin
  } else {
    console.debug('should never be here')
  }

  return result
}

function hasOverlap (cellGeo, caledCells) {
  for (var i in caledCells) {
    var cellId = i
    var geo = caledCells[i]
    var testGeo = mxUtils.clone(geo)
    testGeo.x -= ENTITY_PERIMETER
    testGeo.y -= ENTITY_PERIMETER
    testGeo.width += ENTITY_PERIMETER
    testGeo.height += ENTITY_PERIMETER

    if (hasOverlapRects(cellGeo, testGeo)) { return true }
  }

  return false
}

function hasOverlapRects (rect1Geo, rect2Geo) {
  var r1sq = rect1Geo.width * rect1Geo.height
  var r2sq = rect2Geo.width * rect2Geo.height
  var large, small
  if (r1sq >= r2sq) {
    large = rect1Geo
    small = rect2Geo
  } else {
    large = rect2Geo
    small = rect1Geo
  }
  // 如果大的包括了小的
  if (small.x >= large.x && small.x + small.width <= large.x + large.width && small.y >= large.y && small.y + small.height <= large.y + large.height) { return true }

  var leftMost = rect1Geo.x
  var rightMost = rect1Geo.x + rect1Geo.width
  var topMost = rect1Geo.y
  var bottomMost = rect1Geo.y + rect1Geo.height

  var geo = rect2Geo

  return cross(leftMost, rightMost, topMost, geo.y, geo.y + geo.height, geo.x) ||
    cross(leftMost, rightMost, topMost, geo.y, geo.y + geo.height, geo.x + geo.width) ||
    cross(leftMost, rightMost, bottomMost, geo.y, geo.y + geo.height, geo.x) ||
    cross(leftMost, rightMost, bottomMost, geo.y, geo.y + geo.height, geo.x + geo.width) ||
    cross(geo.x, geo.x + geo.width, geo.y, topMost, bottomMost, leftMost) ||
    cross(geo.x, geo.x + geo.width, geo.y, topMost, bottomMost, rightMost) ||
    cross(geo.x, geo.x + geo.width, geo.y + geo.height, topMost, bottomMost, leftMost) ||
    cross(geo.x, geo.x + geo.width, geo.y + geo.height, topMost, bottomMost, rightMost)
}

function cross (left, right, y, top, bottom, x) {
  return (top <= y) && (bottom >= y) && (left <= x) && (right >= x)
}

// hasOverlapLineAndRect
var EDGE_ENTITY_MARGIN = 5
var EDGE_SPACE = 5
var USED_POINT = {} // 一个set，point按照xn-yn来存放

function addUsedPoints (points) {
  for (var i = 0; i < points.length; i++) {
    var point = points[i]
    if (!point) { continue }
    USED_POINT[buildPointKey(point)] = true
  }
}

function checkUsedPoint (point) {
  if (USED_POINT[buildPointKey(point)]) { return true }
  return false
}

function buildPointKey (point) {
  return 'x' + point.x + '-y' + point.y
}

function hasOverlapLineAndRect (lineGeo, rectGeo) {
  var start = lineGeo.start
  var end = lineGeo.end

  var minx = Math.min(start.x, end.x)
  var miny = Math.min(start.y, end.y)
  var maxx = Math.max(start.x, end.x)
  var maxy = Math.max(start.y, end.y)

  return hasOverlapRects({
    x: minx,
    y: miny,
    height: maxy - miny,
    width: maxx - minx
  }, rectGeo)
}

function isEdgeHasOverlapEntities (edgeGeo, entityIds) {
  for (var i = 0; i < entityIds.length; i++) {
    if (hasOverlapLineAndRect(edgeGeo, globalPos[entityIds[i].id])) {
      return true
    }
  }

  return false
}

/* mxEdgeStyle.MyStyle = function(state, source, target, points, result)
{
  if (source != null && target != null)
  {
  if (globalPos == null) {
    mxEdgeStyle.OrthConnector(state, source, target, points, result);
  } else {
      var toBeCheckedIds = mxUtils.clone(cellIdToGroup[source.cell.id]);

    for (var i=0; i<toBeCheckedIds.length; i++) {
      if (toBeCheckedIds[i].id == source.cell.id || toBeCheckedIds[i].id == target.cell.id) {
        toBeCheckedIds.splice(i, 1);
        i--;
      }
    }

    var sgeo = source.cell.geometry;
    var tgeo = target.cell.geometry;

    if (source.cell.value == '12' && target.cell.value=='10') {
      console.debug("got me");
    }

    var direction = getDirection(sgeo, tgeo);
    if (!getPointsByDirection(direction, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
      var notFound = true;
      var seconardyDirection = getSecondaryDirection(direction, sgeo, tgeo);

      if (seconardyDirection) {
        if (getPointsByDirection(seconardyDirection, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
          notFound = false;
        }
      }

      if (notFound) {
        var pt = new MxPoint(target.getCenterX(), source.getCenterY());

        if (mxUtils.contains(source, pt.x, pt.y))
        {
          pt.y = source.y + source.height;
        }

        result.push(pt);
      }
    }

  }
  }
}; */
//     2   3
//  1         4
//  8         5
//     7   6
function getDirection (sgeo, tgeo) {
  var spos = { x: sgeo.x + sgeo.width / 2, y: sgeo.y + sgeo.height / 2 }

  if (tgeo.x < spos.x) {
    var v = tgeo.y - spos.y
    var absV = Math.abs(v)
    if (v > 0) {
      if (spos.x - tgeo.x > absV) {
        return 8
      } else {
        return 7
      }
    } else {
      if (spos.x - tgeo.x > absV) {
        return 1
      } else {
        return 2
      }
    }
  } else {
    let v = tgeo.y - spos.y
    let absV = Math.abs(v)
    if (v > 0) {
      if (tgeo.x - spos.x > absV) {
        return 5
      } else {
        return 6
      }
    } else {
      if (tgeo.x - spos.x > absV) {
        return 4
      } else {
        return 3
      }
    }
  }
}

function getSecondaryDirection (firstDirection, sgeo, tgeo) {
  var scorex = sgeo.x + sgeo.width / 2
  var scorey = sgeo.y + sgeo.height / 2
  var rightBottomX = tgeo.x + tgeo.width
  var rightBottomY = tgeo.y + tgeo.height

  if (firstDirection === 1) {
    if (tgeo.y + tgeo.height < sgeo.y + sgeo.height / 2) {
      return 2
    } else {
      return 8
    }
  } else if (firstDirection === 2) {
    if (tgeo.x + tgeo.width > sgeo.x + sgeo.width / 2) {
      return 3
    } else {
      return 1
    }
  } else if (firstDirection === 3) {
    let rightBottomX = tgeo.x + tgeo.width
    let rightBottomY = tgeo.y + tgeo.height

    if (rightBottomY > scorey) {
      if (rightBottomY - scorey > rightBottomX - scorex) {
        return 6
      } else {
        return 5
      }
    } else {
      return 4
    }
  } else if (firstDirection === 4) {
    if (rightBottomY - scorey > rightBottomX - scorex) {
      return 6
    } else {
      return 5
    }
  } else if (firstDirection === 5) {
    return 6
  } else if (firstDirection === 6) {
    return 5
  } else if (firstDirection === 7) {
    if (rightBottomY - scorey > rightBottomX - scorex) {
      return 6
    } else {
      return 5
    }
  } else if (firstDirection === 8) {
    if (rightBottomX < scorex) {
      return 7
    } else {
      if (rightBottomY - scorey > rightBottomX - scorex) {
        return 6
      } else {
        return 5
      }
    }
  }
}

function getPointsByDirection (direction, tgeo, sgeo, result, toBeCheckedIds, source, target) {
  if (direction === 1) {
    // 目标在源西北角，先检查是否有overlap的y
    if (tgeo.y + tgeo.height - EDGE_ENTITY_MARGIN > sgeo.y + EDGE_ENTITY_MARGIN) {
      var maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      var minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        var middley = (minY + maxY) / 2
        for (var ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          var edgeGeo = {
            start: {
              x: sgeo.x,
              y: middley + ty
            },
            end: {
              x: tgeo.x + tgeo.width,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find-1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    middley = sgeo.height / 2 + sgeo.y
    for (var sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      var startPoint = { x: sgeo.x, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      var middlex = tgeo.x + tgeo.width / 2
      for (var tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        var endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }
        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          var newEndPoint = {
            x: endPoint.x,
            y: tgeo.y + tgeo.height
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find -2-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 考虑2折，从两个东西中间创建一条横线
    var lowerMiddley = sgeo.height / 2 + sgeo.y
    for (var sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (tgeo.x + tgeo.width + sgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (sgeo.x - tgeo.x - tgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        var middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        var upperMiddley = tgeo.height / 2 + tgeo.y
        for (var suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          var middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x + tgeo.width,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 2) {
    // 目标在源北西角，先检查是否有overlap的x
    if (tgeo.x + tgeo.width - EDGE_ENTITY_MARGIN > sgeo.x + EDGE_ENTITY_MARGIN) {
      var maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      var minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y + tgeo.height
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }
        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x + tgeo.width,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + tgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (sgeo.y - tgeo.y - tgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y + tgeo.height
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 3) {
    // 目标在源北东角，先检查是否有overlap的x
    if (tgeo.x + EDGE_ENTITY_MARGIN <= sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y + tgeo.height
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find -1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + tgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (sgeo.y - tgeo.y - tgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y + tgeo.height
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 4) {
    // 目标在源东北角，先检查是否有overlap的y
    if (tgeo.y + tgeo.height - EDGE_ENTITY_MARGIN > sgeo.y + EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x + sgeo.width,
              y: middley + ty
            },
            end: {
              x: tgeo.x,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x + sgeo.width, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y + tgeo.height
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (sgeo.x + sgeo.width + tgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (tgeo.x - sgeo.x - sgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 5) {
    // 目标在源东南角，先检查是否有overlap的y
    if (tgeo.y + EDGE_ENTITY_MARGIN < sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x + sgeo.width,
              y: middley + ty
            },
            end: {
              x: tgeo.x,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find -1-' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x + sgeo.width, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (sgeo.x + sgeo.width + tgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (tgeo.x - sgeo.x - sgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 6) {
    // 目标在源北东角，先检查是否有overlap的x
    if (tgeo.x + EDGE_ENTITY_MARGIN <= sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y + sgeo.height
            },
            end: {
              x: middlex + tx,
              y: tgeo.y
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y + sgeo.height }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y + sgeo.height
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + sgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (tgeo.y - sgeo.y - sgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 7) {
    // 目标在源南东角，先检查是否有overlap的x
    if (tgeo.x + tgeo.width - EDGE_ENTITY_MARGIN > sgeo.x + EDGE_ENTITY_MARGIN) {
      let maxX = Math.min(Math.min(tgeo.x + tgeo.width, sgeo.x + sgeo.width), sgeo.x + sgeo.width - EDGE_ENTITY_MARGIN)
      let minX = Math.max(Math.max(tgeo.x, sgeo.x), sgeo.x + EDGE_ENTITY_MARGIN)
      // 如果有交集,先尝试不折
      if (maxX > minX) {
        // 尝试直接连接
        let middlex = (minX + maxX) / 2
        for (let tx = 0, isNeg = 1; tx <= (maxX - minX) / 2; tx += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: middlex + tx,
              y: sgeo.y
            },
            end: {
              x: middlex + tx,
              y: tgeo.y
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middlex = sgeo.width / 2 + sgeo.x
    for (let sx = 0, isXNeg = 1; sx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
      let startPoint = { x: middlex - sx * isXNeg, y: sgeo.y + sgeo.height }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middley = tgeo.y + tgeo.height / 2
      for (let ty = 0, isYNeg = 1; ty <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; ty += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let endPoint = {
          x: startPoint.x,
          y: middley + ty * isYNeg
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }
        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: tgeo.x + tgeo.width,
            y: endPoint.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 - ' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddlex = sgeo.width / 2 + sgeo.x
    for (let slx = 0, isLXNeg = 1; slx <= sgeo.width / 2 - EDGE_ENTITY_MARGIN; slx += isLXNeg < 0 ? EDGE_SPACE : 0, isLXNeg *= -1) {
      let startPoint = {
        x: lowerMiddlex + slx * isLXNeg,
        y: sgeo.y + sgeo.height
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middley = (sgeo.y + sgeo.height + tgeo.y) / 2
      for (let sy = 0, isYNeg = 1; sy <= (tgeo.y - sgeo.y - sgeo.height) / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
        let middleLower = {
          x: startPoint.x,
          y: middley + sy * isYNeg
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddlex = tgeo.width / 2 + tgeo.x
        for (let sux = 0, isUXNeg = 1; sux <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; sux += isUXNeg < 0 ? EDGE_SPACE : 0, isUXNeg *= -1) {
          let middleUpper = {
            x: upperMiddlex + sux * isUXNeg,
            y: middleLower.y
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: middleUpper.x,
            y: tgeo.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3 -' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  } else if (direction === 8) {
    // 目标在源西南角，先检查是否有overlap的y
    if (tgeo.y + EDGE_ENTITY_MARGIN > sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN) {
      let maxY = Math.min(Math.min(tgeo.y + tgeo.height, sgeo.y + sgeo.height), sgeo.y + sgeo.height - EDGE_ENTITY_MARGIN)
      let minY = Math.max(Math.max(tgeo.y, sgeo.y), sgeo.y + EDGE_ENTITY_MARGIN)
      // 如果在Y轴上有交集,先尝试不折
      if (maxY > minY) {
        // 尝试直接连接
        let middley = (minY + maxY) / 2
        for (let ty = 0, isNeg = 1; ty <= (maxY - minY) / 2; ty += isNeg < 0 ? EDGE_SPACE : 0, isNeg *= -1) {
          let edgeGeo = {
            start: {
              x: sgeo.x,
              y: middley + ty
            },
            end: {
              x: tgeo.x + tgeo.width,
              y: middley + ty
            }
          }

          if (checkUsedPoint(edgeGeo.start) || checkUsedPoint(edgeGeo.end)) {
            continue
          }

          if (!isEdgeHasOverlapEntities(edgeGeo, toBeCheckedIds)) {
            result.push(new MxPoint(edgeGeo.start.x, edgeGeo.start.y))
            result.push(new MxPoint(edgeGeo.end.x, edgeGeo.end.y))
            addUsedPoints(result)
            console.debug('find - 1 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }
    // 如果直接连接失败， 需要考虑一折，那么我们尝试从中缝区域走,从左侧上撇
    let middley = sgeo.height / 2 + sgeo.y
    for (let sy = 0, isYNeg = 1; sy <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sy += isYNeg < 0 ? EDGE_SPACE : 0, isYNeg *= -1) {
      let startPoint = { x: sgeo.x, y: middley - sy * isYNeg }
      if (checkUsedPoint(startPoint)) {
        continue
      }
      let middlex = tgeo.x + tgeo.width / 2
      for (let tx = 0, isXNeg = 1; tx <= tgeo.width / 2 - EDGE_ENTITY_MARGIN; tx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let endPoint = {
          x: middlex + tx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(endPoint)) {
          continue
        }

        if (!isEdgeHasOverlapEntities({ start: startPoint, end: endPoint }, toBeCheckedIds)) {
          let newEndPoint = {
            x: endPoint.x,
            y: tgeo.y
          }

          if (!checkUsedPoint(newEndPoint) && !isEdgeHasOverlapEntities({ start: endPoint, end: newEndPoint }, toBeCheckedIds)) {
            result.push(new MxPoint(startPoint.x, startPoint.y))
            result.push(new MxPoint(endPoint.x, endPoint.y))
            result.push(new MxPoint(newEndPoint.x, newEndPoint.y))
            addUsedPoints(result)
            console.debug('find - 2 -' + source.cell.value + '->' + target.cell.value)
            return true
          }
        }
      }
    }

    // 考虑2折，从两个东西中间创建一条横线
    let lowerMiddley = sgeo.height / 2 + sgeo.y
    for (let sly = 0, isLYNeg = 1; sly <= sgeo.height / 2 - EDGE_ENTITY_MARGIN; sly += isLYNeg < 0 ? EDGE_SPACE : 0, isLYNeg *= -1) {
      let startPoint = {
        x: sgeo.x,
        y: lowerMiddley + sly * isLYNeg
      }

      if (checkUsedPoint(startPoint)) {
        continue
      }

      let middlex = (tgeo.x + tgeo.width + sgeo.x) / 2
      for (let sx = 0, isXNeg = 1; sx <= (sgeo.x - tgeo.x - tgeo.width) / 2 - EDGE_ENTITY_MARGIN; sx += isXNeg < 0 ? EDGE_SPACE : 0, isXNeg *= -1) {
        let middleLower = {
          x: middlex + sx * isXNeg,
          y: startPoint.y
        }

        if (checkUsedPoint(middleLower) || isEdgeHasOverlapEntities({ start: startPoint, end: middleLower }, toBeCheckedIds)) {
          continue
        }

        let upperMiddley = tgeo.height / 2 + tgeo.y
        for (let suy = 0, isUYNeg = 1; suy <= tgeo.height / 2 - EDGE_ENTITY_MARGIN; suy += isUYNeg < 0 ? EDGE_SPACE : 0, isUYNeg *= -1) {
          let middleUpper = {
            x: middleLower.x,
            y: upperMiddley + suy * isUYNeg
          }

          if (checkUsedPoint(middleUpper) || isEdgeHasOverlapEntities({ start: middleLower, end: middleUpper }, toBeCheckedIds)) {
            continue
          }

          let endPoint = {
            x: tgeo.x + tgeo.width,
            y: middleUpper.y
          }

          if (checkUsedPoint(endPoint) || isEdgeHasOverlapEntities({ start: middleUpper, end: endPoint }, toBeCheckedIds)) {
            continue
          }

          result.push(new MxPoint(startPoint.x, startPoint.y))
          result.push(new MxPoint(middleLower.x, middleLower.y))
          result.push(new MxPoint(middleUpper.x, middleUpper.y))
          result.push(new MxPoint(endPoint.x, endPoint.y))
          addUsedPoints(result)
          console.debug('find - 3-' + source.cell.value + '->' + target.cell.value)
          return true
        }
      }
    }
  }
}
let ENTITY_MIN_SPACE = 30
function calcCellFinalPost (areas, pos) {
  // 用来记录所有area中最小的高和宽，然后两值中间大值作为我们尝试移动的最小单位
  // 我们尽量把整个区域摆成一个正方形，正方形做法就是把所有区域面积加起来，然后求根算出边长
  // 然后把区域面积从大到小，从左到右从上到下往图形里面放
  let minHeight = 999999
  let minWidth = 999999
  let maxWidth = 0

  let areaId = 0
  let totalSquare = 0
  for (let i = 0; i < areas.length; i++) {
    let area = areas[i]

    let topMost = 9999999
    let bottomMost = -9999999
    let leftMost = 9999999
    let rightMost = -9999999

    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      topMost = Math.min(topMost, geo.y)
      bottomMost = Math.max(bottomMost, geo.y + geo.height)
      leftMost = Math.min(leftMost, geo.x)
      rightMost = Math.max(rightMost, geo.x + geo.width)
    }
    // 计算出这个区域的面积
    area.height = bottomMost - topMost
    area.width = rightMost - leftMost
    area.square = area.height * area.width
    totalSquare += area.square
    area.id = areaId++

    minHeight = Math.min(minHeight, area.height)
    minWidth = Math.min(minWidth, area.width)
    maxWidth = Math.max(maxWidth, area.width)

    // 把这个区域内的右上角设到0,0
    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      geo.x -= leftMost
      geo.y -= topMost
    }
  }

  let step = Math.max(minHeight, minWidth)

  areas.sort(function (a1, a2) {
    return a2.square - a1.square
  })

  let boundx = Math.max(Math.ceil(Math.sqrt(totalSquare) / step) * step, Math.ceil(maxWidth / step) * step)

  let startx = 0
  let starty = 0
  let calcedAreas = {}

  for (let i = 0; i < areas.length; i++) {
    let nextPos = locateArea(startx, starty, areas[i], calcedAreas, step, boundx)
    startx = nextPos.x
    starty = nextPos.y
  }

  for (let i = 0; i < areas.length; i++) {
    let area = areas[i]

    for (let j = 0; j < area.cells.length; j++) {
      let cell = area.cells[j]
      let geo = pos[cell.id]

      geo.x += area.x
      geo.y += area.y
    }
  }
}

function locateArea (startx, starty, area, calcedAreas, step, boundx) {
  let x = startx
  let y = starty
  while (true) {
    if (x >= boundx) {
      x = 0
      y += step + ENTITY_MIN_SPACE
    }

    let geo = {
      x: x,
      y: y,
      height: area.height,
      width: area.width
    }

    if (!hasOverlap(geo, calcedAreas)) {
      area.x = geo.x
      area.y = geo.y

      calcedAreas[area.id] = geo

      let next = {
        x: Math.ceil((geo.x + geo.width) / step) * step,
        y: geo.y
      }

      return next
    }

    x += step + ENTITY_MIN_SPACE
  }
}
let cellIdToGroup = {}
let globalPos = null
/* Above is from wx's layout code */

const STYLE = {
  W: 'fillColor=#EEE;strokeColor=#DDD',
  G: 'fillColor=#CCC;strokeColor=#DDD',
  WW: 'fillColor=#FFF;strokeColor=#DDD',
  NONE: 'fillColor=#FFF;strokeColor=#FFF;',
  BLACK: 'fillColor=#FFF;strokeColor=#000',
  TITLE: 'fillColor=#F0F0F0;strokeColor=#000',
  TABLE: 'fillColor=transparent;strokeWidth=1;strokeColor=#ccc;dashed=2;',
  VIEW: 'shape=swimlane;fillColor=#FFF;dashed=1',
  OUTLINE: 'strokeColor=#79EE79;fillColor=#B9EEB9;strokeWidth=1',
  TRANSPARENT: 'fillColor=transparent;strokeColor=#transparent',
  COMMENT: 'fillColor=transparent;strokeColor=transparent;',
  FIGURE: 'fillColor=transparent;strokeColor=#ddd;strokeWidth=1',
  SubType: 'resizable=0;fillColor=transparent;strokeWidth=1;strokeColor=#000;'
}

function MyGraph (container) {
  mxGraph.call(this, container)
}
MyGraph.prototype = new MxGraph()
MyGraph.prototype.constructor = MyGraph
MyGraph.prototype.expandedImage = ''

class DrawGraph {
  constructor (container, data, param, outlineContainer, themeCreateTemplate, isDesignModel, showLogicalName = true, showPhysicalName = true, showDataType = true, editorType = 'model') {
    this.container = container
    this.outlineContainer = outlineContainer
    this.themeCreateTemplate = themeCreateTemplate
    this.param = param
    this.dataByType = data
    this.vertex = {}
    this.shapes = {}
    this.graph = {}
    this.editor = {}
    this.showLogical = showLogicalName
    this.showPhysical = showPhysicalName
    this.editorType = editorType
    this.redundantMargin = {
      paperHeight: 0,
      paperWidth: 0,
      update: function ({ ShapeSize, Location }) {
        let height = ShapeSize.height + Location.y
        let width = ShapeSize.width + Location.x
        if (height > this.paperHeight) {
          this.paperHeight = height
        }
        if (width > this.paperWidth) {
          this.paperWidth = width
        }
      },
      create: function () {
        this.executeCreate({ height: this.paperHeight, width: this.paperWidth })
      },
      executeCreate: ({ height, width }) => {
        let parent = this.graph.getDefaultParent()
        this.graph.insertVertex(
          parent,
          null,
          null,
          width + 60,
          height + 180,
          1,
          1, STYLE.TRANSPARENT)
      }
    }

    if (isDesignModel) { // design model
      this.modelType = 'design'
    } else if (this.dataByType.model['TypeUniqueId'] === '8ea840a5-37f4-48f8-82d9-1429e42a0fc6' || this.dataByType.model['TypeUniqueId'] === '4ab7d425-7b4a-49c2-a19b-86dd5f911706') { // mongoDB
      this.modelType = 'mongoOrCassandra'
    } else {
      this.modelType = 'database'
    }
    this.displaySetting = {
      name: this.modelType !== 'design' ? 'full' : 'logical',
      type: showDataType,
      column: 'all'
    }
    this.style = STYLE
  }
  destroy () {
    if (this.outline) {
      this.outline.destroy()
    }

    if (this.graph) {
      this.graph.destroy()
    }
  }
  start () {
    this.draw()
    this.initEventListener()
    this.param.$This.loading.status = false
    setTimeout(() => {
      this.param.$This.$bus.$once('focusCurrentTable', tableId => {
        for (let index in this.vertex) {
          let v = this.vertex[index]
          if (v.id === Number.parseInt(tableId)) {
            let cell = v
            $(`.svg-table[data-id=${index.slice(5)}]`).addClass('is-current')
            setTimeout(() => {
              this.graph.scrollCellToVisible(cell, true)
            }, 10)

            this.param.$This.$bus.$emit('focusCurrentTableOver')
          }
        }
      })
      this.param.$This.$bus.$emit('relationLoaded')
    })
  }

  drawShape (diagramAdd) { // diagramAdd 用于模型copy
    window.connectionPoints = []
    if (diagramAdd) { // 模型copy的创建需在cell上添加new字段
      this.new = true
    } else {
      this.new = false
    }
    this.registerSubtypeShape()
    let diagram = diagramAdd || this.dataByType.diagram[this.param.diagramId]?.children
    let diagramThemeId = this.dataByType.diagram[this.param.diagramId]?.properties?.StyleThemeRef
    if (!diagram) {
      if (this.dataByType.diagram[this.param.diagramId]) {
        this.dataByType.diagram[this.param.diagramId].children = []
      }
      return
    }
    // let parent = this.graph.getDefaultParent()

    let diagramMap = {}
    diagram.forEach(item => {
      diagramMap[item.properties.Id] = item
    })

    let figureArr = []
    diagram.forEach(d => {
      if (d.properties.TypeId === 80000008) {
        let themeStyle = {}
        if (this.dataByType.theme) {
          if (diagramThemeId && this.dataByType.theme[diagramThemeId] && !this.dataByType.theme[diagramThemeId].properties.deleted) {
            themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(this.dataByType.theme[diagramThemeId].properties))
          } else {
            themeStyle = this.themeCreateTemplate
          }
          if (d.properties.StyleThemeRef) {
            if (this.dataByType.theme[d.properties.StyleThemeRef] && !this.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
              themeStyle = _.merge(_.cloneDeep(this.themeCreateTemplate), _.cloneDeep(this.dataByType.theme[d.properties.StyleThemeRef].properties))
            }
          }
        }

        let t = this.dataByType.table[d.properties.OwneeRef]
        let v = this.dataByType.view[d.properties.OwneeRef]
        if (!d.properties.Location) {
          d.properties.Location = {
            x: 0, y: 0
          }
        }
        if (t) {
          this.drawTableShape(d, t, themeStyle, false, figureArr)
        } else if (v) {
          let t = v
          this.drawViewShape(d, t, themeStyle)
        } else if (this.dataByType.comment && this.dataByType.comment[d.properties.OwneeRef]) { // handle comment shape
          this.drawCommentShape(d, themeStyle)
        } else if (d.properties.SubTypeRef) { // handle subtype
          this.drawSubTypeShape(d, false, diagramAdd)
        } else if (!d.properties['OwneeRef']) {
          this.drawFigureShape(d, themeStyle, false, figureArr)
        }
      }
    })
    this.graph.orderCells(true, figureArr)
    // 图框有顺序需要重新排序
    figureArr = this.graph.getDefaultParent().children?.filter(cell => cell.isFigure || cell.isBusiness) || []
    figureArr = figureArr.sort((a, b) => {
      return a.OrderNumber - b.OrderNumber || a.Id - b.Id
    })
    this.graph.getDefaultParent().children && this.graph.getDefaultParent().children.splice(0, figureArr.length, ...figureArr)
    this.graph.refresh()
    // this.redundantMargin.create()
  }
  doLayout () {
    window.move = true
    window.connectionPoints = []
    mxEdgeStyle.MyStyle = function (state, source, target, points, result) {
      if (source != null && target != null) {
        if (globalPos == null) {
          mxEdgeStyle.OrthConnector(state, source, target, points, result)
        } else {
          let toBeCheckedIds = mxUtils.clone(cellIdToGroup[source.cell.id])

          for (let i = 0; i < toBeCheckedIds.length; i++) {
            if (toBeCheckedIds[i].id === source.cell.id || toBeCheckedIds[i].id === target.cell.id) {
              toBeCheckedIds.splice(i, 1)
              i--
            }
          }

          let sgeo = source.cell.geometry
          let tgeo = target.cell.geometry

          if (source.cell.value === '12' && target.cell.value === '10') {
            console.debug('got me')
          }

          let direction = getDirection(sgeo, tgeo)
          if (!getPointsByDirection(direction, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
            let notFound = true
            let seconardyDirection = getSecondaryDirection(direction, sgeo, tgeo)

            if (seconardyDirection) {
              if (getPointsByDirection(seconardyDirection, tgeo, sgeo, result, toBeCheckedIds, source, target)) {
                notFound = false
                notFound = false
              }
            }

            if (notFound) {
              let pt = new MxPoint(target.getCenterX(), source.getCenterY())

              if (mxUtils.contains(source, pt.x, pt.y)) {
                pt.y = source.y + source.height
              }

              result.push(pt)
            }
          }
        }
      }
    }
    let array = Object.values(this.vertex)
    let noRelationCells = []
    let cellGroups = []
    for (let i = 0; i < array.length; i++) {
      let cell = array[i]
      if (!cell.edges || cell.edges.length === 0 || (cell.edges.length === 1 && cell.edges[0].source.id === cell.edges[0].target.id)) {
        noRelationCells.push(cell)
        continue
      }

      let cellGroup = {
        id: cell.id,
        group: []
      }
      for (let j = 0; j < cell.edges.length; j++) {
        let edge = cell.edges[j]
        if (edge.source !== cell) {
          cellGroup.group.push(edge.source.id)
        } else if (edge.target !== cell) {
          cellGroup.group.push(edge.target.id)
        }
      }
      cellGroups.push(cellGroup)
    }
    let r = bfsToSplitGroups(cellGroups)
    let pos = {}
    let startx = 50
    let starty = 50
    let toBeCacledAreas = []
    for (let i = 0; i < r.length; i++) {
      let relation = r[i]
      let cells = []
      // 填充每个id以及关联的id
      for (let k = 0; k < relation.length; k++) {
        relation[k] = findGroupById(relation[k], cellGroups)
        cells.push(this.graph.getModel().getCell(relation[k].id))
      }
      // 逆序排列，关联多的放在前面
      relation.sort(function (o1, o2) {
        let o1len = o1.group.length
        let o2len = o2.group.length

        return o2len - o1len
      })
      // 找出这些cell的新的位置
      layoutHasConnectionsCells(this.graph, relation, pos)

      toBeCacledAreas.push({
        cells: cells
      })
    };
    // layoutNoConnectionCells(startx, 0, noRelationCells, pos);

    for (let i = 0; i < noRelationCells.length; i++) {
      let cell = noRelationCells[i]
      toBeCacledAreas.push({
        cells: [cell]
      })

      pos[cell.id] = mxUtils.clone(cell.geometry)
    }

    calcCellFinalPost(toBeCacledAreas, pos)

    doLayout(this.graph, array, pos)
    globalPos = pos
    if (this.displaySetting.column === 'no') {
      this.collapseAll()
    } else if (this.displaySetting.column === 'key') {
      this.showKeyColumn()
    } else {
      this.expandAll()
    }
    if (this.displaySetting.type) {
      this.showDataType()
    } else {
      this.hideDataType()
    }
    if (this.displaySetting.name) {
      let name = this.displaySetting.name
      if (name === 'physical') {
        this.showPhysicalName()
      } else if (name === 'logical') {
        this.showLogicalName()
      } else if (name === 'full') {
        this.showFullName()
      }
    }
    this.graph.refresh()
  }
  static colorFormatter (color) {
    if (!color) {
      return ''
    }
    if (color.indexOf('NamedColor') === 0) {
      return color.split(':')[1]
    } else if (color.indexOf('ARGBColor') === 0) {
      const c = color.split(':')
      return `rgba(${c[2]}, ${c[3]}, ${c[4]}, ${parseInt(c[1]) / 255})`
    } else {
      return color
    }
  }
  static styleFontFormatter (styleFont) {
    let res = ''
    const fontList = styleFont.split(',')
    if (fontList.length >= 2) {
      res += ';font-family: ' + fontList[0]
      res += ';font-size: ' + fontList[1].replace('pt', 'pt')
      for (let i = 2; i < fontList.length; i++) {
        const index = fontList[i].indexOf('style=')
        if (index !== -1) {
          fontList[i] = fontList[i].substr(index + 'style='.length)
        }
        if (fontList[i].indexOf('Bold') !== -1) {
          res += ';font-weight: bold'
        } else if (fontList[i].indexOf('Italic') !== -1) {
          res += ';font-style: italic'
        } else if (fontList[i].indexOf('Underline') !== -1) {
          res += ';text-decoration: underline '
          if (fontList[i + 1] && fontList[i + 1].indexOf('Strikeout') !== -1) {
            res += 'line-through'
            break
          }
        } else if (fontList[i].indexOf('Strikeout') !== -1) {
          res += ';text-decoration: line-through '
          if (fontList[i + 1] && fontList[i + 1].indexOf('Underline') !== -1) {
            res += 'underline'
            break
          }
        }
      }
    }
    return res + ';'
  }
  refreshOutline () {
    setTimeout(() => {
      this.outline.refresh()
    })
  }
  focusTable (shape) {
    let shapeId = shape.split(':')[1]
    let name = shape.split(':')[2]
    let columnId = shape.split(':')[3]
    let type = shape.split(':')[0]
    let cell = this.vertex['shape' + shapeId]
    this.graph.setSelectionCell(cell)
    this.graph.scrollCellToVisible(cell, true)
    $('.highlight').removeClass('highlight')
    let selector
    if (type === 'figure') {
      selector = $(`.svg-figure[data-id=${shapeId}]`)
    } else if (type === 'business_column') {
      selector = $(`.svg-table[data-id=${shapeId}] .svg-tName`)
    } else if (type === 'table_column') {
      selector = $(`.svg-table[data-id=${shapeId}] div[data-id=${columnId}]`)
    } if (type === 'view_column') {
      selector = $(`.svg-view[data-id=${shapeId}] div[data-id=${columnId}]`)
    } else if (type === 'table') {
      selector = $(`.svg-table[data-id=${shapeId}] .svg-tName`)
    } else if (type === 'view') {
      selector = $(`.svg-view[data-id=${shapeId}] .svg-tName`)
    }
    $(selector[0]).addClass('highlight')
  }
  getColTree (cols) {
    let childrenMap = {}
    cols.forEach(v => {
      if (v.deleted) {
        return
      }
      let pId = v.OwnerRef || 'root'
      if (childrenMap.hasOwnProperty(pId)) {
        childrenMap[pId].push(v)
      } else {
        childrenMap[pId] = [v]
      }
    })
    cols.forEach(v => {
      if (v.deleted) {
        return
      }
      if (childrenMap.hasOwnProperty(v.Id)) {
        v.childrenCol = childrenMap[v.Id]
      }
    })
    return childrenMap['root']
  }
  renderColTree (tree, t, IsExpanded = false) {
    if (!tree) {
      return ''
    }
    let tableHtml = ``
    tableHtml += `<div class="er-tree-box ${IsExpanded ? 'active' : ''}">`
    tree.forEach(col => {
      tableHtml += `<div class="${col.IsExpanded ? 'expand' : ''} tree svg-col `
      if (col.keyType) {
        tableHtml += ' svg-' + col.keyType
      } else if (col.DataStandardRef) {
        tableHtml += ' ds'
      }
      if (col.subRank) {
        tableHtml += ' sub-rank-' + col.subRank
      }
      let label = this.formatColumnLabel(col)
      tableHtml += '" p-id="' + t.properties.Id + '" '
      tableHtml += ' data-pid="' + t.properties.Id + '" '
      tableHtml += ` data-id="${col.Id}"`
      if (col.LogicalName) {
        tableHtml += ` data-logicalName="${col.LogicalName}"`
      }
      tableHtml += `data-columnName="${col.Name}" data-type="${col.DataType}"`
      tableHtml += `>`
      if (col.childrenCol) {
        tableHtml += `<div class="triangle left hide-children"></div><div class="triangle top show-children"></div>`
      }
      tableHtml += `<span>`
      tableHtml += label
      tableHtml += '</span>'
      tableHtml += '</div>'
      if (col.childrenCol) {
        tableHtml += this.renderColTree(col.childrenCol, t, col.IsExpanded)
      }
    })
    tableHtml += `</div>`
    return tableHtml
  }
  prepareColumnMsg (t, isTreeType = false) {
    let order = t.properties.ColumnOrderArray
    if (order) {
      let orderMap = new Map()
      order.forEach((item, index) => {
        orderMap.set(item, index)
      })
      t.children.sort((a, b) => {
        if (!isNaN(orderMap.get(a.properties.Id)) && !isNaN(orderMap.get(b.properties.Id))) {
          return (orderMap.get(a.properties.Id) - orderMap.get(b.properties.Id))
        } else if (isNaN(orderMap.get(a.properties.Id))) {
          return 1
        } else if (isNaN(orderMap.get(b.properties.Id))) {
          return -1
        } else {
          return 0
        }
      })
    }
    if (!isTreeType) {
      let others = []
      let topAttributeArray = []
      let topAttribute = {}
      let topAttribute2 = {}
      let topAttribute3 = {}
      let topAttribute4 = {}
      let topAttribute5 = {}
      let childAttribute = {}
      let result = []
      t.children && t.children.forEach(item => {
        if (item.properties['TypeId'] === 80000005) {
          if (!item.properties.OwnerRef) {
            topAttributeArray.push(item)
            topAttribute[item.properties.Id] = item
          } else {
            if (topAttribute[item.properties.OwnerRef]) {
              if (!topAttribute[item.properties.OwnerRef].children) {
                topAttribute[item.properties.OwnerRef].children = []
              }
              if (topAttribute[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
                topAttribute[item.properties.OwnerRef].children.push(item.properties.Id)
              }
              topAttribute2[item.properties.Id] = item
            }
          }
        } else {
          others.push(item)
        }
      })
      if (Object.keys(topAttribute2).length > 0) {
        t.children.forEach(item => {
          if (item.properties['TypeId'] === 80000005) {
            if (topAttribute2[item.properties.OwnerRef]) {
              if (!topAttribute2[item.properties.OwnerRef].children) {
                topAttribute2[item.properties.OwnerRef].children = []
              }
              if (topAttribute2[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
                topAttribute2[item.properties.OwnerRef].children.push(item.properties.Id)
              }

              topAttribute3[item.properties.Id] = item
            }
          }
        })
        t.children.forEach(item => {
          if (item.properties['TypeId'] === 80000005) {
            if (topAttribute3[item.properties.OwnerRef]) {
              if (!topAttribute3[item.properties.OwnerRef].children) {
                topAttribute3[item.properties.OwnerRef].children = []
              }
              if (topAttribute3[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
                topAttribute3[item.properties.OwnerRef].children.push(item.properties.Id)
              }
              topAttribute4[item.properties.Id] = item
            }
          }
        })
        t.children.forEach(item => {
          if (item.properties['TypeId'] === 80000005) {
            if (topAttribute4[item.properties.OwnerRef]) {
              if (!topAttribute4[item.properties.OwnerRef].children) {
                topAttribute4[item.properties.OwnerRef].children = []
              }
              if (topAttribute4[item.properties.OwnerRef].children.indexOf(item.properties.Id) === -1) {
                topAttribute4[item.properties.OwnerRef].children.push(item.properties.Id)
              }
              topAttribute5[item.properties.Id] = item
            }
          }
        })
      }
      if (Object.keys(topAttribute2).length > 0) {
        t.children = others
        topAttributeArray.forEach(item => {
          t.children.push(item)
          if (topAttribute[item.properties.Id].children) {
            topAttribute[item.properties.Id].children.forEach(item2 => {
              topAttribute2[item2].properties.subRank = 2
              t.children.push(topAttribute2[item2])
              if (Object.keys(topAttribute3).length > 0) {
                if (topAttribute2[item2].children) {
                  topAttribute2[item2].children.forEach(item3 => {
                    topAttribute3[item3].properties.subRank = 3
                    t.children.push(topAttribute3[item3])
                    if (topAttribute3[item3].children) {
                      topAttribute3[item3].children.forEach(item4 => {
                        topAttribute4[item4].properties.subRank = 4
                        t.children.push(topAttribute4[item4])
                        if (topAttribute4[item4].children) {
                          topAttribute4[item4].children.forEach(item5 => {
                            topAttribute5[item5].properties.subRank = 5
                            t.children.push(topAttribute5[item5])
                          })
                        }
                      })
                    }
                  })
                }
              }
            })
          }
        })
      }
    }
    let properties = {
      pk: [],
      pf: [],
      fk: [],
      uk: [],
      nk: [],
      vk: [],
      column: {},
      columnArray: []
    }
    if (t.children && Array.isArray(t.children)) {
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        if (item.properties.TypeId === 80000005) { // column
          properties.column[item.properties.Id] = item.properties
          properties.columnArray.push(item.properties)
        }
      }
    }

    if (t.children && Array.isArray(t.children)) {
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        if (item.objectClass === 'Datablau.LDM.EntityAttribute' && !item.properties.deleted) {
          properties.column[item.properties.Id].keyType = ''
        }
        // item.children && item.children.forEach(item => {
        //   let id = item.properties['AttributeRef']
        //   if (properties.column[id]) {
        //     properties.column[id].keyType = ''
        //   }
        // })
      }
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        if (item.properties.deleted) {
          continue
        }
        if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'PrimaryKey') {
          if (item.children) {
            item.children.forEach(item => {
              if (item.properties.deleted) {
                return
              }
              let id = item.properties['AttributeRef']
              if (properties.column[id]) {
                properties.column[id].keyType += 'p'
              }
              properties.pk.push(properties.column[id])
            })
          }
        }
        if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'ForeignKey') {
          item.children && item.children.forEach(item => {
            if (item.properties.deleted) {
              return
            }
            let id = item.properties['AttributeRef']
            properties.fk.push(id)
            if (properties.column[id]) {
              properties.column[id].keyType += 'f'
            }
          })
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'UniqueKey') {
          if (item.children) {
            item.children.forEach(item => {
              if (item.properties.deleted) {
                return
              }
              let id = item.properties['AttributeRef']
              properties.uk.push(id)
              if (properties.column[id] && properties.column[id].keyType.indexOf('u') === -1) { // 防止重复n
                // if (!properties.column[id].keyType) {
                properties.column[id].keyType += 'u'
                // }
              }
            })
          }
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'NonUniqueKey') {
          item.children && item.children.forEach(item => {
            if (item.properties.deleted) {
              return
            }
            let id = item.properties['AttributeRef']
            properties.nk.push(id)
            if (properties.column[id] && properties.column[id].keyType.indexOf('n') === -1) { // 防止重复n
              // if (!properties.column[id].keyType) {
              properties.column[id].keyType += 'n'
              // }
            }
          })
        } else if (item.properties.TypeId === 80000093 && item.properties['KeyGroupType'] === 'VirtualKey') {
          item.children && item.children.forEach(item => {
            if (item.properties.deleted) {
              return
            }
            let id = item.properties['AttributeRef']
            properties.vk.push(id)
            if (properties.column[id]) {
              // if (!properties.column[id].keyType) {
              properties.column[id].keyType += 'v'
              // }
            }
          })
        }
      }
      for (let i = 0; i < t.children.length; i++) {
        let item = t.children[i]
        item.children && item.children.forEach(item => {
          let id = item.properties && item.properties['AttributeRef']
          if (properties.column[id]) {
            if (properties.column[id].keyType.indexOf('p') !== -1) {
              if (properties.column[id].keyType.indexOf('f') !== -1) {
                if (properties.column[id].keyType.indexOf('v') !== -1) {
                  properties.column[id].keyType = 'pfvk'
                } else {
                  properties.column[id].keyType = 'pfk'
                }
              } else {
                if (properties.column[id].keyType.indexOf('v') !== -1) {
                  properties.column[id].keyType = 'pvk'
                } else {
                  properties.column[id].keyType = 'pk'
                }
              }
            } else {
              if (properties.column[id].keyType.indexOf('f') !== -1) {
                if (properties.column[id].keyType.indexOf('v') !== -1) {
                  properties.column[id].keyType = 'fvk'
                } else {
                  properties.column[id].keyType = 'fk'
                }
              } else if (properties.column[id].keyType.indexOf('v') !== -1) {
                if (properties.column[id].keyType.indexOf('u') !== -1) {
                  properties.column[id].keyType = 'uvk'
                } else if (properties.column[id].keyType.indexOf('n') !== -1) {
                  properties.column[id].keyType = 'vnk'
                } else {
                  properties.column[id].keyType = 'vk'
                }
              }
            }
            if (properties.column[id].keyType.indexOf('k') === -1) {
              properties.column[id].keyType += 'k'
              if (properties.column[id].keyType === 'k') {
                properties.column[id].keyType = ''
              }
            }
          }
        })
      }
    }
    // for (let i = 0; i < properties.pk.length; i++) {
    //   if (!properties.pk[i]) {
    //     continue
    //   }
    //   let pk = properties.pk[i].Id
    //   for (let j = 0; j < properties.fk.length; j++) {
    //     if (pk === properties.fk[j]) {
    //       properties.column[pk].keyType = 'pf'
    //     }
    //   }
    // }
    return properties
  }
  formatColumnLabel (col) {
    const designModel = this.modelType === 'design'
    let label = ''
    if (this.showLogical && this.showPhysical) {
      if (col['LogicalName']) {
        if (designModel) {
          label += this.displaySetting.type ? `${col['LogicalName']} : ${(col.DataType || '')}` : `${col['LogicalName']}`
        } else {
          label += this.displaySetting.type ? `${col.Name}(${col['LogicalName']}) : ${(col.DataType || '')}` : `${col.Name}(${col['LogicalName']})`
        }
      } else {
        label += this.displaySetting.type ? (col.Name + ' : ' + (col.DataType || '')) : col.Name
      }
    } else if (this.showLogical) {
      if (col['LogicalName']) {
        label += this.displaySetting.type ? `${col['LogicalName']} : ${(col.DataType || '')}` : `${col['LogicalName']}`
      } else {
        label += this.displaySetting.type ? (col.Name + ' : ' + (col.DataType || '')) : col.Name
      }
    } else if (this.showPhysical) {
      label += this.displaySetting.type ? (col.Name + ' : ' + (col.DataType || '')) : col.Name
    } else {
      if (col['LogicalName']) {
        if (designModel) {
          label += this.displaySetting.type ? `${col['LogicalName']} : ${(col.DataType || '')}` : `${col['LogicalName']}`
        } else {
          label += this.displaySetting.type ? `${col.Name}(${col['LogicalName']}) : ${(col.DataType || '')}` : `${col.Name}(${col['LogicalName']})`
        }
      } else {
        label += this.displaySetting.type ? (col.Name + ' : ' + (col.DataType || '')) : col.Name
      }
    }
    return label
  }

  formatTableLabel (t) {
    const designModel = this.modelType === 'design'
    let label = ''
    if (this.showLogical && this.showPhysical) {
      if (t.properties['LogicalName']) {
        if (designModel) {
          label += `${t.properties['LogicalName']}`
        } else {
          label += `${t.properties.Name}(${t.properties['LogicalName']})`
        }
      } else {
        label += `${t.properties.Name}`
      }
    } else if (this.showLogical) {
      if (t.properties['LogicalName']) {
        label += `${t.properties['LogicalName']}`
      } else {
        label += `${t.properties.Name}`
      }
    } else if (this.showPhysical) {
      label += `${t.properties.Name}`
    } else {
      if (t.properties['LogicalName']) {
        if (designModel) {
          label += `${t.properties['LogicalName']}`
        } else {
          label += `${t.properties.Name}(${t.properties['LogicalName']})`
        }
      } else {
        label += `${t.properties.Name}`
      }
    }
    return label
  }

  formatIdToStyle (arr) {
    const res = {}
    arr && arr.forEach(style => {
      const data = style.properties
      if (data.TypeId === 80000005) { // Attribute
        res[data['Id']] = data
      }
    })
    return res
  }

  parseStyle (style, privateStyle) {
    let privateStyleProperties = privateStyle && privateStyle.properties
    let res = ''
    if (privateStyleProperties) {
      privateStyleProperties['StyleTextColor'] && (res += 'color: ' + DrawGraph.colorFormatter(privateStyleProperties['StyleTextColor']) + ';')
      privateStyleProperties['StyleBackColor'] && (res += 'background-color: ' + DrawGraph.colorFormatter(privateStyleProperties['StyleBackColor']) + ';')
      privateStyleProperties['StyleFont'] && (res += DrawGraph.styleFontFormatter(privateStyleProperties['StyleFont']) + ';')
    } else {
      style['AttributeTextColor'] && (res += 'color:' + DrawGraph.colorFormatter(style['AttributeTextColor']) + ';')
      style['AttributeTextFont'] && (res += DrawGraph.styleFontFormatter(style['AttributeTextFont']) + ';')
    }
    return res
  }

  hideColByDisplayColumn (col) {
    let res = ''
    if (this.displaySetting.column === 'key') {
      if (col.keyType) {
        // res = res.replace(/display:[\s]?none/, '')
      } else {
        res += ';display:none;'
      }
    } else if (this.displaySetting.column === 'all') {
      // res = res.replace(/display:[\s]?none/, '')
    } else {
      res += ';display:none;'
    }
    return res
  }

  addThemeStyleToFigure (d, themeStyle) {
    for (let key in d.properties) {
      if (d.properties.hasOwnProperty(key)) {
        if (key.indexOf('Figure') !== -1) {
          delete d.properties[key]
        }
      }
    }
    let style = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Figure') !== -1) {
          style[key] = themeStyle[key]
        }
      }
    }
    Object.assign(d.properties, style)
  }

  addThemeStyleToComment (d, themeStyle) {
    for (let key in d.properties) {
      if (d.properties.hasOwnProperty(key)) {
        if (key.indexOf('Comment') !== -1) {
          delete d.properties[key]
        }
      }
    }
    let commentThemeStyle = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Comment') !== -1) {
          commentThemeStyle[key] = themeStyle[key]
        }
      }
    }
    Object.assign(d.properties, commentThemeStyle)
  }

  addThemeStyleToTable (d, t, themeStyle) {
    let entityThemeStyle = {}
    let attributeThemeStyle = {}
    for (let key in themeStyle) {
      if (themeStyle.hasOwnProperty(key)) {
        if (key.indexOf('Entity') !== -1 || key.indexOf('BO') !== -1) {
          entityThemeStyle[key] = themeStyle[key]
        } else if (key.indexOf('Attribute') !== -1) {
          attributeThemeStyle[key] = themeStyle[key]
        }
      }
    }
    for (let key in d.properties) {
      if (d.properties.hasOwnProperty(key)) {
        if (key.indexOf('Entity') !== -1 || key.indexOf('BO') !== -1) {
          delete d.properties[key]
        }
      }
    }
    Object.assign(d.properties, entityThemeStyle)
    t.children && t.children.forEach(item => {
      Object.assign(item.properties, attributeThemeStyle)
    })
  }

  addThemeStyleToEdge (themeStyle) {
    let res = ''

    if (themeStyle.RelationshipLineWidth) {
      res += 'strokeWidth=' + themeStyle.RelationshipLineWidth + ';'
    }
    if (themeStyle.RelationshipLineColor) {
      res += 'strokeColor=' + DrawGraph.colorFormatter(themeStyle.RelationshipLineColor) + ';'
    }

    if (themeStyle.RelationshipTextColor) {
      res += 'fontColor=' + DrawGraph.colorFormatter(themeStyle.RelationshipTextColor) + ';'
    }
    if (themeStyle.RelationshipTextFont) {
      const fontList = themeStyle.RelationshipTextFont.split(',')
      if (fontList.length >= 2) {
        res += 'fontFamily=' + fontList[0] + ';'
        res += 'fontSize=' + fontList[1].substr(0, fontList[1].length - 2) + ';'
        let fontStyleNumber = 0
        if (themeStyle.RelationshipTextFont.indexOf('Bold') !== -1) {
          fontStyleNumber += 1
        }
        if (themeStyle.RelationshipTextFont.indexOf('Italic') !== -1) {
          fontStyleNumber += 2
        }
        if (themeStyle.RelationshipTextFont.indexOf('Underline') !== -1) {
          fontStyleNumber += 4
        }
        if (themeStyle.RelationshipTextFont.indexOf('Strikeout') !== -1) {
          fontStyleNumber += 8
        }
        res += `fontStyle=${fontStyleNumber};`
      }
    }
    return res + ';'
  }

  calculateHeight (table, keyOnly) {
    let t = table
    // let keyOnly = this.displaySetting.column === 'key'
    let totalHeight = 30
    let columnCnt = 0
    const keyRefAttributeSet = new Set()
    let hasPk = false
    t.children && t.children.forEach(item => {
      if (item.properties.TypeId === 80000005) {
        columnCnt++
      } else if (item.properties.TypeId === 80000093) {
        if (item.properties.KeyGroupType === 'PrimaryKey') {
          hasPk = true
        }
        Array.isArray(item.children) && item.children.forEach(item => {
          keyRefAttributeSet.add(item.properties['AttributeRef'])
        })
      }
    })
    if (keyOnly) {
      columnCnt = keyRefAttributeSet.size
    }
    if (hasPk) {
      totalHeight += 16 + 16 + 18 * columnCnt
    } else {
      totalHeight += 34 + 16 + 18 * columnCnt
    }
    return totalHeight
  }

  drawTableShape (d, t, themeStyle, returnHtml, figureArr) {
    const currentDatabaseTypeUniqueId = this.dataByType.model.TypeUniqueId && this.dataByType.model.TypeUniqueId.toUpperCase()
    // 嵌套展示的数据库
    const treeTypeDatabaseMap = {
      '8EA840A5-37F4-48F8-82D9-1429E42A0FC6': true,
      '4AB7D425-7B4A-49C2-A19B-86DD5F911706': true
    }
    const isTreeType = treeTypeDatabaseMap[currentDatabaseTypeUniqueId]
    const dataColumnOrdered = {
      children: []
    }
    // no-sql不排序 且目前nosql排序添加子字段会丢失
    if (!isTreeType && t.properties.ColumnOrderArrayRefs && t.properties.ColumnOrderArrayRefs.length && JSON.stringify(t.properties.ColumnOrderArrayRefs) !== JSON.stringify(t.children && t.children.filter(i => !i.properties.deleted && i.properties.TypeId === 80000005).map(i => i.properties.Id))) {
      const columnMap = new Map()
      if (t.children) {
        t.children.forEach(item => {
          if (item.properties.TypeId === 80000005) {
            columnMap.set(item.properties.Id, item)
          } else {
            dataColumnOrdered.children.push(item)
          }
        })
        t.properties.ColumnOrderArrayRefs.forEach(item => {
          if (columnMap.get(item)) {
            dataColumnOrdered.children.push(columnMap.get(item))
          }
        })
        t.children = dataColumnOrdered.children
      }
    }
    if (!t.properties.ColumnOrderArrayRefs || !t.properties.ColumnOrderArrayRefs.length) {
      setTimeout(() => {
        t.properties.ColumnOrderArrayRefs = t.children ? t.children.filter(item => item.properties.TypeId === 80000005).map(item => item.properties.Id) : []
      })
    }
    const designModel = this.modelType === 'design'
    const isMongoDB = this.modelType === 'mongoOrCassandra'
    const columnOrderArray = t.properties['ColumnOrderArray']
    t.posit = d.properties
    if (themeStyle) {
      this.addThemeStyleToTable(d, t, themeStyle)
    }
    t.style = this.formatIdToStyle(t.children)
    if (d.properties['ShapeSize'].width === 'auto') {
      d.properties['ShapeSize'].width = 120
    }
    const outerWidth = d.properties['ShapeSize'].width
    const innerWidth = outerWidth
    const calculateHeight = (keyOnly) => {
      if (keyOnly === undefined) {
        keyOnly = this.displaySetting.column === 'key'
      }
      let totalHeight = 30
      let columnCnt = 0
      const keyRefAttributeSet = new Set()
      let hasPk = false
      t.children && t.children.forEach(item => {
        if (item.properties.TypeId === 80000005) {
          columnCnt++
        } else if (item.properties.TypeId === 80000093) {
          if (item.properties.KeyGroupType === 'PrimaryKey') {
            hasPk = true
          }
          Array.isArray(item.children) && item.children.forEach(item => {
            keyRefAttributeSet.add(item.properties['AttributeRef'])
          })
        }
      })
      if (keyOnly) {
        columnCnt = keyRefAttributeSet.size
      }
      if (hasPk) {
        totalHeight += 16 + 16 + 18 * columnCnt
      } else {
        totalHeight += 34 + 16 + 18 * columnCnt
      }
      return totalHeight
    }
    if (d.properties['ShapeSize'].height === 'auto') {
      d.properties['ShapeSize'].height = calculateHeight()
    }
    let outerHeight = d.properties['ShapeSize'].height
    let isCollapsed = d.properties['IsCollapsed'] || this.displaySetting.column === 'no'

    let tableHtml = t.properties.TypeId === 80100073 ? `<div class="svg-table svg-business` : `<div ondragover="dragoverHandler(event)" ondrop="handleDrop(event)" class="svg-table`
    if (isCollapsed && t.properties.TypeId !== 80100073) { // 业务对象不需要仅展示表头
      tableHtml += ` collapsed`
    }
    tableHtml += `" data-height="${outerHeight}" calc-height="${calculateHeight(false)}" calc-key-height="${calculateHeight(true)}" data-oween-id="${t.properties.Id}" data-id="${d.properties.Id}" style="height:${outerHeight}px;width:${outerWidth}px;overflow:hidden;display:flex;flex-direction:column;`
    if (t.properties.TypeId === 80100073) {
      tableHtml += 'display: table;'
      if (d.properties['BOBackgroundColor']) {
        tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['BOBackgroundColor'])};`
      }
      if (d.properties['BOBorderColor'] && d.properties['BOBorderWidth']) {
        tableHtml += `border:${d.properties['BOBorderWidth']}px ${d.properties['IsBOBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['BOBorderColor'])};`
      }
      if (d.properties['BORoundingSize']) {
        tableHtml += `border-radius: ${d.properties['BORoundingSize']}px;`
      }
      if (d.properties['StyleBackColor']) {
        tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
      }
    } else {
      if (d.properties['EntityRoundingSize']) {
        if (!d.properties['EntityRoundingSize'] && t.properties.relied) {
          tableHtml += `border-radius: 4px;`
        } else {
          tableHtml += `border-radius: ${d.properties['EntityRoundingSize']}px;`
        }
      } else {
        if (t.properties.relied) {
          tableHtml += `border-radius: 4px;`
        }
      }
      if (d.properties['EntityBodyBackgroundColor']) {
        tableHtml += ` background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
      }
      if (d.properties['StyleBackColor']) {
        tableHtml += ` background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
      }
      if (t.properties.TypeId !== 80100073) {
        if (d.properties['EntityShadowColor'] && d.properties['EntityShadowSize']) {
          let c = d.properties['EntityShadowColor'].split(':')
          tableHtml += `box-shadow: ${d.properties['EntityShadowSize'].width}px ${d.properties['EntityShadowSize'].height}px 0 ${DrawGraph.colorFormatter(d.properties['EntityShadowColor'])};`
        } else {
          tableHtml += `box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.245);`
        }
      }
      if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
        tableHtml += `border: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
      }
    }
    tableHtml += `">`
    if (t.properties.TypeId === 80100073) { // 业务实体
      let label = this.formatTableLabel(t)
      tableHtml += `<div class="svg-tName pd-15" data-id="${t.properties.Id}" data-name="${t.properties.Name}"`
      if (t.properties['LogicalName']) {
        tableHtml += ` data-logicalName="${t.properties['LogicalName']}"`
      }
      tableHtml += ` style="background: unset;border-bottom: unset;height:100%;display: table-cell;padding: 10px;`
      if (d.properties['BOTextAlignment']) {
        let position = d.properties['BOTextAlignment']
        if (position.indexOf('Center') !== -1) {
          tableHtml += `text-align: center;`
        } else if (position.indexOf('Left') !== -1) {
          tableHtml += `text-align: left;`
        } else if (position.indexOf('Right') !== -1) {
          tableHtml += `text-align: right;`
        }
      }
      if (d.properties['BOTextFont']) {
        tableHtml += `${DrawGraph.styleFontFormatter(d.properties['BOTextFont'])}`
      }
      if (d.properties['BOTextColor']) {
        tableHtml += `color:${DrawGraph.colorFormatter(d.properties['BOTextColor'])};`
      }
      if (d.properties['BOTextAlignment']) {
        let position = d.properties['BOTextAlignment']
        tableHtml += `line-height:1.1;`
        if (position.indexOf('Top') !== -1) {
          tableHtml += `vertical-align: top;`
        } else if (position.indexOf('Middle') !== -1) {
          tableHtml += `vertical-align: middle;`
        } else if (position.indexOf('Bottom') !== -1) {
          tableHtml += `vertical-align: bottom;`
        }
      }
      tableHtml += `"><span>${label}</span></div>`
    } else {
      { // Title of table
        let label = this.formatTableLabel(t)
        tableHtml += `<div class="svg-tName" data-id="${t.properties.Id}" title="${label}" data-name="${t.properties.Name}"`
        if (t.properties['LogicalName']) {
          tableHtml += ` data-logicalName="${t.properties['LogicalName']}"`
        }
        if (d.properties['EntityHeaderSelectedColor']) {
          tableHtml += ` header-selected-color="${DrawGraph.colorFormatter(d.properties['EntityHeaderSelectedColor'])}"`
        }
        let headerUnselectedColor = ''
        if (d.properties['EntityHeaderBackgroundColor']) {
          headerUnselectedColor = DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])
        }
        if (d.properties['StyleBackColor2']) {
          headerUnselectedColor = DrawGraph.colorFormatter(d.properties['StyleBackColor2'])
        }
        if (headerUnselectedColor !== '') {
          tableHtml += ` header-unselected-color="${headerUnselectedColor}"`
        }
        tableHtml += `style="flex: 0 0 auto;`
        if (d.properties['EntityHeaderTextAlignment']) {
          let position = d.properties['EntityHeaderTextAlignment']
          if (position.indexOf('Center') !== -1) {
            tableHtml += `text-align: center;`
          } else if (position.indexOf('Left') !== -1) {
            tableHtml += `text-align: left;`
          } else if (position.indexOf('Right') !== -1) {
            tableHtml += `text-align: right;`
          }
        }
        if (d.properties['EntityHeaderBackgroundColor']) { // table header 样式
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])};`
        }
        if (d.properties['EntityHeaderTextColor']) {
          tableHtml += `color:${DrawGraph.colorFormatter(d.properties['EntityHeaderTextColor'])};`
        }
        if (d.properties['StyleBackColor2']) {
          tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor2'])};`
        }
        if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
          tableHtml += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
        }
        tableHtml += `"`
        tableHtml += `><span class="pd-15" style="`
        if (d.properties['EntityHeaderTextFont']) {
          tableHtml += `${DrawGraph.styleFontFormatter(d.properties['EntityHeaderTextFont'])}`
        }
        if (d.properties['EntityHeaderTextAlignment']) {
          let position = d.properties['EntityHeaderTextAlignment']
          tableHtml += `line-height:1.1;`
          if (position.indexOf('Top') !== -1) {
            tableHtml += `vertical-align: top;`
          } else if (position.indexOf('Middle') !== -1) {
            tableHtml += `vertical-align: middle;`
          } else if (position.indexOf('Bottom') !== -1) {
            tableHtml += `vertical-align: bottom;`
          }
          // if (position.indexOf('Center') !== -1) {
          //   tableHtml += `text-align: center;`
          // } else if (position.indexOf('Left') !== -1) {
          //   tableHtml += `text-align: left;`
          // } else if (position.indexOf('Right') !== -1) {
          //   tableHtml += `text-align: right;`
          // }
        }
        tableHtml += `">`

        tableHtml += label
        tableHtml += `</span><div class="collapse-btn"></div></div>`
      }
      if (isCollapsed) {
        outerHeight = 30
      }
      if (window) { // Body of table
        // tableHtml += `<div class="table-body" style="height:${outerHeight - 32}px;flex: 1 1 auto;`
        tableHtml += `<div class="table-body" style="height:auto;flex: 0 0 auto;display: flex;flex-direction: column;`
        // if (d.properties['EntityBodyBackgroundColor']) { 注掉的原因是 svg-table的元素上已有此样式
        //   tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
        // }
        // if (d.properties['StyleBackColor']) {
        //   tableHtml += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
        // }
        tableHtml += `">`
        let properties = this.prepareColumnMsg(t, isTreeType)
        let lastNode = null
        // window.handleDrapEnter = function (e) {
        //   e.target.parentNode.classList.add('active')
        // }
        // window.handleDrapLeave = function (e) {

        //   e.target.parentNode.classList.remove('active')
        // }
        // test drap & drop end
        if (!isTreeType) {
          tableHtml += `<div data-oween-id="${t.properties.Id}" ondragover="dragoverHandler(event)" ondrop="handleDrop(event, true)" style="flex: 0 0 auto;padding:7px 0 8px;min-height:33px;border-bottom: 1px solid #000;`
          if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
            tableHtml += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
          }
          tableHtml += `">`
          properties.columnArray.forEach(col => {
            if (col.deleted) {
              return
            }
            if (col.keyType && (col.keyType.indexOf('p') !== -1)) {
              tableHtml += '<div class="svg-col  '
              if (col.keyType) {
                tableHtml += ' svg-' + col.keyType
              }
              let label = this.formatColumnLabel(col)
              if (col.showParent) {
                tableHtml += ' show parent'
              } else if (col.showChild) {
                tableHtml += ' show child'
              }
              tableHtml += '" p-id="' + t.properties.Id + '"'
              tableHtml += ' data-pid="' + t.properties.Id + '" '
              const style = t.style[col.Id]
              const privateStyle = d.children && d.children.find(v => v.properties.AttributeRef === col.Id)
              if (style) {
                tableHtml += `data-id="${col.Id}" data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}" style="${this.parseStyle(style, privateStyle)};${this.hideColByDisplayColumn(col)}"`
              } else {
                tableHtml += `data-id="${col.Id}" data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}" style="${this.hideColByDisplayColumn(col)}"`
              }

              if (col.LogicalName) {
                tableHtml += ` data-logicalName="${col.LogicalName}"`
              }
              tableHtml += `><span >`

              tableHtml += label
              tableHtml += /* ' : ' + col.DataType + */ '</span></div>'
              delete properties.column[col.Id]
            }
          })
          tableHtml += `</div><div style="flex: 0 0 auto;padding-top:7px;">`
          properties.columnArray.forEach(col => {
            if (col.deleted) {
              return
            }
            if (properties.column[col.Id]) {
              tableHtml += '<div class="svg-col  '
              if (col.keyType) {
                tableHtml += ' svg-' + col.keyType
              } else if (col.DataStandardRef) {
                tableHtml += ' ds'
              }
              if (col.showParent) {
                tableHtml += ' show parent'
              } else if (col.showChild) {
                tableHtml += ' show child'
              }
              let label = this.formatColumnLabel(col)
              tableHtml += '" p-id="' + t.properties.Id + '" '
              tableHtml += ' data-pid="' + t.properties.Id + '" '
              const style = t.style[col.Id]
              const privateStyle = d.children && d.children.find(v => v.properties.AttributeRef === col.Id)
              if (style || privateStyle) {
                tableHtml += `data-id="${col.Id}" style="width:100%;height:18px;${this.parseStyle(style, privateStyle)};${this.hideColByDisplayColumn(col)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
              } else {
                tableHtml += `data-id="${col.Id}" style="width:100%;height:18px;${this.hideColByDisplayColumn(col)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
              }
              if (col.LogicalName) {
                tableHtml += ` data-logicalName="${col.LogicalName}"`
              }
              tableHtml += `><span >`
              tableHtml += label
              tableHtml += '</span></div>'
            }
          })
          tableHtml += `</div>`
        } else if (isTreeType) {
          let colTree = this.getColTree(_.cloneDeep(properties.columnArray))
          tableHtml += `<div class="tree-container" style="padding:7px 0 8px;margin-bottom:7px;">`
          tableHtml += this.renderColTree(colTree, t)
          tableHtml += `</div>`
        }
        // else {
        //   tableHtml += `<div style="padding:7px 0 8px;margin-bottom:7px;">`
        //   properties.columnArray.forEach(col => {
        //     tableHtml += '<div class="svg-col field'
        //     if (col.keyType) {
        //       tableHtml += ' svg-' + col.keyType
        //     } else if (col.DataStandardRef) {
        //       tableHtml += ' ds'
        //     }
        //     if (col.subRank) {
        //       tableHtml += ' sub-rank-' + col.subRank
        //     }
        //     let label = this.formatColumnLabel(col)
        //     tableHtml += '"p-id="' + t.properties.Id + '"'
        //     const style = t.style[col.Id]
        //     const privateStyle = d.children && d.children.find(v => v.properties.AttributeRef === col.Id)
        //     if (style) {
        //       tableHtml += `data-id="${col.Id}" style="height:18px;width:100%;${this.parseStyle(style, privateStyle)}"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
        //     } else {
        //       tableHtml += `data-id="${col.Id}" style="height:18px;width:100%;"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
        //     }
        //     if (col.LogicalName) {
        //       tableHtml += ` data-logicalName="${col.LogicalName}"`
        //     }
        //     tableHtml += `><span>`
        //     tableHtml += label
        //     tableHtml += '</span></div>'
        //   })
        //   tableHtml += `</div>`
        // }
      }
    }
    tableHtml += `</div>`// End of table.
    let roundSize = t.properties.TypeId === 80100073 ? d.properties['BORoundingSize'] : d.properties['EntityRoundingSize']
    if (!roundSize && t.properties.relied) { // 依赖实体强制圆角
      roundSize = 4
    }
    if (!returnHtml) {
      let parent = this.graph.getDefaultParent()
      this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(
        parent,
        d.properties.Id,
        tableHtml,
        t.posit.Location.x,
        t.posit.Location.y,
        outerWidth,
        this.displaySetting.column === 'no' ? 30 : outerHeight,
        STYLE.TABLE + (roundSize ? `rounded=1;perimeter=rectanglePerimeter;arcSize=${roundSize}` : 'rounded=0')
      )
      if (this.new) {
        this.vertex['shape' + d.properties.Id].new = true
      }
      this.vertex['shape' + d.properties.Id].Id = d.properties.Id
      this.vertex['shape' + d.properties.Id].OwneeRef = d.properties.OwneeRef
      this.vertex['shape' + d.properties.Id].isTable = true
      if (d.properties['StyleBackColor']) {
        this.vertex['shape' + d.properties.Id].StyleBackColor = d.properties['StyleBackColor']
      }
      if (d.properties['StyleBackColor2']) {
        this.vertex['shape' + d.properties.Id].StyleBackColor2 = d.properties['StyleBackColor2']
      }
      if (d.properties['StyleThemeRef']) {
        this.vertex['shape' + d.properties.Id].StyleThemeRef = d.properties['StyleThemeRef']
      }
      this.vertex['shape' + d.properties.Id].viceValue = this.vertex['shape' + d.properties.Id].value
      this.vertex['shape' + d.properties.Id].viceHeight = calculateHeight()
      if (t.properties.TypeId === 80100073) {
        this.vertex['shape' + d.properties.Id].isBusiness = true
        let shape = this.vertex['shape' + d.properties.Id]
        shape.OrderNumber = d.properties.OrderNumber || 0
        figureArr.push(shape)
      }
      // this.redundantMargin.update(t.posit)
      this.shapes[d.properties.OwneeRef] = this.vertex['shape' + d.properties.Id]
    } else {
      return tableHtml
    }
  }

  drawViewShape (d, t, themeStyle, returnHtml) {
    const dataColumnOrdered = {
      children: []
    }
    if (t.properties.ColumnOrderArrayRefs && t.properties.ColumnOrderArrayRefs.length && JSON.stringify(t.properties.ColumnOrderArrayRefs) !== JSON.stringify(t.children && t.children.filter(i => !i.properties.deleted && i.properties.TypeId === 80000005).map(i => i.properties.Id))) {
      const columnMap = new Map()
      if (t.children) {
        t.children.forEach(item => {
          if (item.properties.TypeId === 80000005) {
            columnMap.set(item.properties.Id, item)
          } else {
            dataColumnOrdered.children.push(item)
          }
        })
        t.properties.ColumnOrderArrayRefs.forEach(item => {
          if (columnMap.get(item)) {
            dataColumnOrdered.children.push(columnMap.get(item))
          }
        })
        t.children = dataColumnOrdered.children
      }
    }
    if (!t.properties.ColumnOrderArrayRefs || !t.properties.ColumnOrderArrayRefs.length) {
      setTimeout(() => {
        t.properties.ColumnOrderArrayRefs = t.children ? t.children.filter(item => item.properties.TypeId === 80000005).map(item => item.properties.Id) : []
      })
    }
    this.addThemeStyleToTable(d, t, themeStyle)
    t.style = this.formatIdToStyle(t.children)
    t.posit = d.properties
    if (d.properties['ShapeSize'].width === 'auto') {
      d.properties['ShapeSize'].width = 120
    }
    const calculateHeight = (keyOnly) => {
      if (keyOnly === undefined) {
        keyOnly = this.displaySetting.column === 'key'
      }
      let totalHeight = 30
      let columnCnt = 0
      const keyRefAttributeSet = new Set()
      let hasPk = false
      t.children && t.children.forEach(item => {
        if (item.properties.TypeId === 80000005) {
          columnCnt++
        } else if (item.properties.TypeId === 80000093) {
          if (item.properties.KeyGroupType === 'PrimaryKey') {
            hasPk = true
          }
          Array.isArray(item.children) && item.children.forEach(item => {
            keyRefAttributeSet.add(item.properties['AttributeRef'])
          })
        }
      })
      if (keyOnly) {
        columnCnt = keyRefAttributeSet.size
      }
      if (hasPk) {
        totalHeight += 16 + 16 + 18 * columnCnt
      } else {
        totalHeight += 16 + 18 * columnCnt
      }
      return totalHeight
    }
    if (d.properties['ShapeSize'].height === 'auto') {
      d.properties['ShapeSize'].height = calculateHeight()
    }
    const outerWidth = t.posit['ShapeSize'].width
    const outerHeight = t.posit['ShapeSize'].height
    const innerWidth = outerWidth - 2
    const designModel = this.modelType === 'design'
    let label = this.formatTableLabel(t)
    let isCollapsed = d.properties['IsCollapsed'] || this.displaySetting.column === 'no'

    let html = `<div ondragover="dragoverHandler(event)" ondrop="handleDrop(event)" class="svg-view`
    if (isCollapsed) {
      html += ` collapsed`
    }
    html += '"'
    html += ` calc-height="${calculateHeight(false)}" calc-key-height="${calculateHeight(true)}" data-id="${d.properties.Id}" title="${label}" data-oween-id="${t.properties.Id}" view-id="${t.properties.Id}" data-name="${t.properties.Name}"`
    html += ` style="height:${outerHeight}px;width:${outerWidth}px;border: 1px dashed #000;`
    if (d.properties['EntityRoundingSize']) {
      html += `border-radius: ${d.properties['EntityRoundingSize']}px;`
    }
    if (d.properties['EntityBodyBackgroundColor']) {
      html += ` background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
    }
    if (d.properties['StyleBackColor']) {
      html += ` background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
    }
    if (d.properties['EntityShadowColor'] && d.properties['EntityShadowSize']) {
      let c = d.properties['EntityShadowColor'].split(':')
      html += `box-shadow: ${d.properties['EntityShadowSize'].width}px ${d.properties['EntityShadowSize'].height}px 0 ${DrawGraph.colorFormatter(d.properties['EntityShadowColor'])};`
    } else {
      html += `box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.245);`
    }
    if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
      html += `border: ${d.properties['EntityBorderWidth']}px dashed ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
    }

    if (t.properties['LogicalName']) {
      html += ` data-logicalName="${t.properties['LogicalName']}">`
    } else {
      html += `">`
    }
    { // Title of view
      let label = this.formatTableLabel(t)
      html += `<div class="svg-tName" data-id="${t.properties.Id}" title="${label}" data-name="${t.properties.Name}"`
      if (t.properties['LogicalName']) {
        html += ` data-logicalName="${t.properties['LogicalName']}"`
      }
      if (d.properties['EntityHeaderSelectedColor']) {
        html += ` header-selected-color="${DrawGraph.colorFormatter(d.properties['EntityHeaderSelectedColor'])}"`
      }
      let headerUnselectedColor = ''
      if (d.properties['EntityHeaderBackgroundColor']) {
        headerUnselectedColor = DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])
      }
      if (d.properties['StyleBackColor2']) {
        headerUnselectedColor = DrawGraph.colorFormatter(d.properties['StyleBackColor2'])
      }
      if (headerUnselectedColor !== '') {
        html += ` header-unselected-color="${headerUnselectedColor}"`
      }

      html += `style="background-color: #f7f7f7;border-bottom: 1px dashed #000;`
      if (d.properties['EntityHeaderTextAlignment']) {
        let position = d.properties['EntityHeaderTextAlignment']
        if (position.indexOf('Center') !== -1) {
          html += `text-align: center;`
        } else if (position.indexOf('Left') !== -1) {
          html += `text-align: left;`
        } else if (position.indexOf('Right') !== -1) {
          html += `text-align: right;`
        }
      }
      if (d.properties['EntityHeaderBackgroundColor']) { // table header 样式
        html += `background-color:${DrawGraph.colorFormatter(d.properties['EntityHeaderBackgroundColor'])};`
      }
      if (d.properties['EntityHeaderTextColor']) {
        html += `color:${DrawGraph.colorFormatter(d.properties['EntityHeaderTextColor'])};`
      }
      if (d.properties['StyleBackColor2']) {
        html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor2'])};`
      }
      if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
        html += `border-bottom: ${d.properties['EntityBorderWidth']}px dashed ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
      }
      html += `"`
      html += `><span class="pd-15" style="`
      if (d.properties['EntityHeaderTextFont']) {
        html += `${DrawGraph.styleFontFormatter(d.properties['EntityHeaderTextFont'])}`
      }
      if (d.properties['EntityHeaderTextAlignment']) {
        let position = d.properties['EntityHeaderTextAlignment']
        html += `line-height:1.1;`
        if (position.indexOf('Top') !== -1) {
          html += `vertical-align: top;`
        } else if (position.indexOf('Middle') !== -1) {
          html += `vertical-align: middle;`
        } else if (position.indexOf('Bottom') !== -1) {
          html += `vertical-align: bottom;`
        }
        // if (position.indexOf('Center') !== -1) {
        //   html += `text-align: center;`
        // } else if (position.indexOf('Left') !== -1) {
        //   html += `text-align: left;`
        // } else if (position.indexOf('Right') !== -1) {
        //   html += `text-align: right;`
        // }
      }
      html += `">`

      html += label
      html += `</span><div class="collapse-btn"></div></div>`
    }
    html += `<div class="table-body" style="height:auto;`
    // if (d.properties['EntityBodyBackgroundColor']) {
    //   html += `background-color:${DrawGraph.colorFormatter(d.properties['EntityBodyBackgroundColor'])};`
    // }
    // if (d.properties['StyleBackColor']) {
    //   html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
    // }
    html += `">`
    let properties = this.prepareColumnMsg(t)
    const isMongoDB = this.modelType === 'mongoOrCassandra'
    if (!isMongoDB) {
      html += `<div style="padding:7px 0 8px;min-height:33px;margin-bottom:7px;`
      // if (d.properties['EntityBorderColor'] && d.properties['EntityBorderWidth']) {
      //   html += `border-bottom: ${d.properties['EntityBorderWidth']}px ${d.properties['IsEntityBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['EntityBorderColor'])};`
      // }
      html += `">`
      properties.columnArray.forEach(col => {
        if (col.deleted) {
          return
        }
        if (properties.column[col.Id]) {
          html += '<div class="svg-col  '
          if (col.keyType) {
            html += ' svg-' + col.keyType
          } else if (col.DataStandardRef) {
            html += ' ds'
          }
          if (col.showParent) {
            html += ' show parent'
          } else if (col.showChild) {
            html += ' show child'
          }
          let label = this.formatColumnLabel(col)
          html += '" p-id="' + t.properties.Id + '" '
          html += ' data-pid="' + t.properties.Id + '" '
          const style = t.style[col.Id]
          const privateStyle = d.children && d.children.find(v => v.properties.AttributeRef === col.Id)
          if (style) {
            html += ` data-id="${col.Id}" style="height:18px;width:100%;${this.parseStyle(style, privateStyle)};${this.hideColByDisplayColumn(col)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
          } else {
            html += ` data-id="${col.Id}" style="height:18px;width:100%;${this.hideColByDisplayColumn(col)}" data-columnName="${col.Name}"  data-type="${col.DataType}" title="${label}"`
          }
          html += ` data-name="${col.Name}"`
          if (col.LogicalName) {
            html += ` data-logicalName="${col.LogicalName}"`
          }
          html += `><span >`
          html += label
          html += '</span></div>'
        }
      })
    } else {
      html += `<div style="padding:7px 0 8px;margin-bottom:7px;">`
      properties.columnArray.forEach(col => {
        if (col.deleted) {
          return
        }
        html += '<div class="svg-col field'
        if (col.keyType) {
          html += ' svg-' + col.keyType
        } else if (col.DataStandardRef) {
          html += ' ds'
        }
        if (col.subRank) {
          html += ' sub-rank-' + col.subRank
        }
        let label = this.formatColumnLabel(col)
        html += '" p-id="' + t.properties.Id + '" '
        html += ' data-pid="' + t.properties.Id + '" '
        const style = t.style[col.Id]
        const privateStyle = d.children && d.children.find(v => v.properties.AttributeRef === col.Id)
        if (style) {
          html += `data-id="${col.Id}" style="width:100%;height:18px;${this.parseStyle(style, privateStyle)};${this.hideColByDisplayColumn(col)}"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
        } else {
          html += `data-id="${col.Id}" style="width:100%;height:18px;${this.hideColByDisplayColumn(col)}"  data-columnName="${col.Name}" data-type="${col.DataType}" title="${label}"`
        }
        if (col.LogicalName) {
          html += ` data-logicalName="${col.LogicalName}"`
        }
        html += `><span>`
        html += label
        html += '</span></div>'
      })
      html += `</div>`
    }
    html += `</div>`
    if (!returnHtml) {
      let parent = this.graph.getDefaultParent()
      this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(parent,
        t.properties.Id,
        html,
        t.posit.Location.x,
        t.posit.Location.y,
        outerWidth,
        this.displaySetting.column === 'no' ? 30 : outerHeight,
        STYLE.TABLE + (d.properties['EntityRoundingSize'] ? `rounded=1;perimeter=rectanglePerimeter;arcSize=${d.properties['EntityRoundingSize']}` : 'rounded=0'))
      if (this.new) {
        this.vertex['shape' + d.properties.Id].new = true
      }
      this.vertex['shape' + d.properties.Id].Id = d.properties.Id
      this.vertex['shape' + d.properties.Id].OwneeRef = d.properties.OwneeRef
      this.vertex['shape' + d.properties.Id].isView = true
      this.vertex['shape' + d.properties.Id].viceValue = this.vertex['shape' + d.properties.Id].value
      this.vertex['shape' + d.properties.Id].viceHeight = calculateHeight()
      if (d.properties['StyleBackColor']) {
        this.vertex['shape' + d.properties.Id].StyleBackColor = d.properties['StyleBackColor']
      }
      if (d.properties['StyleBackColor2']) {
        this.vertex['shape' + d.properties.Id].StyleBackColor2 = d.properties['StyleBackColor2']
      }
      if (d.properties['StyleThemeRef']) {
        this.vertex['shape' + d.properties.Id].StyleThemeRef = d.properties['StyleThemeRef']
      }
    } else {
      return html
    }
  }

  drawCommentShape (d, themeStyle, returnHtml) {
    this.addThemeStyleToComment(d, themeStyle)
    let text = this.dataByType.comment[d.properties.OwneeRef].properties.Text
    if (text) {
      text = text.replace(/\r/g, '')
    }
    if (!text) {
      text = '《双击进行编辑》'
    }
    text = xss(text)
    if (d.properties['ShapeSize'].width === 'auto') {
      d.properties['ShapeSize'].width = 120
    }
    if (d.properties['ShapeSize'].height === 'auto') {
      d.properties['ShapeSize'].height = 150
    }
    let width = d.properties['ShapeSize'].width
    let height = d.properties['ShapeSize'].height
    let html = `<div class="svg-comment" style="position:relative;z-index:1;height:${height}px;width:${width}px;text-align:left;padding:10px;word-break: break-all;word-wrap: break-word;white-space: pre-line;line-height:1;`
    if (d.properties['CommentBackgroundColor']) {
      let color = DrawGraph.colorFormatter(d.properties['CommentBackgroundColor'])
      html += `background: linear-gradient(-135deg, transparent 8px, ${color} 0);`
    }
    if (d.properties['CommentShadowColor'] && d.properties['CommentShadowSize']) {
      let c = d.properties['CommentShadowColor']
      html += `box-shadow: ${d.properties['CommentShadowSize'].width}px ${d.properties['CommentShadowSize'].height}px 0 ${DrawGraph.colorFormatter(c)};`
    }
    if (d.properties['CommentTextColor']) {
      let color = DrawGraph.colorFormatter(d.properties['CommentTextColor'])
      html += `color:${color};`
    }
    if (d.properties['CommentTextFont']) {
      html += `${DrawGraph.styleFontFormatter(d.properties['CommentTextFont'])};`
    }
    if (d.properties['StyleBackColor']) {
      let color = DrawGraph.colorFormatter(d.properties['StyleBackColor'])
      html += `background: linear-gradient(-135deg, transparent 10px, ${color} 0);`
    }
    if (d.properties['StyleTextColor']) {
      let color = DrawGraph.colorFormatter(d.properties['StyleTextColor'])
      html += `color:${color};`
    }
    if (d.properties['StyleFont']) {
      html += `${DrawGraph.styleFontFormatter(d.properties['StyleFont'])}`
    }
    html += `" title="${text}">`
    const commentTopRightCorner = require(d.properties['IsCommentBorderDashed'] ? './images/comment-dashed.png' : './images/comment-solid.png')
    if (!d.properties['CommentBorderWidth']) {
      html += `${text}`
    } else {
      let borderCss = `${d.properties['CommentBorderWidth']}px ${d.properties['IsCommentBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['CommentBorderColor'])};`
      html += `<span>${text}</span><b style="position: absolute;left:0px;bottom:0;height:100%;border-left: ${borderCss}"></b><b style="position: absolute;left:0;bottom:0px;width:100%;border-bottom: ${borderCss}"></b><b style="position: absolute;left:0;top:0px;width:${d.properties['ShapeSize'].width - 10}px;border-top: ${borderCss}"></b><b style="position: absolute;bottom:0;right:0px;height:${d.properties['ShapeSize'].height - 10}px;border-right: ${borderCss}"></b><div style="border-bottom-width: ${d.properties['CommentBorderWidth']}px;border-left-width: ${d.properties['CommentBorderWidth']}px;border-style: ${d.properties['IsCommentBorderDashed'] ? 'dotted' : 'solid'};border-color: ${DrawGraph.colorFormatter(d.properties['CommentBorderColor'])};" class="comment-top-right-corner"><span style="border-width: ${d.properties['CommentBorderWidth']}px;border-style: ${d.properties['IsCommentBorderDashed'] ? 'dotted' : 'solid'};border-color: ${DrawGraph.colorFormatter(d.properties['CommentBorderColor'])};"></span></div>`
    }
    html += `</div>`
    if (!returnHtml) {
      const parent = this.graph.getDefaultParent()
      const shape = this.graph.insertVertex(
        parent,
        null,
        html,
        d.properties.Location.x,
        d.properties.Location.y,
        d.properties['ShapeSize'].width,
        d.properties['ShapeSize'].height,
        STYLE.COMMENT)
      shape.geometry.alternateBounds = new MxRectangle(0, 0, width, height)
      this.vertex['shape' + d.properties.Id] = shape
      if (d.properties['StyleBackColor']) {
        this.vertex['shape' + d.properties.Id].StyleBackColor = d.properties['StyleBackColor']
      }
      if (d.properties['StyleThemeRef']) {
        this.vertex['shape' + d.properties.Id].StyleThemeRef = d.properties['StyleThemeRef']
      }
      if (d.properties['StyleTextColor']) {
        this.vertex['shape' + d.properties.Id].StyleTextColor = d.properties['StyleTextColor']
      }
      if (d.properties['StyleFont']) {
        this.vertex['shape' + d.properties.Id].StyleFont = d.properties['StyleFont']
      }
      if (this.new) {
        shape.new = true
      }
      shape.Id = d.properties.Id
      shape.OwneeRef = d.properties.OwneeRef
      shape.isComment = true
      // this.graph.cellsOrdered([shape], true)
    } else {
      return html
    }
  }

  drawSubTypeShape (d, returnHtml, diagramAdd) { // 全局样式没有subtype，所以不传themeStyle
    let height = d.properties.ShapeSize.height
    let width = d.properties.ShapeSize.width
    let subTypeId = d.properties.SubTypeRef
    let parentKeyName = ''
    let subtype = null
    let parentEntityId = null
    {
      let diagram = diagramAdd || this.dataByType.diagram[this.param.diagramId].children
      let parentConnection = null
      diagram.forEach(item => {
        if (item.properties.TypeId === 80000009) {
          if (item.properties.ChildShapeRef === d.properties.Id && !item.properties.deleted) {
            parentConnection = item
          }
        }
      })
      diagram.forEach(item => {
        if (item.properties.TypeId === 80000008) {
          if (item.properties.Id === parentConnection.properties.ParentShapeRef && !item.properties.deleted) {
            parentEntityId = item.properties.OwneeRef
          }
        }
      })
      let parentTable = this.dataByType.table[parentEntityId]
      let columns = {}
      parentTable.children.forEach(item => {
        if (item.properties.TypeId === 80000005) { // 前进回退字段之前状态被删除，也需要此字段信息
          columns[item.properties.Id] = item.properties
        } else if (item.properties.TypeId === 80100042 && item.properties.Id === subTypeId && !item.properties.deleted) {
          subtype = item.properties
        }
      })
      if (subtype && subtype.AttributeRef) {
        let LogicalName = columns[subtype.AttributeRef]?.LogicalName
        parentKeyName = LogicalName || ''
      }
    }
    let html = `<div style="height:${height}px;width:${width}px;">`
    html += `<div class="subtype-shape`
    let exclusive = false
    if (subtype && (!subtype['SubtypeType'] || subtype['SubtypeType'] === 'Exclusive')) {
      html += ` exclusive`
      exclusive = true
    }
    html += `"><div>${parentKeyName}</div></div></div>`
    if (returnHtml) {
      return html
    }
    this.vertex['shape' + d.properties.Id] = this.graph.insertVertex(
      this.graph.getDefaultParent(), null, html,
      d.properties.Location.x,
      d.properties.Location.y,
      width, height,
      `shape=${exclusive ? 'subtype-exclusive' : 'subtype'};${STYLE.SubType}${d.properties.StyleBackColor ? `fillColor=${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};` : ''}`)
    if (this.new) {
      this.vertex['shape' + d.properties.Id].new = true
    }
    this.vertex['shape' + d.properties.Id].Id = d.properties.Id
    this.vertex['shape' + d.properties.Id].isSubType = true
    this.vertex['shape' + d.properties.Id].SubTypeRef = subTypeId
    this.vertex['shape' + d.properties.Id].ParentTableId = parentEntityId
  }

  drawSubTypeStyle (subtypeCell) {
    let diagram = this.dataByType.diagram[this.param.diagramId].children
    let d = diagram?.find(shape => shape.properties.Id === subtypeCell.Id && !shape.properties.deleted)
    let height = d.properties.ShapeSize.height
    let width = d.properties.ShapeSize.width
    let subTypeId = d.properties.SubTypeRef
    let parentKeyName = ''
    let subtype = null
    let parentEntityId = null
    {
      let parentConnection = null
      diagram.forEach(item => {
        if (item.properties.TypeId === 80000009) {
          if (item.properties.ChildShapeRef === d.properties.Id && !item.properties.deleted) {
            parentConnection = item
          }
        }
      })
      diagram.forEach(item => {
        if (item.properties.TypeId === 80000008) {
          if (item.properties.Id === parentConnection.properties.ParentShapeRef && !item.properties.deleted) {
            parentEntityId = item.properties.OwneeRef
          }
        }
      })
      let parentTable = this.dataByType.table[parentEntityId]
      let columns = {}
      parentTable.children.forEach(item => {
        if (item.properties.TypeId === 80000005) { // 前进回退字段之前状态被删除，也需要此字段信息
          columns[item.properties.Id] = item.properties
        } else if (item.properties.TypeId === 80100042 && item.properties.Id === subTypeId && !item.properties.deleted) {
          subtype = item.properties
        }
      })
      if (subtype && subtype.AttributeRef) {
        let LogicalName = columns[subtype.AttributeRef]?.LogicalName
        parentKeyName = LogicalName || ''
      }
    }
    let exclusive = false
    if (subtype && (!subtype['SubtypeType'] || subtype['SubtypeType'] === 'Exclusive')) {
      exclusive = true
    }
    return `shape=${exclusive ? 'subtype-exclusive' : 'subtype'};${STYLE.SubType}${d.properties.StyleBackColor ? `fillColor=${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};` : ''}`
  }

  drawFigureShape (d, themeStyle, returnHtml, figureArr) {
    this.addThemeStyleToFigure(d, themeStyle)
    let width = d.properties['ShapeSize'].width
    let height = d.properties['ShapeSize'].height
    let html = `<div class="svg-figure" data-id="${d.properties.Id}" style="height:${height}px;width:${width + 1}px;text-align:center;vertical-align:top;overflow : hidden;border:1px solid #000;background-color:#fff;`
    let style = 'fillColor=#fff;strokeWidth=1;strokeColor=#000;'
    if (d.properties['FigureBackgroundColor']) {
      html += `background-color:${DrawGraph.colorFormatter(d.properties['FigureBackgroundColor'])};`
      style += `fillColor=${DrawGraph.colorFormatter(d.properties['FigureBackgroundColor'])};`
    }
    if (d.properties['FigureBorderColor'] && d.properties['FigureBorderWidth']) {
      html += `border:${d.properties['FigureBorderWidth']}px ${d.properties['IsFigureBorderDashed'] ? 'dashed' : 'solid'} ${DrawGraph.colorFormatter(d.properties['FigureBorderColor'])};`
      style += `strokeWidth=${d.properties['FigureBorderWidth']};${d.properties['IsFigureBorderDashed'] ? 'dashed=1;dashPattern=2 1' : ''};strokeColor=${DrawGraph.colorFormatter(d.properties['FigureBorderColor'])};`
    }
    if (d.properties['FigureRoundingSize']) {
      html += `border-radius: ${d.properties['FigureRoundingSize']}px;`
      style += `rounded=1;perimeter=rectanglePerimeter;arcSize=${d.properties['FigureRoundingSize']};`
    }
    if (d.properties['StyleBackColor']) {
      html += `background-color:${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
      style += `fillColor=${DrawGraph.colorFormatter(d.properties['StyleBackColor'])};`
    }
    html += `" ></div>`
    if (!returnHtml) {
      const parent = this.graph.getDefaultParent()
      if (d.objectClass === 'Datablau.ERD.ShapePolyline' || d.objectClass === 'Datablau.ERD.ShapePolygon') {
        let points = d.properties.Path.split(';').map(ps => ps.split(',').map(i => +i))
        let shape = this.graph.insertEdge(parent, d.properties.Id, null, null, null, 'endArrow=none;' + style)
        let startPoint = new MxPoint(points[0][0], points[0][1])
        shape.geometry.setTerminalPoint(startPoint, true)
        shape.geometry.points = [...points.slice(1, d.objectClass === 'Datablau.ERD.ShapePolygon' ? points.length : points.length - 1).map(p => new MxPoint(p[0], p[1]))] // ShapePolygon最后一个节点是起点，需要用掉除第一个外剩下所有点
        shape.geometry.setTerminalPoint(d.objectClass === 'Datablau.ERD.ShapePolygon' ? startPoint : new MxPoint(points[points.length - 1][0], points[points.length - 1][1]), false)
        shape.geometry.relative = true
        shape.isPolygon = true
        if (d.objectClass === 'Datablau.ERD.ShapePolygon') {
          shape.isLine = false
        } else {
          shape.isLine = true
        }
        shape.Id = d.properties.Id
        shape.isFigure = true
        shape.Name = d.properties.Name
        shape.OrderNumber = d.properties.OrderNumber || 0
        shape.pts = _.cloneDeep([...points.slice(1, points.length - 1).map(p => new MxPoint(p[0], p[1]))])
        figureArr.push(shape)
      } else {
        let html = `<div class="svg-figure" data-id="${d.properties.Id}" style="width: ${d.properties['ShapeSize'].width}px;height: ${d.properties['ShapeSize'].height}px;display: flex;padding: 10px;`
        if (d.properties['FigureTextPosition']) {
          let position = d.properties['FigureTextPosition']
          if (position.indexOf('Center') !== -1) {
            html += `justify-content: center;`
          } else if (position.indexOf('Left') !== -1) {
            html += `justify-content: flex-start;`
          } else if (position.indexOf('Right') !== -1) {
            html += `justify-content: flex-end;`
          }
        }
        if (d.properties['FigureTextPosition']) {
          let position = d.properties['FigureTextPosition']
          html += `line-height:1.1;`
          if (position.indexOf('Top') !== -1) {
            html += `align-items: flex-start;`
          } else if (position.indexOf('Middle') !== -1) {
            html += `align-items: center;`
          } else if (position.indexOf('Bottom') !== -1) {
            html += `align-items: flex-end;`
          }
        }
        if (d.properties['FigureTextColor']) {
          let color = DrawGraph.colorFormatter(d.properties['FigureTextColor'])
          html += `color:${color};`
        }
        if (d.properties['FigureTextFont']) {
          html += `${DrawGraph.styleFontFormatter(d.properties['FigureTextFont'])};`
        }
        if (d.properties['StyleTextColor']) {
          let color = DrawGraph.colorFormatter(d.properties['StyleTextColor'])
          html += `color:${color};`
        }
        if (d.properties['StyleFont']) {
          html += `${DrawGraph.styleFontFormatter(d.properties['StyleFont'])}`
        }

        html += `">${d.properties['Text'] ? d.properties['Text'] : ''}</div>`
        const shape = this.graph.insertVertex(
          parent,
          d.properties.Id,
          html,
          d.properties.Location.x,
          d.properties.Location.y,
          d.properties['ShapeSize'].width,
          d.properties['ShapeSize'].height, `shape=${shapeMap[d.objectClass]};perimeter=rectanglePerimeter;` + style)
        this.vertex['shape' + d.properties.Id] = shape
        if (d.properties['StyleBackColor']) {
          this.vertex['shape' + d.properties.Id].StyleBackColor = d.properties['StyleBackColor']
        }
        if (d.properties['StyleThemeRef']) {
          this.vertex['shape' + d.properties.Id].StyleThemeRef = d.properties['StyleThemeRef']
        }
        if (this.new) {
          shape.new = true
        }
        shape.Id = d.properties.Id
        shape.isFigure = true
        shape.Name = d.properties.Name
        shape.OrderNumber = d.properties.OrderNumber || 0
        figureArr.push(shape)
      }
    } else {
      if (d.objectClass === 'Datablau.ERD.ShapePolyline' || d.objectClass === 'Datablau.ERD.ShapePolygon') {
        return 'endArrow=none;' + style
      } else {
        return `shape=${shapeMap[d.objectClass]};perimeter=rectanglePerimeter;` + style
      }
    }
  }

  initEdgeStyle () {
    let style = mxUtils.clone(this.graph.getStylesheet().getDefaultEdgeStyle())
    style = mxUtils.clone(style)
    style.edgeStyle = 'topToBottomEdgeStyle'
    style.strokeColor = '#333'
    style.fillColor = '#EEE'
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_circle'
    style[mxConstants.ARROW_SPACING] = 80
    style[mxConstants.ARROW_SIZE] = 20
    style[mxConstants.STYLE_STARTSIZE] = 8
    style[mxConstants.STYLE_STARTFILL] = 0
    style[mxConstants.STYLE_ENDSIZE] = 8
    style[mxConstants.STYLE_ENDFILL] = 0
    style[mxConstants.STYLE_STROKEWIDTH] = 1
    const self = this
    mxEdgeStyle.myStyle = function (state, source, target, points, result) {
      let relation = state.cell
      if (relation.BendPoints) {
        let bendPoints = relation.BendPoints.split(/[,;]/)
        points = []
        points.push(new MxPoint(
          Number.parseInt(bendPoints[1]),
          Number.parseInt(bendPoints[2])
        ))
        if (bendPoints.length >= 6) {
          points.push(new MxPoint(Number.parseInt(bendPoints[6]), Number.parseInt(bendPoints[7])))
        }
      }
      mxEdgeStyle.TopToBottom(state, source, target, points, result)
    }
    mxStyleRegistry.putValue('tmpEdgeStyle', mxEdgeStyle.myStyle)
    style[mxConstants.STYLE_DASHED] = 0 // DASHED
    // style.edgeStyle = 'tmpEdgeStyle'
    this.graph.getStylesheet().putCellStyle('ZeroOrOne', style)
    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    this.graph.getStylesheet().putCellStyle('ZeroOrOneDashed', style)
    this.graph.getStylesheet().putCellStyle('ZeroOrOneVirtual', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMore', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_circle'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMoreDashed', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_has_foot_no_circle'
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('OneOrMore', style)
    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1
    style.startArrow = 'connector_circle'
    this.graph.getStylesheet().putCellStyle('OneOrMoreDashed', style)
    this.graph.getStylesheet().putCellStyle('OneOrMoreVirtual', style)

    style = mxUtils.clone(style)
    style[mxConstants.STYLE_DASHED] = 1
    style.startArrow = 'none'
    style.endArrow = 'none'
    this.graph.getStylesheet().putCellStyle('Dashed', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style[mxConstants.STYLE_DASHED] = 0
    style.endArrow = 'connector_basic'
    this.graph.getStylesheet().putCellStyle('OneOnly', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_basic'
    style.endArrow = 'connector_basic'
    style[mxConstants.STYLE_DASHED] = 1
    this.graph.getStylesheet().putCellStyle('OneOnlyDashed', style)
    this.graph.getStylesheet().putCellStyle('OneOnlyVirtual', style)

    style = mxUtils.clone(style)
    style.startArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1
    style.endArrow = 'connector_has_foot'
    this.graph.getStylesheet().putCellStyle('None', style)
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('NoneDashed', style)
    style = mxUtils.clone(style)
    style.startArrow = 'connector_circle'
    style.endArrow = 'connector_has_foot'
    style[mxConstants.STYLE_DASHED] = 1 // DASHED
    style[mxConstants.STYLE_DASH_PATTERN] = '5 10'
    this.graph.getStylesheet().putCellStyle('ZeroOneOrMoreVirtual', style)

    // 带箭头样式
    style = mxUtils.clone(style)
    style.startArrow = mxConstants.ARROW_BLOCK
    style.endArrow = 'none'
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('Generalization', style)
    style = mxUtils.clone(style)
    style.startArrow = mxConstants.ARROW_BLOCK
    style.endArrow = 'none'
    style[mxConstants.STYLE_DASHED] = 1
    style[mxConstants.STYLE_DASH_PATTERN] = '3 3'
    this.graph.getStylesheet().putCellStyle('Realization', style)
    style = mxUtils.clone(style)
    style.startArrow = 'none'
    style.endArrow = mxConstants.ARROW_OPEN
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('Association', style)
    style = mxUtils.clone(style)
    style.startArrow = mxConstants.ARROW_DIAMOND_THIN
    style.endArrow = mxConstants.ARROW_OPEN
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('Aggregation', style)
    style = mxUtils.clone(style)
    style.startArrow = mxConstants.ARROW_DIAMOND_THIN
    style.startFill = 1
    style.endArrow = mxConstants.ARROW_OPEN
    style[mxConstants.STYLE_DASHED] = 0
    this.graph.getStylesheet().putCellStyle('Composition', style)
    style = mxUtils.clone(style)
    style.startArrow = 'none'
    style.startFill = 0
    style.endArrow = mxConstants.ARROW_OPEN
    style[mxConstants.STYLE_DASHED] = 1
    this.graph.getStylesheet().putCellStyle('Dependency', style)
    style = mxUtils.clone(style)
    style.startArrow = mxConstants.ARROW_OPEN
    style.endArrow = 'none'
    style[mxConstants.STYLE_DASHED] = 1
    this.graph.getStylesheet().putCellStyle('Extend', style)
    // style.startSize = 10

    let cardinalityTypeMap = {
      'ZeroOrOne': 'connector_circle',
      'ZeroOneOrMore': 'connector_has_foot',
      'OneOrMore': 'connector_has_foot_no_circle',
      'OneOnly': 'connector_basic',
      'None': 'connector_has_foot'
    }

    for (let startCardinalityType in cardinalityTypeMap) {
      for (let endCardinalityType in cardinalityTypeMap) {
        style = mxUtils.clone(style)
        style.startArrow = cardinalityTypeMap[startCardinalityType]
        style.endArrow = cardinalityTypeMap[endCardinalityType]
        style[mxConstants.STYLE_DASHED] = 0
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}`, style)
        style = mxUtils.clone(style)
        style[mxConstants.STYLE_DASHED] = 1
        style[mxConstants.STYLE_DASH_PATTERN] = '5 10'
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}Dashed`, style)
        style = mxUtils.clone(style)
        style[mxConstants.STYLE_DASHED] = 1
        style[mxConstants.STYLE_DASH_PATTERN] = '5 5'
        this.graph.getStylesheet().putCellStyle(`${startCardinalityType}:${endCardinalityType}DashedVirtual`, style)
      }
    }
  }
  registerEdgeStyle ({ EndCardinality = 'ZeroOrOne', points = [] } = {}) {
    let firstBendPoint = null
    let secondBendPoint = null
    let getBendPoints = str => {
      if (str) {
        let arr = str.split(/[,;]/)
        arr.forEach((item, index) => {
          arr[index] = Number.parseInt(item)
        })
        firstBendPoint = new MxPoint(arr[1], arr[2])
        if (arr.length >= 6) {
          secondBendPoint = new MxPoint(arr[6], arr[7])
        }
      }
    }

    let getSourceCellPoint = cell => {
      return getCellPoint(cell, firstBendPoint)
    }
    let getTargetCellPoint = cell => {
      return getCellPoint(cell, secondBendPoint)
    }
    let getCellPoint = (cell, point) => {
      let [left, right, top, bottom] = [cell.x, cell.x + cell.width, cell.y, cell.y + cell.height]
      let [x, y] = []
      //      if(point.x < left && point.y < top){
      //
      //      }else if(point.x > left && point.y > bottom){
      //
      //      }
      if (point.x < left) {
        x = left; y = point.y
      } else if (point.x > right) {
        x = right; y = point.y
      } else if (point.y > bottom) {
        x = point.x; y = bottom
      } else if (point.y < top) {
        x = point.x; y = top
      }
      return [new MxPoint(x, y)]
    }
    let style = mxUtils.clone(this.graph.getStylesheet().getCellStyle(EndCardinality))
    mxEdgeStyle.myStyle = function (state, source, target, points, result) {
      getBendPoints(state.cell.BendPoints)
      let sourcePoint = getSourceCellPoint(source)
      points = []
      // sourcePoint.forEach(item => {
      //   points.push(item)
      // })
      if (firstBendPoint) {
        points.push(firstBendPoint)
      }
      if (secondBendPoint) {
        points.push(secondBendPoint)
      }
      let targetPoint = getTargetCellPoint(target)
      // targetPoint.forEach(item => {
      //   points.push(item)
      // })
      mxEdgeStyle.TopToBottom(state, source, target, points, result)
    }
    mxStyleRegistry.putValue('tmpEdgeStyle', mxEdgeStyle.myStyle)
    style.edgeStyle = 'tmpEdgeStyle'
    this.graph.getStylesheet().putCellStyle('tmpStyle', style)
  }

  registerSubtypeShape () {
    // function SubtypeShape () {
    //   mxCylinder.call(this)
    // }
    // mxUtils.extend(SubtypeShape, mxCylinder)
    // SubtypeShape.prototype.redrawPath = function (path, x, y, w, h, isForeground) {
    //   if (isForeground) {
    //     path.moveTo(0, 0)
    //     path.lineTo(w / 2, h / 2)
    //     path.lineTo(w, 0)
    //   } else {
    //     path.moveTo(0, 0)
    //     console.log(path)
    //     // path.arc(0, 0, 20, 0, Math.PI, 1)
    //     path.lineTo(w, 0)
    //     path.lineTo(w, h)
    //     path.lineTo(0, h)
    //     path.close()
    //   }
    // }
    // mxCellRenderer.registerShape('subtype', SubtypeShape)
    function SubtypeShape () {
      mxEllipse.call(this)
    }
    mxUtils.extend(SubtypeShape, mxEllipse)
    SubtypeShape.prototype.paintVertexShape = function (c, x, y, w, h) {
      c.begin()
      c.moveTo(x, y + h)
      c.arcTo(w / 2, h, 0, 1, 1, x + w, y + h)
      c.close()
      c.fillAndStroke()
    }

    mxCellRenderer.registerShape('subtype', SubtypeShape)
    function SubtypeShapeExclusive () {
      mxEllipse.call(this)
    }
    mxUtils.extend(SubtypeShapeExclusive, mxEllipse)
    SubtypeShapeExclusive.prototype.paintVertexShape = function (c, x, y, w, h) {
      c.begin()
      c.moveTo(x, y + h)
      c.arcTo(w / 2, h, 0, 1, 1, x + w, y + h)
      c.close()
      c.fillAndStroke()
      c.begin()
      c.moveTo(x + w / 4, y + h)
      c.lineTo(x + w * 3 / 4, y + 3)
      c.moveTo(x + w * 3 / 4, y + h)
      c.lineTo(x + w / 4, y + 3)
      c.close()
      c.fillAndStroke()
    }

    mxCellRenderer.registerShape('subtype-exclusive', SubtypeShapeExclusive)
  }

  registerArrow () {
    function createArrow ({ hasCircle = false, hasFoot = false }) {
      return function (canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
        return function () {
          let action = (type, x, y, ...args) => {
            if (Math.abs(unitY) < 0.1) {
              if (Math.abs(unitX - 1) < 0.1) {
                canvas[type](pe.x - y, pe.y + x, ...args)
              } else if (Math.abs(unitX + 1) < 0.1) {
                canvas[type](pe.x + y, pe.y + x, ...args)
              }
            } else {
              if (Math.abs(unitY - 1) < 0.1) {
                canvas[type](pe.x + x, pe.y - y, ...args)
              } else if (Math.abs(unitY + 1) < 0.1) {
                canvas[type](pe.x + x, pe.y + y, ...args)
              }
            }
            //            canvas[type](pe.x - x*unitY , pe.y-y*unitY)
          }
          let ellipseAction = (x, y, a, b) => {
            if (Math.abs(unitY) < 0.1) {
              if (Math.abs(unitX - 1) < 0.1) {
                canvas.ellipse(pe.x - y - b / 2, pe.y + x - a / 2, b, a)
              } else if (Math.abs(unitX + 1) < 0.1) {
                canvas.ellipse(pe.x + y - b / 2, pe.y + x - a / 2, b, a)
              }
            } else {
              if (Math.abs(unitY - 1) < 0.1) {
                canvas.ellipse(pe.x + x - a / 2, pe.y - y - b / 2, a, b)
              } else if (Math.abs(unitY + 1) < 0.1) {
                canvas.ellipse(pe.x + x - a / 2, pe.y + y - b / 2, a, b)
              }
            }
          }
          canvas.styleEnabled = true
          canvas.setFillColor('#F0F0F0')
          canvas.begin()

          if (hasFoot) {
            action('moveTo', -4, 13)
            action('lineTo', 4, 13)
            action('moveTo', 0, 12)
            action('lineTo', 2, 6)
            action('moveTo', 3, 3)
            action('lineTo', 4, 0)
            action('moveTo', 0, 12)
            action('lineTo', -1, 9)
            action('moveTo', -2, 6)
            action('lineTo', -4, 0)
          } else {
            action('moveTo', -6, 13)
            action('lineTo', 6, 13)
          }
          canvas.stroke()
          if (hasCircle) {
            ellipseAction(0, 18, 9, 9)
            canvas.fillAndStroke()
          }

          canvas.close()
        }
      }
    }

    mxMarker.addMarker('connector_basic', createArrow({ hasCircle: false }))
    mxMarker.addMarker('connector_circle', createArrow({ hasCircle: true }))
    mxMarker.addMarker('connector_has_foot', createArrow({ hasCircle: true, hasFoot: true }))
    mxMarker.addMarker('connector_has_foot_no_circle', createArrow({ hasCircle: false, hasFoot: true }))
  }
  drawEdge (diagramAdd) {
    if (diagramAdd) { // 模型copy的创建需在cell上添加new字段
      this.new = true
    } else {
      this.new = false
    }
    this.registerArrow()
    this.initEdgeStyle()

    let diagram = diagramAdd || this.dataByType.diagram[this.param.diagramId]?.children
    let diagramThemeId = this.dataByType.diagram[this.param.diagramId]?.properties?.StyleThemeRef
    if (!diagram) {
      if (this.dataByType.diagram[this.param.diagramId]) {
        this.dataByType.diagram[this.param.diagramId].children = []
      }
      return
    }
    let parent = this.graph.getDefaultParent()

    let diagramMap = {}
    diagram.forEach(item => {
      diagramMap[item.properties.Id] = item
    })

    diagram.forEach(d => {
      if (d.properties.TypeId === 80000009 || d.properties.TypeId === 80010287) {
        let themeStyle = null
        if (this.dataByType.theme) {
          if (diagramThemeId && this.dataByType.theme[diagramThemeId] && !this.dataByType.theme[diagramThemeId].properties.deleted) {
            themeStyle = _.cloneDeep(this.dataByType.theme[diagramThemeId].properties)
          } else {
            themeStyle = this.themeCreateTemplate
          }
          if (d.properties.StyleThemeRef) {
            if (this.dataByType.theme[d.properties.StyleThemeRef] && !this.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
              themeStyle = _.cloneDeep(this.dataByType.theme[d.properties.StyleThemeRef].properties)
            }
          }
        }
        let showLabel = this.dataByType.diagram[this.param.diagramId].properties.ShowLabel
        if (this.dataByType.relation[d.properties.OwneeRef]) {
          let relation = this.dataByType.relation[d.properties.OwneeRef].properties
          relation.BendPoints = d.properties.BendPoints
          let edgeStyle = (relation.StartCardinality ? relation.StartCardinality : 'None') + ':' + (relation.EndCardinality ? relation.EndCardinality : 'None')
          if (relation.RelationalType === 'NonIdentifying') {
            edgeStyle += 'Dashed'
          }
          if (this.dataByType.relation[d.properties.OwneeRef].objectClass && this.dataByType.relation[d.properties.OwneeRef].objectClass.indexOf('Virtual') !== -1) {
            edgeStyle += 'Virtual'
          }
          if (this.dataByType.relation[d.properties.OwneeRef].properties.RelationshipUmlType) { // 带箭头方向的UML线
            edgeStyle = this.dataByType.relation[d.properties.OwneeRef].properties.RelationshipUmlType
          }
          let edge = this.graph.insertEdge(parent, d.properties.Id, showLabel ? relation.Label : null,
            this.vertex['shape' + d.properties.ParentShapeRef],
            this.vertex['shape' + d.properties.ChildShapeRef],
            `${edgeStyle};verticalLabelPosition=top;verticalAlign=bottom;labelPosition=right;align=left;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''} `
          )
          if (this.new) {
            edge.new = true
          }
          edge.Id = d.properties.Id
          edge.OwneeRef = d.properties.OwneeRef
          if (relation.CardinalityValue) {
            edge.endCardinalityType = ''
          } else {
            edge.endCardinalityType = relation.EndCardinality
          }
          if (this.vertex['shape' + d.properties.ChildShapeRef].isSubType) { // 为subtype关系中top的edge
            edge.subtypeTopEdge = true
          }
          edge.CardinalityValue = relation.CardinalityValue
          edge.BendPoints = d.properties.BendPoints
          edge.StartOrientation = d.properties.StartOrientation
          edge.EndOrientation = d.properties.EndOrientation
          edge.type = this.dataByType.relation[d.properties.OwneeRef].objectClass.slice(25)
          edge.relationalType = relation.RelationalType
          edge.IsCascade = relation.IsCascade
          // this.graph.orderCells(true, [edge])
          this.vertex['edge' + d.properties.Id] = edge
        } else {
          let edge = this.graph.insertEdge(parent, d.properties.Id, null,
            this.vertex['shape' + d.properties.ParentShapeRef],
            this.vertex['shape' + d.properties.ChildShapeRef],
            `Dashed;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''}`
          )
          if (this.new) {
            edge.new = true
          }
          edge.Id = d.properties.Id
          edge.OwneeRef = d.properties.OwneeRef
          edge.endCardinalityType = ''
          edge.CardinalityValue = ''
          edge.BendPoints = d.properties.BendPoints
          edge.StartOrientation = d.properties.StartOrientation
          edge.EndOrientation = d.properties.EndOrientation
          edge.IsCascade = undefined
          edge.type = 'editDisabled' // 建立在图框和备注上的虚拟关系，没有relation，不能编辑
          this.vertex['edge' + d.properties.Id] = edge
          // this.graph.orderCells(true, [edge])
        }
      }
    })
  }
  drawEdgeShapeStyle (connectionId) {
    let d = this.dataByType.diagram[this.param.diagramId].children.find(d => d.properties.Id === connectionId)
    let diagramThemeId = this.dataByType.diagram[this.param.diagramId].properties.StyleThemeRef
    let themeStyle = null
    if (this.dataByType.theme) {
      if (diagramThemeId && this.dataByType.theme[diagramThemeId] && !this.dataByType.theme[diagramThemeId].properties.deleted) {
        themeStyle = _.cloneDeep(this.dataByType.theme[diagramThemeId].properties)
      } else {
        themeStyle = this.themeCreateTemplate
      }
      if (d.properties.StyleThemeRef) {
        if (this.dataByType.theme[d.properties.StyleThemeRef] && !this.dataByType.theme[d.properties.StyleThemeRef].properties.deleted) {
          themeStyle = _.cloneDeep(this.dataByType.theme[d.properties.StyleThemeRef].properties)
        }
      }
    }
    let showLabel = this.dataByType.diagram[this.param.diagramId].properties.ShowLabel
    if (this.dataByType.relation[d.properties.OwneeRef]) {
      let relation = this.dataByType.relation[d.properties.OwneeRef].properties
      relation.BendPoints = d.properties.BendPoints
      let edgeStyle = (relation.StartCardinality ? relation.StartCardinality : 'None') + ':' + (relation.EndCardinality ? relation.EndCardinality : 'None')
      if (relation.RelationalType === 'NonIdentifying') {
        edgeStyle += 'Dashed'
      }
      if (this.dataByType.relation[d.properties.OwneeRef].objectClass && this.dataByType.relation[d.properties.OwneeRef].objectClass.indexOf('Virtual') !== -1) {
        edgeStyle += 'Virtual'
      }
      if (this.dataByType.relation[d.properties.OwneeRef].properties.RelationshipUmlType) { // 带箭头方向的UML线
        edgeStyle = this.dataByType.relation[d.properties.OwneeRef].properties.RelationshipUmlType
      }
      return `${edgeStyle};verticalLabelPosition=top;verticalAlign=bottom;labelPosition=right;align=left;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''} `
    } else {
      return `Dashed;${themeStyle ? this.addThemeStyleToEdge(themeStyle) : ''}${d.properties.StyleBackColor2 ? `strokeColor=${DrawGraph.colorFormatter(d.properties.StyleBackColor2)};` : ''}`
    }
  }
  draw () {
    mxEvent.disableContextMenu(this.container)
    // const graph = new MyGraph(this.container)
    const editor = new MxEditor()
    editor.setGraphContainer(this.container)
    const graph = editor.graph
    {
      // Creates a layout algorithm to be used
      // with the graph
      let layout = new MxHierarchicalLayout(graph)
      let organic = new MxFastOrganicLayout(graph)
      organic.forceConstant = 120
      let parent = graph.getDefaultParent()

      // Adds a button to execute the layout
      let button = document.createElement('button')
      $(button).css({
        position: 'absolute',
        right: '80px',
        top: '20px',
        display: 'none'
      })
      mxUtils.write(button, '自动布局')
      mxEvent.addListener(button, 'click', function (evt) {
        layout.execute(parent)
      })
      $('#consa-graph')[0].appendChild(button)
    }
    let c = new MxRubberband(graph)
    if (this.outlineContainer) {
      this.outline = new MxOutline(graph, this.outlineContainer)
      this.outline.setZoomEnabled(true)
    }
    const container = this.container
    this.editor = editor
    this.graph = graph
    graph.htmlLabels = true
    graph.setCellsEditable(false)
    graph.setAllowLoops(true)
    graph.setHtmlLabels(true)
    graph.setCellsResizable(true)
    graph.setAllowDanglingEdges(true)
    graph.setConnectable(true)
    mxEvent.disableContextMenu(container)
    graph.setDropEnabled(false)
    graph.setCellsDisconnectable(false)
    graph.setCellsCloneable(false)
    graph.setEdgeLabelsMovable(false)
    graph.setSplitEnabled(false)
    // mxGraphHandler.prototype.guidesEnabled = true
    graph.setTooltips(false)
    graph.swimlaneNesting = false
    graph.dropEnabled = true
    graph.setAllowDanglingEdges(true)
    // mxEdgeHandler.prototype.manageLabelHandle = true
    const model = graph.getModel()
    graph.panningHandler.useLeftButtonForPanning = true
    graph.container.style.cursor = 'move'
    graph.setPanning(true)
    model.beginUpdate()
    try {
      this.drawShape()
      this.drawEdge()
      window.connectionPoints = []
      // this.drawShapeAndEdge()
      //      this.doLayout();
    } catch (e) {
      this.param.$This.$message.error('绘图出错')
      console.error(e)
    }
    let beginTime = new Date().getTime()
    model.endUpdate()
    if (!graph.getDefaultParent().children) {
      graph.getDefaultParent().children = []
    }
    let endTime = new Date().getTime()
    let cost = endTime - beginTime
    console.debug(`用时${cost}毫秒`)
    editor.undoManager.clear() // 清空操作记录
    window.undoManager = editor.undoManager
    if (this.outline) {
      setTimeout(() => {
        this.outline.refresh()
      })
    }
  }
  zoom (factor) {
    this.graph.zoom(factor)
  }
  resizeShapeHeight (table) {
    let dataHeight, height
    if (this.displaySetting.column === 'key') {
      dataHeight = table.attr('calc-key-height')
    } else if (this.displaySetting.column === 'all') {
      dataHeight = table.attr('calc-height')
    } else {
      dataHeight = 30
    }
    height = Number.parseInt(dataHeight)
    return height
  }
  toggleColumnShow (table) {
    let cols = $(table).find('.svg-col')
    // debugger
    if (this.displaySetting.column === 'key') {
      cols.each(function (index, ele) {
        let $ele = $(ele)
        if ($ele.attr('class').indexOf('k') !== -1) {
          $ele.show()
        } else {
          $ele.hide()
        }
      })
    } else if (this.displaySetting.column === 'all') {
      cols.each(function (index, ele) {
        if (cols.length > 3) {
          console.log($(ele))
        }
        $(ele).show()
      })
    } else {
      cols.each(function (index, ele) {
        $(ele).hide()
      })
    }
  }
  initEventListener () {
    let root = $(this.container)
    root.off('click')
    root.off('mousedown')
    root.off('mouseup')
    // window.move = false
    // root.on('pointerdown', '.svg-table, .svg-view', function (e) {
    //   window.move = true
    //   $('.svg-table, .svg-view').each((index, value) => {
    //     let $header = $(value).find('.svg-tName')
    //     $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
    //   })
    //   let $header = $(this).find('.svg-tName')
    //   $header.css('backgroundColor', $header.attr('header-selected-color'))
    // })
    // root.on('pointerup', '.svg-table, .svg-view', function (e) {
    //   window.move = false
    // })
    // root.on('click', function (e) {
    //   if (window.move) return
    //   let $header = $(this).find('.svg-tName')
    //   $header.each((index, value) => {
    //     let $h = $(value)
    //     $h.css('backgroundColor', $h.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $h.attr('header-unselected-color'))
    //   })
    // })

    if (this.editorType === 'model') {
      // root.on('click', '.svg-table, .svg-view', function (e) {
      //   e.stopPropagation()
      //   $('.svg-table, .svg-view').each((index, value) => {
      //     let $header = $(value).find('.svg-tName')
      //     $header.css('backgroundColor', $header.attr('header-unselected-color') === 'Control' ? '#F0F0F0' : $header.attr('header-unselected-color'))
      //   })
      //   let $header = $(this).find('.svg-tName')
      //   $header.css('backgroundColor', $header.attr('header-selected-color'))
      // })
    } else if (this.editorType === 'table') {
      root.on('click', '.svg-table:not(.svg-business) .svg-col>span', (e) => {
        let id = $(e.target).parent().attr('data-id')
        let pId = $(e.target).parent().attr('p-id')
        // this.param.$This.showColDetail(id, pId)
        this.param.$This.showTabDetail(pId)
      })
      root.on('click', '.svg-table:not(.svg-business) .svg-tName>span', (e) => {
        let id = $(e.target).parent().attr('data-id')
        this.param.$This.showTabDetail(id)
      })
      root.on('click', '.svg-view .svg-col>span', (e) => {
        let pId = $(e.target).parent().attr('p-id')
        this.param.$This.showViewDetail(pId)
      })
      root.on('click', '.svg-view .svg-tName>span', (e) => {
        let id = $(e.target).parent().attr('data-id')
        this.param.$This.showViewDetail(id)
      })
      root.on('click', '.svg-business .svg-tName>span', (e) => {
        let id = $(e.target).parent().attr('data-id')
        this.param.$This.showTabDetail(id)
      })
    }
    let timeout = null
    root.on('click', '.collapse-btn', e => {
      let table = $(e.target).parent().parent()
      let height
      let children = this.graph.getDefaultParent().children
      let vertex = children.find(cell => cell.OwneeRef + '' === table.attr('data-oween-id'))
      let diagram = this.dataByType.diagram[this.param.diagramId]?.children
      let shape = diagram?.find(shape => !shape.properties.deleted && shape.properties.OwneeRef === +table.attr('data-oween-id'))
      if (table.hasClass('collapsed')) {
        if (this.displaySetting.column !== 'no') {
          height = vertex.viceHeight
          vertex.value = vertex.viceValue.replace(/height:\d+px;width/, `height:${height}px;width`).replace('svg-table collapsed', 'svg-table').replace('svg-view collapsed', 'svg-view')
        } else {
          height = 30
          vertex.value = vertex.value?.replace(/height:\d+px;width/, 'height:30px;width').replace('svg-table collapsed', 'svg-table').replace('svg-view collapsed', 'svg-view')
        }
        if (shape) { // 修改shape的收起状态，不然重新获取cell时候收起状态还是之前的
          shape.properties['IsCollapsed'] = false
          shape.properties.changed = true
          vertex.changed = true
        }
      } else {
        height = 30
        vertex.viceValue = vertex.value
        vertex.viceHeight = vertex.geometry.height
        vertex.value = vertex.value?.replace(/height:\d+px;width/, 'height:30px;width').replace('svg-table', 'svg-table collapsed').replace('svg-view', 'svg-view collapsed')
        if (shape) {
          shape.properties['IsCollapsed'] = true
          shape.properties.changed = true
          vertex.changed = true
        }
      }
      vertex.geometry.height = height
      this.graph.refresh(vertex)
      this.graph.getView().refresh()
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (this.displaySetting.type) {
          this.showDataType()
        } else {
          this.hideDataType()
        }
        if (this.displaySetting.name) {
          let name = this.displaySetting.name
          if (name === 'physical') {
            this.showPhysicalName()
          } else if (name === 'logical') {
            this.showLogicalName()
          } else if (name === 'full') {
            this.showFullName()
          }
        }
        if (this.displaySetting.column) {
          let table = $('.svg-table[data-id=' + $(e.target).parent().parent().attr('data-id') + ']')
          let col = this.displaySetting.column
          if (col === 'no') {
            table.find('.svg-col').hide()
          } else if (col === 'all') {
            table.find('.svg-col').show()
          } else if (col === 'key') {
            table.find('.svg-col').show()
            $.each($('.svg-table, .svg-view').not('.svg-business').find('[class^="svg-col"]'), (index, item) => {
              let $item = $(item)
              if ($item.attr('class').indexOf('k') === -1) {
                $item.hide()
              }
            })
            table.find('[class="svg-col ds"]').hide()
          }
        }
      })
    })
  }

  expandAll () {
    this.displaySetting.column = 'all'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = tables[i]
      if ($(item).hasClass('collapsed')) {
        $(item).find('.collapse-btn').click()
      }
      let table = $(item)
      let height = this.resizeShapeHeight(table)
      let vertex = this.vertex['shape' + table.attr('data-id')]
      vertex.value = vertex.value?.replace(/height:((\d+\.\d+)|(\d+))px;width/, `height:${height}px;width`)
      vertex.geometry.height = height
      vertex.changed = true
      // 将高度 赋值给 d.properties.ShapeSize
      let tableData = this.dataByType.diagram[this.param.diagramId] && this.dataByType.diagram[this.param.diagramId].children?.find(item => item.properties.Id === vertex.Id)
      tableData.properties.ShapeSize.height = height
      this.graph.refresh(vertex)
      this.graph.getView().refresh()
      $(item).find('.svg-col').show()
      if (this.displaySetting.type) {
        this.showDataType()
      } else {
        this.hideDataType()
      }
    }

    setTimeout(() => {
      // 前面的 this.graph.refresh 造成 jQuery 之前取的 dom 被刷新掉了
      $('.svg-table, .svg-view').not('.svg-business').each((index, table) => {
        this.toggleColumnShow($(table))
      })
    }, 0)
  }
  collapseAll () {
    this.displaySetting.column = 'no'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = tables[i]
      if (!$(item).hasClass('collapsed')) {
        $(item).find('.collapse-btn').click()
      }
      let table = $(item)
      let height = this.resizeShapeHeight(table)
      let vertex = this.vertex['shape' + table.attr('data-id')]
      vertex.value = vertex.value?.replace(/height:((\d+\.\d+)|(\d+))px;width/, `height:${height}px;width`)
      vertex.geometry.height = height
      // 将高度 赋值给 d.properties.ShapeSize
      let tableData = this.dataByType.diagram[this.param.diagramId] && this.dataByType.diagram[this.param.diagramId].children?.find(item => item.properties.Id === vertex.Id)
      tableData.properties.ShapeSize.height = height

      setTimeout(() => {
        this.toggleColumnShow($(item))
      }, 0)
    }
  }
  showKeyColumn () {
    this.displaySetting.column = 'key'
    let tables = $('.svg-table, .svg-view').not('.svg-business')
    for (let i = 0; i < tables.length; i++) {
      let item = $(tables[i])
      if (item.hasClass('collapsed')) {
        item.find('.collapse-btn').click()
      }
      let table = $(item)
      let height = this.resizeShapeHeight(table)
      let vertex = this.vertex['shape' + table.attr('data-id')]
      vertex.value = vertex.value?.replace(/height:((\d+\.\d+)|(\d+))px;width/, `height:${height}px;width`)
      vertex.geometry.height = height
      // 将高度 赋值给 d.properties.ShapeSize
      let tableData = this.dataByType.diagram[this.param.diagramId] && this.dataByType.diagram[this.param.diagramId].children?.find(item => item.properties.Id === vertex.Id)
      tableData.properties.ShapeSize.height = height
      this.graph.refresh(vertex)
      this.graph.getView().refresh()
    }
    setTimeout(() => {
      let table = $('.svg-table, .svg-view').not('.svg-business')
      this.toggleColumnShow(table)
      if (this.displaySetting.type) {
        this.showDataType()
      } else {
        this.hideDataType()
      }
    }, 0)
  }
  showDataType () {
    this.displaySetting.type = true
    $('.svg-col').html(function () {
      if (!$(this).text().includes($(this).attr('data-type'))) {
        return '<span>' + $(this).text() + ' : ' + $(this).attr('data-type') + '</span>'
      }
    })
  }
  hideDataType () {
    this.displaySetting.type = false
    $('.svg-col').html(function () {
      return '<span>' + $(this).text().split(' :')[0] + '</span>'
    })
  }
  showFullName (isDesignModel) {
    this.displaySetting.name = 'full'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let physicalName = $(this).attr('data-columnName')
      let logicalName = $(this).attr('data-logicalName')

      let newText = isDesignModel ? logicalName || physicalName : physicalName
      if (isDesignModel) {
        if (physicalName) {
          newText = logicalName ? logicalName + '(' + physicalName + ')' : physicalName
        }
      } else {
        if (logicalName) {
          newText = physicalName + '(' + logicalName + ')'
        }
      }
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    if (isDesignModel) {
      $('.svg-tName').text(function () {
        let $span = $(this).find('span')
        if ($span.length === 0) {
          let physicalName = $(this).attr('data-name')
          let logicalName = $(this).attr('data-logicalName')
          if (physicalName) {
            return logicalName ? logicalName + '(' + physicalName + ')' : physicalName
          } else {
            return logicalName
          }
        }
      })
    }
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (isDesignModel) {
        if (physicalName) {
          return logicalName ? logicalName + '(' + physicalName + ')' : physicalName
        } else {
          return logicalName
        }
      } else {
        if (logicalName) {
          return physicalName + '(' + logicalName + ')'
        } else {
          return physicalName
        }
      }
    })
    // $('.svg-view span').text(function () {
    //   let physicalName = $(this).parent().attr('data-name')
    //   let logicalName = $(this).parent().attr('data-logicalName')
    //   if (isDesignModel) {
    //     if (physicalName) {
    //       return logicalName ? logicalName + '(' + physicalName + ')' : physicalName
    //     } else {
    //       return logicalName
    //     }
    //   } else {
    //     if (logicalName) {
    //       return physicalName + '(' + logicalName + ')'
    //     } else {
    //       return physicalName
    //     }
    //   }
    // })
  }
  showPhysicalName (isDesignModel) {
    this.displaySetting.name = 'physical'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let newText = $(this).attr('data-columnName')
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    if (isDesignModel) {
      $('.svg-tName').text(function () {
        let $span = $(this).find('span')
        if ($span.length === 0) {
          let physicalName = $(this).attr('data-name')
          let logicalName = $(this).attr('data-logicalName')
          return physicalName
        }
      })
    }
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      return physicalName
    })
    // $('.svg-view span').text(function () {
    //   let physicalName = $(this).parent().attr('data-name')
    //   let logicalName = $(this).parent().attr('data-logicalName')
    //   return physicalName
    // })
  }
  showLogicalName (isDesignModel) {
    this.displaySetting.name = 'logical'
    $('.svg-col').html(function () {
      let oldText = $(this).text()
      let physicalName = $(this).attr('data-columnName')
      let logicalName = $(this).attr('data-logicalName')
      let newText = ''
      if (logicalName) {
        newText = logicalName
      } else {
        newText = physicalName
      }
      if (oldText.indexOf(' : ') > -1) {
        let type = $(this).attr('data-type')
        newText += ' : ' + type
      }
      return '<span>' + newText + '</span>'
    })
    if (isDesignModel) {
      $('.svg-tName').text(function () {
        let $span = $(this).find('span')
        if ($span.length === 0) {
          let physicalName = $(this).attr('data-name')
          let logicalName = $(this).attr('data-logicalName')
          if (logicalName) {
            return logicalName
          } else {
            return physicalName
          }
        }
      })
    }
    $('.svg-tName span').text(function () {
      let physicalName = $(this).parent().attr('data-name')
      let logicalName = $(this).parent().attr('data-logicalName')
      if (logicalName) {
        return logicalName
      } else {
        return physicalName
      }
    })
    // $('.svg-view span').text(function () {
    //   let physicalName = $(this).parent().attr('data-name')
    //   let logicalName = $(this).parent().attr('data-logicalName')
    //   if (logicalName) {
    //     return logicalName
    //   } else {
    //     return physicalName
    //   }
    // })
  }
}

export default DrawGraph
