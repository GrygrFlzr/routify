import { createNodeMiddleware } from '../../lib/utils/middleware'
export const assignAPI = createNodeMiddleware(({ file }) => {
    file.api = new ClientApi(file)
})

class ClientApi {
    constructor(file) {
        this.__file = file
        Object.defineProperty(this, '__file', { enumerable: false })
        this.isMeta = !!file.isMeta
        this.path = file.path
        this.title = _prettyName(file)
        this.meta = file.meta
    }

    get parent() { return !this.__file.root && this.__file.parent.api }
    get children() {
        return (this.__file.children || this.__file.isLayout && this.__file.parent.children || [])
            .filter(c => !c.isNonIndexable)
            .sort((a, b) => (a.meta.index || a.meta.title || a.path)
                .toString()
                .localeCompare(b.meta.index, undefined, { numeric: true, sensitivity: 'base' }))
            .map(({ api }) => api)
    }
    get next() { return _navigate(this, +1) }
    get prev() { return _navigate(this, -1) }
}

function _navigate(node, direction) {
    if (!node.__file.root) {
        const siblings = node.parent.children
        const index = siblings.indexOf(node)
        return node.parent.children[index + direction]
    }
}


function _prettyName(file) {
    if (typeof file.meta.title !== 'undefined') return file.meta.title
    else return (file.shortPath || file.path)
        .split('/')
        .pop()
        .replace(/-/g, ' ')
}

