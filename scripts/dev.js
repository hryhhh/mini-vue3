import minimist from "minimist";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from "esbuild";
import { log } from "console";

//node中的命令行参数通过process.argv获取
const args = minimist(process.argv.slice(2))

const __filename = fileURLToPath(import.meta.url)// 获取当前模块的文件名，适用于 ES 模块
const __dirname = dirname(__filename)//获取当前模块所在的目录名，适用于 ES 模块

const require = createRequire(import.meta.url)//require函数在 ES 模块中也可以加载 CommonJS 模块

const target = args._[0] || 'reactivity'//打包哪个项目
const format = args.f || 'iife'//打包后的模块规范

//入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)

const pkg = require(`../packages/${target}/package.json`)

esbuild.context({
    entryPoints: [entry],//入口文件
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),////输出文件
    bundle: true,//打包在一起
    platform: "browser",//打包后的模块规范
    sourcemap: true,
    format,
    globalName: pkg.buildOptions?.name,

}).then((ctx) => {
    console.log('watching...')
     ctx.watch()
})