export function patchStyle(el, prev, next) {
    const style = el.style;
    if (!next) {
        el.removeAttribute('style');
    } else {
        if (prev) {
            for (const key in prev) {
                if (!next[key]) {
                    style[key] = '';
                }
            }
        }
        for (const key in next) {
            style[key] = next[key];
        }
    }
}