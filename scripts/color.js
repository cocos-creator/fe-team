// \x1B[31m 是一个转义序列，它将被您的终端拦截并指示它切换到红色
// \x1B[0m 表示重置终端颜色，使其在此之后不再继续成为所选颜色；
class Color {
    static bright(v) {
        return `\x1B[1m${v}\x1B[0m`; 
    }
    static grey(v) {
        return `\x1B[2m${v}\x1B[0m`; 
    }
    static italic(v) {
        return `\x1B[3m${v}\x1B[0m`; 
    }
    static underline(v) {
        return `\x1B[4m${v}\x1B[0m`; 
    }
    static reverse(v) {
        return `\x1B[7m${v}\x1B[0m`; 
    }
    static hidden(v) {
        return `\x1B[8m${v}\x1B[0m`; 
    }
    static black(v) {
        return `\x1B[30m${v}\x1B[0m`; 
    }
    static red(v) {
        return `\x1B[31m${v}\x1B[0m`; 
    }
    static green(v) {
        return `\x1B[32m${v}\x1B[0m`; 
    }
    static yellow(v) {
        return `\x1B[33m${v}\x1B[0m`; 
    }
    static blue(v) {
        return `\x1B[34m${v}\x1B[0m`; 
    }
    static white(v) {
        return `\x1B[37m${v}\x1B[0m`; 
    }
    static blackBG(v) {
        return `\x1B[40m${v}\x1B[0m`; 
    }
    static redBG(v) {
        return `\x1B[41m${v}\x1B[0m`; 
    }
    static blueBG(v) {
        return `\x1B[44m${v}\x1B[0m`; 
    }
    static whiteBG(v) {
        return `\x1B[47m${v}\x1B[0m`; 
    }
}
module.exports = {
    Color,
};