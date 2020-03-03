/**
 * 测试用例
 * */
const recognizeSvgCaptcha = require('svg-captcha')
const readline = require('readline')

const { recognize } = require('./index')

const testRecognize = async (runTime) => {
  let needTime = parseInt(runTime)

  let succ = 0
  let total = 0
  const startTime = Date.now()

  onShutdown(() => {
    const costTime = Date.now() - startTime
    console.log(`\n分析中断，识别成功数：${succ} / ${total} (${(succ / total * 100).toFixed(2)}%)，平均每次耗时${consumingToStr((costTime / total).toFixed(2))}`)
    process.exit(2)
  })

  console.log(`分析开始，即将分析${needTime || '不限'}次`)

  while (isNaN(needTime) || needTime > 0) {
    const captcha = recognizeSvgCaptcha.create()
    const recoText = recognize(captcha.data)
    if (recoText === captcha.text) {
      succ++
    }
    total++

    if (needTime) {
      needTime--
    }

    if (total % 100 === 0) {
      // 删除光标所在行
      readline.clearLine(process.stdout, 0)
      // 移动光标到行首
      readline.cursorTo(process.stdout, 0)

      const costTime = Date.now() - startTime
      process.stdout.write(
        `已分析${total}次，识别成功数：${succ} / ${total} (${(succ / total * 100).toFixed(2)}%)，总耗时${consumingToStr(costTime)}，平均每次耗时${consumingToStr((costTime / total).toFixed(2))}`,
        'utf-8'
      )

      // 如果这里不停一下，会永远在一个事件循环内不停遍历，在监听到ctrl+c时，就无法停止应用
      await wait(0)
    }
  }

  console.log(`\n分析完成，识别成功数：${succ} / ${total} (${(succ / total * 100).toFixed(2)}%)`)
}

/**
 * 侦听关闭本应用信号
 *
 * 使用 pm2 启动本项目时
 * pm2要重启或退出本应用时会发出这个事件
 *
 * 使用 node 启动本项目时
 * 按下 ctrl + c 时会发出这个事件
 *
 * ps. 这里面必须在最后执行 process.exit() ，否则本应用无法停止
 * ps. 如果正在一个事件循环里执行遍历，该回调无法触发，也就无法停止应用。因为js的事件循环不会被打断，在此情况下，不建议侦听应用关闭的信号
 * */
const onShutdown = (callback) => {
  // 其它情况这个有效
  process.on('SIGINT', callback)
  // 当上面那个无效时，这个有效 https://pm2.io/doc/en/runtime/best-practices/graceful-shutdown/#windows-graceful-stop
  process.on('message', async (msg) => {
    if (msg === 'shutdown') {
      callback()
    }
  })
}

// 把毫秒转为合适的度量单位
const consumingToStr = function (msec) {
  const sec = (msec / 1000) | 0
  const min = (sec / 60) | 0
  const hour = (min / 60) | 0
  const day = (hour / 24) | 0
  const year = (day / 365) | 0
  const r = {
    total: msec,
    msec: msec % 1000,
    sec: sec % 60,
    min: min % 60,
    hour: hour % 24,
    day: day % 365,
    year: year
  }

  const msgArr = []

  r.year && msgArr.push(`${r.year} year`)
  r.day && msgArr.push(`${r.day} day`)
  r.hour && msgArr.push(`${r.hour} hour`)
  r.min && msgArr.push(`${r.min} minute`)
  r.sec && msgArr.push(`${r.sec} second`)
  r.msec && msgArr.push(`${r.msec} ms`)

  return msgArr.join(' ')
}

const wait = msec => new Promise(resolve => setTimeout(resolve, msec))

const runTime = process.argv[2]
testRecognize(runTime).then(async () => {
  console.log('执行完成')
  await wait(1000)
  process.exit(0)
}).catch(async (err) => {
  console.error('致命错误', err.stack)
  await wait(1000)
  process.exit(1)
})
