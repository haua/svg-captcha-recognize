/**
 * 识别验证码
 * */

// 以svg path 的长度为维度，看看是否有多个字母有相同的长度
// 15 个数字可解析为两种字母，涉及的字母： 4 C I J L l M N n r R t W x X y z
const lengthMap = {
  986: ['I', 'l'],
  998: ['1'],
  1068: ['I', 'l'],
  1081: ['1'],
  1082: ['v'],
  1130: ['Y'],
  1134: ['Y'],
  1172: ['v'],
  1224: ['Y'],
  1274: ['L', 'y'],
  1298: ['V'],
  1311: ['V'],
  1360: ['i'],
  1380: ['L', 'y'],
  1406: ['V'],
  1473: ['i'],
  1478: ['T'],
  1491: ['r'],
  1598: ['N', 'X'],
  1601: ['T'],
  1604: ['X'],
  1610: ['J', 'x'],
  1613: ['x'],
  1614: ['N'],
  1615: ['r', 'N'],
  1616: ['N'],
  1617: ['N'],
  1618: ['N'],
  1634: ['k'],
  1637: ['k'],
  1694: ['z', 't'],
  1706: ['K'],
  1709: ['K'],
  1731: ['X', 'N'],
  1744: ['x', 'J'],
  1754: ['F'],
  1770: ['k'],
  1835: ['z', 't'],
  1838: ['u'],
  1840: ['A'],
  1844: ['A'],
  1848: ['K'],
  1850: ['Z'],
  1853: ['Z'],
  1886: ['h'],
  1900: ['F'],
  1922: ['H'],
  1928: ['H'],
  1960: ['P'],
  1991: ['u'],
  1993: ['A'],
  1996: ['D'],
  2004: ['Z'],
  2018: ['w'],
  2035: ['w'],
  2042: ['7'],
  2043: ['h'],
  2080: ['j'],
  2082: ['H'],
  2104: ['R'],
  2107: ['R'],
  2123: ['P'],
  2140: ['4'],
  2162: ['D'],
  2164: ['O'],
  2183: ['w'],
  2198: ['n', 'C'],
  2199: ['C'],
  2200: ['C'],
  2201: ['C'],
  2202: ['C'],
  2210: ['f'],
  2212: ['7'],
  2246: ['E'],
  2253: ['j'],
  2260: ['o'],
  2272: ['d'],
  2279: ['R', 'M'],
  2282: ['M'],
  2294: ['U'],
  2301: ['U'],
  2310: ['W'],
  2318: ['4', 'W'],
  2321: ['M'],
  2332: ['a'],
  2344: ['O'],
  2345: ['W'],
  2346: ['W'],
  2366: ['s'],
  2380: ['b'],
  2381: ['n', 'C'],
  2382: ['0'],
  2394: ['f'],
  2433: ['E'],
  2448: ['o'],
  2461: ['d'],
  2464: ['p'],
  2466: ['M'],
  2485: ['U'],
  2498: ['c'],
  2501: ['e'],
  2503: ['W'],
  2512: ['q'],
  2526: ['a'],
  2546: ['2'],
  2563: ['s'],
  2578: ['b'],
  2580: ['0'],
  2606: ['5'],
  2632: ['6'],
  2669: ['p'],
  2706: ['c'],
  2709: ['e'],
  2721: ['q'],
  2758: ['2'],
  2800: ['9'],
  2823: ['5'],
  2851: ['6'],
  3033: ['9'],
  3038: ['S'],
  3054: ['B'],
  3160: ['g'],
  3244: ['Q'],
  3254: ['Q'],
  3266: ['G'],
  3291: ['S'],
  3308: ['B'],
  3414: ['8'],
  3423: ['g'],
  3514: ['Q'],
  3538: ['G'],
  3663: ['m'],
  3667: ['m'],
  3698: ['8'],
  3878: ['3'],
  3968: ['m'],
  4201: ['3'] }

// 相同长度的两个字母，这里详细分析具体是哪个字母
const lengthSameMap = {
  986: path => utils.getMinXY(path)[1] > 13 ? 'I' : 'l',
  1068: path => utils.getMinXY(path)[1] > 13 ? 'I' : 'l',
  1274: path => utils.getMoveY(path) > 30 ? 'y' : 'L', // L y，根据第一个y值的大小可以区分它俩
  1380: path => utils.getMoveY(path) > 30 ? 'y' : 'L',
  1610: path => utils.getMinXY(path)[1] > 19 ? 'x' : 'J',
  1744: path => utils.getMinXY(path)[1] > 19 ? 'x' : 'J',
  1615: path => utils.getMinXY(path)[1] > 18 ? 'r' : 'N',
  2198: path => utils.getMinXY(path)[1] > 19 ? 'n' : 'C',
  2381: path => utils.getMinXY(path)[1] > 19 ? 'n' : 'C',
  2318: path => utils.getWH(path)[0] > 30 ? 'W' : '4',
  1598: path => utils.getMinXY(path)[1] > 13 ? 'X' : 'N',
  1731: path => utils.getMinXY(path)[1] > 13 ? 'X' : 'N',
  1694: path => utils.getMinXY(path)[1] > 22 ? 'z' : 't',
  1835: path => utils.getMinXY(path)[1] > 22 ? 'z' : 't',
  2279: path => utils.getMinXY(path)[1] > 13 ? 'R' : 'M'
}

// 从svg中把几个字母的d内容取出来，同时把字母按照它们在svg中的顺序排列
const getLetters = (svg) => {
  let i = 0
  const letters = []
  while (i < svg.length - 1 && i !== -1) {
    const pathStart = svg.indexOf('<path', i)
    if (pathStart === -1) {
      break
    }
    let pathEnd = svg.indexOf('>', pathStart)
    if (pathEnd === -1) {
      pathEnd = svg.length
    } else {
      pathEnd++
    }

    // 太短的是噪点
    if (pathEnd - pathStart > 500) {
      const path = svg.substring(pathStart, pathEnd)
      const [, d] = path.match(/d="([^"]+)"/) || []
      if (d) {
        letters.push(d)
      }
    }

    i = pathEnd
  }

  // 给字母按照位置排序
  if (letters.length) {
    letters.sort((a, b) => {
      const [ax] = a.match(/\d+(\.\d*)?/)
      const [bx] = b.match(/\d+(\.\d*)?/)
      return parseFloat(ax) - parseFloat(bx)
    })
  }

  return letters
}

const utils = {
  getMoveY (path) {
    const [,,, moveY] = path.match(/M(\d+(\.\d*)?)\s+(\d+(\.\d*)?)/) || []
    return parseFloat(moveY)
  },

  getAllXY (path) {
    return (path.match(/(\d+(\.\d*)?)/g) || []).map(v => parseFloat(v))
  },

  getMinXY (path) {
    const xs = []
    const ys = []
    this.getAllXY(path).forEach((v, i) => {
      (i % 2 ? ys : xs).push(v)
    })
    return [
      Math.min(...xs),
      Math.min(...ys)
    ]
  },

  // 获取宽高
  getWH (path) {
    const xs = []
    const ys = []
    this.getAllXY(path).forEach((v, i) => {
      (i % 2 ? ys : xs).push(v)
    })
    const maxXY = [
      Math.max(...xs),
      Math.max(...ys)
    ]
    const minXY = [
      Math.min(...xs),
      Math.min(...ys)
    ]
    return [
      maxXY[0] - minXY[0],
      maxXY[1] - minXY[1]
    ]
  }
}

module.exports = {
  recognize (svg) {
    const letters = getLetters(svg)
    return letters.map(l => {
      if (lengthSameMap[l.length]) {
        return lengthSameMap[l.length](l)
      }
      const letters = lengthMap[l.length] || ['']
      if (!letters[0]) { // 这个值没有记录到
        console.log(`had not train : ${l}`)
      }
      return letters[0]
    }).join('')
  }
}
