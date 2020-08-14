# xmlrun
Convert xml to a tree of objects with a run function to traverse all of them

# usage

## in node.js

```
let xmlrun = require('xmlrun');
let runner = xmlrun('xml text');
runner.setRunner('default', function(target) {
    let result = {
        type: xmlrun.utils.getNodeTypeDesc(target.type),
        tagName: target.tag,
        attributes: target.attr,
        value: target.val,
        children: []
    }
    if(!!target.child) {
        result.children = target.child.reduce((acc, cur) => {
            acc.push(cur.run());
            return acc;
        }, []);
    }
    return result;
});
let result = runner.run();
console.log(JSON.stringify(result, null, 2));
```

# description

xmlrun use DOMParser provided by xmldom or browser env to build a node tree with a run method for each node. run the method with proper runner then the method will tranverse all node recursively. currently, it should be done by runner manually. 
