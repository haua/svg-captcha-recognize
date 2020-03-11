# svg-captcha-recognize svg-captcha验证码识别

## 项目说明

该项目不能用于任何盗刷行为，仅为证实svg-captcha生成的验证码是可以很轻易被破解的，
比位图的验证码更容易被破解，如果实在需要使用，请一定准备多套字体，并且经常更换，英文字体还是很容易找到的。

ps. 我已经给svg-captcha提了issue了，看他们的重视程度，应该会修复这个问题。

> issue 已经有回复了： https://github.com/produck/svg-captcha/issues/45
3.0会完全修复

**特点**：
1. 识别正确率100%
2. 每次识别耗时最高都在1ms以内
3. 零依赖

缺点：
1. 仅支持 svg-captcha 默认的字体，如果用了自定义字体，需要重新生成字典
2. 目前是针对 svg-captcha 1.4.0 及以下版本做的，不排除他们更新后此方法无法识别

> Even though you can write a program that convert svg to png, svg captcha has done its job
  —— make captcha recognition harder 

> 所以SVG验证码可能比的图片普通验证码要更难识别，因为你必须先做SVG到其它格式的转化。

以上引用了svg-captcha文档的一句话，而我并没有把SVG转为其它格式，却做到了更快的验证码识别，并且识别率100%。

svg-captcha: https://www.npmjs.com/package/svg-captcha

## 用法

    const { recognize } = require('./index')
    const text = recognize(csvText) // 只需传入由svg-captcha生成的svg字符串
    console.log(text)

## 测试方法

    # 以下命令将不停地生成svg-captcha验证码，然后识别，
    # 最后对比识别出来的验证码与svg-captcha返回的是否一致，
    # 同时打印结果。当需要停止测试时，按下ctrl+c即可
    npm install
    node ./test.js
    # 已分析83200次，识别成功数：83200 / 83200 (100.00%)，总耗时53 second 530 ms，平均每次耗时0.64 ms
