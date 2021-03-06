(function () {
    let env = null;
    let Ys = f=>g=>(x=>y=>x(y)(x))(x=>y=>f(n=>x(y)(x)(n)))(x=>y=>g(n=>x(y)(x)(n)));
    if('undefined' !== typeof exports && 'undefined' !== typeof module && !!module.exports) {
        exports = module.exports = xmlnode;
        env = 'module';
    } else {
        window.xmlnode = xmlnode;
        env = 'browser';
    }
    const util = {
        tagStore: new Set(),
        tagLog: function(tag) {
            if(!!tag)
                this.tagStore.add(tag);
        },
        printLog: function() {
            console.log(this.tagStore);
        },
        indent: function (n) {
            let ret = '';
            for(let i=0; i<n; i++) ret+='\t';
            return ret;
        },
        getNodeTypeDesc: function(type) {
            return nodeType[type];
        },
        logStore: new Map(),
        putLog: function(o) {
            this.logStore.set(new Date(), o);
        },
        dumpLog: function() {
            console.log(this.logStore);
            this.logStore.clear();
        },
        resultStore: {}
    };

    const nodeType = [
        '',
        'ELEMENT_NODE',
        'ATTRIBUTE_NODE',
        'TEXT_NODE',
        'CDATA_SECTION_NODE',
        'ENTITY_REFERENCE_NODE',
        'ENTITY_NODE',
        'PROCESSING_INSTRUCTION_NODE',
        'COMMENT_NODE',
        'DOCUMENT_NODE',
        'DOCUMENT_TYPE_NODE',
        'DOCUMENT_FRAGMENT_NODE',
        'NOTATION_NODE'
    ];
    
    const tagRunner = {
        'default': function(target) {
            console.log(util.indent(target.depth) + '* ' + `${!!target.parent?target.parent.tag:''} => ${target.tag} (${nodeType[target.type]}), value: ${target.val.substr(0, 30)} ..., depth: ${target.depth}`);
            if(!!target.attr) console.log(util.indent(target.depth) + '    attrbutes: ' + JSON.stringify(target.attr).substr(0, 50) + '...');
            if(!!target.child)
                target.child.forEach(c => c.run());
            util.tagLog(target.tag);
        }
    };
    
    xmlnode.utils = util;
    var debug = false;
    
    function xmlnode(data, dSwitch) {
        if(!!dSwitch) debug = true;
        let doc = null;
        if('undefined' !== typeof DOMParser) {
            doc = new DOMParser().parseFromString(data);
        } else {
            if(env === 'module') {
                let DOMParser = require('xmldom').DOMParser;
                doc = new DOMParser().parseFromString(data);
            } else {
                throw new Error('DOMParser not found.');
            }
        }
        let root = new Node(null, doc.nodeType, doc.tagName, doc.attributes, doc.nodeValue, doc.childNodes, 0);
        doc = null;
        return root;
    }
    
    function Node(parent, type, tag, attrs, val, child, depth) {
        this.type = type;
        this.depth = depth;
        if(!!parent) this.parent = parent;
        if(!!tag) this.tag = tag;
        if(!!attrs) {
            this.attr = {};
            for(let i=0; i<attrs.length; i++) {
                this.attr[attrs.item(i).name] = attrs.item(i).value;
            }
        }
        this.val = '';
        if(!!child) {
            this.child = [];
            for(let i=0; i<child.length; i++) {
                switch(child[i].nodeType) {
                    case 1:
                    case 4:
                    case 7:
                    case 9:
                        this.child.push(new Node(this, child[i].nodeType, child[i].tagName, child[i].attributes, child[i].nodeValue, child[i].childNodes, depth+1));
                        break;
                    case 8:
                        this.child.push(new Node(this, child[i].nodeType, child[i].tagName, child[i].attributes, child[i].data, child[i].childNodes, depth+1));
                        break;
                    case 2:
                        this.attr[child[i].nodeName] = child[i].nodeValue;
                    case 3:
                        if(!!child[i].nodeValue && child[i].nodeValue.trim().length > 0) this.val += `${child[i].nodeValue.trim()}`;
                        break;
                    default:
                        console.log('node type: ', child[i].nodeType);
                        break;
                }
            }
        }
        
        this.run = function(that, result) {
            if(!that) that = this;
            let ret = !!result ? result : {};
            if(debug && that.depth === 0 && env !== 'browser') util.putLog(process.memoryUsage());
            if(!!that.tag && !!tagRunner[that.tag]) {
                ret = tagRunner[that.tag](that);
            } else {
                ret = tagRunner['default'](that);
            }
            if(debug && that.depth === 0 && env !== 'browser') util.putLog(process.memoryUsage());
            if(debug && that.depth === 0 && env !== 'browser') util.dumpLog();
            return ret;
        };
        this.setRunner = function(tagName, func) {
            if('function' === typeof func) {
                tagRunner[tagName] = func;
            }
        }
    }
})();
