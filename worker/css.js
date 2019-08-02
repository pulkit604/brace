module.exports.id = 'ace/mode/css_worker';
module.exports.src ="\"no use strict\"!(function(window) {\n" +
    "if (typeof window.window != \"undefined\" && window.document)\n" +
    "    return;\n" +
    "if (window.require && window.define)\n" +
    "    return;\n" +
    "\n" +
    "if (!window.console) {\n" +
    "    window.console = function() {\n" +
    "        var msgs = Array.prototype.slice.call(arguments, 0);\n" +
    "        postMessage({type: \"log\", data: msgs});\n" +
    "    };\n" +
    "    window.console.error =\n" +
    "    window.console.warn = \n" +
    "    window.console.log =\n" +
    "    window.console.trace = window.console;\n" +
    "}\n" +
    "window.window = window;\n" +
    "window.ace = window;\n" +
    "\n" +
    "window.onerror = function(message, file, line, col, err) {\n" +
    "    postMessage({type: \"error\", data: {\n" +
    "        message: message,\n" +
    "        data: err.data,\n" +
    "        file: file,\n" +
    "        line: line, \n" +
    "        col: col,\n" +
    "        stack: err.stack\n" +
    "    }});\n" +
    "};\n" +
    "\n" +
    "window.normalizeModule = function(parentId, moduleName) {\n" +
    "    // normalize plugin requires\n" +
    "    if (moduleName.indexOf(\"!\") !== -1) {\n" +
    "        var chunks = moduleName.split(\"!\");\n" +
    "        return window.normalizeModule(parentId, chunks[0]) + \"!\" + window.normalizeModule(parentId, chunks[1]);\n" +
    "    }\n" +
    "    // normalize relative requires\n" +
    "    if (moduleName.charAt(0) == \".\") {\n" +
    "        var base = parentId.split(\"/\").slice(0, -1).join(\"/\");\n" +
    "        moduleName = (base ? base + \"/\" : \"\") + moduleName;\n" +
    "        \n" +
    "        while (moduleName.indexOf(\".\") !== -1 && previous != moduleName) {\n" +
    "            var previous = moduleName;\n" +
    "            moduleName = moduleName.replace(/^\\.\\//, \"\").replace(/\\/\\.\\//, \"/\").replace(/[^\\/]+\\/\\.\\.\\//, \"\");\n" +
    "        }\n" +
    "    }\n" +
    "    \n" +
    "    return moduleName;\n" +
    "};\n" +
    "\n" +
    "window.require = function require(parentId, id) {\n" +
    "    if (!id) {\n" +
    "        id = parentId;\n" +
    "        parentId = null;\n" +
    "    }\n" +
    "    if (!id.charAt)\n" +
    "        throw new Error(\"worker.js require() accepts only (parentId, id) as arguments\");\n" +
    "\n" +
    "    id = window.normalizeModule(parentId, id);\n" +
    "\n" +
    "    var module = window.require.modules[id];\n" +
    "    if (module) {\n" +
    "        if (!module.initialized) {\n" +
    "            module.initialized = true;\n" +
    "            module.exports = module.factory().exports;\n" +
    "        }\n" +
    "        return module.exports;\n" +
    "    }\n" +
    "   \n" +
    "    if (!window.require.tlns)\n" +
    "        return console.log(\"unable to load \" + id);\n" +
    "    \n" +
    "    var path = resolveModuleId(id, window.require.tlns);\n" +
    "    if (path.slice(-3) != \".js\") path += \".js\";\n" +
    "    \n" +
    "    window.require.id = id;\n" +
    "    window.require.modules[id] = {}; // prevent infinite loop on broken modules\n" +
    "    importScripts(path);\n" +
    "    return window.require(parentId, id);\n" +
    "};\n" +
    "function resolveModuleId(id, paths) {\n" +
    "    var testPath = id, tail = \"\";\n" +
    "    while (testPath) {\n" +
    "        var alias = paths[testPath];\n" +
    "        if (typeof alias == \"string\") {\n" +
    "            return alias + tail;\n" +
    "        } else if (alias) {\n" +
    "            return  alias.location.replace(/\\/*$/, \"/\") + (tail || alias.main || alias.name);\n" +
    "        } else if (alias === false) {\n" +
    "            return \"\";\n" +
    "        }\n" +
    "        var i = testPath.lastIndexOf(\"/\");\n" +
    "        if (i === -1) break;\n" +
    "        tail = testPath.substr(i) + tail;\n" +
    "        testPath = testPath.slice(0, i);\n" +
    "    }\n" +
    "    return id;\n" +
    "}\n" +
    "window.require.modules = {};\n" +
    "window.require.tlns = {};\n" +
    "\n" +
    "window.define = function(id, deps, factory) {\n" +
    "    if (arguments.length == 2) {\n" +
    "        factory = deps;\n" +
    "        if (typeof id != \"string\") {\n" +
    "            deps = id;\n" +
    "            id = window.require.id;\n" +
    "        }\n" +
    "    } else if (arguments.length == 1) {\n" +
    "        factory = id;\n" +
    "        deps = [];\n" +
    "        id = window.require.id;\n" +
    "    }\n" +
    "    \n" +
    "    if (typeof factory != \"function\") {\n" +
    "        window.require.modules[id] = {\n" +
    "            exports: factory,\n" +
    "            initialized: true\n" +
    "        };\n" +
    "        return;\n" +
    "    }\n" +
    "\n" +
    "    if (!deps.length)\n" +
    "        // If there is no dependencies, we inject \"require\", \"exports\" and\n" +
    "        // \"module\" as dependencies, to provide CommonJS compatibility.\n" +
    "        deps = [\"require\", \"exports\", \"module\"];\n" +
    "\n" +
    "    var req = function(childId) {\n" +
    "        return window.require(id, childId);\n" +
    "    };\n" +
    "\n" +
    "    window.require.modules[id] = {\n" +
    "        exports: {},\n" +
    "        factory: function() {\n" +
    "            var module = this;\n" +
    "            var returnExports = factory.apply(this, deps.slice(0, factory.length).map(function(dep) {\n" +
    "                switch (dep) {\n" +
    "                    // Because \"require\", \"exports\" and \"module\" aren't actual\n" +
    "                    // dependencies, we must handle them seperately.\n" +
    "                    case \"require\": return req;\n" +
    "                    case \"exports\": return module.exports;\n" +
    "                    case \"module\":  return module;\n" +
    "                    // But for all other dependencies, we can just go ahead and\n" +
    "                    // require them.\n" +
    "                    default:        return req(dep);\n" +
    "                }\n" +
    "            }));\n" +
    "            if (returnExports)\n" +
    "                module.exports = returnExports;\n" +
    "            return module;\n" +
    "        }\n" +
    "    };\n" +
    "};\n" +
    "window.define.amd = {};\n" +
    "require.tlns = {};\n" +
    "window.initBaseUrls  = function initBaseUrls(topLevelNamespaces) {\n" +
    "    for (var i in topLevelNamespaces)\n" +
    "        require.tlns[i] = topLevelNamespaces[i];\n" +
    "};\n" +
    "\n" +
    "window.initSender = function initSender() {\n" +
    "\n" +
    "    var EventEmitter = window.require(\"ace/lib/event_emitter\").EventEmitter;\n" +
    "    var oop = window.require(\"ace/lib/oop\");\n" +
    "    \n" +
    "    var Sender = function() {};\n" +
    "    \n" +
    "    (function() {\n" +
    "        \n" +
    "        oop.implement(this, EventEmitter);\n" +
    "                \n" +
    "        this.callback = function(data, callbackId) {\n" +
    "            postMessage({\n" +
    "                type: \"call\",\n" +
    "                id: callbackId,\n" +
    "                data: data\n" +
    "            });\n" +
    "        };\n" +
    "    \n" +
    "        this.emit = function(name, data) {\n" +
    "            postMessage({\n" +
    "                type: \"event\",\n" +
    "                name: name,\n" +
    "                data: data\n" +
    "            });\n" +
    "        };\n" +
    "        \n" +
    "    }).call(Sender.prototype);\n" +
    "    \n" +
    "    return new Sender();\n" +
    "};\n" +
    "\n" +
    "var main = window.main = null;\n" +
    "var sender = window.sender = null;\n" +
    "\n" +
    "window.onmessage = function(e) {\n" +
    "    var msg = e.data;\n" +
    "    if (msg.event && sender) {\n" +
    "        sender._signal(msg.event, msg.data);\n" +
    "    }\n" +
    "    else if (msg.command) {\n" +
    "        if (main[msg.command])\n" +
    "            main[msg.command].apply(main, msg.args);\n" +
    "        else if (window[msg.command])\n" +
    "            window[msg.command].apply(window, msg.args);\n" +
    "        else\n" +
    "            throw new Error(\"Unknown command:\" + msg.command);\n" +
    "    }\n" +
    "    else if (msg.init) {\n" +
    "        window.initBaseUrls(msg.tlns);\n" +
    "        require(\"ace/lib/es5-shim\");\n" +
    "        sender = window.sender = window.initSender();\n" +
    "        var clazz = require(msg.module)[msg.classname];\n" +
    "        main = window.main = new clazz(sender);\n" +
    "    }\n" +
    "};\n" +
    "})(this);\n" +
    "\n" +
    "define(\"ace/lib/oop\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "exports.inherits = function(ctor, superCtor) {\n" +
    "    ctor.super_ = superCtor;\n" +
    "    ctor.prototype = Object.create(superCtor.prototype, {\n" +
    "        constructor: {\n" +
    "            value: ctor,\n" +
    "            enumerable: false,\n" +
    "            writable: true,\n" +
    "            configurable: true\n" +
    "        }\n" +
    "    });\n" +
    "};\n" +
    "\n" +
    "exports.mixin = function(obj, mixin) {\n" +
    "    for (var key in mixin) {\n" +
    "        obj[key] = mixin[key];\n" +
    "    }\n" +
    "    return obj;\n" +
    "};\n" +
    "\n" +
    "exports.implement = function(proto, mixin) {\n" +
    "    exports.mixin(proto, mixin);\n" +
    "};\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/lib/lang\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "exports.last = function(a) {\n" +
    "    return a[a.length - 1];\n" +
    "};\n" +
    "\n" +
    "exports.stringReverse = function(string) {\n" +
    "    return string.split(\"\").reverse().join(\"\");\n" +
    "};\n" +
    "\n" +
    "exports.stringRepeat = function (string, count) {\n" +
    "    var result = '';\n" +
    "    while (count > 0) {\n" +
    "        if (count & 1)\n" +
    "            result += string;\n" +
    "\n" +
    "        if (count >>= 1)\n" +
    "            string += string;\n" +
    "    }\n" +
    "    return result;\n" +
    "};\n" +
    "\n" +
    "var trimBeginRegexp = /^\\s\\s*/;\n" +
    "var trimEndRegexp = /\\s\\s*$/;\n" +
    "\n" +
    "exports.stringTrimLeft = function (string) {\n" +
    "    return string.replace(trimBeginRegexp, '');\n" +
    "};\n" +
    "\n" +
    "exports.stringTrimRight = function (string) {\n" +
    "    return string.replace(trimEndRegexp, '');\n" +
    "};\n" +
    "\n" +
    "exports.copyObject = function(obj) {\n" +
    "    var copy = {};\n" +
    "    for (var key in obj) {\n" +
    "        copy[key] = obj[key];\n" +
    "    }\n" +
    "    return copy;\n" +
    "};\n" +
    "\n" +
    "exports.copyArray = function(array){\n" +
    "    var copy = [];\n" +
    "    for (var i=0, l=array.length; i<l; i++) {\n" +
    "        if (array[i] && typeof array[i] == \"object\")\n" +
    "            copy[i] = this.copyObject(array[i]);\n" +
    "        else \n" +
    "            copy[i] = array[i];\n" +
    "    }\n" +
    "    return copy;\n" +
    "};\n" +
    "\n" +
    "exports.deepCopy = function deepCopy(obj) {\n" +
    "    if (typeof obj !== \"object\" || !obj)\n" +
    "        return obj;\n" +
    "    var copy;\n" +
    "    if (Array.isArray(obj)) {\n" +
    "        copy = [];\n" +
    "        for (var key = 0; key < obj.length; key++) {\n" +
    "            copy[key] = deepCopy(obj[key]);\n" +
    "        }\n" +
    "        return copy;\n" +
    "    }\n" +
    "    if (Object.prototype.toString.call(obj) !== \"[object Object]\")\n" +
    "        return obj;\n" +
    "    \n" +
    "    copy = {};\n" +
    "    for (var key in obj)\n" +
    "        copy[key] = deepCopy(obj[key]);\n" +
    "    return copy;\n" +
    "};\n" +
    "\n" +
    "exports.arrayToMap = function(arr) {\n" +
    "    var map = {};\n" +
    "    for (var i=0; i<arr.length; i++) {\n" +
    "        map[arr[i]] = 1;\n" +
    "    }\n" +
    "    return map;\n" +
    "\n" +
    "};\n" +
    "\n" +
    "exports.createMap = function(props) {\n" +
    "    var map = Object.create(null);\n" +
    "    for (var i in props) {\n" +
    "        map[i] = props[i];\n" +
    "    }\n" +
    "    return map;\n" +
    "};\n" +
    "exports.arrayRemove = function(array, value) {\n" +
    "  for (var i = 0; i <= array.length; i++) {\n" +
    "    if (value === array[i]) {\n" +
    "      array.splice(i, 1);\n" +
    "    }\n" +
    "  }\n" +
    "};\n" +
    "\n" +
    "exports.escapeRegExp = function(str) {\n" +
    "    return str.replace(/([.*+?^${}()|[\\]\\/\\\\])/g, '\\\\$1');\n" +
    "};\n" +
    "\n" +
    "exports.escapeHTML = function(str) {\n" +
    "    return (\"\" + str).replace(/&/g, \"&#38;\").replace(/\"/g, \"&#34;\").replace(/'/g, \"&#39;\").replace(/</g, \"&#60;\");\n" +
    "};\n" +
    "\n" +
    "exports.getMatchOffsets = function(string, regExp) {\n" +
    "    var matches = [];\n" +
    "\n" +
    "    string.replace(regExp, function(str) {\n" +
    "        matches.push({\n" +
    "            offset: arguments[arguments.length-2],\n" +
    "            length: str.length\n" +
    "        });\n" +
    "    });\n" +
    "\n" +
    "    return matches;\n" +
    "};\n" +
    "exports.deferredCall = function(fcn) {\n" +
    "    var timer = null;\n" +
    "    var callback = function() {\n" +
    "        timer = null;\n" +
    "        fcn();\n" +
    "    };\n" +
    "\n" +
    "    var deferred = function(timeout) {\n" +
    "        deferred.cancel();\n" +
    "        timer = setTimeout(callback, timeout || 0);\n" +
    "        return deferred;\n" +
    "    };\n" +
    "\n" +
    "    deferred.schedule = deferred;\n" +
    "\n" +
    "    deferred.call = function() {\n" +
    "        this.cancel();\n" +
    "        fcn();\n" +
    "        return deferred;\n" +
    "    };\n" +
    "\n" +
    "    deferred.cancel = function() {\n" +
    "        clearTimeout(timer);\n" +
    "        timer = null;\n" +
    "        return deferred;\n" +
    "    };\n" +
    "    \n" +
    "    deferred.isPending = function() {\n" +
    "        return timer;\n" +
    "    };\n" +
    "\n" +
    "    return deferred;\n" +
    "};\n" +
    "\n" +
    "\n" +
    "exports.delayedCall = function(fcn, defaultTimeout) {\n" +
    "    var timer = null;\n" +
    "    var callback = function() {\n" +
    "        timer = null;\n" +
    "        fcn();\n" +
    "    };\n" +
    "\n" +
    "    var _self = function(timeout) {\n" +
    "        if (timer == null)\n" +
    "            timer = setTimeout(callback, timeout || defaultTimeout);\n" +
    "    };\n" +
    "\n" +
    "    _self.delay = function(timeout) {\n" +
    "        timer && clearTimeout(timer);\n" +
    "        timer = setTimeout(callback, timeout || defaultTimeout);\n" +
    "    };\n" +
    "    _self.schedule = _self;\n" +
    "\n" +
    "    _self.call = function() {\n" +
    "        this.cancel();\n" +
    "        fcn();\n" +
    "    };\n" +
    "\n" +
    "    _self.cancel = function() {\n" +
    "        timer && clearTimeout(timer);\n" +
    "        timer = null;\n" +
    "    };\n" +
    "\n" +
    "    _self.isPending = function() {\n" +
    "        return timer;\n" +
    "    };\n" +
    "\n" +
    "    return _self;\n" +
    "};\n" +
    "});\n" +
    "\n" +
    "define(\"ace/range\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "var comparePoints = function(p1, p2) {\n" +
    "    return p1.row - p2.row || p1.column - p2.column;\n" +
    "};\n" +
    "var Range = function(startRow, startColumn, endRow, endColumn) {\n" +
    "    this.start = {\n" +
    "        row: startRow,\n" +
    "        column: startColumn\n" +
    "    };\n" +
    "\n" +
    "    this.end = {\n" +
    "        row: endRow,\n" +
    "        column: endColumn\n" +
    "    };\n" +
    "};\n" +
    "\n" +
    "(function() {\n" +
    "    this.isEqual = function(range) {\n" +
    "        return this.start.row === range.start.row &&\n" +
    "            this.end.row === range.end.row &&\n" +
    "            this.start.column === range.start.column &&\n" +
    "            this.end.column === range.end.column;\n" +
    "    };\n" +
    "    this.toString = function() {\n" +
    "        return (\"Range: [\" + this.start.row + \"/\" + this.start.column +\n" +
    "            \"] -> [\" + this.end.row + \"/\" + this.end.column + \"]\");\n" +
    "    };\n" +
    "\n" +
    "    this.contains = function(row, column) {\n" +
    "        return this.compare(row, column) == 0;\n" +
    "    };\n" +
    "    this.compareRange = function(range) {\n" +
    "        var cmp,\n" +
    "            end = range.end,\n" +
    "            start = range.start;\n" +
    "\n" +
    "        cmp = this.compare(end.row, end.column);\n" +
    "        if (cmp == 1) {\n" +
    "            cmp = this.compare(start.row, start.column);\n" +
    "            if (cmp == 1) {\n" +
    "                return 2;\n" +
    "            } else if (cmp == 0) {\n" +
    "                return 1;\n" +
    "            } else {\n" +
    "                return 0;\n" +
    "            }\n" +
    "        } else if (cmp == -1) {\n" +
    "            return -2;\n" +
    "        } else {\n" +
    "            cmp = this.compare(start.row, start.column);\n" +
    "            if (cmp == -1) {\n" +
    "                return -1;\n" +
    "            } else if (cmp == 1) {\n" +
    "                return 42;\n" +
    "            } else {\n" +
    "                return 0;\n" +
    "            }\n" +
    "        }\n" +
    "    };\n" +
    "    this.comparePoint = function(p) {\n" +
    "        return this.compare(p.row, p.column);\n" +
    "    };\n" +
    "    this.containsRange = function(range) {\n" +
    "        return this.comparePoint(range.start) == 0 && this.comparePoint(range.end) == 0;\n" +
    "    };\n" +
    "    this.intersects = function(range) {\n" +
    "        var cmp = this.compareRange(range);\n" +
    "        return (cmp == -1 || cmp == 0 || cmp == 1);\n" +
    "    };\n" +
    "    this.isEnd = function(row, column) {\n" +
    "        return this.end.row == row && this.end.column == column;\n" +
    "    };\n" +
    "    this.isStart = function(row, column) {\n" +
    "        return this.start.row == row && this.start.column == column;\n" +
    "    };\n" +
    "    this.setStart = function(row, column) {\n" +
    "        if (typeof row == \"object\") {\n" +
    "            this.start.column = row.column;\n" +
    "            this.start.row = row.row;\n" +
    "        } else {\n" +
    "            this.start.row = row;\n" +
    "            this.start.column = column;\n" +
    "        }\n" +
    "    };\n" +
    "    this.setEnd = function(row, column) {\n" +
    "        if (typeof row == \"object\") {\n" +
    "            this.end.column = row.column;\n" +
    "            this.end.row = row.row;\n" +
    "        } else {\n" +
    "            this.end.row = row;\n" +
    "            this.end.column = column;\n" +
    "        }\n" +
    "    };\n" +
    "    this.inside = function(row, column) {\n" +
    "        if (this.compare(row, column) == 0) {\n" +
    "            if (this.isEnd(row, column) || this.isStart(row, column)) {\n" +
    "                return false;\n" +
    "            } else {\n" +
    "                return true;\n" +
    "            }\n" +
    "        }\n" +
    "        return false;\n" +
    "    };\n" +
    "    this.insideStart = function(row, column) {\n" +
    "        if (this.compare(row, column) == 0) {\n" +
    "            if (this.isEnd(row, column)) {\n" +
    "                return false;\n" +
    "            } else {\n" +
    "                return true;\n" +
    "            }\n" +
    "        }\n" +
    "        return false;\n" +
    "    };\n" +
    "    this.insideEnd = function(row, column) {\n" +
    "        if (this.compare(row, column) == 0) {\n" +
    "            if (this.isStart(row, column)) {\n" +
    "                return false;\n" +
    "            } else {\n" +
    "                return true;\n" +
    "            }\n" +
    "        }\n" +
    "        return false;\n" +
    "    };\n" +
    "    this.compare = function(row, column) {\n" +
    "        if (!this.isMultiLine()) {\n" +
    "            if (row === this.start.row) {\n" +
    "                return column < this.start.column ? -1 : (column > this.end.column ? 1 : 0);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        if (row < this.start.row)\n" +
    "            return -1;\n" +
    "\n" +
    "        if (row > this.end.row)\n" +
    "            return 1;\n" +
    "\n" +
    "        if (this.start.row === row)\n" +
    "            return column >= this.start.column ? 0 : -1;\n" +
    "\n" +
    "        if (this.end.row === row)\n" +
    "            return column <= this.end.column ? 0 : 1;\n" +
    "\n" +
    "        return 0;\n" +
    "    };\n" +
    "    this.compareStart = function(row, column) {\n" +
    "        if (this.start.row == row && this.start.column == column) {\n" +
    "            return -1;\n" +
    "        } else {\n" +
    "            return this.compare(row, column);\n" +
    "        }\n" +
    "    };\n" +
    "    this.compareEnd = function(row, column) {\n" +
    "        if (this.end.row == row && this.end.column == column) {\n" +
    "            return 1;\n" +
    "        } else {\n" +
    "            return this.compare(row, column);\n" +
    "        }\n" +
    "    };\n" +
    "    this.compareInside = function(row, column) {\n" +
    "        if (this.end.row == row && this.end.column == column) {\n" +
    "            return 1;\n" +
    "        } else if (this.start.row == row && this.start.column == column) {\n" +
    "            return -1;\n" +
    "        } else {\n" +
    "            return this.compare(row, column);\n" +
    "        }\n" +
    "    };\n" +
    "    this.clipRows = function(firstRow, lastRow) {\n" +
    "        if (this.end.row > lastRow)\n" +
    "            var end = {row: lastRow + 1, column: 0};\n" +
    "        else if (this.end.row < firstRow)\n" +
    "            var end = {row: firstRow, column: 0};\n" +
    "\n" +
    "        if (this.start.row > lastRow)\n" +
    "            var start = {row: lastRow + 1, column: 0};\n" +
    "        else if (this.start.row < firstRow)\n" +
    "            var start = {row: firstRow, column: 0};\n" +
    "\n" +
    "        return Range.fromPoints(start || this.start, end || this.end);\n" +
    "    };\n" +
    "    this.extend = function(row, column) {\n" +
    "        var cmp = this.compare(row, column);\n" +
    "\n" +
    "        if (cmp == 0)\n" +
    "            return this;\n" +
    "        else if (cmp == -1)\n" +
    "            var start = {row: row, column: column};\n" +
    "        else\n" +
    "            var end = {row: row, column: column};\n" +
    "\n" +
    "        return Range.fromPoints(start || this.start, end || this.end);\n" +
    "    };\n" +
    "\n" +
    "    this.isEmpty = function() {\n" +
    "        return (this.start.row === this.end.row && this.start.column === this.end.column);\n" +
    "    };\n" +
    "    this.isMultiLine = function() {\n" +
    "        return (this.start.row !== this.end.row);\n" +
    "    };\n" +
    "    this.clone = function() {\n" +
    "        return Range.fromPoints(this.start, this.end);\n" +
    "    };\n" +
    "    this.collapseRows = function() {\n" +
    "        if (this.end.column == 0)\n" +
    "            return new Range(this.start.row, 0, Math.max(this.start.row, this.end.row-1), 0);\n" +
    "        else\n" +
    "            return new Range(this.start.row, 0, this.end.row, 0);\n" +
    "    };\n" +
    "    this.toScreenRange = function(session) {\n" +
    "        var screenPosStart = session.documentToScreenPosition(this.start);\n" +
    "        var screenPosEnd = session.documentToScreenPosition(this.end);\n" +
    "\n" +
    "        return new Range(\n" +
    "            screenPosStart.row, screenPosStart.column,\n" +
    "            screenPosEnd.row, screenPosEnd.column\n" +
    "        );\n" +
    "    };\n" +
    "    this.moveBy = function(row, column) {\n" +
    "        this.start.row += row;\n" +
    "        this.start.column += column;\n" +
    "        this.end.row += row;\n" +
    "        this.end.column += column;\n" +
    "    };\n" +
    "\n" +
    "}).call(Range.prototype);\n" +
    "Range.fromPoints = function(start, end) {\n" +
    "    return new Range(start.row, start.column, end.row, end.column);\n" +
    "};\n" +
    "Range.comparePoints = comparePoints;\n" +
    "\n" +
    "Range.comparePoints = function(p1, p2) {\n" +
    "    return p1.row - p2.row || p1.column - p2.column;\n" +
    "};\n" +
    "\n" +
    "\n" +
    "exports.Range = Range;\n" +
    "});\n" +
    "\n" +
    "define(\"ace/apply_delta\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "function throwDeltaError(delta, errorText){\n" +
    "    console.log(\"Invalid Delta:\", delta);\n" +
    "    throw \"Invalid Delta: \" + errorText;\n" +
    "}\n" +
    "\n" +
    "function positionInDocument(docLines, position) {\n" +
    "    return position.row    >= 0 && position.row    <  docLines.length &&\n" +
    "           position.column >= 0 && position.column <= docLines[position.row].length;\n" +
    "}\n" +
    "\n" +
    "function validateDelta(docLines, delta) {\n" +
    "    if (delta.action != \"insert\" && delta.action != \"remove\")\n" +
    "        throwDeltaError(delta, \"delta.action must be 'insert' or 'remove'\");\n" +
    "    if (!(delta.lines instanceof Array))\n" +
    "        throwDeltaError(delta, \"delta.lines must be an Array\");\n" +
    "    if (!delta.start || !delta.end)\n" +
    "       throwDeltaError(delta, \"delta.start/end must be an present\");\n" +
    "    var start = delta.start;\n" +
    "    if (!positionInDocument(docLines, delta.start))\n" +
    "        throwDeltaError(delta, \"delta.start must be contained in document\");\n" +
    "    var end = delta.end;\n" +
    "    if (delta.action == \"remove\" && !positionInDocument(docLines, end))\n" +
    "        throwDeltaError(delta, \"delta.end must contained in document for 'remove' actions\");\n" +
    "    var numRangeRows = end.row - start.row;\n" +
    "    var numRangeLastLineChars = (end.column - (numRangeRows == 0 ? start.column : 0));\n" +
    "    if (numRangeRows != delta.lines.length - 1 || delta.lines[numRangeRows].length != numRangeLastLineChars)\n" +
    "        throwDeltaError(delta, \"delta.range must match delta lines\");\n" +
    "}\n" +
    "\n" +
    "exports.applyDelta = function(docLines, delta, doNotValidate) {\n" +
    "    \n" +
    "    var row = delta.start.row;\n" +
    "    var startColumn = delta.start.column;\n" +
    "    var line = docLines[row] || \"\";\n" +
    "    switch (delta.action) {\n" +
    "        case \"insert\":\n" +
    "            var lines = delta.lines;\n" +
    "            if (lines.length === 1) {\n" +
    "                docLines[row] = line.substring(0, startColumn) + delta.lines[0] + line.substring(startColumn);\n" +
    "            } else {\n" +
    "                var args = [row, 1].concat(delta.lines);\n" +
    "                docLines.splice.apply(docLines, args);\n" +
    "                docLines[row] = line.substring(0, startColumn) + docLines[row];\n" +
    "                docLines[row + delta.lines.length - 1] += line.substring(startColumn);\n" +
    "            }\n" +
    "            break;\n" +
    "        case \"remove\":\n" +
    "            var endColumn = delta.end.column;\n" +
    "            var endRow = delta.end.row;\n" +
    "            if (row === endRow) {\n" +
    "                docLines[row] = line.substring(0, startColumn) + line.substring(endColumn);\n" +
    "            } else {\n" +
    "                docLines.splice(\n" +
    "                    row, endRow - row + 1,\n" +
    "                    line.substring(0, startColumn) + docLines[endRow].substring(endColumn)\n" +
    "                );\n" +
    "            }\n" +
    "            break;\n" +
    "    }\n" +
    "};\n" +
    "});\n" +
    "\n" +
    "define(\"ace/lib/event_emitter\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "var EventEmitter = {};\n" +
    "var stopPropagation = function() { this.propagationStopped = true; };\n" +
    "var preventDefault = function() { this.defaultPrevented = true; };\n" +
    "\n" +
    "EventEmitter._emit =\n" +
    "EventEmitter._dispatchEvent = function(eventName, e) {\n" +
    "    this._eventRegistry || (this._eventRegistry = {});\n" +
    "    this._defaultHandlers || (this._defaultHandlers = {});\n" +
    "\n" +
    "    var listeners = this._eventRegistry[eventName] || [];\n" +
    "    var defaultHandler = this._defaultHandlers[eventName];\n" +
    "    if (!listeners.length && !defaultHandler)\n" +
    "        return;\n" +
    "\n" +
    "    if (typeof e != \"object\" || !e)\n" +
    "        e = {};\n" +
    "\n" +
    "    if (!e.type)\n" +
    "        e.type = eventName;\n" +
    "    if (!e.stopPropagation)\n" +
    "        e.stopPropagation = stopPropagation;\n" +
    "    if (!e.preventDefault)\n" +
    "        e.preventDefault = preventDefault;\n" +
    "\n" +
    "    listeners = listeners.slice();\n" +
    "    for (var i=0; i<listeners.length; i++) {\n" +
    "        listeners[i](e, this);\n" +
    "        if (e.propagationStopped)\n" +
    "            break;\n" +
    "    }\n" +
    "    \n" +
    "    if (defaultHandler && !e.defaultPrevented)\n" +
    "        return defaultHandler(e, this);\n" +
    "};\n" +
    "\n" +
    "\n" +
    "EventEmitter._signal = function(eventName, e) {\n" +
    "    var listeners = (this._eventRegistry || {})[eventName];\n" +
    "    if (!listeners)\n" +
    "        return;\n" +
    "    listeners = listeners.slice();\n" +
    "    for (var i=0; i<listeners.length; i++)\n" +
    "        listeners[i](e, this);\n" +
    "};\n" +
    "\n" +
    "EventEmitter.once = function(eventName, callback) {\n" +
    "    var _self = this;\n" +
    "    this.addEventListener(eventName, function newCallback() {\n" +
    "        _self.removeEventListener(eventName, newCallback);\n" +
    "        callback.apply(null, arguments);\n" +
    "    });\n" +
    "    if (!callback) {\n" +
    "        return new Promise(function(resolve) {\n" +
    "            callback = resolve;\n" +
    "        });\n" +
    "    }\n" +
    "};\n" +
    "\n" +
    "\n" +
    "EventEmitter.setDefaultHandler = function(eventName, callback) {\n" +
    "    var handlers = this._defaultHandlers;\n" +
    "    if (!handlers)\n" +
    "        handlers = this._defaultHandlers = {_disabled_: {}};\n" +
    "    \n" +
    "    if (handlers[eventName]) {\n" +
    "        var old = handlers[eventName];\n" +
    "        var disabled = handlers._disabled_[eventName];\n" +
    "        if (!disabled)\n" +
    "            handlers._disabled_[eventName] = disabled = [];\n" +
    "        disabled.push(old);\n" +
    "        var i = disabled.indexOf(callback);\n" +
    "        if (i != -1) \n" +
    "            disabled.splice(i, 1);\n" +
    "    }\n" +
    "    handlers[eventName] = callback;\n" +
    "};\n" +
    "EventEmitter.removeDefaultHandler = function(eventName, callback) {\n" +
    "    var handlers = this._defaultHandlers;\n" +
    "    if (!handlers)\n" +
    "        return;\n" +
    "    var disabled = handlers._disabled_[eventName];\n" +
    "    \n" +
    "    if (handlers[eventName] == callback) {\n" +
    "        if (disabled)\n" +
    "            this.setDefaultHandler(eventName, disabled.pop());\n" +
    "    } else if (disabled) {\n" +
    "        var i = disabled.indexOf(callback);\n" +
    "        if (i != -1)\n" +
    "            disabled.splice(i, 1);\n" +
    "    }\n" +
    "};\n" +
    "\n" +
    "EventEmitter.on =\n" +
    "EventEmitter.addEventListener = function(eventName, callback, capturing) {\n" +
    "    this._eventRegistry = this._eventRegistry || {};\n" +
    "\n" +
    "    var listeners = this._eventRegistry[eventName];\n" +
    "    if (!listeners)\n" +
    "        listeners = this._eventRegistry[eventName] = [];\n" +
    "\n" +
    "    if (listeners.indexOf(callback) == -1)\n" +
    "        listeners[capturing ? \"unshift\" : \"push\"](callback);\n" +
    "    return callback;\n" +
    "};\n" +
    "\n" +
    "EventEmitter.off =\n" +
    "EventEmitter.removeListener =\n" +
    "EventEmitter.removeEventListener = function(eventName, callback) {\n" +
    "    this._eventRegistry = this._eventRegistry || {};\n" +
    "\n" +
    "    var listeners = this._eventRegistry[eventName];\n" +
    "    if (!listeners)\n" +
    "        return;\n" +
    "\n" +
    "    var index = listeners.indexOf(callback);\n" +
    "    if (index !== -1)\n" +
    "        listeners.splice(index, 1);\n" +
    "};\n" +
    "\n" +
    "EventEmitter.removeAllListeners = function(eventName) {\n" +
    "    if (this._eventRegistry) this._eventRegistry[eventName] = [];\n" +
    "};\n" +
    "\n" +
    "exports.EventEmitter = EventEmitter;\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/anchor\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "var oop = require(\"./lib/oop\");\n" +
    "var EventEmitter = require(\"./lib/event_emitter\").EventEmitter;\n" +
    "\n" +
    "var Anchor = exports.Anchor = function(doc, row, column) {\n" +
    "    this.$onChange = this.onChange.bind(this);\n" +
    "    this.attach(doc);\n" +
    "    \n" +
    "    if (typeof column == \"undefined\")\n" +
    "        this.setPosition(row.row, row.column);\n" +
    "    else\n" +
    "        this.setPosition(row, column);\n" +
    "};\n" +
    "\n" +
    "(function() {\n" +
    "\n" +
    "    oop.implement(this, EventEmitter);\n" +
    "    this.getPosition = function() {\n" +
    "        return this.$clipPositionToDocument(this.row, this.column);\n" +
    "    };\n" +
    "    this.getDocument = function() {\n" +
    "        return this.document;\n" +
    "    };\n" +
    "    this.$insertRight = false;\n" +
    "    this.onChange = function(delta) {\n" +
    "        if (delta.start.row == delta.end.row && delta.start.row != this.row)\n" +
    "            return;\n" +
    "\n" +
    "        if (delta.start.row > this.row)\n" +
    "            return;\n" +
    "            \n" +
    "        var point = $getTransformedPoint(delta, {row: this.row, column: this.column}, this.$insertRight);\n" +
    "        this.setPosition(point.row, point.column, true);\n" +
    "    };\n" +
    "    \n" +
    "    function $pointsInOrder(point1, point2, equalPointsInOrder) {\n" +
    "        var bColIsAfter = equalPointsInOrder ? point1.column <= point2.column : point1.column < point2.column;\n" +
    "        return (point1.row < point2.row) || (point1.row == point2.row && bColIsAfter);\n" +
    "    }\n" +
    "            \n" +
    "    function $getTransformedPoint(delta, point, moveIfEqual) {\n" +
    "        var deltaIsInsert = delta.action == \"insert\";\n" +
    "        var deltaRowShift = (deltaIsInsert ? 1 : -1) * (delta.end.row    - delta.start.row);\n" +
    "        var deltaColShift = (deltaIsInsert ? 1 : -1) * (delta.end.column - delta.start.column);\n" +
    "        var deltaStart = delta.start;\n" +
    "        var deltaEnd = deltaIsInsert ? deltaStart : delta.end; // Collapse insert range.\n" +
    "        if ($pointsInOrder(point, deltaStart, moveIfEqual)) {\n" +
    "            return {\n" +
    "                row: point.row,\n" +
    "                column: point.column\n" +
    "            };\n" +
    "        }\n" +
    "        if ($pointsInOrder(deltaEnd, point, !moveIfEqual)) {\n" +
    "            return {\n" +
    "                row: point.row + deltaRowShift,\n" +
    "                column: point.column + (point.row == deltaEnd.row ? deltaColShift : 0)\n" +
    "            };\n" +
    "        }\n" +
    "        \n" +
    "        return {\n" +
    "            row: deltaStart.row,\n" +
    "            column: deltaStart.column\n" +
    "        };\n" +
    "    }\n" +
    "    this.setPosition = function(row, column, noClip) {\n" +
    "        var pos;\n" +
    "        if (noClip) {\n" +
    "            pos = {\n" +
    "                row: row,\n" +
    "                column: column\n" +
    "            };\n" +
    "        } else {\n" +
    "            pos = this.$clipPositionToDocument(row, column);\n" +
    "        }\n" +
    "\n" +
    "        if (this.row == pos.row && this.column == pos.column)\n" +
    "            return;\n" +
    "\n" +
    "        var old = {\n" +
    "            row: this.row,\n" +
    "            column: this.column\n" +
    "        };\n" +
    "\n" +
    "        this.row = pos.row;\n" +
    "        this.column = pos.column;\n" +
    "        this._signal(\"change\", {\n" +
    "            old: old,\n" +
    "            value: pos\n" +
    "        });\n" +
    "    };\n" +
    "    this.detach = function() {\n" +
    "        this.document.removeEventListener(\"change\", this.$onChange);\n" +
    "    };\n" +
    "    this.attach = function(doc) {\n" +
    "        this.document = doc || this.document;\n" +
    "        this.document.on(\"change\", this.$onChange);\n" +
    "    };\n" +
    "    this.$clipPositionToDocument = function(row, column) {\n" +
    "        var pos = {};\n" +
    "\n" +
    "        if (row >= this.document.getLength()) {\n" +
    "            pos.row = Math.max(0, this.document.getLength() - 1);\n" +
    "            pos.column = this.document.getLine(pos.row).length;\n" +
    "        }\n" +
    "        else if (row < 0) {\n" +
    "            pos.row = 0;\n" +
    "            pos.column = 0;\n" +
    "        }\n" +
    "        else {\n" +
    "            pos.row = row;\n" +
    "            pos.column = Math.min(this.document.getLine(pos.row).length, Math.max(0, column));\n" +
    "        }\n" +
    "\n" +
    "        if (column < 0)\n" +
    "            pos.column = 0;\n" +
    "\n" +
    "        return pos;\n" +
    "    };\n" +
    "\n" +
    "}).call(Anchor.prototype);\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/document\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "var oop = require(\"./lib/oop\");\n" +
    "var applyDelta = require(\"./apply_delta\").applyDelta;\n" +
    "var EventEmitter = require(\"./lib/event_emitter\").EventEmitter;\n" +
    "var Range = require(\"./range\").Range;\n" +
    "var Anchor = require(\"./anchor\").Anchor;\n" +
    "\n" +
    "var Document = function(textOrLines) {\n" +
    "    this.$lines = [\"\"];\n" +
    "    if (textOrLines.length === 0) {\n" +
    "        this.$lines = [\"\"];\n" +
    "    } else if (Array.isArray(textOrLines)) {\n" +
    "        this.insertMergedLines({row: 0, column: 0}, textOrLines);\n" +
    "    } else {\n" +
    "        this.insert({row: 0, column:0}, textOrLines);\n" +
    "    }\n" +
    "};\n" +
    "\n" +
    "(function() {\n" +
    "\n" +
    "    oop.implement(this, EventEmitter);\n" +
    "    this.setValue = function(text) {\n" +
    "        var len = this.getLength() - 1;\n" +
    "        this.remove(new Range(0, 0, len, this.getLine(len).length));\n" +
    "        this.insert({row: 0, column: 0}, text);\n" +
    "    };\n" +
    "    this.getValue = function() {\n" +
    "        return this.getAllLines().join(this.getNewLineCharacter());\n" +
    "    };\n" +
    "    this.createAnchor = function(row, column) {\n" +
    "        return new Anchor(this, row, column);\n" +
    "    };\n" +
    "    if (\"aaa\".split(/a/).length === 0) {\n" +
    "        this.$split = function(text) {\n" +
    "            return text.replace(/\\r\\n|\\r/g, \"\\n\").split(\"\\n\");\n" +
    "        };\n" +
    "    } else {\n" +
    "        this.$split = function(text) {\n" +
    "            return text.split(/\\r\\n|\\r|\\n/);\n" +
    "        };\n" +
    "    }\n" +
    "\n" +
    "\n" +
    "    this.$detectNewLine = function(text) {\n" +
    "        var match = text.match(/^.*?(\\r\\n|\\r|\\n)/m);\n" +
    "        this.$autoNewLine = match ? match[1] : \"\\n\";\n" +
    "        this._signal(\"changeNewLineMode\");\n" +
    "    };\n" +
    "    this.getNewLineCharacter = function() {\n" +
    "        switch (this.$newLineMode) {\n" +
    "          case \"windows\":\n" +
    "            return \"\\r\\n\";\n" +
    "          case \"unix\":\n" +
    "            return \"\\n\";\n" +
    "          default:\n" +
    "            return this.$autoNewLine || \"\\n\";\n" +
    "        }\n" +
    "    };\n" +
    "\n" +
    "    this.$autoNewLine = \"\";\n" +
    "    this.$newLineMode = \"auto\";\n" +
    "    this.setNewLineMode = function(newLineMode) {\n" +
    "        if (this.$newLineMode === newLineMode)\n" +
    "            return;\n" +
    "\n" +
    "        this.$newLineMode = newLineMode;\n" +
    "        this._signal(\"changeNewLineMode\");\n" +
    "    };\n" +
    "    this.getNewLineMode = function() {\n" +
    "        return this.$newLineMode;\n" +
    "    };\n" +
    "    this.isNewLine = function(text) {\n" +
    "        return (text == \"\\r\\n\" || text == \"\\r\" || text == \"\\n\");\n" +
    "    };\n" +
    "    this.getLine = function(row) {\n" +
    "        return this.$lines[row] || \"\";\n" +
    "    };\n" +
    "    this.getLines = function(firstRow, lastRow) {\n" +
    "        return this.$lines.slice(firstRow, lastRow + 1);\n" +
    "    };\n" +
    "    this.getAllLines = function() {\n" +
    "        return this.getLines(0, this.getLength());\n" +
    "    };\n" +
    "    this.getLength = function() {\n" +
    "        return this.$lines.length;\n" +
    "    };\n" +
    "    this.getTextRange = function(range) {\n" +
    "        return this.getLinesForRange(range).join(this.getNewLineCharacter());\n" +
    "    };\n" +
    "    this.getLinesForRange = function(range) {\n" +
    "        var lines;\n" +
    "        if (range.start.row === range.end.row) {\n" +
    "            lines = [this.getLine(range.start.row).substring(range.start.column, range.end.column)];\n" +
    "        } else {\n" +
    "            lines = this.getLines(range.start.row, range.end.row);\n" +
    "            lines[0] = (lines[0] || \"\").substring(range.start.column);\n" +
    "            var l = lines.length - 1;\n" +
    "            if (range.end.row - range.start.row == l)\n" +
    "                lines[l] = lines[l].substring(0, range.end.column);\n" +
    "        }\n" +
    "        return lines;\n" +
    "    };\n" +
    "    this.insertLines = function(row, lines) {\n" +
    "        console.warn(\"Use of document.insertLines is deprecated. Use the insertFullLines method instead.\");\n" +
    "        return this.insertFullLines(row, lines);\n" +
    "    };\n" +
    "    this.removeLines = function(firstRow, lastRow) {\n" +
    "        console.warn(\"Use of document.removeLines is deprecated. Use the removeFullLines method instead.\");\n" +
    "        return this.removeFullLines(firstRow, lastRow);\n" +
    "    };\n" +
    "    this.insertNewLine = function(position) {\n" +
    "        console.warn(\"Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead.\");\n" +
    "        return this.insertMergedLines(position, [\"\", \"\"]);\n" +
    "    };\n" +
    "    this.insert = function(position, text) {\n" +
    "        if (this.getLength() <= 1)\n" +
    "            this.$detectNewLine(text);\n" +
    "        \n" +
    "        return this.insertMergedLines(position, this.$split(text));\n" +
    "    };\n" +
    "    this.insertInLine = function(position, text) {\n" +
    "        var start = this.clippedPos(position.row, position.column);\n" +
    "        var end = this.pos(position.row, position.column + text.length);\n" +
    "        \n" +
    "        this.applyDelta({\n" +
    "            start: start,\n" +
    "            end: end,\n" +
    "            action: \"insert\",\n" +
    "            lines: [text]\n" +
    "        }, true);\n" +
    "        \n" +
    "        return this.clonePos(end);\n" +
    "    };\n" +
    "    \n" +
    "    this.clippedPos = function(row, column) {\n" +
    "        var length = this.getLength();\n" +
    "        if (row === undefined) {\n" +
    "            row = length;\n" +
    "        } else if (row < 0) {\n" +
    "            row = 0;\n" +
    "        } else if (row >= length) {\n" +
    "            row = length - 1;\n" +
    "            column = undefined;\n" +
    "        }\n" +
    "        var line = this.getLine(row);\n" +
    "        if (column == undefined)\n" +
    "            column = line.length;\n" +
    "        column = Math.min(Math.max(column, 0), line.length);\n" +
    "        return {row: row, column: column};\n" +
    "    };\n" +
    "    \n" +
    "    this.clonePos = function(pos) {\n" +
    "        return {row: pos.row, column: pos.column};\n" +
    "    };\n" +
    "    \n" +
    "    this.pos = function(row, column) {\n" +
    "        return {row: row, column: column};\n" +
    "    };\n" +
    "    \n" +
    "    this.$clipPosition = function(position) {\n" +
    "        var length = this.getLength();\n" +
    "        if (position.row >= length) {\n" +
    "            position.row = Math.max(0, length - 1);\n" +
    "            position.column = this.getLine(length - 1).length;\n" +
    "        } else {\n" +
    "            position.row = Math.max(0, position.row);\n" +
    "            position.column = Math.min(Math.max(position.column, 0), this.getLine(position.row).length);\n" +
    "        }\n" +
    "        return position;\n" +
    "    };\n" +
    "    this.insertFullLines = function(row, lines) {\n" +
    "        row = Math.min(Math.max(row, 0), this.getLength());\n" +
    "        var column = 0;\n" +
    "        if (row < this.getLength()) {\n" +
    "            lines = lines.concat([\"\"]);\n" +
    "            column = 0;\n" +
    "        } else {\n" +
    "            lines = [\"\"].concat(lines);\n" +
    "            row--;\n" +
    "            column = this.$lines[row].length;\n" +
    "        }\n" +
    "        this.insertMergedLines({row: row, column: column}, lines);\n" +
    "    };    \n" +
    "    this.insertMergedLines = function(position, lines) {\n" +
    "        var start = this.clippedPos(position.row, position.column);\n" +
    "        var end = {\n" +
    "            row: start.row + lines.length - 1,\n" +
    "            column: (lines.length == 1 ? start.column : 0) + lines[lines.length - 1].length\n" +
    "        };\n" +
    "        \n" +
    "        this.applyDelta({\n" +
    "            start: start,\n" +
    "            end: end,\n" +
    "            action: \"insert\",\n" +
    "            lines: lines\n" +
    "        });\n" +
    "        \n" +
    "        return this.clonePos(end);\n" +
    "    };\n" +
    "    this.remove = function(range) {\n" +
    "        var start = this.clippedPos(range.start.row, range.start.column);\n" +
    "        var end = this.clippedPos(range.end.row, range.end.column);\n" +
    "        this.applyDelta({\n" +
    "            start: start,\n" +
    "            end: end,\n" +
    "            action: \"remove\",\n" +
    "            lines: this.getLinesForRange({start: start, end: end})\n" +
    "        });\n" +
    "        return this.clonePos(start);\n" +
    "    };\n" +
    "    this.removeInLine = function(row, startColumn, endColumn) {\n" +
    "        var start = this.clippedPos(row, startColumn);\n" +
    "        var end = this.clippedPos(row, endColumn);\n" +
    "        \n" +
    "        this.applyDelta({\n" +
    "            start: start,\n" +
    "            end: end,\n" +
    "            action: \"remove\",\n" +
    "            lines: this.getLinesForRange({start: start, end: end})\n" +
    "        }, true);\n" +
    "        \n" +
    "        return this.clonePos(start);\n" +
    "    };\n" +
    "    this.removeFullLines = function(firstRow, lastRow) {\n" +
    "        firstRow = Math.min(Math.max(0, firstRow), this.getLength() - 1);\n" +
    "        lastRow  = Math.min(Math.max(0, lastRow ), this.getLength() - 1);\n" +
    "        var deleteFirstNewLine = lastRow == this.getLength() - 1 && firstRow > 0;\n" +
    "        var deleteLastNewLine  = lastRow  < this.getLength() - 1;\n" +
    "        var startRow = ( deleteFirstNewLine ? firstRow - 1                  : firstRow                    );\n" +
    "        var startCol = ( deleteFirstNewLine ? this.getLine(startRow).length : 0                           );\n" +
    "        var endRow   = ( deleteLastNewLine  ? lastRow + 1                   : lastRow                     );\n" +
    "        var endCol   = ( deleteLastNewLine  ? 0                             : this.getLine(endRow).length ); \n" +
    "        var range = new Range(startRow, startCol, endRow, endCol);\n" +
    "        var deletedLines = this.$lines.slice(firstRow, lastRow + 1);\n" +
    "        \n" +
    "        this.applyDelta({\n" +
    "            start: range.start,\n" +
    "            end: range.end,\n" +
    "            action: \"remove\",\n" +
    "            lines: this.getLinesForRange(range)\n" +
    "        });\n" +
    "        return deletedLines;\n" +
    "    };\n" +
    "    this.removeNewLine = function(row) {\n" +
    "        if (row < this.getLength() - 1 && row >= 0) {\n" +
    "            this.applyDelta({\n" +
    "                start: this.pos(row, this.getLine(row).length),\n" +
    "                end: this.pos(row + 1, 0),\n" +
    "                action: \"remove\",\n" +
    "                lines: [\"\", \"\"]\n" +
    "            });\n" +
    "        }\n" +
    "    };\n" +
    "    this.replace = function(range, text) {\n" +
    "        if (!(range instanceof Range))\n" +
    "            range = Range.fromPoints(range.start, range.end);\n" +
    "        if (text.length === 0 && range.isEmpty())\n" +
    "            return range.start;\n" +
    "        if (text == this.getTextRange(range))\n" +
    "            return range.end;\n" +
    "\n" +
    "        this.remove(range);\n" +
    "        var end;\n" +
    "        if (text) {\n" +
    "            end = this.insert(range.start, text);\n" +
    "        }\n" +
    "        else {\n" +
    "            end = range.start;\n" +
    "        }\n" +
    "        \n" +
    "        return end;\n" +
    "    };\n" +
    "    this.applyDeltas = function(deltas) {\n" +
    "        for (var i=0; i<deltas.length; i++) {\n" +
    "            this.applyDelta(deltas[i]);\n" +
    "        }\n" +
    "    };\n" +
    "    this.revertDeltas = function(deltas) {\n" +
    "        for (var i=deltas.length-1; i>=0; i--) {\n" +
    "            this.revertDelta(deltas[i]);\n" +
    "        }\n" +
    "    };\n" +
    "    this.applyDelta = function(delta, doNotValidate) {\n" +
    "        var isInsert = delta.action == \"insert\";\n" +
    "        if (isInsert ? delta.lines.length <= 1 && !delta.lines[0]\n" +
    "            : !Range.comparePoints(delta.start, delta.end)) {\n" +
    "            return;\n" +
    "        }\n" +
    "        \n" +
    "        if (isInsert && delta.lines.length > 20000) {\n" +
    "            this.$splitAndapplyLargeDelta(delta, 20000);\n" +
    "        }\n" +
    "        else {\n" +
    "            applyDelta(this.$lines, delta, doNotValidate);\n" +
    "            this._signal(\"change\", delta);\n" +
    "        }\n" +
    "    };\n" +
    "    \n" +
    "    this.$splitAndapplyLargeDelta = function(delta, MAX) {\n" +
    "        var lines = delta.lines;\n" +
    "        var l = lines.length - MAX + 1;\n" +
    "        var row = delta.start.row; \n" +
    "        var column = delta.start.column;\n" +
    "        for (var from = 0, to = 0; from < l; from = to) {\n" +
    "            to += MAX - 1;\n" +
    "            var chunk = lines.slice(from, to);\n" +
    "            chunk.push(\"\");\n" +
    "            this.applyDelta({\n" +
    "                start: this.pos(row + from, column),\n" +
    "                end: this.pos(row + to, column = 0),\n" +
    "                action: delta.action,\n" +
    "                lines: chunk\n" +
    "            }, true);\n" +
    "        }\n" +
    "        delta.lines = lines.slice(from);\n" +
    "        delta.start.row = row + from;\n" +
    "        delta.start.column = column;\n" +
    "        this.applyDelta(delta, true);\n" +
    "    };\n" +
    "    this.revertDelta = function(delta) {\n" +
    "        this.applyDelta({\n" +
    "            start: this.clonePos(delta.start),\n" +
    "            end: this.clonePos(delta.end),\n" +
    "            action: (delta.action == \"insert\" ? \"remove\" : \"insert\"),\n" +
    "            lines: delta.lines.slice()\n" +
    "        });\n" +
    "    };\n" +
    "    this.indexToPosition = function(index, startRow) {\n" +
    "        var lines = this.$lines || this.getAllLines();\n" +
    "        var newlineLength = this.getNewLineCharacter().length;\n" +
    "        for (var i = startRow || 0, l = lines.length; i < l; i++) {\n" +
    "            index -= lines[i].length + newlineLength;\n" +
    "            if (index < 0)\n" +
    "                return {row: i, column: index + lines[i].length + newlineLength};\n" +
    "        }\n" +
    "        return {row: l-1, column: index + lines[l-1].length + newlineLength};\n" +
    "    };\n" +
    "    this.positionToIndex = function(pos, startRow) {\n" +
    "        var lines = this.$lines || this.getAllLines();\n" +
    "        var newlineLength = this.getNewLineCharacter().length;\n" +
    "        var index = 0;\n" +
    "        var row = Math.min(pos.row, lines.length);\n" +
    "        for (var i = startRow || 0; i < row; ++i)\n" +
    "            index += lines[i].length + newlineLength;\n" +
    "\n" +
    "        return index + pos.column;\n" +
    "    };\n" +
    "\n" +
    "}).call(Document.prototype);\n" +
    "\n" +
    "exports.Document = Document;\n" +
    "});\n" +
    "\n" +
    "define(\"ace/worker/mirror\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "var Range = require(\"../range\").Range;\n" +
    "var Document = require(\"../document\").Document;\n" +
    "var lang = require(\"../lib/lang\");\n" +
    "    \n" +
    "var Mirror = exports.Mirror = function(sender) {\n" +
    "    this.sender = sender;\n" +
    "    var doc = this.doc = new Document(\"\");\n" +
    "    \n" +
    "    var deferredUpdate = this.deferredUpdate = lang.delayedCall(this.onUpdate.bind(this));\n" +
    "    \n" +
    "    var _self = this;\n" +
    "    sender.on(\"change\", function(e) {\n" +
    "        var data = e.data;\n" +
    "        if (data[0].start) {\n" +
    "            doc.applyDeltas(data);\n" +
    "        } else {\n" +
    "            for (var i = 0; i < data.length; i += 2) {\n" +
    "                if (Array.isArray(data[i+1])) {\n" +
    "                    var d = {action: \"insert\", start: data[i], lines: data[i+1]};\n" +
    "                } else {\n" +
    "                    var d = {action: \"remove\", start: data[i], end: data[i+1]};\n" +
    "                }\n" +
    "                doc.applyDelta(d, true);\n" +
    "            }\n" +
    "        }\n" +
    "        if (_self.$timeout)\n" +
    "            return deferredUpdate.schedule(_self.$timeout);\n" +
    "        _self.onUpdate();\n" +
    "    });\n" +
    "};\n" +
    "\n" +
    "(function() {\n" +
    "    \n" +
    "    this.$timeout = 500;\n" +
    "    \n" +
    "    this.setTimeout = function(timeout) {\n" +
    "        this.$timeout = timeout;\n" +
    "    };\n" +
    "    \n" +
    "    this.setValue = function(value) {\n" +
    "        this.doc.setValue(value);\n" +
    "        this.deferredUpdate.schedule(this.$timeout);\n" +
    "    };\n" +
    "    \n" +
    "    this.getValue = function(callbackId) {\n" +
    "        this.sender.callback(this.doc.getValue(), callbackId);\n" +
    "    };\n" +
    "    \n" +
    "    this.onUpdate = function() {\n" +
    "    };\n" +
    "    \n" +
    "    this.isPending = function() {\n" +
    "        return this.deferredUpdate.isPending();\n" +
    "    };\n" +
    "    \n" +
    "}).call(Mirror.prototype);\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/mode/css/csslint\",[], function(require, exports, module) {\n" +
    "var parserlib = {};\n" +
    "(function(){\n" +
    "function EventTarget(){\n" +
    "    this._listeners = {};\n" +
    "}\n" +
    "\n" +
    "EventTarget.prototype = {\n" +
    "    constructor: EventTarget,\n" +
    "    addListener: function(type, listener){\n" +
    "        if (!this._listeners[type]){\n" +
    "            this._listeners[type] = [];\n" +
    "        }\n" +
    "\n" +
    "        this._listeners[type].push(listener);\n" +
    "    },\n" +
    "    fire: function(event){\n" +
    "        if (typeof event == \"string\"){\n" +
    "            event = { type: event };\n" +
    "        }\n" +
    "        if (typeof event.target != \"undefined\"){\n" +
    "            event.target = this;\n" +
    "        }\n" +
    "\n" +
    "        if (typeof event.type == \"undefined\"){\n" +
    "            throw new Error(\"Event object missing 'type' property.\");\n" +
    "        }\n" +
    "\n" +
    "        if (this._listeners[event.type]){\n" +
    "            var listeners = this._listeners[event.type].concat();\n" +
    "            for (var i=0, len=listeners.length; i < len; i++){\n" +
    "                listeners[i].call(this, event);\n" +
    "            }\n" +
    "        }\n" +
    "    },\n" +
    "    removeListener: function(type, listener){\n" +
    "        if (this._listeners[type]){\n" +
    "            var listeners = this._listeners[type];\n" +
    "            for (var i=0, len=listeners.length; i < len; i++){\n" +
    "                if (listeners[i] === listener){\n" +
    "                    listeners.splice(i, 1);\n" +
    "                    break;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "\n" +
    "        }\n" +
    "    }\n" +
    "};\n" +
    "function StringReader(text){\n" +
    "    this._input = text.replace(/\\n\\r?/g, \"\\n\");\n" +
    "    this._line = 1;\n" +
    "    this._col = 1;\n" +
    "    this._cursor = 0;\n" +
    "}\n" +
    "\n" +
    "StringReader.prototype = {\n" +
    "    constructor: StringReader,\n" +
    "    getCol: function(){\n" +
    "        return this._col;\n" +
    "    },\n" +
    "    getLine: function(){\n" +
    "        return this._line ;\n" +
    "    },\n" +
    "    eof: function(){\n" +
    "        return (this._cursor == this._input.length);\n" +
    "    },\n" +
    "    peek: function(count){\n" +
    "        var c = null;\n" +
    "        count = (typeof count == \"undefined\" ? 1 : count);\n" +
    "        if (this._cursor < this._input.length){\n" +
    "            c = this._input.charAt(this._cursor + count - 1);\n" +
    "        }\n" +
    "\n" +
    "        return c;\n" +
    "    },\n" +
    "    read: function(){\n" +
    "        var c = null;\n" +
    "        if (this._cursor < this._input.length){\n" +
    "            if (this._input.charAt(this._cursor) == \"\\n\"){\n" +
    "                this._line++;\n" +
    "                this._col=1;\n" +
    "            } else {\n" +
    "                this._col++;\n" +
    "            }\n" +
    "            c = this._input.charAt(this._cursor++);\n" +
    "        }\n" +
    "\n" +
    "        return c;\n" +
    "    },\n" +
    "    mark: function(){\n" +
    "        this._bookmark = {\n" +
    "            cursor: this._cursor,\n" +
    "            line:   this._line,\n" +
    "            col:    this._col\n" +
    "        };\n" +
    "    },\n" +
    "\n" +
    "    reset: function(){\n" +
    "        if (this._bookmark){\n" +
    "            this._cursor = this._bookmark.cursor;\n" +
    "            this._line = this._bookmark.line;\n" +
    "            this._col = this._bookmark.col;\n" +
    "            delete this._bookmark;\n" +
    "        }\n" +
    "    },\n" +
    "    readTo: function(pattern){\n" +
    "\n" +
    "        var buffer = \"\",\n" +
    "            c;\n" +
    "        while (buffer.length < pattern.length || buffer.lastIndexOf(pattern) != buffer.length - pattern.length){\n" +
    "            c = this.read();\n" +
    "            if (c){\n" +
    "                buffer += c;\n" +
    "            } else {\n" +
    "                throw new Error(\"Expected \\\"\" + pattern + \"\\\" at line \" + this._line  + \", col \" + this._col + \".\");\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return buffer;\n" +
    "\n" +
    "    },\n" +
    "    readWhile: function(filter){\n" +
    "\n" +
    "        var buffer = \"\",\n" +
    "            c = this.read();\n" +
    "\n" +
    "        while(c !== null && filter(c)){\n" +
    "            buffer += c;\n" +
    "            c = this.read();\n" +
    "        }\n" +
    "\n" +
    "        return buffer;\n" +
    "\n" +
    "    },\n" +
    "    readMatch: function(matcher){\n" +
    "\n" +
    "        var source = this._input.substring(this._cursor),\n" +
    "            value = null;\n" +
    "        if (typeof matcher == \"string\"){\n" +
    "            if (source.indexOf(matcher) === 0){\n" +
    "                value = this.readCount(matcher.length);\n" +
    "            }\n" +
    "        } else if (matcher instanceof RegExp){\n" +
    "            if (matcher.test(source)){\n" +
    "                value = this.readCount(RegExp.lastMatch.length);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return value;\n" +
    "    },\n" +
    "    readCount: function(count){\n" +
    "        var buffer = \"\";\n" +
    "\n" +
    "        while(count--){\n" +
    "            buffer += this.read();\n" +
    "        }\n" +
    "\n" +
    "        return buffer;\n" +
    "    }\n" +
    "\n" +
    "};\n" +
    "function SyntaxError(message, line, col){\n" +
    "    this.col = col;\n" +
    "    this.line = line;\n" +
    "    this.message = message;\n" +
    "\n" +
    "}\n" +
    "SyntaxError.prototype = new Error();\n" +
    "function SyntaxUnit(text, line, col, type){\n" +
    "    this.col = col;\n" +
    "    this.line = line;\n" +
    "    this.text = text;\n" +
    "    this.type = type;\n" +
    "}\n" +
    "SyntaxUnit.fromToken = function(token){\n" +
    "    return new SyntaxUnit(token.value, token.startLine, token.startCol);\n" +
    "};\n" +
    "\n" +
    "SyntaxUnit.prototype = {\n" +
    "    constructor: SyntaxUnit,\n" +
    "    valueOf: function(){\n" +
    "        return this.text;\n" +
    "    },\n" +
    "    toString: function(){\n" +
    "        return this.text;\n" +
    "    }\n" +
    "\n" +
    "};\n" +
    "function TokenStreamBase(input, tokenData){\n" +
    "    this._reader = input ? new StringReader(input.toString()) : null;\n" +
    "    this._token = null;\n" +
    "    this._tokenData = tokenData;\n" +
    "    this._lt = [];\n" +
    "    this._ltIndex = 0;\n" +
    "\n" +
    "    this._ltIndexCache = [];\n" +
    "}\n" +
    "TokenStreamBase.createTokenData = function(tokens){\n" +
    "\n" +
    "    var nameMap     = [],\n" +
    "        typeMap     = {},\n" +
    "        tokenData     = tokens.concat([]),\n" +
    "        i            = 0,\n" +
    "        len            = tokenData.length+1;\n" +
    "\n" +
    "    tokenData.UNKNOWN = -1;\n" +
    "    tokenData.unshift({name:\"EOF\"});\n" +
    "\n" +
    "    for (; i < len; i++){\n" +
    "        nameMap.push(tokenData[i].name);\n" +
    "        tokenData[tokenData[i].name] = i;\n" +
    "        if (tokenData[i].text){\n" +
    "            typeMap[tokenData[i].text] = i;\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "    tokenData.name = function(tt){\n" +
    "        return nameMap[tt];\n" +
    "    };\n" +
    "\n" +
    "    tokenData.type = function(c){\n" +
    "        return typeMap[c];\n" +
    "    };\n" +
    "\n" +
    "    return tokenData;\n" +
    "};\n" +
    "\n" +
    "TokenStreamBase.prototype = {\n" +
    "    constructor: TokenStreamBase,\n" +
    "    match: function(tokenTypes, channel){\n" +
    "        if (!(tokenTypes instanceof Array)){\n" +
    "            tokenTypes = [tokenTypes];\n" +
    "        }\n" +
    "\n" +
    "        var tt  = this.get(channel),\n" +
    "            i   = 0,\n" +
    "            len = tokenTypes.length;\n" +
    "\n" +
    "        while(i < len){\n" +
    "            if (tt == tokenTypes[i++]){\n" +
    "                return true;\n" +
    "            }\n" +
    "        }\n" +
    "        this.unget();\n" +
    "        return false;\n" +
    "    },\n" +
    "    mustMatch: function(tokenTypes, channel){\n" +
    "\n" +
    "        var token;\n" +
    "        if (!(tokenTypes instanceof Array)){\n" +
    "            tokenTypes = [tokenTypes];\n" +
    "        }\n" +
    "\n" +
    "        if (!this.match.apply(this, arguments)){\n" +
    "            token = this.LT(1);\n" +
    "            throw new SyntaxError(\"Expected \" + this._tokenData[tokenTypes[0]].name +\n" +
    "                \" at line \" + token.startLine + \", col \" + token.startCol + \".\", token.startLine, token.startCol);\n" +
    "        }\n" +
    "    },\n" +
    "    advance: function(tokenTypes, channel){\n" +
    "\n" +
    "        while(this.LA(0) !== 0 && !this.match(tokenTypes, channel)){\n" +
    "            this.get();\n" +
    "        }\n" +
    "\n" +
    "        return this.LA(0);\n" +
    "    },\n" +
    "    get: function(channel){\n" +
    "\n" +
    "        var tokenInfo   = this._tokenData,\n" +
    "            reader      = this._reader,\n" +
    "            value,\n" +
    "            i           =0,\n" +
    "            len         = tokenInfo.length,\n" +
    "            found       = false,\n" +
    "            token,\n" +
    "            info;\n" +
    "        if (this._lt.length && this._ltIndex >= 0 && this._ltIndex < this._lt.length){\n" +
    "\n" +
    "            i++;\n" +
    "            this._token = this._lt[this._ltIndex++];\n" +
    "            info = tokenInfo[this._token.type];\n" +
    "            while((info.channel !== undefined && channel !== info.channel) &&\n" +
    "                    this._ltIndex < this._lt.length){\n" +
    "                this._token = this._lt[this._ltIndex++];\n" +
    "                info = tokenInfo[this._token.type];\n" +
    "                i++;\n" +
    "            }\n" +
    "            if ((info.channel === undefined || channel === info.channel) &&\n" +
    "                    this._ltIndex <= this._lt.length){\n" +
    "                this._ltIndexCache.push(i);\n" +
    "                return this._token.type;\n" +
    "            }\n" +
    "        }\n" +
    "        token = this._getToken();\n" +
    "        if (token.type > -1 && !tokenInfo[token.type].hide){\n" +
    "            token.channel = tokenInfo[token.type].channel;\n" +
    "            this._token = token;\n" +
    "            this._lt.push(token);\n" +
    "            this._ltIndexCache.push(this._lt.length - this._ltIndex + i);\n" +
    "            if (this._lt.length > 5){\n" +
    "                this._lt.shift();\n" +
    "            }\n" +
    "            if (this._ltIndexCache.length > 5){\n" +
    "                this._ltIndexCache.shift();\n" +
    "            }\n" +
    "            this._ltIndex = this._lt.length;\n" +
    "        }\n" +
    "        info = tokenInfo[token.type];\n" +
    "        if (info &&\n" +
    "                (info.hide ||\n" +
    "                (info.channel !== undefined && channel !== info.channel))){\n" +
    "            return this.get(channel);\n" +
    "        } else {\n" +
    "            return token.type;\n" +
    "        }\n" +
    "    },\n" +
    "    LA: function(index){\n" +
    "        var total = index,\n" +
    "            tt;\n" +
    "        if (index > 0){\n" +
    "            if (index > 5){\n" +
    "                throw new Error(\"Too much lookahead.\");\n" +
    "            }\n" +
    "            while(total){\n" +
    "                tt = this.get();\n" +
    "                total--;\n" +
    "            }\n" +
    "            while(total < index){\n" +
    "                this.unget();\n" +
    "                total++;\n" +
    "            }\n" +
    "        } else if (index < 0){\n" +
    "\n" +
    "            if(this._lt[this._ltIndex+index]){\n" +
    "                tt = this._lt[this._ltIndex+index].type;\n" +
    "            } else {\n" +
    "                throw new Error(\"Too much lookbehind.\");\n" +
    "            }\n" +
    "\n" +
    "        } else {\n" +
    "            tt = this._token.type;\n" +
    "        }\n" +
    "\n" +
    "        return tt;\n" +
    "\n" +
    "    },\n" +
    "    LT: function(index){\n" +
    "        this.LA(index);\n" +
    "        return this._lt[this._ltIndex+index-1];\n" +
    "    },\n" +
    "    peek: function(){\n" +
    "        return this.LA(1);\n" +
    "    },\n" +
    "    token: function(){\n" +
    "        return this._token;\n" +
    "    },\n" +
    "    tokenName: function(tokenType){\n" +
    "        if (tokenType < 0 || tokenType > this._tokenData.length){\n" +
    "            return \"UNKNOWN_TOKEN\";\n" +
    "        } else {\n" +
    "            return this._tokenData[tokenType].name;\n" +
    "        }\n" +
    "    },\n" +
    "    tokenType: function(tokenName){\n" +
    "        return this._tokenData[tokenName] || -1;\n" +
    "    },\n" +
    "    unget: function(){\n" +
    "        if (this._ltIndexCache.length){\n" +
    "            this._ltIndex -= this._ltIndexCache.pop();//--;\n" +
    "            this._token = this._lt[this._ltIndex - 1];\n" +
    "        } else {\n" +
    "            throw new Error(\"Too much lookahead.\");\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "};\n" +
    "\n" +
    "\n" +
    "parserlib.util = {\n" +
    "StringReader: StringReader,\n" +
    "SyntaxError : SyntaxError,\n" +
    "SyntaxUnit  : SyntaxUnit,\n" +
    "EventTarget : EventTarget,\n" +
    "TokenStreamBase : TokenStreamBase\n" +
    "};\n" +
    "})();\n" +
    "(function(){\n" +
    "var EventTarget = parserlib.util.EventTarget,\n" +
    "TokenStreamBase = parserlib.util.TokenStreamBase,\n" +
    "StringReader = parserlib.util.StringReader,\n" +
    "SyntaxError = parserlib.util.SyntaxError,\n" +
    "SyntaxUnit  = parserlib.util.SyntaxUnit;\n" +
    "\n" +
    "var Colors = {\n" +
    "    aliceblue       :\"#f0f8ff\",\n" +
    "    antiquewhite    :\"#faebd7\",\n" +
    "    aqua            :\"#00ffff\",\n" +
    "    aquamarine      :\"#7fffd4\",\n" +
    "    azure           :\"#f0ffff\",\n" +
    "    beige           :\"#f5f5dc\",\n" +
    "    bisque          :\"#ffe4c4\",\n" +
    "    black           :\"#000000\",\n" +
    "    blanchedalmond  :\"#ffebcd\",\n" +
    "    blue            :\"#0000ff\",\n" +
    "    blueviolet      :\"#8a2be2\",\n" +
    "    brown           :\"#a52a2a\",\n" +
    "    burlywood       :\"#deb887\",\n" +
    "    cadetblue       :\"#5f9ea0\",\n" +
    "    chartreuse      :\"#7fff00\",\n" +
    "    chocolate       :\"#d2691e\",\n" +
    "    coral           :\"#ff7f50\",\n" +
    "    cornflowerblue  :\"#6495ed\",\n" +
    "    cornsilk        :\"#fff8dc\",\n" +
    "    crimson         :\"#dc143c\",\n" +
    "    cyan            :\"#00ffff\",\n" +
    "    darkblue        :\"#00008b\",\n" +
    "    darkcyan        :\"#008b8b\",\n" +
    "    darkgoldenrod   :\"#b8860b\",\n" +
    "    darkgray        :\"#a9a9a9\",\n" +
    "    darkgrey        :\"#a9a9a9\",\n" +
    "    darkgreen       :\"#006400\",\n" +
    "    darkkhaki       :\"#bdb76b\",\n" +
    "    darkmagenta     :\"#8b008b\",\n" +
    "    darkolivegreen  :\"#556b2f\",\n" +
    "    darkorange      :\"#ff8c00\",\n" +
    "    darkorchid      :\"#9932cc\",\n" +
    "    darkred         :\"#8b0000\",\n" +
    "    darksalmon      :\"#e9967a\",\n" +
    "    darkseagreen    :\"#8fbc8f\",\n" +
    "    darkslateblue   :\"#483d8b\",\n" +
    "    darkslategray   :\"#2f4f4f\",\n" +
    "    darkslategrey   :\"#2f4f4f\",\n" +
    "    darkturquoise   :\"#00ced1\",\n" +
    "    darkviolet      :\"#9400d3\",\n" +
    "    deeppink        :\"#ff1493\",\n" +
    "    deepskyblue     :\"#00bfff\",\n" +
    "    dimgray         :\"#696969\",\n" +
    "    dimgrey         :\"#696969\",\n" +
    "    dodgerblue      :\"#1e90ff\",\n" +
    "    firebrick       :\"#b22222\",\n" +
    "    floralwhite     :\"#fffaf0\",\n" +
    "    forestgreen     :\"#228b22\",\n" +
    "    fuchsia         :\"#ff00ff\",\n" +
    "    gainsboro       :\"#dcdcdc\",\n" +
    "    ghostwhite      :\"#f8f8ff\",\n" +
    "    gold            :\"#ffd700\",\n" +
    "    goldenrod       :\"#daa520\",\n" +
    "    gray            :\"#808080\",\n" +
    "    grey            :\"#808080\",\n" +
    "    green           :\"#008000\",\n" +
    "    greenyellow     :\"#adff2f\",\n" +
    "    honeydew        :\"#f0fff0\",\n" +
    "    hotpink         :\"#ff69b4\",\n" +
    "    indianred       :\"#cd5c5c\",\n" +
    "    indigo          :\"#4b0082\",\n" +
    "    ivory           :\"#fffff0\",\n" +
    "    khaki           :\"#f0e68c\",\n" +
    "    lavender        :\"#e6e6fa\",\n" +
    "    lavenderblush   :\"#fff0f5\",\n" +
    "    lawngreen       :\"#7cfc00\",\n" +
    "    lemonchiffon    :\"#fffacd\",\n" +
    "    lightblue       :\"#add8e6\",\n" +
    "    lightcoral      :\"#f08080\",\n" +
    "    lightcyan       :\"#e0ffff\",\n" +
    "    lightgoldenrodyellow  :\"#fafad2\",\n" +
    "    lightgray       :\"#d3d3d3\",\n" +
    "    lightgrey       :\"#d3d3d3\",\n" +
    "    lightgreen      :\"#90ee90\",\n" +
    "    lightpink       :\"#ffb6c1\",\n" +
    "    lightsalmon     :\"#ffa07a\",\n" +
    "    lightseagreen   :\"#20b2aa\",\n" +
    "    lightskyblue    :\"#87cefa\",\n" +
    "    lightslategray  :\"#778899\",\n" +
    "    lightslategrey  :\"#778899\",\n" +
    "    lightsteelblue  :\"#b0c4de\",\n" +
    "    lightyellow     :\"#ffffe0\",\n" +
    "    lime            :\"#00ff00\",\n" +
    "    limegreen       :\"#32cd32\",\n" +
    "    linen           :\"#faf0e6\",\n" +
    "    magenta         :\"#ff00ff\",\n" +
    "    maroon          :\"#800000\",\n" +
    "    mediumaquamarine:\"#66cdaa\",\n" +
    "    mediumblue      :\"#0000cd\",\n" +
    "    mediumorchid    :\"#ba55d3\",\n" +
    "    mediumpurple    :\"#9370d8\",\n" +
    "    mediumseagreen  :\"#3cb371\",\n" +
    "    mediumslateblue :\"#7b68ee\",\n" +
    "    mediumspringgreen   :\"#00fa9a\",\n" +
    "    mediumturquoise :\"#48d1cc\",\n" +
    "    mediumvioletred :\"#c71585\",\n" +
    "    midnightblue    :\"#191970\",\n" +
    "    mintcream       :\"#f5fffa\",\n" +
    "    mistyrose       :\"#ffe4e1\",\n" +
    "    moccasin        :\"#ffe4b5\",\n" +
    "    navajowhite     :\"#ffdead\",\n" +
    "    navy            :\"#000080\",\n" +
    "    oldlace         :\"#fdf5e6\",\n" +
    "    olive           :\"#808000\",\n" +
    "    olivedrab       :\"#6b8e23\",\n" +
    "    orange          :\"#ffa500\",\n" +
    "    orangered       :\"#ff4500\",\n" +
    "    orchid          :\"#da70d6\",\n" +
    "    palegoldenrod   :\"#eee8aa\",\n" +
    "    palegreen       :\"#98fb98\",\n" +
    "    paleturquoise   :\"#afeeee\",\n" +
    "    palevioletred   :\"#d87093\",\n" +
    "    papayawhip      :\"#ffefd5\",\n" +
    "    peachpuff       :\"#ffdab9\",\n" +
    "    peru            :\"#cd853f\",\n" +
    "    pink            :\"#ffc0cb\",\n" +
    "    plum            :\"#dda0dd\",\n" +
    "    powderblue      :\"#b0e0e6\",\n" +
    "    purple          :\"#800080\",\n" +
    "    red             :\"#ff0000\",\n" +
    "    rosybrown       :\"#bc8f8f\",\n" +
    "    royalblue       :\"#4169e1\",\n" +
    "    saddlebrown     :\"#8b4513\",\n" +
    "    salmon          :\"#fa8072\",\n" +
    "    sandybrown      :\"#f4a460\",\n" +
    "    seagreen        :\"#2e8b57\",\n" +
    "    seashell        :\"#fff5ee\",\n" +
    "    sienna          :\"#a0522d\",\n" +
    "    silver          :\"#c0c0c0\",\n" +
    "    skyblue         :\"#87ceeb\",\n" +
    "    slateblue       :\"#6a5acd\",\n" +
    "    slategray       :\"#708090\",\n" +
    "    slategrey       :\"#708090\",\n" +
    "    snow            :\"#fffafa\",\n" +
    "    springgreen     :\"#00ff7f\",\n" +
    "    steelblue       :\"#4682b4\",\n" +
    "    tan             :\"#d2b48c\",\n" +
    "    teal            :\"#008080\",\n" +
    "    thistle         :\"#d8bfd8\",\n" +
    "    tomato          :\"#ff6347\",\n" +
    "    turquoise       :\"#40e0d0\",\n" +
    "    violet          :\"#ee82ee\",\n" +
    "    wheat           :\"#f5deb3\",\n" +
    "    white           :\"#ffffff\",\n" +
    "    whitesmoke      :\"#f5f5f5\",\n" +
    "    yellow          :\"#ffff00\",\n" +
    "    yellowgreen     :\"#9acd32\",\n" +
    "    activeBorder        :\"Active window border.\",\n" +
    "    activecaption       :\"Active window caption.\",\n" +
    "    appworkspace        :\"Background color of multiple document interface.\",\n" +
    "    background          :\"Desktop background.\",\n" +
    "    buttonface          :\"The face background color for 3-D elements that appear 3-D due to one layer of surrounding border.\",\n" +
    "    buttonhighlight     :\"The color of the border facing the light source for 3-D elements that appear 3-D due to one layer of surrounding border.\",\n" +
    "    buttonshadow        :\"The color of the border away from the light source for 3-D elements that appear 3-D due to one layer of surrounding border.\",\n" +
    "    buttontext          :\"Text on push buttons.\",\n" +
    "    captiontext         :\"Text in caption, size box, and scrollbar arrow box.\",\n" +
    "    graytext            :\"Grayed (disabled) text. This color is set to #000 if the current display driver does not support a solid gray color.\",\n" +
    "    greytext            :\"Greyed (disabled) text. This color is set to #000 if the current display driver does not support a solid grey color.\",\n" +
    "    highlight           :\"Item(s) selected in a control.\",\n" +
    "    highlighttext       :\"Text of item(s) selected in a control.\",\n" +
    "    inactiveborder      :\"Inactive window border.\",\n" +
    "    inactivecaption     :\"Inactive window caption.\",\n" +
    "    inactivecaptiontext :\"Color of text in an inactive caption.\",\n" +
    "    infobackground      :\"Background color for tooltip controls.\",\n" +
    "    infotext            :\"Text color for tooltip controls.\",\n" +
    "    menu                :\"Menu background.\",\n" +
    "    menutext            :\"Text in menus.\",\n" +
    "    scrollbar           :\"Scroll bar gray area.\",\n" +
    "    threeddarkshadow    :\"The color of the darker (generally outer) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.\",\n" +
    "    threedface          :\"The face background color for 3-D elements that appear 3-D due to two concentric layers of surrounding border.\",\n" +
    "    threedhighlight     :\"The color of the lighter (generally outer) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.\",\n" +
    "    threedlightshadow   :\"The color of the darker (generally inner) of the two borders facing the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.\",\n" +
    "    threedshadow        :\"The color of the lighter (generally inner) of the two borders away from the light source for 3-D elements that appear 3-D due to two concentric layers of surrounding border.\",\n" +
    "    window              :\"Window background.\",\n" +
    "    windowframe         :\"Window frame.\",\n" +
    "    windowtext          :\"Text in windows.\"\n" +
    "};\n" +
    "function Combinator(text, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, text, line, col, Parser.COMBINATOR_TYPE);\n" +
    "    this.type = \"unknown\";\n" +
    "    if (/^\\s+$/.test(text)){\n" +
    "        this.type = \"descendant\";\n" +
    "    } else if (text == \">\"){\n" +
    "        this.type = \"child\";\n" +
    "    } else if (text == \"+\"){\n" +
    "        this.type = \"adjacent-sibling\";\n" +
    "    } else if (text == \"~\"){\n" +
    "        this.type = \"sibling\";\n" +
    "    }\n" +
    "\n" +
    "}\n" +
    "\n" +
    "Combinator.prototype = new SyntaxUnit();\n" +
    "Combinator.prototype.constructor = Combinator;\n" +
    "function MediaFeature(name, value){\n" +
    "\n" +
    "    SyntaxUnit.call(this, \"(\" + name + (value !== null ? \":\" + value : \"\") + \")\", name.startLine, name.startCol, Parser.MEDIA_FEATURE_TYPE);\n" +
    "    this.name = name;\n" +
    "    this.value = value;\n" +
    "}\n" +
    "\n" +
    "MediaFeature.prototype = new SyntaxUnit();\n" +
    "MediaFeature.prototype.constructor = MediaFeature;\n" +
    "function MediaQuery(modifier, mediaType, features, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, (modifier ? modifier + \" \": \"\") + (mediaType ? mediaType : \"\") + (mediaType && features.length > 0 ? \" and \" : \"\") + features.join(\" and \"), line, col, Parser.MEDIA_QUERY_TYPE);\n" +
    "    this.modifier = modifier;\n" +
    "    this.mediaType = mediaType;\n" +
    "    this.features = features;\n" +
    "\n" +
    "}\n" +
    "\n" +
    "MediaQuery.prototype = new SyntaxUnit();\n" +
    "MediaQuery.prototype.constructor = MediaQuery;\n" +
    "function Parser(options){\n" +
    "    EventTarget.call(this);\n" +
    "\n" +
    "\n" +
    "    this.options = options || {};\n" +
    "\n" +
    "    this._tokenStream = null;\n" +
    "}\n" +
    "Parser.DEFAULT_TYPE = 0;\n" +
    "Parser.COMBINATOR_TYPE = 1;\n" +
    "Parser.MEDIA_FEATURE_TYPE = 2;\n" +
    "Parser.MEDIA_QUERY_TYPE = 3;\n" +
    "Parser.PROPERTY_NAME_TYPE = 4;\n" +
    "Parser.PROPERTY_VALUE_TYPE = 5;\n" +
    "Parser.PROPERTY_VALUE_PART_TYPE = 6;\n" +
    "Parser.SELECTOR_TYPE = 7;\n" +
    "Parser.SELECTOR_PART_TYPE = 8;\n" +
    "Parser.SELECTOR_SUB_PART_TYPE = 9;\n" +
    "\n" +
    "Parser.prototype = function(){\n" +
    "\n" +
    "    var proto = new EventTarget(),  //new prototype\n" +
    "        prop,\n" +
    "        additions =  {\n" +
    "            constructor: Parser,\n" +
    "            DEFAULT_TYPE : 0,\n" +
    "            COMBINATOR_TYPE : 1,\n" +
    "            MEDIA_FEATURE_TYPE : 2,\n" +
    "            MEDIA_QUERY_TYPE : 3,\n" +
    "            PROPERTY_NAME_TYPE : 4,\n" +
    "            PROPERTY_VALUE_TYPE : 5,\n" +
    "            PROPERTY_VALUE_PART_TYPE : 6,\n" +
    "            SELECTOR_TYPE : 7,\n" +
    "            SELECTOR_PART_TYPE : 8,\n" +
    "            SELECTOR_SUB_PART_TYPE : 9,\n" +
    "\n" +
    "            _stylesheet: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    charset     = null,\n" +
    "                    count,\n" +
    "                    token,\n" +
    "                    tt;\n" +
    "\n" +
    "                this.fire(\"startstylesheet\");\n" +
    "                this._charset();\n" +
    "\n" +
    "                this._skipCruft();\n" +
    "                while (tokenStream.peek() == Tokens.IMPORT_SYM){\n" +
    "                    this._import();\n" +
    "                    this._skipCruft();\n" +
    "                }\n" +
    "                while (tokenStream.peek() == Tokens.NAMESPACE_SYM){\n" +
    "                    this._namespace();\n" +
    "                    this._skipCruft();\n" +
    "                }\n" +
    "                tt = tokenStream.peek();\n" +
    "                while(tt > Tokens.EOF){\n" +
    "\n" +
    "                    try {\n" +
    "\n" +
    "                        switch(tt){\n" +
    "                            case Tokens.MEDIA_SYM:\n" +
    "                                this._media();\n" +
    "                                this._skipCruft();\n" +
    "                                break;\n" +
    "                            case Tokens.PAGE_SYM:\n" +
    "                                this._page();\n" +
    "                                this._skipCruft();\n" +
    "                                break;\n" +
    "                            case Tokens.FONT_FACE_SYM:\n" +
    "                                this._font_face();\n" +
    "                                this._skipCruft();\n" +
    "                                break;\n" +
    "                            case Tokens.KEYFRAMES_SYM:\n" +
    "                                this._keyframes();\n" +
    "                                this._skipCruft();\n" +
    "                                break;\n" +
    "                            case Tokens.VIEWPORT_SYM:\n" +
    "                                this._viewport();\n" +
    "                                this._skipCruft();\n" +
    "                                break;\n" +
    "                            case Tokens.UNKNOWN_SYM:  //unknown @ rule\n" +
    "                                tokenStream.get();\n" +
    "                                if (!this.options.strict){\n" +
    "                                    this.fire({\n" +
    "                                        type:       \"error\",\n" +
    "                                        error:      null,\n" +
    "                                        message:    \"Unknown @ rule: \" + tokenStream.LT(0).value + \".\",\n" +
    "                                        line:       tokenStream.LT(0).startLine,\n" +
    "                                        col:        tokenStream.LT(0).startCol\n" +
    "                                    });\n" +
    "                                    count=0;\n" +
    "                                    while (tokenStream.advance([Tokens.LBRACE, Tokens.RBRACE]) == Tokens.LBRACE){\n" +
    "                                        count++;    //keep track of nesting depth\n" +
    "                                    }\n" +
    "\n" +
    "                                    while(count){\n" +
    "                                        tokenStream.advance([Tokens.RBRACE]);\n" +
    "                                        count--;\n" +
    "                                    }\n" +
    "\n" +
    "                                } else {\n" +
    "                                    throw new SyntaxError(\"Unknown @ rule.\", tokenStream.LT(0).startLine, tokenStream.LT(0).startCol);\n" +
    "                                }\n" +
    "                                break;\n" +
    "                            case Tokens.S:\n" +
    "                                this._readWhitespace();\n" +
    "                                break;\n" +
    "                            default:\n" +
    "                                if(!this._ruleset()){\n" +
    "                                    switch(tt){\n" +
    "                                        case Tokens.CHARSET_SYM:\n" +
    "                                            token = tokenStream.LT(1);\n" +
    "                                            this._charset(false);\n" +
    "                                            throw new SyntaxError(\"@charset not allowed here.\", token.startLine, token.startCol);\n" +
    "                                        case Tokens.IMPORT_SYM:\n" +
    "                                            token = tokenStream.LT(1);\n" +
    "                                            this._import(false);\n" +
    "                                            throw new SyntaxError(\"@import not allowed here.\", token.startLine, token.startCol);\n" +
    "                                        case Tokens.NAMESPACE_SYM:\n" +
    "                                            token = tokenStream.LT(1);\n" +
    "                                            this._namespace(false);\n" +
    "                                            throw new SyntaxError(\"@namespace not allowed here.\", token.startLine, token.startCol);\n" +
    "                                        default:\n" +
    "                                            tokenStream.get();  //get the last token\n" +
    "                                            this._unexpectedToken(tokenStream.token());\n" +
    "                                    }\n" +
    "\n" +
    "                                }\n" +
    "                        }\n" +
    "                    } catch(ex) {\n" +
    "                        if (ex instanceof SyntaxError && !this.options.strict){\n" +
    "                            this.fire({\n" +
    "                                type:       \"error\",\n" +
    "                                error:      ex,\n" +
    "                                message:    ex.message,\n" +
    "                                line:       ex.line,\n" +
    "                                col:        ex.col\n" +
    "                            });\n" +
    "                        } else {\n" +
    "                            throw ex;\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                    tt = tokenStream.peek();\n" +
    "                }\n" +
    "\n" +
    "                if (tt != Tokens.EOF){\n" +
    "                    this._unexpectedToken(tokenStream.token());\n" +
    "                }\n" +
    "\n" +
    "                this.fire(\"endstylesheet\");\n" +
    "            },\n" +
    "\n" +
    "            _charset: function(emit){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    charset,\n" +
    "                    token,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.CHARSET_SYM)){\n" +
    "                    line = tokenStream.token().startLine;\n" +
    "                    col = tokenStream.token().startCol;\n" +
    "\n" +
    "                    this._readWhitespace();\n" +
    "                    tokenStream.mustMatch(Tokens.STRING);\n" +
    "\n" +
    "                    token = tokenStream.token();\n" +
    "                    charset = token.value;\n" +
    "\n" +
    "                    this._readWhitespace();\n" +
    "                    tokenStream.mustMatch(Tokens.SEMICOLON);\n" +
    "\n" +
    "                    if (emit !== false){\n" +
    "                        this.fire({\n" +
    "                            type:   \"charset\",\n" +
    "                            charset:charset,\n" +
    "                            line:   line,\n" +
    "                            col:    col\n" +
    "                        });\n" +
    "                    }\n" +
    "                }\n" +
    "            },\n" +
    "\n" +
    "            _import: function(emit){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    tt,\n" +
    "                    uri,\n" +
    "                    importToken,\n" +
    "                    mediaList   = [];\n" +
    "                tokenStream.mustMatch(Tokens.IMPORT_SYM);\n" +
    "                importToken = tokenStream.token();\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                tokenStream.mustMatch([Tokens.STRING, Tokens.URI]);\n" +
    "                uri = tokenStream.token().value.replace(/^(?:url\\()?[\"']?([^\"']+?)[\"']?\\)?$/, \"$1\");\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                mediaList = this._media_query_list();\n" +
    "                tokenStream.mustMatch(Tokens.SEMICOLON);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (emit !== false){\n" +
    "                    this.fire({\n" +
    "                        type:   \"import\",\n" +
    "                        uri:    uri,\n" +
    "                        media:  mediaList,\n" +
    "                        line:   importToken.startLine,\n" +
    "                        col:    importToken.startCol\n" +
    "                    });\n" +
    "                }\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _namespace: function(emit){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    prefix,\n" +
    "                    uri;\n" +
    "                tokenStream.mustMatch(Tokens.NAMESPACE_SYM);\n" +
    "                line = tokenStream.token().startLine;\n" +
    "                col = tokenStream.token().startCol;\n" +
    "                this._readWhitespace();\n" +
    "                if (tokenStream.match(Tokens.IDENT)){\n" +
    "                    prefix = tokenStream.token().value;\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                tokenStream.mustMatch([Tokens.STRING, Tokens.URI]);\n" +
    "                uri = tokenStream.token().value.replace(/(?:url\\()?[\"']([^\"']+)[\"']\\)?/, \"$1\");\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                tokenStream.mustMatch(Tokens.SEMICOLON);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (emit !== false){\n" +
    "                    this.fire({\n" +
    "                        type:   \"namespace\",\n" +
    "                        prefix: prefix,\n" +
    "                        uri:    uri,\n" +
    "                        line:   line,\n" +
    "                        col:    col\n" +
    "                    });\n" +
    "                }\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _media: function(){\n" +
    "                var tokenStream     = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    mediaList;//       = [];\n" +
    "                tokenStream.mustMatch(Tokens.MEDIA_SYM);\n" +
    "                line = tokenStream.token().startLine;\n" +
    "                col = tokenStream.token().startCol;\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                mediaList = this._media_query_list();\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.LBRACE);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"startmedia\",\n" +
    "                    media:  mediaList,\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "\n" +
    "                while(true) {\n" +
    "                    if (tokenStream.peek() == Tokens.PAGE_SYM){\n" +
    "                        this._page();\n" +
    "                    } else if (tokenStream.peek() == Tokens.FONT_FACE_SYM){\n" +
    "                        this._font_face();\n" +
    "                    } else if (tokenStream.peek() == Tokens.VIEWPORT_SYM){\n" +
    "                        this._viewport();\n" +
    "                    } else if (!this._ruleset()){\n" +
    "                        break;\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.RBRACE);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"endmedia\",\n" +
    "                    media:  mediaList,\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "            },\n" +
    "            _media_query_list: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    mediaList   = [];\n" +
    "\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (tokenStream.peek() == Tokens.IDENT || tokenStream.peek() == Tokens.LPAREN){\n" +
    "                    mediaList.push(this._media_query());\n" +
    "                }\n" +
    "\n" +
    "                while(tokenStream.match(Tokens.COMMA)){\n" +
    "                    this._readWhitespace();\n" +
    "                    mediaList.push(this._media_query());\n" +
    "                }\n" +
    "\n" +
    "                return mediaList;\n" +
    "            },\n" +
    "            _media_query: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    type        = null,\n" +
    "                    ident       = null,\n" +
    "                    token       = null,\n" +
    "                    expressions = [];\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.IDENT)){\n" +
    "                    ident = tokenStream.token().value.toLowerCase();\n" +
    "                    if (ident != \"only\" && ident != \"not\"){\n" +
    "                        tokenStream.unget();\n" +
    "                        ident = null;\n" +
    "                    } else {\n" +
    "                        token = tokenStream.token();\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (tokenStream.peek() == Tokens.IDENT){\n" +
    "                    type = this._media_type();\n" +
    "                    if (token === null){\n" +
    "                        token = tokenStream.token();\n" +
    "                    }\n" +
    "                } else if (tokenStream.peek() == Tokens.LPAREN){\n" +
    "                    if (token === null){\n" +
    "                        token = tokenStream.LT(1);\n" +
    "                    }\n" +
    "                    expressions.push(this._media_expression());\n" +
    "                }\n" +
    "\n" +
    "                if (type === null && expressions.length === 0){\n" +
    "                    return null;\n" +
    "                } else {\n" +
    "                    this._readWhitespace();\n" +
    "                    while (tokenStream.match(Tokens.IDENT)){\n" +
    "                        if (tokenStream.token().value.toLowerCase() != \"and\"){\n" +
    "                            this._unexpectedToken(tokenStream.token());\n" +
    "                        }\n" +
    "\n" +
    "                        this._readWhitespace();\n" +
    "                        expressions.push(this._media_expression());\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                return new MediaQuery(ident, type, expressions, token.startLine, token.startCol);\n" +
    "            },\n" +
    "            _media_type: function(){\n" +
    "                return this._media_feature();\n" +
    "            },\n" +
    "            _media_expression: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    feature     = null,\n" +
    "                    token,\n" +
    "                    expression  = null;\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.LPAREN);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                feature = this._media_feature();\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.COLON)){\n" +
    "                    this._readWhitespace();\n" +
    "                    token = tokenStream.LT(1);\n" +
    "                    expression = this._expression();\n" +
    "                }\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.RPAREN);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                return new MediaFeature(feature, (expression ? new SyntaxUnit(expression, token.startLine, token.startCol) : null));\n" +
    "            },\n" +
    "            _media_feature: function(){\n" +
    "                var tokenStream = this._tokenStream;\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.IDENT);\n" +
    "\n" +
    "                return SyntaxUnit.fromToken(tokenStream.token());\n" +
    "            },\n" +
    "            _page: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    identifier  = null,\n" +
    "                    pseudoPage  = null;\n" +
    "                tokenStream.mustMatch(Tokens.PAGE_SYM);\n" +
    "                line = tokenStream.token().startLine;\n" +
    "                col = tokenStream.token().startCol;\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.IDENT)){\n" +
    "                    identifier = tokenStream.token().value;\n" +
    "                    if (identifier.toLowerCase() === \"auto\"){\n" +
    "                        this._unexpectedToken(tokenStream.token());\n" +
    "                    }\n" +
    "                }\n" +
    "                if (tokenStream.peek() == Tokens.COLON){\n" +
    "                    pseudoPage = this._pseudo_page();\n" +
    "                }\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"startpage\",\n" +
    "                    id:     identifier,\n" +
    "                    pseudo: pseudoPage,\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "\n" +
    "                this._readDeclarations(true, true);\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"endpage\",\n" +
    "                    id:     identifier,\n" +
    "                    pseudo: pseudoPage,\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "\n" +
    "            },\n" +
    "            _margin: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    marginSym   = this._margin_sym();\n" +
    "\n" +
    "                if (marginSym){\n" +
    "                    line = tokenStream.token().startLine;\n" +
    "                    col = tokenStream.token().startCol;\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type: \"startpagemargin\",\n" +
    "                        margin: marginSym,\n" +
    "                        line:   line,\n" +
    "                        col:    col\n" +
    "                    });\n" +
    "\n" +
    "                    this._readDeclarations(true);\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type: \"endpagemargin\",\n" +
    "                        margin: marginSym,\n" +
    "                        line:   line,\n" +
    "                        col:    col\n" +
    "                    });\n" +
    "                    return true;\n" +
    "                } else {\n" +
    "                    return false;\n" +
    "                }\n" +
    "            },\n" +
    "            _margin_sym: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream;\n" +
    "\n" +
    "                if(tokenStream.match([Tokens.TOPLEFTCORNER_SYM, Tokens.TOPLEFT_SYM,\n" +
    "                        Tokens.TOPCENTER_SYM, Tokens.TOPRIGHT_SYM, Tokens.TOPRIGHTCORNER_SYM,\n" +
    "                        Tokens.BOTTOMLEFTCORNER_SYM, Tokens.BOTTOMLEFT_SYM,\n" +
    "                        Tokens.BOTTOMCENTER_SYM, Tokens.BOTTOMRIGHT_SYM,\n" +
    "                        Tokens.BOTTOMRIGHTCORNER_SYM, Tokens.LEFTTOP_SYM,\n" +
    "                        Tokens.LEFTMIDDLE_SYM, Tokens.LEFTBOTTOM_SYM, Tokens.RIGHTTOP_SYM,\n" +
    "                        Tokens.RIGHTMIDDLE_SYM, Tokens.RIGHTBOTTOM_SYM]))\n" +
    "                {\n" +
    "                    return SyntaxUnit.fromToken(tokenStream.token());\n" +
    "                } else {\n" +
    "                    return null;\n" +
    "                }\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _pseudo_page: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream;\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.COLON);\n" +
    "                tokenStream.mustMatch(Tokens.IDENT);\n" +
    "\n" +
    "                return tokenStream.token().value;\n" +
    "            },\n" +
    "\n" +
    "            _font_face: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "                tokenStream.mustMatch(Tokens.FONT_FACE_SYM);\n" +
    "                line = tokenStream.token().startLine;\n" +
    "                col = tokenStream.token().startCol;\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"startfontface\",\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "\n" +
    "                this._readDeclarations(true);\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"endfontface\",\n" +
    "                    line:   line,\n" +
    "                    col:    col\n" +
    "                });\n" +
    "            },\n" +
    "\n" +
    "            _viewport: function(){\n" +
    "                 var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.VIEWPORT_SYM);\n" +
    "                    line = tokenStream.token().startLine;\n" +
    "                    col = tokenStream.token().startCol;\n" +
    "\n" +
    "                    this._readWhitespace();\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type:   \"startviewport\",\n" +
    "                        line:   line,\n" +
    "                        col:    col\n" +
    "                    });\n" +
    "\n" +
    "                    this._readDeclarations(true);\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type:   \"endviewport\",\n" +
    "                        line:   line,\n" +
    "                        col:    col\n" +
    "                    });\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _operator: function(inFunction){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token       = null;\n" +
    "\n" +
    "                if (tokenStream.match([Tokens.SLASH, Tokens.COMMA]) ||\n" +
    "                    (inFunction && tokenStream.match([Tokens.PLUS, Tokens.STAR, Tokens.MINUS]))){\n" +
    "                    token =  tokenStream.token();\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "                return token ? PropertyValuePart.fromToken(token) : null;\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _combinator: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = null,\n" +
    "                    token;\n" +
    "\n" +
    "                if(tokenStream.match([Tokens.PLUS, Tokens.GREATER, Tokens.TILDE])){\n" +
    "                    token = tokenStream.token();\n" +
    "                    value = new Combinator(token.value, token.startLine, token.startCol);\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return value;\n" +
    "            },\n" +
    "\n" +
    "            _unary_operator: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream;\n" +
    "\n" +
    "                if (tokenStream.match([Tokens.MINUS, Tokens.PLUS])){\n" +
    "                    return tokenStream.token().value;\n" +
    "                } else {\n" +
    "                    return null;\n" +
    "                }\n" +
    "            },\n" +
    "\n" +
    "            _property: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = null,\n" +
    "                    hack        = null,\n" +
    "                    tokenValue,\n" +
    "                    token,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "                if (tokenStream.peek() == Tokens.STAR && this.options.starHack){\n" +
    "                    tokenStream.get();\n" +
    "                    token = tokenStream.token();\n" +
    "                    hack = token.value;\n" +
    "                    line = token.startLine;\n" +
    "                    col = token.startCol;\n" +
    "                }\n" +
    "\n" +
    "                if(tokenStream.match(Tokens.IDENT)){\n" +
    "                    token = tokenStream.token();\n" +
    "                    tokenValue = token.value;\n" +
    "                    if (tokenValue.charAt(0) == \"_\" && this.options.underscoreHack){\n" +
    "                        hack = \"_\";\n" +
    "                        tokenValue = tokenValue.substring(1);\n" +
    "                    }\n" +
    "\n" +
    "                    value = new PropertyName(tokenValue, hack, (line||token.startLine), (col||token.startCol));\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return value;\n" +
    "            },\n" +
    "            _ruleset: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    tt,\n" +
    "                    selectors;\n" +
    "                try {\n" +
    "                    selectors = this._selectors_group();\n" +
    "                } catch (ex){\n" +
    "                    if (ex instanceof SyntaxError && !this.options.strict){\n" +
    "                        this.fire({\n" +
    "                            type:       \"error\",\n" +
    "                            error:      ex,\n" +
    "                            message:    ex.message,\n" +
    "                            line:       ex.line,\n" +
    "                            col:        ex.col\n" +
    "                        });\n" +
    "                        tt = tokenStream.advance([Tokens.RBRACE]);\n" +
    "                        if (tt == Tokens.RBRACE){\n" +
    "                        } else {\n" +
    "                            throw ex;\n" +
    "                        }\n" +
    "\n" +
    "                    } else {\n" +
    "                        throw ex;\n" +
    "                    }\n" +
    "                    return true;\n" +
    "                }\n" +
    "                if (selectors){\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type:       \"startrule\",\n" +
    "                        selectors:  selectors,\n" +
    "                        line:       selectors[0].line,\n" +
    "                        col:        selectors[0].col\n" +
    "                    });\n" +
    "\n" +
    "                    this._readDeclarations(true);\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type:       \"endrule\",\n" +
    "                        selectors:  selectors,\n" +
    "                        line:       selectors[0].line,\n" +
    "                        col:        selectors[0].col\n" +
    "                    });\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "                return selectors;\n" +
    "\n" +
    "            },\n" +
    "            _selectors_group: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    selectors   = [],\n" +
    "                    selector;\n" +
    "\n" +
    "                selector = this._selector();\n" +
    "                if (selector !== null){\n" +
    "\n" +
    "                    selectors.push(selector);\n" +
    "                    while(tokenStream.match(Tokens.COMMA)){\n" +
    "                        this._readWhitespace();\n" +
    "                        selector = this._selector();\n" +
    "                        if (selector !== null){\n" +
    "                            selectors.push(selector);\n" +
    "                        } else {\n" +
    "                            this._unexpectedToken(tokenStream.LT(1));\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                return selectors.length ? selectors : null;\n" +
    "            },\n" +
    "            _selector: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    selector    = [],\n" +
    "                    nextSelector = null,\n" +
    "                    combinator  = null,\n" +
    "                    ws          = null;\n" +
    "                nextSelector = this._simple_selector_sequence();\n" +
    "                if (nextSelector === null){\n" +
    "                    return null;\n" +
    "                }\n" +
    "\n" +
    "                selector.push(nextSelector);\n" +
    "\n" +
    "                do {\n" +
    "                    combinator = this._combinator();\n" +
    "\n" +
    "                    if (combinator !== null){\n" +
    "                        selector.push(combinator);\n" +
    "                        nextSelector = this._simple_selector_sequence();\n" +
    "                        if (nextSelector === null){\n" +
    "                            this._unexpectedToken(tokenStream.LT(1));\n" +
    "                        } else {\n" +
    "                            selector.push(nextSelector);\n" +
    "                        }\n" +
    "                    } else {\n" +
    "                        if (this._readWhitespace()){\n" +
    "                            ws = new Combinator(tokenStream.token().value, tokenStream.token().startLine, tokenStream.token().startCol);\n" +
    "                            combinator = this._combinator();\n" +
    "                            nextSelector = this._simple_selector_sequence();\n" +
    "                            if (nextSelector === null){\n" +
    "                                if (combinator !== null){\n" +
    "                                    this._unexpectedToken(tokenStream.LT(1));\n" +
    "                                }\n" +
    "                            } else {\n" +
    "\n" +
    "                                if (combinator !== null){\n" +
    "                                    selector.push(combinator);\n" +
    "                                } else {\n" +
    "                                    selector.push(ws);\n" +
    "                                }\n" +
    "\n" +
    "                                selector.push(nextSelector);\n" +
    "                            }\n" +
    "                        } else {\n" +
    "                            break;\n" +
    "                        }\n" +
    "\n" +
    "                    }\n" +
    "                } while(true);\n" +
    "\n" +
    "                return new Selector(selector, selector[0].line, selector[0].col);\n" +
    "            },\n" +
    "            _simple_selector_sequence: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    elementName = null,\n" +
    "                    modifiers   = [],\n" +
    "                    selectorText= \"\",\n" +
    "                    components  = [\n" +
    "                        function(){\n" +
    "                            return tokenStream.match(Tokens.HASH) ?\n" +
    "                                    new SelectorSubPart(tokenStream.token().value, \"id\", tokenStream.token().startLine, tokenStream.token().startCol) :\n" +
    "                                    null;\n" +
    "                        },\n" +
    "                        this._class,\n" +
    "                        this._attrib,\n" +
    "                        this._pseudo,\n" +
    "                        this._negation\n" +
    "                    ],\n" +
    "                    i           = 0,\n" +
    "                    len         = components.length,\n" +
    "                    component   = null,\n" +
    "                    found       = false,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "                line = tokenStream.LT(1).startLine;\n" +
    "                col = tokenStream.LT(1).startCol;\n" +
    "\n" +
    "                elementName = this._type_selector();\n" +
    "                if (!elementName){\n" +
    "                    elementName = this._universal();\n" +
    "                }\n" +
    "\n" +
    "                if (elementName !== null){\n" +
    "                    selectorText += elementName;\n" +
    "                }\n" +
    "\n" +
    "                while(true){\n" +
    "                    if (tokenStream.peek() === Tokens.S){\n" +
    "                        break;\n" +
    "                    }\n" +
    "                    while(i < len && component === null){\n" +
    "                        component = components[i++].call(this);\n" +
    "                    }\n" +
    "\n" +
    "                    if (component === null){\n" +
    "                        if (selectorText === \"\"){\n" +
    "                            return null;\n" +
    "                        } else {\n" +
    "                            break;\n" +
    "                        }\n" +
    "                    } else {\n" +
    "                        i = 0;\n" +
    "                        modifiers.push(component);\n" +
    "                        selectorText += component.toString();\n" +
    "                        component = null;\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "\n" +
    "                return selectorText !== \"\" ?\n" +
    "                        new SelectorPart(elementName, modifiers, selectorText, line, col) :\n" +
    "                        null;\n" +
    "            },\n" +
    "            _type_selector: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    ns          = this._namespace_prefix(),\n" +
    "                    elementName = this._element_name();\n" +
    "\n" +
    "                if (!elementName){\n" +
    "                    if (ns){\n" +
    "                        tokenStream.unget();\n" +
    "                        if (ns.length > 1){\n" +
    "                            tokenStream.unget();\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                    return null;\n" +
    "                } else {\n" +
    "                    if (ns){\n" +
    "                        elementName.text = ns + elementName.text;\n" +
    "                        elementName.col -= ns.length;\n" +
    "                    }\n" +
    "                    return elementName;\n" +
    "                }\n" +
    "            },\n" +
    "            _class: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.DOT)){\n" +
    "                    tokenStream.mustMatch(Tokens.IDENT);\n" +
    "                    token = tokenStream.token();\n" +
    "                    return new SelectorSubPart(\".\" + token.value, \"class\", token.startLine, token.startCol - 1);\n" +
    "                } else {\n" +
    "                    return null;\n" +
    "                }\n" +
    "\n" +
    "            },\n" +
    "            _element_name: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.IDENT)){\n" +
    "                    token = tokenStream.token();\n" +
    "                    return new SelectorSubPart(token.value, \"elementName\", token.startLine, token.startCol);\n" +
    "\n" +
    "                } else {\n" +
    "                    return null;\n" +
    "                }\n" +
    "            },\n" +
    "            _namespace_prefix: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = \"\";\n" +
    "                if (tokenStream.LA(1) === Tokens.PIPE || tokenStream.LA(2) === Tokens.PIPE){\n" +
    "\n" +
    "                    if(tokenStream.match([Tokens.IDENT, Tokens.STAR])){\n" +
    "                        value += tokenStream.token().value;\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.PIPE);\n" +
    "                    value += \"|\";\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "                return value.length ? value : null;\n" +
    "            },\n" +
    "            _universal: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = \"\",\n" +
    "                    ns;\n" +
    "\n" +
    "                ns = this._namespace_prefix();\n" +
    "                if(ns){\n" +
    "                    value += ns;\n" +
    "                }\n" +
    "\n" +
    "                if(tokenStream.match(Tokens.STAR)){\n" +
    "                    value += \"*\";\n" +
    "                }\n" +
    "\n" +
    "                return value.length ? value : null;\n" +
    "\n" +
    "           },\n" +
    "            _attrib: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = null,\n" +
    "                    ns,\n" +
    "                    token;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.LBRACKET)){\n" +
    "                    token = tokenStream.token();\n" +
    "                    value = token.value;\n" +
    "                    value += this._readWhitespace();\n" +
    "\n" +
    "                    ns = this._namespace_prefix();\n" +
    "\n" +
    "                    if (ns){\n" +
    "                        value += ns;\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.IDENT);\n" +
    "                    value += tokenStream.token().value;\n" +
    "                    value += this._readWhitespace();\n" +
    "\n" +
    "                    if(tokenStream.match([Tokens.PREFIXMATCH, Tokens.SUFFIXMATCH, Tokens.SUBSTRINGMATCH,\n" +
    "                            Tokens.EQUALS, Tokens.INCLUDES, Tokens.DASHMATCH])){\n" +
    "\n" +
    "                        value += tokenStream.token().value;\n" +
    "                        value += this._readWhitespace();\n" +
    "\n" +
    "                        tokenStream.mustMatch([Tokens.IDENT, Tokens.STRING]);\n" +
    "                        value += tokenStream.token().value;\n" +
    "                        value += this._readWhitespace();\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.RBRACKET);\n" +
    "\n" +
    "                    return new SelectorSubPart(value + \"]\", \"attribute\", token.startLine, token.startCol);\n" +
    "                } else {\n" +
    "                    return null;\n" +
    "                }\n" +
    "            },\n" +
    "            _pseudo: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    pseudo      = null,\n" +
    "                    colons      = \":\",\n" +
    "                    line,\n" +
    "                    col;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.COLON)){\n" +
    "\n" +
    "                    if (tokenStream.match(Tokens.COLON)){\n" +
    "                        colons += \":\";\n" +
    "                    }\n" +
    "\n" +
    "                    if (tokenStream.match(Tokens.IDENT)){\n" +
    "                        pseudo = tokenStream.token().value;\n" +
    "                        line = tokenStream.token().startLine;\n" +
    "                        col = tokenStream.token().startCol - colons.length;\n" +
    "                    } else if (tokenStream.peek() == Tokens.FUNCTION){\n" +
    "                        line = tokenStream.LT(1).startLine;\n" +
    "                        col = tokenStream.LT(1).startCol - colons.length;\n" +
    "                        pseudo = this._functional_pseudo();\n" +
    "                    }\n" +
    "\n" +
    "                    if (pseudo){\n" +
    "                        pseudo = new SelectorSubPart(colons + pseudo, \"pseudo\", line, col);\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                return pseudo;\n" +
    "            },\n" +
    "            _functional_pseudo: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value = null;\n" +
    "\n" +
    "                if(tokenStream.match(Tokens.FUNCTION)){\n" +
    "                    value = tokenStream.token().value;\n" +
    "                    value += this._readWhitespace();\n" +
    "                    value += this._expression();\n" +
    "                    tokenStream.mustMatch(Tokens.RPAREN);\n" +
    "                    value += \")\";\n" +
    "                }\n" +
    "\n" +
    "                return value;\n" +
    "            },\n" +
    "            _expression: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    value       = \"\";\n" +
    "\n" +
    "                while(tokenStream.match([Tokens.PLUS, Tokens.MINUS, Tokens.DIMENSION,\n" +
    "                        Tokens.NUMBER, Tokens.STRING, Tokens.IDENT, Tokens.LENGTH,\n" +
    "                        Tokens.FREQ, Tokens.ANGLE, Tokens.TIME,\n" +
    "                        Tokens.RESOLUTION, Tokens.SLASH])){\n" +
    "\n" +
    "                    value += tokenStream.token().value;\n" +
    "                    value += this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return value.length ? value : null;\n" +
    "\n" +
    "            },\n" +
    "            _negation: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    value       = \"\",\n" +
    "                    arg,\n" +
    "                    subpart     = null;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.NOT)){\n" +
    "                    value = tokenStream.token().value;\n" +
    "                    line = tokenStream.token().startLine;\n" +
    "                    col = tokenStream.token().startCol;\n" +
    "                    value += this._readWhitespace();\n" +
    "                    arg = this._negation_arg();\n" +
    "                    value += arg;\n" +
    "                    value += this._readWhitespace();\n" +
    "                    tokenStream.match(Tokens.RPAREN);\n" +
    "                    value += tokenStream.token().value;\n" +
    "\n" +
    "                    subpart = new SelectorSubPart(value, \"not\", line, col);\n" +
    "                    subpart.args.push(arg);\n" +
    "                }\n" +
    "\n" +
    "                return subpart;\n" +
    "            },\n" +
    "            _negation_arg: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    args        = [\n" +
    "                        this._type_selector,\n" +
    "                        this._universal,\n" +
    "                        function(){\n" +
    "                            return tokenStream.match(Tokens.HASH) ?\n" +
    "                                    new SelectorSubPart(tokenStream.token().value, \"id\", tokenStream.token().startLine, tokenStream.token().startCol) :\n" +
    "                                    null;\n" +
    "                        },\n" +
    "                        this._class,\n" +
    "                        this._attrib,\n" +
    "                        this._pseudo\n" +
    "                    ],\n" +
    "                    arg         = null,\n" +
    "                    i           = 0,\n" +
    "                    len         = args.length,\n" +
    "                    elementName,\n" +
    "                    line,\n" +
    "                    col,\n" +
    "                    part;\n" +
    "\n" +
    "                line = tokenStream.LT(1).startLine;\n" +
    "                col = tokenStream.LT(1).startCol;\n" +
    "\n" +
    "                while(i < len && arg === null){\n" +
    "\n" +
    "                    arg = args[i].call(this);\n" +
    "                    i++;\n" +
    "                }\n" +
    "                if (arg === null){\n" +
    "                    this._unexpectedToken(tokenStream.LT(1));\n" +
    "                }\n" +
    "                if (arg.type == \"elementName\"){\n" +
    "                    part = new SelectorPart(arg, [], arg.toString(), line, col);\n" +
    "                } else {\n" +
    "                    part = new SelectorPart(null, [arg], arg.toString(), line, col);\n" +
    "                }\n" +
    "\n" +
    "                return part;\n" +
    "            },\n" +
    "\n" +
    "            _declaration: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    property    = null,\n" +
    "                    expr        = null,\n" +
    "                    prio        = null,\n" +
    "                    error       = null,\n" +
    "                    invalid     = null,\n" +
    "                    propertyName= \"\";\n" +
    "\n" +
    "                property = this._property();\n" +
    "                if (property !== null){\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.COLON);\n" +
    "                    this._readWhitespace();\n" +
    "\n" +
    "                    expr = this._expr();\n" +
    "                    if (!expr || expr.length === 0){\n" +
    "                        this._unexpectedToken(tokenStream.LT(1));\n" +
    "                    }\n" +
    "\n" +
    "                    prio = this._prio();\n" +
    "                    propertyName = property.toString();\n" +
    "                    if (this.options.starHack && property.hack == \"*\" ||\n" +
    "                            this.options.underscoreHack && property.hack == \"_\") {\n" +
    "\n" +
    "                        propertyName = property.text;\n" +
    "                    }\n" +
    "\n" +
    "                    try {\n" +
    "                        this._validateProperty(propertyName, expr);\n" +
    "                    } catch (ex) {\n" +
    "                        invalid = ex;\n" +
    "                    }\n" +
    "\n" +
    "                    this.fire({\n" +
    "                        type:       \"property\",\n" +
    "                        property:   property,\n" +
    "                        value:      expr,\n" +
    "                        important:  prio,\n" +
    "                        line:       property.line,\n" +
    "                        col:        property.col,\n" +
    "                        invalid:    invalid\n" +
    "                    });\n" +
    "\n" +
    "                    return true;\n" +
    "                } else {\n" +
    "                    return false;\n" +
    "                }\n" +
    "            },\n" +
    "\n" +
    "            _prio: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    result      = tokenStream.match(Tokens.IMPORTANT_SYM);\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                return result;\n" +
    "            },\n" +
    "\n" +
    "            _expr: function(inFunction){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    values      = [],\n" +
    "                    value       = null,\n" +
    "                    operator    = null;\n" +
    "\n" +
    "                value = this._term(inFunction);\n" +
    "                if (value !== null){\n" +
    "\n" +
    "                    values.push(value);\n" +
    "\n" +
    "                    do {\n" +
    "                        operator = this._operator(inFunction);\n" +
    "                        if (operator){\n" +
    "                            values.push(operator);\n" +
    "                        } /*else {\n" +
    "                            values.push(new PropertyValue(valueParts, valueParts[0].line, valueParts[0].col));\n" +
    "                            valueParts = [];\n" +
    "                        }*/\n" +
    "\n" +
    "                        value = this._term(inFunction);\n" +
    "\n" +
    "                        if (value === null){\n" +
    "                            break;\n" +
    "                        } else {\n" +
    "                            values.push(value);\n" +
    "                        }\n" +
    "                    } while(true);\n" +
    "                }\n" +
    "\n" +
    "                return values.length > 0 ? new PropertyValue(values, values[0].line, values[0].col) : null;\n" +
    "            },\n" +
    "\n" +
    "            _term: function(inFunction){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    unary       = null,\n" +
    "                    value       = null,\n" +
    "                    endChar     = null,\n" +
    "                    token,\n" +
    "                    line,\n" +
    "                    col;\n" +
    "                unary = this._unary_operator();\n" +
    "                if (unary !== null){\n" +
    "                    line = tokenStream.token().startLine;\n" +
    "                    col = tokenStream.token().startCol;\n" +
    "                }\n" +
    "                if (tokenStream.peek() == Tokens.IE_FUNCTION && this.options.ieFilters){\n" +
    "\n" +
    "                    value = this._ie_function();\n" +
    "                    if (unary === null){\n" +
    "                        line = tokenStream.token().startLine;\n" +
    "                        col = tokenStream.token().startCol;\n" +
    "                    }\n" +
    "                } else if (inFunction && tokenStream.match([Tokens.LPAREN, Tokens.LBRACE, Tokens.LBRACKET])){\n" +
    "\n" +
    "                    token = tokenStream.token();\n" +
    "                    endChar = token.endChar;\n" +
    "                    value = token.value + this._expr(inFunction).text;\n" +
    "                    if (unary === null){\n" +
    "                        line = tokenStream.token().startLine;\n" +
    "                        col = tokenStream.token().startCol;\n" +
    "                    }\n" +
    "                    tokenStream.mustMatch(Tokens.type(endChar));\n" +
    "                    value += endChar;\n" +
    "                    this._readWhitespace();\n" +
    "                } else if (tokenStream.match([Tokens.NUMBER, Tokens.PERCENTAGE, Tokens.LENGTH,\n" +
    "                        Tokens.ANGLE, Tokens.TIME,\n" +
    "                        Tokens.FREQ, Tokens.STRING, Tokens.IDENT, Tokens.URI, Tokens.UNICODE_RANGE])){\n" +
    "\n" +
    "                    value = tokenStream.token().value;\n" +
    "                    if (unary === null){\n" +
    "                        line = tokenStream.token().startLine;\n" +
    "                        col = tokenStream.token().startCol;\n" +
    "                    }\n" +
    "                    this._readWhitespace();\n" +
    "                } else {\n" +
    "                    token = this._hexcolor();\n" +
    "                    if (token === null){\n" +
    "                        if (unary === null){\n" +
    "                            line = tokenStream.LT(1).startLine;\n" +
    "                            col = tokenStream.LT(1).startCol;\n" +
    "                        }\n" +
    "                        if (value === null){\n" +
    "                            if (tokenStream.LA(3) == Tokens.EQUALS && this.options.ieFilters){\n" +
    "                                value = this._ie_function();\n" +
    "                            } else {\n" +
    "                                value = this._function();\n" +
    "                            }\n" +
    "                        }\n" +
    "\n" +
    "                    } else {\n" +
    "                        value = token.value;\n" +
    "                        if (unary === null){\n" +
    "                            line = token.startLine;\n" +
    "                            col = token.startCol;\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "                return value !== null ?\n" +
    "                        new PropertyValuePart(unary !== null ? unary + value : value, line, col) :\n" +
    "                        null;\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _function: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    functionText = null,\n" +
    "                    expr        = null,\n" +
    "                    lt;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.FUNCTION)){\n" +
    "                    functionText = tokenStream.token().value;\n" +
    "                    this._readWhitespace();\n" +
    "                    expr = this._expr(true);\n" +
    "                    functionText += expr;\n" +
    "                    if (this.options.ieFilters && tokenStream.peek() == Tokens.EQUALS){\n" +
    "                        do {\n" +
    "\n" +
    "                            if (this._readWhitespace()){\n" +
    "                                functionText += tokenStream.token().value;\n" +
    "                            }\n" +
    "                            if (tokenStream.LA(0) == Tokens.COMMA){\n" +
    "                                functionText += tokenStream.token().value;\n" +
    "                            }\n" +
    "\n" +
    "                            tokenStream.match(Tokens.IDENT);\n" +
    "                            functionText += tokenStream.token().value;\n" +
    "\n" +
    "                            tokenStream.match(Tokens.EQUALS);\n" +
    "                            functionText += tokenStream.token().value;\n" +
    "                            lt = tokenStream.peek();\n" +
    "                            while(lt != Tokens.COMMA && lt != Tokens.S && lt != Tokens.RPAREN){\n" +
    "                                tokenStream.get();\n" +
    "                                functionText += tokenStream.token().value;\n" +
    "                                lt = tokenStream.peek();\n" +
    "                            }\n" +
    "                        } while(tokenStream.match([Tokens.COMMA, Tokens.S]));\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.match(Tokens.RPAREN);\n" +
    "                    functionText += \")\";\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return functionText;\n" +
    "            },\n" +
    "\n" +
    "            _ie_function: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    functionText = null,\n" +
    "                    expr        = null,\n" +
    "                    lt;\n" +
    "                if (tokenStream.match([Tokens.IE_FUNCTION, Tokens.FUNCTION])){\n" +
    "                    functionText = tokenStream.token().value;\n" +
    "\n" +
    "                    do {\n" +
    "\n" +
    "                        if (this._readWhitespace()){\n" +
    "                            functionText += tokenStream.token().value;\n" +
    "                        }\n" +
    "                        if (tokenStream.LA(0) == Tokens.COMMA){\n" +
    "                            functionText += tokenStream.token().value;\n" +
    "                        }\n" +
    "\n" +
    "                        tokenStream.match(Tokens.IDENT);\n" +
    "                        functionText += tokenStream.token().value;\n" +
    "\n" +
    "                        tokenStream.match(Tokens.EQUALS);\n" +
    "                        functionText += tokenStream.token().value;\n" +
    "                        lt = tokenStream.peek();\n" +
    "                        while(lt != Tokens.COMMA && lt != Tokens.S && lt != Tokens.RPAREN){\n" +
    "                            tokenStream.get();\n" +
    "                            functionText += tokenStream.token().value;\n" +
    "                            lt = tokenStream.peek();\n" +
    "                        }\n" +
    "                    } while(tokenStream.match([Tokens.COMMA, Tokens.S]));\n" +
    "\n" +
    "                    tokenStream.match(Tokens.RPAREN);\n" +
    "                    functionText += \")\";\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return functionText;\n" +
    "            },\n" +
    "\n" +
    "            _hexcolor: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token = null,\n" +
    "                    color;\n" +
    "\n" +
    "                if(tokenStream.match(Tokens.HASH)){\n" +
    "\n" +
    "                    token = tokenStream.token();\n" +
    "                    color = token.value;\n" +
    "                    if (!/#[a-f0-9]{3,6}/i.test(color)){\n" +
    "                        throw new SyntaxError(\"Expected a hex color but found '\" + color + \"' at line \" + token.startLine + \", col \" + token.startCol + \".\", token.startLine, token.startCol);\n" +
    "                    }\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return token;\n" +
    "            },\n" +
    "\n" +
    "            _keyframes: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token,\n" +
    "                    tt,\n" +
    "                    name,\n" +
    "                    prefix = \"\";\n" +
    "\n" +
    "                tokenStream.mustMatch(Tokens.KEYFRAMES_SYM);\n" +
    "                token = tokenStream.token();\n" +
    "                if (/^@\\-([^\\-]+)\\-/.test(token.value)) {\n" +
    "                    prefix = RegExp.$1;\n" +
    "                }\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                name = this._keyframe_name();\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                tokenStream.mustMatch(Tokens.LBRACE);\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"startkeyframes\",\n" +
    "                    name:   name,\n" +
    "                    prefix: prefix,\n" +
    "                    line:   token.startLine,\n" +
    "                    col:    token.startCol\n" +
    "                });\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                tt = tokenStream.peek();\n" +
    "                while(tt == Tokens.IDENT || tt == Tokens.PERCENTAGE) {\n" +
    "                    this._keyframe_rule();\n" +
    "                    this._readWhitespace();\n" +
    "                    tt = tokenStream.peek();\n" +
    "                }\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"endkeyframes\",\n" +
    "                    name:   name,\n" +
    "                    prefix: prefix,\n" +
    "                    line:   token.startLine,\n" +
    "                    col:    token.startCol\n" +
    "                });\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "                tokenStream.mustMatch(Tokens.RBRACE);\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _keyframe_name: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token;\n" +
    "\n" +
    "                tokenStream.mustMatch([Tokens.IDENT, Tokens.STRING]);\n" +
    "                return SyntaxUnit.fromToken(tokenStream.token());\n" +
    "            },\n" +
    "\n" +
    "            _keyframe_rule: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token,\n" +
    "                    keyList = this._key_list();\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"startkeyframerule\",\n" +
    "                    keys:   keyList,\n" +
    "                    line:   keyList[0].line,\n" +
    "                    col:    keyList[0].col\n" +
    "                });\n" +
    "\n" +
    "                this._readDeclarations(true);\n" +
    "\n" +
    "                this.fire({\n" +
    "                    type:   \"endkeyframerule\",\n" +
    "                    keys:   keyList,\n" +
    "                    line:   keyList[0].line,\n" +
    "                    col:    keyList[0].col\n" +
    "                });\n" +
    "\n" +
    "            },\n" +
    "\n" +
    "            _key_list: function(){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token,\n" +
    "                    key,\n" +
    "                    keyList = [];\n" +
    "                keyList.push(this._key());\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                while(tokenStream.match(Tokens.COMMA)){\n" +
    "                    this._readWhitespace();\n" +
    "                    keyList.push(this._key());\n" +
    "                    this._readWhitespace();\n" +
    "                }\n" +
    "\n" +
    "                return keyList;\n" +
    "            },\n" +
    "\n" +
    "            _key: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    token;\n" +
    "\n" +
    "                if (tokenStream.match(Tokens.PERCENTAGE)){\n" +
    "                    return SyntaxUnit.fromToken(tokenStream.token());\n" +
    "                } else if (tokenStream.match(Tokens.IDENT)){\n" +
    "                    token = tokenStream.token();\n" +
    "\n" +
    "                    if (/from|to/i.test(token.value)){\n" +
    "                        return SyntaxUnit.fromToken(token);\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.unget();\n" +
    "                }\n" +
    "                this._unexpectedToken(tokenStream.LT(1));\n" +
    "            },\n" +
    "            _skipCruft: function(){\n" +
    "                while(this._tokenStream.match([Tokens.S, Tokens.CDO, Tokens.CDC])){\n" +
    "                }\n" +
    "            },\n" +
    "            _readDeclarations: function(checkStart, readMargins){\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    tt;\n" +
    "\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                if (checkStart){\n" +
    "                    tokenStream.mustMatch(Tokens.LBRACE);\n" +
    "                }\n" +
    "\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                try {\n" +
    "\n" +
    "                    while(true){\n" +
    "\n" +
    "                        if (tokenStream.match(Tokens.SEMICOLON) || (readMargins && this._margin())){\n" +
    "                        } else if (this._declaration()){\n" +
    "                            if (!tokenStream.match(Tokens.SEMICOLON)){\n" +
    "                                break;\n" +
    "                            }\n" +
    "                        } else {\n" +
    "                            break;\n" +
    "                        }\n" +
    "                        this._readWhitespace();\n" +
    "                    }\n" +
    "\n" +
    "                    tokenStream.mustMatch(Tokens.RBRACE);\n" +
    "                    this._readWhitespace();\n" +
    "\n" +
    "                } catch (ex) {\n" +
    "                    if (ex instanceof SyntaxError && !this.options.strict){\n" +
    "                        this.fire({\n" +
    "                            type:       \"error\",\n" +
    "                            error:      ex,\n" +
    "                            message:    ex.message,\n" +
    "                            line:       ex.line,\n" +
    "                            col:        ex.col\n" +
    "                        });\n" +
    "                        tt = tokenStream.advance([Tokens.SEMICOLON, Tokens.RBRACE]);\n" +
    "                        if (tt == Tokens.SEMICOLON){\n" +
    "                            this._readDeclarations(false, readMargins);\n" +
    "                        } else if (tt != Tokens.RBRACE){\n" +
    "                            throw ex;\n" +
    "                        }\n" +
    "\n" +
    "                    } else {\n" +
    "                        throw ex;\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "            },\n" +
    "            _readWhitespace: function(){\n" +
    "\n" +
    "                var tokenStream = this._tokenStream,\n" +
    "                    ws = \"\";\n" +
    "\n" +
    "                while(tokenStream.match(Tokens.S)){\n" +
    "                    ws += tokenStream.token().value;\n" +
    "                }\n" +
    "\n" +
    "                return ws;\n" +
    "            },\n" +
    "            _unexpectedToken: function(token){\n" +
    "                throw new SyntaxError(\"Unexpected token '\" + token.value + \"' at line \" + token.startLine + \", col \" + token.startCol + \".\", token.startLine, token.startCol);\n" +
    "            },\n" +
    "            _verifyEnd: function(){\n" +
    "                if (this._tokenStream.LA(1) != Tokens.EOF){\n" +
    "                    this._unexpectedToken(this._tokenStream.LT(1));\n" +
    "                }\n" +
    "            },\n" +
    "            _validateProperty: function(property, value){\n" +
    "                Validation.validate(property, value);\n" +
    "            },\n" +
    "\n" +
    "            parse: function(input){\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                this._stylesheet();\n" +
    "            },\n" +
    "\n" +
    "            parseStyleSheet: function(input){\n" +
    "                return this.parse(input);\n" +
    "            },\n" +
    "\n" +
    "            parseMediaQuery: function(input){\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                var result = this._media_query();\n" +
    "                this._verifyEnd();\n" +
    "                return result;\n" +
    "            },\n" +
    "            parsePropertyValue: function(input){\n" +
    "\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                var result = this._expr();\n" +
    "                this._readWhitespace();\n" +
    "                this._verifyEnd();\n" +
    "                return result;\n" +
    "            },\n" +
    "            parseRule: function(input){\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                var result = this._ruleset();\n" +
    "                this._readWhitespace();\n" +
    "                this._verifyEnd();\n" +
    "                return result;\n" +
    "            },\n" +
    "            parseSelector: function(input){\n" +
    "\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                this._readWhitespace();\n" +
    "\n" +
    "                var result = this._selector();\n" +
    "                this._readWhitespace();\n" +
    "                this._verifyEnd();\n" +
    "                return result;\n" +
    "            },\n" +
    "            parseStyleAttribute: function(input){\n" +
    "                input += \"}\"; // for error recovery in _readDeclarations()\n" +
    "                this._tokenStream = new TokenStream(input, Tokens);\n" +
    "                this._readDeclarations();\n" +
    "            }\n" +
    "        };\n" +
    "    for (prop in additions){\n" +
    "        if (additions.hasOwnProperty(prop)){\n" +
    "            proto[prop] = additions[prop];\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "    return proto;\n" +
    "}();\n" +
    "var Properties = {\n" +
    "    \"align-items\"                   : \"flex-start | flex-end | center | baseline | stretch\",\n" +
    "    \"align-content\"                 : \"flex-start | flex-end | center | space-between | space-around | stretch\",\n" +
    "    \"align-self\"                    : \"auto | flex-start | flex-end | center | baseline | stretch\",\n" +
    "    \"-webkit-align-items\"           : \"flex-start | flex-end | center | baseline | stretch\",\n" +
    "    \"-webkit-align-content\"         : \"flex-start | flex-end | center | space-between | space-around | stretch\",\n" +
    "    \"-webkit-align-self\"            : \"auto | flex-start | flex-end | center | baseline | stretch\",\n" +
    "    \"alignment-adjust\"              : \"auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical | <percentage> | <length>\",\n" +
    "    \"alignment-baseline\"            : \"baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical\",\n" +
    "    \"animation\"                     : 1,\n" +
    "    \"animation-delay\"               : { multi: \"<time>\", comma: true },\n" +
    "    \"animation-direction\"           : { multi: \"normal | reverse | alternate | alternate-reverse\", comma: true },\n" +
    "    \"animation-duration\"            : { multi: \"<time>\", comma: true },\n" +
    "    \"animation-fill-mode\"           : { multi: \"none | forwards | backwards | both\", comma: true },\n" +
    "    \"animation-iteration-count\"     : { multi: \"<number> | infinite\", comma: true },\n" +
    "    \"animation-name\"                : { multi: \"none | <ident>\", comma: true },\n" +
    "    \"animation-play-state\"          : { multi: \"running | paused\", comma: true },\n" +
    "    \"animation-timing-function\"     : 1,\n" +
    "    \"-moz-animation-delay\"               : { multi: \"<time>\", comma: true },\n" +
    "    \"-moz-animation-direction\"           : { multi: \"normal | reverse | alternate | alternate-reverse\", comma: true },\n" +
    "    \"-moz-animation-duration\"            : { multi: \"<time>\", comma: true },\n" +
    "    \"-moz-animation-iteration-count\"     : { multi: \"<number> | infinite\", comma: true },\n" +
    "    \"-moz-animation-name\"                : { multi: \"none | <ident>\", comma: true },\n" +
    "    \"-moz-animation-play-state\"          : { multi: \"running | paused\", comma: true },\n" +
    "\n" +
    "    \"-ms-animation-delay\"               : { multi: \"<time>\", comma: true },\n" +
    "    \"-ms-animation-direction\"           : { multi: \"normal | reverse | alternate | alternate-reverse\", comma: true },\n" +
    "    \"-ms-animation-duration\"            : { multi: \"<time>\", comma: true },\n" +
    "    \"-ms-animation-iteration-count\"     : { multi: \"<number> | infinite\", comma: true },\n" +
    "    \"-ms-animation-name\"                : { multi: \"none | <ident>\", comma: true },\n" +
    "    \"-ms-animation-play-state\"          : { multi: \"running | paused\", comma: true },\n" +
    "\n" +
    "    \"-webkit-animation-delay\"               : { multi: \"<time>\", comma: true },\n" +
    "    \"-webkit-animation-direction\"           : { multi: \"normal | reverse | alternate | alternate-reverse\", comma: true },\n" +
    "    \"-webkit-animation-duration\"            : { multi: \"<time>\", comma: true },\n" +
    "    \"-webkit-animation-fill-mode\"           : { multi: \"none | forwards | backwards | both\", comma: true },\n" +
    "    \"-webkit-animation-iteration-count\"     : { multi: \"<number> | infinite\", comma: true },\n" +
    "    \"-webkit-animation-name\"                : { multi: \"none | <ident>\", comma: true },\n" +
    "    \"-webkit-animation-play-state\"          : { multi: \"running | paused\", comma: true },\n" +
    "\n" +
    "    \"-o-animation-delay\"               : { multi: \"<time>\", comma: true },\n" +
    "    \"-o-animation-direction\"           : { multi: \"normal | reverse | alternate | alternate-reverse\", comma: true },\n" +
    "    \"-o-animation-duration\"            : { multi: \"<time>\", comma: true },\n" +
    "    \"-o-animation-iteration-count\"     : { multi: \"<number> | infinite\", comma: true },\n" +
    "    \"-o-animation-name\"                : { multi: \"none | <ident>\", comma: true },\n" +
    "    \"-o-animation-play-state\"          : { multi: \"running | paused\", comma: true },\n" +
    "\n" +
    "    \"appearance\"                    : \"icon | window | desktop | workspace | document | tooltip | dialog | button | push-button | hyperlink | radio-button | checkbox | menu-item | tab | menu | menubar | pull-down-menu | pop-up-menu | list-menu | radio-group | checkbox-group | outline-tree | range | field | combo-box | signature | password | normal | none | inherit\",\n" +
    "    \"azimuth\"                       : function (expression) {\n" +
    "        var simple      = \"<angle> | leftwards | rightwards | inherit\",\n" +
    "            direction   = \"left-side | far-left | left | center-left | center | center-right | right | far-right | right-side\",\n" +
    "            behind      = false,\n" +
    "            valid       = false,\n" +
    "            part;\n" +
    "\n" +
    "        if (!ValidationTypes.isAny(expression, simple)) {\n" +
    "            if (ValidationTypes.isAny(expression, \"behind\")) {\n" +
    "                behind = true;\n" +
    "                valid = true;\n" +
    "            }\n" +
    "\n" +
    "            if (ValidationTypes.isAny(expression, direction)) {\n" +
    "                valid = true;\n" +
    "                if (!behind) {\n" +
    "                    ValidationTypes.isAny(expression, \"behind\");\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            if (valid) {\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                throw new ValidationError(\"Expected (<'azimuth'>) but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            }\n" +
    "        }\n" +
    "    },\n" +
    "    \"backface-visibility\"           : \"visible | hidden\",\n" +
    "    \"background\"                    : 1,\n" +
    "    \"background-attachment\"         : { multi: \"<attachment>\", comma: true },\n" +
    "    \"background-clip\"               : { multi: \"<box>\", comma: true },\n" +
    "    \"background-color\"              : \"<color> | inherit\",\n" +
    "    \"background-image\"              : { multi: \"<bg-image>\", comma: true },\n" +
    "    \"background-origin\"             : { multi: \"<box>\", comma: true },\n" +
    "    \"background-position\"           : { multi: \"<bg-position>\", comma: true },\n" +
    "    \"background-repeat\"             : { multi: \"<repeat-style>\" },\n" +
    "    \"background-size\"               : { multi: \"<bg-size>\", comma: true },\n" +
    "    \"baseline-shift\"                : \"baseline | sub | super | <percentage> | <length>\",\n" +
    "    \"behavior\"                      : 1,\n" +
    "    \"binding\"                       : 1,\n" +
    "    \"bleed\"                         : \"<length>\",\n" +
    "    \"bookmark-label\"                : \"<content> | <attr> | <string>\",\n" +
    "    \"bookmark-level\"                : \"none | <integer>\",\n" +
    "    \"bookmark-state\"                : \"open | closed\",\n" +
    "    \"bookmark-target\"               : \"none | <uri> | <attr>\",\n" +
    "    \"border\"                        : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"border-bottom\"                 : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"border-bottom-color\"           : \"<color> | inherit\",\n" +
    "    \"border-bottom-left-radius\"     :  \"<x-one-radius>\",\n" +
    "    \"border-bottom-right-radius\"    :  \"<x-one-radius>\",\n" +
    "    \"border-bottom-style\"           : \"<border-style>\",\n" +
    "    \"border-bottom-width\"           : \"<border-width>\",\n" +
    "    \"border-collapse\"               : \"collapse | separate | inherit\",\n" +
    "    \"border-color\"                  : { multi: \"<color> | inherit\", max: 4 },\n" +
    "    \"border-image\"                  : 1,\n" +
    "    \"border-image-outset\"           : { multi: \"<length> | <number>\", max: 4 },\n" +
    "    \"border-image-repeat\"           : { multi: \"stretch | repeat | round\", max: 2 },\n" +
    "    \"border-image-slice\"            : function(expression) {\n" +
    "\n" +
    "        var valid   = false,\n" +
    "            numeric = \"<number> | <percentage>\",\n" +
    "            fill    = false,\n" +
    "            count   = 0,\n" +
    "            max     = 4,\n" +
    "            part;\n" +
    "\n" +
    "        if (ValidationTypes.isAny(expression, \"fill\")) {\n" +
    "            fill = true;\n" +
    "            valid = true;\n" +
    "        }\n" +
    "\n" +
    "        while (expression.hasNext() && count < max) {\n" +
    "            valid = ValidationTypes.isAny(expression, numeric);\n" +
    "            if (!valid) {\n" +
    "                break;\n" +
    "            }\n" +
    "            count++;\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "        if (!fill) {\n" +
    "            ValidationTypes.isAny(expression, \"fill\");\n" +
    "        } else {\n" +
    "            valid = true;\n" +
    "        }\n" +
    "\n" +
    "        if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            if (valid) {\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                throw new ValidationError(\"Expected ([<number> | <percentage>]{1,4} && fill?) but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            }\n" +
    "        }\n" +
    "    },\n" +
    "    \"border-image-source\"           : \"<image> | none\",\n" +
    "    \"border-image-width\"            : { multi: \"<length> | <percentage> | <number> | auto\", max: 4 },\n" +
    "    \"border-left\"                   : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"border-left-color\"             : \"<color> | inherit\",\n" +
    "    \"border-left-style\"             : \"<border-style>\",\n" +
    "    \"border-left-width\"             : \"<border-width>\",\n" +
    "    \"border-radius\"                 : function(expression) {\n" +
    "\n" +
    "        var valid   = false,\n" +
    "            simple = \"<length> | <percentage> | inherit\",\n" +
    "            slash   = false,\n" +
    "            fill    = false,\n" +
    "            count   = 0,\n" +
    "            max     = 8,\n" +
    "            part;\n" +
    "\n" +
    "        while (expression.hasNext() && count < max) {\n" +
    "            valid = ValidationTypes.isAny(expression, simple);\n" +
    "            if (!valid) {\n" +
    "\n" +
    "                if (expression.peek() == \"/\" && count > 0 && !slash) {\n" +
    "                    slash = true;\n" +
    "                    max = count + 5;\n" +
    "                    expression.next();\n" +
    "                } else {\n" +
    "                    break;\n" +
    "                }\n" +
    "            }\n" +
    "            count++;\n" +
    "        }\n" +
    "\n" +
    "        if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            if (valid) {\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                throw new ValidationError(\"Expected (<'border-radius'>) but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            }\n" +
    "        }\n" +
    "    },\n" +
    "    \"border-right\"                  : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"border-right-color\"            : \"<color> | inherit\",\n" +
    "    \"border-right-style\"            : \"<border-style>\",\n" +
    "    \"border-right-width\"            : \"<border-width>\",\n" +
    "    \"border-spacing\"                : { multi: \"<length> | inherit\", max: 2 },\n" +
    "    \"border-style\"                  : { multi: \"<border-style>\", max: 4 },\n" +
    "    \"border-top\"                    : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"border-top-color\"              : \"<color> | inherit\",\n" +
    "    \"border-top-left-radius\"        : \"<x-one-radius>\",\n" +
    "    \"border-top-right-radius\"       : \"<x-one-radius>\",\n" +
    "    \"border-top-style\"              : \"<border-style>\",\n" +
    "    \"border-top-width\"              : \"<border-width>\",\n" +
    "    \"border-width\"                  : { multi: \"<border-width>\", max: 4 },\n" +
    "    \"bottom\"                        : \"<margin-width> | inherit\",\n" +
    "    \"-moz-box-align\"                : \"start | end | center | baseline | stretch\",\n" +
    "    \"-moz-box-decoration-break\"     : \"slice |clone\",\n" +
    "    \"-moz-box-direction\"            : \"normal | reverse | inherit\",\n" +
    "    \"-moz-box-flex\"                 : \"<number>\",\n" +
    "    \"-moz-box-flex-group\"           : \"<integer>\",\n" +
    "    \"-moz-box-lines\"                : \"single | multiple\",\n" +
    "    \"-moz-box-ordinal-group\"        : \"<integer>\",\n" +
    "    \"-moz-box-orient\"               : \"horizontal | vertical | inline-axis | block-axis | inherit\",\n" +
    "    \"-moz-box-pack\"                 : \"start | end | center | justify\",\n" +
    "    \"-webkit-box-align\"             : \"start | end | center | baseline | stretch\",\n" +
    "    \"-webkit-box-decoration-break\"  : \"slice |clone\",\n" +
    "    \"-webkit-box-direction\"         : \"normal | reverse | inherit\",\n" +
    "    \"-webkit-box-flex\"              : \"<number>\",\n" +
    "    \"-webkit-box-flex-group\"        : \"<integer>\",\n" +
    "    \"-webkit-box-lines\"             : \"single | multiple\",\n" +
    "    \"-webkit-box-ordinal-group\"     : \"<integer>\",\n" +
    "    \"-webkit-box-orient\"            : \"horizontal | vertical | inline-axis | block-axis | inherit\",\n" +
    "    \"-webkit-box-pack\"              : \"start | end | center | justify\",\n" +
    "    \"box-shadow\"                    : function (expression) {\n" +
    "        var result      = false,\n" +
    "            part;\n" +
    "\n" +
    "        if (!ValidationTypes.isAny(expression, \"none\")) {\n" +
    "            Validation.multiProperty(\"<shadow>\", expression, true, Infinity);\n" +
    "        } else {\n" +
    "            if (expression.hasNext()) {\n" +
    "                part = expression.next();\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            }\n" +
    "        }\n" +
    "    },\n" +
    "    \"box-sizing\"                    : \"content-box | border-box | inherit\",\n" +
    "    \"break-after\"                   : \"auto | always | avoid | left | right | page | column | avoid-page | avoid-column\",\n" +
    "    \"break-before\"                  : \"auto | always | avoid | left | right | page | column | avoid-page | avoid-column\",\n" +
    "    \"break-inside\"                  : \"auto | avoid | avoid-page | avoid-column\",\n" +
    "    \"caption-side\"                  : \"top | bottom | inherit\",\n" +
    "    \"clear\"                         : \"none | right | left | both | inherit\",\n" +
    "    \"clip\"                          : 1,\n" +
    "    \"color\"                         : \"<color> | inherit\",\n" +
    "    \"color-profile\"                 : 1,\n" +
    "    \"column-count\"                  : \"<integer> | auto\",                      //http://www.w3.org/TR/css3-multicol/\n" +
    "    \"column-fill\"                   : \"auto | balance\",\n" +
    "    \"column-gap\"                    : \"<length> | normal\",\n" +
    "    \"column-rule\"                   : \"<border-width> || <border-style> || <color>\",\n" +
    "    \"column-rule-color\"             : \"<color>\",\n" +
    "    \"column-rule-style\"             : \"<border-style>\",\n" +
    "    \"column-rule-width\"             : \"<border-width>\",\n" +
    "    \"column-span\"                   : \"none | all\",\n" +
    "    \"column-width\"                  : \"<length> | auto\",\n" +
    "    \"columns\"                       : 1,\n" +
    "    \"content\"                       : 1,\n" +
    "    \"counter-increment\"             : 1,\n" +
    "    \"counter-reset\"                 : 1,\n" +
    "    \"crop\"                          : \"<shape> | auto\",\n" +
    "    \"cue\"                           : \"cue-after | cue-before | inherit\",\n" +
    "    \"cue-after\"                     : 1,\n" +
    "    \"cue-before\"                    : 1,\n" +
    "    \"cursor\"                        : 1,\n" +
    "    \"direction\"                     : \"ltr | rtl | inherit\",\n" +
    "    \"display\"                       : \"inline | block | list-item | inline-block | table | inline-table | table-row-group | table-header-group | table-footer-group | table-row | table-column-group | table-column | table-cell | table-caption | grid | inline-grid | none | inherit | -moz-box | -moz-inline-block | -moz-inline-box | -moz-inline-grid | -moz-inline-stack | -moz-inline-table | -moz-grid | -moz-grid-group | -moz-grid-line | -moz-groupbox | -moz-deck | -moz-popup | -moz-stack | -moz-marker | -webkit-box | -webkit-inline-box | -ms-flexbox | -ms-inline-flexbox | flex | -webkit-flex | inline-flex | -webkit-inline-flex\",\n" +
    "    \"dominant-baseline\"             : 1,\n" +
    "    \"drop-initial-after-adjust\"     : \"central | middle | after-edge | text-after-edge | ideographic | alphabetic | mathematical | <percentage> | <length>\",\n" +
    "    \"drop-initial-after-align\"      : \"baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical\",\n" +
    "    \"drop-initial-before-adjust\"    : \"before-edge | text-before-edge | central | middle | hanging | mathematical | <percentage> | <length>\",\n" +
    "    \"drop-initial-before-align\"     : \"caps-height | baseline | use-script | before-edge | text-before-edge | after-edge | text-after-edge | central | middle | ideographic | alphabetic | hanging | mathematical\",\n" +
    "    \"drop-initial-size\"             : \"auto | line | <length> | <percentage>\",\n" +
    "    \"drop-initial-value\"            : \"initial | <integer>\",\n" +
    "    \"elevation\"                     : \"<angle> | below | level | above | higher | lower | inherit\",\n" +
    "    \"empty-cells\"                   : \"show | hide | inherit\",\n" +
    "    \"filter\"                        : 1,\n" +
    "    \"fit\"                           : \"fill | hidden | meet | slice\",\n" +
    "    \"fit-position\"                  : 1,\n" +
    "    \"flex\"                          : \"<flex>\",\n" +
    "    \"flex-basis\"                    : \"<width>\",\n" +
    "    \"flex-direction\"                : \"row | row-reverse | column | column-reverse\",\n" +
    "    \"flex-flow\"                     : \"<flex-direction> || <flex-wrap>\",\n" +
    "    \"flex-grow\"                     : \"<number>\",\n" +
    "    \"flex-shrink\"                   : \"<number>\",\n" +
    "    \"flex-wrap\"                     : \"nowrap | wrap | wrap-reverse\",\n" +
    "    \"-webkit-flex\"                  : \"<flex>\",\n" +
    "    \"-webkit-flex-basis\"            : \"<width>\",\n" +
    "    \"-webkit-flex-direction\"        : \"row | row-reverse | column | column-reverse\",\n" +
    "    \"-webkit-flex-flow\"             : \"<flex-direction> || <flex-wrap>\",\n" +
    "    \"-webkit-flex-grow\"             : \"<number>\",\n" +
    "    \"-webkit-flex-shrink\"           : \"<number>\",\n" +
    "    \"-webkit-flex-wrap\"             : \"nowrap | wrap | wrap-reverse\",\n" +
    "    \"-ms-flex\"                      : \"<flex>\",\n" +
    "    \"-ms-flex-align\"                : \"start | end | center | stretch | baseline\",\n" +
    "    \"-ms-flex-direction\"            : \"row | row-reverse | column | column-reverse | inherit\",\n" +
    "    \"-ms-flex-order\"                : \"<number>\",\n" +
    "    \"-ms-flex-pack\"                 : \"start | end | center | justify\",\n" +
    "    \"-ms-flex-wrap\"                 : \"nowrap | wrap | wrap-reverse\",\n" +
    "    \"float\"                         : \"left | right | none | inherit\",\n" +
    "    \"float-offset\"                  : 1,\n" +
    "    \"font\"                          : 1,\n" +
    "    \"font-family\"                   : 1,\n" +
    "    \"font-size\"                     : \"<absolute-size> | <relative-size> | <length> | <percentage> | inherit\",\n" +
    "    \"font-size-adjust\"              : \"<number> | none | inherit\",\n" +
    "    \"font-stretch\"                  : \"normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded | inherit\",\n" +
    "    \"font-style\"                    : \"normal | italic | oblique | inherit\",\n" +
    "    \"font-variant\"                  : \"normal | small-caps | inherit\",\n" +
    "    \"font-weight\"                   : \"normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit\",\n" +
    "    \"grid-cell-stacking\"            : \"columns | rows | layer\",\n" +
    "    \"grid-column\"                   : 1,\n" +
    "    \"grid-columns\"                  : 1,\n" +
    "    \"grid-column-align\"             : \"start | end | center | stretch\",\n" +
    "    \"grid-column-sizing\"            : 1,\n" +
    "    \"grid-column-span\"              : \"<integer>\",\n" +
    "    \"grid-flow\"                     : \"none | rows | columns\",\n" +
    "    \"grid-layer\"                    : \"<integer>\",\n" +
    "    \"grid-row\"                      : 1,\n" +
    "    \"grid-rows\"                     : 1,\n" +
    "    \"grid-row-align\"                : \"start | end | center | stretch\",\n" +
    "    \"grid-row-gap\"                  : 1,\n" +
    "    \"grid-row-span\"                 : \"<integer>\",\n" +
    "    \"grid-row-sizing\"               : 1,\n" +
    "    \"grid-template\"                 : 1,\n" +
    "    \"grid-template-areas\"           : 1,\n" +
    "    \"grid-template-columns\"         : 1,\n" +
    "    \"grid-template-rows\"            : 1,\n" +
    "    \"hanging-punctuation\"           : 1,\n" +
    "    \"height\"                        : \"<margin-width> | <content-sizing> | inherit\",\n" +
    "    \"hyphenate-after\"               : \"<integer> | auto\",\n" +
    "    \"hyphenate-before\"              : \"<integer> | auto\",\n" +
    "    \"hyphenate-character\"           : \"<string> | auto\",\n" +
    "    \"hyphenate-lines\"               : \"no-limit | <integer>\",\n" +
    "    \"hyphenate-resource\"            : 1,\n" +
    "    \"hyphens\"                       : \"none | manual | auto\",\n" +
    "    \"icon\"                          : 1,\n" +
    "    \"image-orientation\"             : \"angle | auto\",\n" +
    "    \"image-rendering\"               : 1,\n" +
    "    \"image-resolution\"              : 1,\n" +
    "    \"inline-box-align\"              : \"initial | last | <integer>\",\n" +
    "    \"justify-content\"               : \"flex-start | flex-end | center | space-between | space-around\",\n" +
    "    \"-webkit-justify-content\"       : \"flex-start | flex-end | center | space-between | space-around\",\n" +
    "    \"left\"                          : \"<margin-width> | inherit\",\n" +
    "    \"letter-spacing\"                : \"<length> | normal | inherit\",\n" +
    "    \"line-height\"                   : \"<number> | <length> | <percentage> | normal | inherit\",\n" +
    "    \"line-break\"                    : \"auto | loose | normal | strict\",\n" +
    "    \"line-stacking\"                 : 1,\n" +
    "    \"line-stacking-ruby\"            : \"exclude-ruby | include-ruby\",\n" +
    "    \"line-stacking-shift\"           : \"consider-shifts | disregard-shifts\",\n" +
    "    \"line-stacking-strategy\"        : \"inline-line-height | block-line-height | max-height | grid-height\",\n" +
    "    \"list-style\"                    : 1,\n" +
    "    \"list-style-image\"              : \"<uri> | none | inherit\",\n" +
    "    \"list-style-position\"           : \"inside | outside | inherit\",\n" +
    "    \"list-style-type\"               : \"disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none | inherit\",\n" +
    "    \"margin\"                        : { multi: \"<margin-width> | inherit\", max: 4 },\n" +
    "    \"margin-bottom\"                 : \"<margin-width> | inherit\",\n" +
    "    \"margin-left\"                   : \"<margin-width> | inherit\",\n" +
    "    \"margin-right\"                  : \"<margin-width> | inherit\",\n" +
    "    \"margin-top\"                    : \"<margin-width> | inherit\",\n" +
    "    \"mark\"                          : 1,\n" +
    "    \"mark-after\"                    : 1,\n" +
    "    \"mark-before\"                   : 1,\n" +
    "    \"marks\"                         : 1,\n" +
    "    \"marquee-direction\"             : 1,\n" +
    "    \"marquee-play-count\"            : 1,\n" +
    "    \"marquee-speed\"                 : 1,\n" +
    "    \"marquee-style\"                 : 1,\n" +
    "    \"max-height\"                    : \"<length> | <percentage> | <content-sizing> | none | inherit\",\n" +
    "    \"max-width\"                     : \"<length> | <percentage> | <content-sizing> | none | inherit\",\n" +
    "    \"max-zoom\"                      : \"<number> | <percentage> | auto\",\n" +
    "    \"min-height\"                    : \"<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit\",\n" +
    "    \"min-width\"                     : \"<length> | <percentage> | <content-sizing> | contain-floats | -moz-contain-floats | -webkit-contain-floats | inherit\",\n" +
    "    \"min-zoom\"                      : \"<number> | <percentage> | auto\",\n" +
    "    \"move-to\"                       : 1,\n" +
    "    \"nav-down\"                      : 1,\n" +
    "    \"nav-index\"                     : 1,\n" +
    "    \"nav-left\"                      : 1,\n" +
    "    \"nav-right\"                     : 1,\n" +
    "    \"nav-up\"                        : 1,\n" +
    "    \"opacity\"                       : \"<number> | inherit\",\n" +
    "    \"order\"                         : \"<integer>\",\n" +
    "    \"-webkit-order\"                 : \"<integer>\",\n" +
    "    \"orphans\"                       : \"<integer> | inherit\",\n" +
    "    \"outline\"                       : 1,\n" +
    "    \"outline-color\"                 : \"<color> | invert | inherit\",\n" +
    "    \"outline-offset\"                : 1,\n" +
    "    \"outline-style\"                 : \"<border-style> | inherit\",\n" +
    "    \"outline-width\"                 : \"<border-width> | inherit\",\n" +
    "    \"overflow\"                      : \"visible | hidden | scroll | auto | inherit\",\n" +
    "    \"overflow-style\"                : 1,\n" +
    "    \"overflow-wrap\"                 : \"normal | break-word\",\n" +
    "    \"overflow-x\"                    : 1,\n" +
    "    \"overflow-y\"                    : 1,\n" +
    "    \"padding\"                       : { multi: \"<padding-width> | inherit\", max: 4 },\n" +
    "    \"padding-bottom\"                : \"<padding-width> | inherit\",\n" +
    "    \"padding-left\"                  : \"<padding-width> | inherit\",\n" +
    "    \"padding-right\"                 : \"<padding-width> | inherit\",\n" +
    "    \"padding-top\"                   : \"<padding-width> | inherit\",\n" +
    "    \"page\"                          : 1,\n" +
    "    \"page-break-after\"              : \"auto | always | avoid | left | right | inherit\",\n" +
    "    \"page-break-before\"             : \"auto | always | avoid | left | right | inherit\",\n" +
    "    \"page-break-inside\"             : \"auto | avoid | inherit\",\n" +
    "    \"page-policy\"                   : 1,\n" +
    "    \"pause\"                         : 1,\n" +
    "    \"pause-after\"                   : 1,\n" +
    "    \"pause-before\"                  : 1,\n" +
    "    \"perspective\"                   : 1,\n" +
    "    \"perspective-origin\"            : 1,\n" +
    "    \"phonemes\"                      : 1,\n" +
    "    \"pitch\"                         : 1,\n" +
    "    \"pitch-range\"                   : 1,\n" +
    "    \"play-during\"                   : 1,\n" +
    "    \"pointer-events\"                : \"auto | none | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | inherit\",\n" +
    "    \"position\"                      : \"static | relative | absolute | fixed | inherit\",\n" +
    "    \"presentation-level\"            : 1,\n" +
    "    \"punctuation-trim\"              : 1,\n" +
    "    \"quotes\"                        : 1,\n" +
    "    \"rendering-intent\"              : 1,\n" +
    "    \"resize\"                        : 1,\n" +
    "    \"rest\"                          : 1,\n" +
    "    \"rest-after\"                    : 1,\n" +
    "    \"rest-before\"                   : 1,\n" +
    "    \"richness\"                      : 1,\n" +
    "    \"right\"                         : \"<margin-width> | inherit\",\n" +
    "    \"rotation\"                      : 1,\n" +
    "    \"rotation-point\"                : 1,\n" +
    "    \"ruby-align\"                    : 1,\n" +
    "    \"ruby-overhang\"                 : 1,\n" +
    "    \"ruby-position\"                 : 1,\n" +
    "    \"ruby-span\"                     : 1,\n" +
    "    \"size\"                          : 1,\n" +
    "    \"speak\"                         : \"normal | none | spell-out | inherit\",\n" +
    "    \"speak-header\"                  : \"once | always | inherit\",\n" +
    "    \"speak-numeral\"                 : \"digits | continuous | inherit\",\n" +
    "    \"speak-punctuation\"             : \"code | none | inherit\",\n" +
    "    \"speech-rate\"                   : 1,\n" +
    "    \"src\"                           : 1,\n" +
    "    \"stress\"                        : 1,\n" +
    "    \"string-set\"                    : 1,\n" +
    "\n" +
    "    \"table-layout\"                  : \"auto | fixed | inherit\",\n" +
    "    \"tab-size\"                      : \"<integer> | <length>\",\n" +
    "    \"target\"                        : 1,\n" +
    "    \"target-name\"                   : 1,\n" +
    "    \"target-new\"                    : 1,\n" +
    "    \"target-position\"               : 1,\n" +
    "    \"text-align\"                    : \"left | right | center | justify | inherit\" ,\n" +
    "    \"text-align-last\"               : 1,\n" +
    "    \"text-decoration\"               : 1,\n" +
    "    \"text-emphasis\"                 : 1,\n" +
    "    \"text-height\"                   : 1,\n" +
    "    \"text-indent\"                   : \"<length> | <percentage> | inherit\",\n" +
    "    \"text-justify\"                  : \"auto | none | inter-word | inter-ideograph | inter-cluster | distribute | kashida\",\n" +
    "    \"text-outline\"                  : 1,\n" +
    "    \"text-overflow\"                 : 1,\n" +
    "    \"text-rendering\"                : \"auto | optimizeSpeed | optimizeLegibility | geometricPrecision | inherit\",\n" +
    "    \"text-shadow\"                   : 1,\n" +
    "    \"text-transform\"                : \"capitalize | uppercase | lowercase | none | inherit\",\n" +
    "    \"text-wrap\"                     : \"normal | none | avoid\",\n" +
    "    \"top\"                           : \"<margin-width> | inherit\",\n" +
    "    \"-ms-touch-action\"              : \"auto | none | pan-x | pan-y\",\n" +
    "    \"touch-action\"                  : \"auto | none | pan-x | pan-y\",\n" +
    "    \"transform\"                     : 1,\n" +
    "    \"transform-origin\"              : 1,\n" +
    "    \"transform-style\"               : 1,\n" +
    "    \"transition\"                    : 1,\n" +
    "    \"transition-delay\"              : 1,\n" +
    "    \"transition-duration\"           : 1,\n" +
    "    \"transition-property\"           : 1,\n" +
    "    \"transition-timing-function\"    : 1,\n" +
    "    \"unicode-bidi\"                  : \"normal | embed | isolate | bidi-override | isolate-override | plaintext | inherit\",\n" +
    "    \"user-modify\"                   : \"read-only | read-write | write-only | inherit\",\n" +
    "    \"user-select\"                   : \"none | text | toggle | element | elements | all | inherit\",\n" +
    "    \"user-zoom\"                     : \"zoom | fixed\",\n" +
    "    \"vertical-align\"                : \"auto | use-script | baseline | sub | super | top | text-top | central | middle | bottom | text-bottom | <percentage> | <length>\",\n" +
    "    \"visibility\"                    : \"visible | hidden | collapse | inherit\",\n" +
    "    \"voice-balance\"                 : 1,\n" +
    "    \"voice-duration\"                : 1,\n" +
    "    \"voice-family\"                  : 1,\n" +
    "    \"voice-pitch\"                   : 1,\n" +
    "    \"voice-pitch-range\"             : 1,\n" +
    "    \"voice-rate\"                    : 1,\n" +
    "    \"voice-stress\"                  : 1,\n" +
    "    \"voice-volume\"                  : 1,\n" +
    "    \"volume\"                        : 1,\n" +
    "    \"white-space\"                   : \"normal | pre | nowrap | pre-wrap | pre-line | inherit | -pre-wrap | -o-pre-wrap | -moz-pre-wrap | -hp-pre-wrap\", //http://perishablepress.com/wrapping-content/\n" +
    "    \"white-space-collapse\"          : 1,\n" +
    "    \"widows\"                        : \"<integer> | inherit\",\n" +
    "    \"width\"                         : \"<length> | <percentage> | <content-sizing> | auto | inherit\",\n" +
    "    \"word-break\"                    : \"normal | keep-all | break-all\",\n" +
    "    \"word-spacing\"                  : \"<length> | normal | inherit\",\n" +
    "    \"word-wrap\"                     : \"normal | break-word\",\n" +
    "    \"writing-mode\"                  : \"horizontal-tb | vertical-rl | vertical-lr | lr-tb | rl-tb | tb-rl | bt-rl | tb-lr | bt-lr | lr-bt | rl-bt | lr | rl | tb | inherit\",\n" +
    "    \"z-index\"                       : \"<integer> | auto | inherit\",\n" +
    "    \"zoom\"                          : \"<number> | <percentage> | normal\"\n" +
    "};\n" +
    "function PropertyName(text, hack, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, text, line, col, Parser.PROPERTY_NAME_TYPE);\n" +
    "    this.hack = hack;\n" +
    "\n" +
    "}\n" +
    "\n" +
    "PropertyName.prototype = new SyntaxUnit();\n" +
    "PropertyName.prototype.constructor = PropertyName;\n" +
    "PropertyName.prototype.toString = function(){\n" +
    "    return (this.hack ? this.hack : \"\") + this.text;\n" +
    "};\n" +
    "function PropertyValue(parts, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, parts.join(\" \"), line, col, Parser.PROPERTY_VALUE_TYPE);\n" +
    "    this.parts = parts;\n" +
    "\n" +
    "}\n" +
    "\n" +
    "PropertyValue.prototype = new SyntaxUnit();\n" +
    "PropertyValue.prototype.constructor = PropertyValue;\n" +
    "function PropertyValueIterator(value){\n" +
    "    this._i = 0;\n" +
    "    this._parts = value.parts;\n" +
    "    this._marks = [];\n" +
    "    this.value = value;\n" +
    "\n" +
    "}\n" +
    "PropertyValueIterator.prototype.count = function(){\n" +
    "    return this._parts.length;\n" +
    "};\n" +
    "PropertyValueIterator.prototype.isFirst = function(){\n" +
    "    return this._i === 0;\n" +
    "};\n" +
    "PropertyValueIterator.prototype.hasNext = function(){\n" +
    "    return (this._i < this._parts.length);\n" +
    "};\n" +
    "PropertyValueIterator.prototype.mark = function(){\n" +
    "    this._marks.push(this._i);\n" +
    "};\n" +
    "PropertyValueIterator.prototype.peek = function(count){\n" +
    "    return this.hasNext() ? this._parts[this._i + (count || 0)] : null;\n" +
    "};\n" +
    "PropertyValueIterator.prototype.next = function(){\n" +
    "    return this.hasNext() ? this._parts[this._i++] : null;\n" +
    "};\n" +
    "PropertyValueIterator.prototype.previous = function(){\n" +
    "    return this._i > 0 ? this._parts[--this._i] : null;\n" +
    "};\n" +
    "PropertyValueIterator.prototype.restore = function(){\n" +
    "    if (this._marks.length){\n" +
    "        this._i = this._marks.pop();\n" +
    "    }\n" +
    "};\n" +
    "function PropertyValuePart(text, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, text, line, col, Parser.PROPERTY_VALUE_PART_TYPE);\n" +
    "    this.type = \"unknown\";\n" +
    "\n" +
    "    var temp;\n" +
    "    if (/^([+\\-]?[\\d\\.]+)([a-z]+)$/i.test(text)){  //dimension\n" +
    "        this.type = \"dimension\";\n" +
    "        this.value = +RegExp.$1;\n" +
    "        this.units = RegExp.$2;\n" +
    "        switch(this.units.toLowerCase()){\n" +
    "\n" +
    "            case \"em\":\n" +
    "            case \"rem\":\n" +
    "            case \"ex\":\n" +
    "            case \"px\":\n" +
    "            case \"cm\":\n" +
    "            case \"mm\":\n" +
    "            case \"in\":\n" +
    "            case \"pt\":\n" +
    "            case \"pc\":\n" +
    "            case \"ch\":\n" +
    "            case \"vh\":\n" +
    "            case \"vw\":\n" +
    "            case \"fr\":\n" +
    "            case \"vmax\":\n" +
    "            case \"vmin\":\n" +
    "                this.type = \"length\";\n" +
    "                break;\n" +
    "\n" +
    "            case \"deg\":\n" +
    "            case \"rad\":\n" +
    "            case \"grad\":\n" +
    "                this.type = \"angle\";\n" +
    "                break;\n" +
    "\n" +
    "            case \"ms\":\n" +
    "            case \"s\":\n" +
    "                this.type = \"time\";\n" +
    "                break;\n" +
    "\n" +
    "            case \"hz\":\n" +
    "            case \"khz\":\n" +
    "                this.type = \"frequency\";\n" +
    "                break;\n" +
    "\n" +
    "            case \"dpi\":\n" +
    "            case \"dpcm\":\n" +
    "                this.type = \"resolution\";\n" +
    "                break;\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "    } else if (/^([+\\-]?[\\d\\.]+)%$/i.test(text)){  //percentage\n" +
    "        this.type = \"percentage\";\n" +
    "        this.value = +RegExp.$1;\n" +
    "    } else if (/^([+\\-]?\\d+)$/i.test(text)){  //integer\n" +
    "        this.type = \"integer\";\n" +
    "        this.value = +RegExp.$1;\n" +
    "    } else if (/^([+\\-]?[\\d\\.]+)$/i.test(text)){  //number\n" +
    "        this.type = \"number\";\n" +
    "        this.value = +RegExp.$1;\n" +
    "\n" +
    "    } else if (/^#([a-f0-9]{3,6})/i.test(text)){  //hexcolor\n" +
    "        this.type = \"color\";\n" +
    "        temp = RegExp.$1;\n" +
    "        if (temp.length == 3){\n" +
    "            this.red    = parseInt(temp.charAt(0)+temp.charAt(0),16);\n" +
    "            this.green  = parseInt(temp.charAt(1)+temp.charAt(1),16);\n" +
    "            this.blue   = parseInt(temp.charAt(2)+temp.charAt(2),16);\n" +
    "        } else {\n" +
    "            this.red    = parseInt(temp.substring(0,2),16);\n" +
    "            this.green  = parseInt(temp.substring(2,4),16);\n" +
    "            this.blue   = parseInt(temp.substring(4,6),16);\n" +
    "        }\n" +
    "    } else if (/^rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)/i.test(text)){ //rgb() color with absolute numbers\n" +
    "        this.type   = \"color\";\n" +
    "        this.red    = +RegExp.$1;\n" +
    "        this.green  = +RegExp.$2;\n" +
    "        this.blue   = +RegExp.$3;\n" +
    "    } else if (/^rgb\\(\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*\\)/i.test(text)){ //rgb() color with percentages\n" +
    "        this.type   = \"color\";\n" +
    "        this.red    = +RegExp.$1 * 255 / 100;\n" +
    "        this.green  = +RegExp.$2 * 255 / 100;\n" +
    "        this.blue   = +RegExp.$3 * 255 / 100;\n" +
    "    } else if (/^rgba\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*([\\d\\.]+)\\s*\\)/i.test(text)){ //rgba() color with absolute numbers\n" +
    "        this.type   = \"color\";\n" +
    "        this.red    = +RegExp.$1;\n" +
    "        this.green  = +RegExp.$2;\n" +
    "        this.blue   = +RegExp.$3;\n" +
    "        this.alpha  = +RegExp.$4;\n" +
    "    } else if (/^rgba\\(\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*,\\s*([\\d\\.]+)\\s*\\)/i.test(text)){ //rgba() color with percentages\n" +
    "        this.type   = \"color\";\n" +
    "        this.red    = +RegExp.$1 * 255 / 100;\n" +
    "        this.green  = +RegExp.$2 * 255 / 100;\n" +
    "        this.blue   = +RegExp.$3 * 255 / 100;\n" +
    "        this.alpha  = +RegExp.$4;\n" +
    "    } else if (/^hsl\\(\\s*(\\d+)\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*\\)/i.test(text)){ //hsl()\n" +
    "        this.type   = \"color\";\n" +
    "        this.hue    = +RegExp.$1;\n" +
    "        this.saturation = +RegExp.$2 / 100;\n" +
    "        this.lightness  = +RegExp.$3 / 100;\n" +
    "    } else if (/^hsla\\(\\s*(\\d+)\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*,\\s*([\\d\\.]+)\\s*\\)/i.test(text)){ //hsla() color with percentages\n" +
    "        this.type   = \"color\";\n" +
    "        this.hue    = +RegExp.$1;\n" +
    "        this.saturation = +RegExp.$2 / 100;\n" +
    "        this.lightness  = +RegExp.$3 / 100;\n" +
    "        this.alpha  = +RegExp.$4;\n" +
    "    } else if (/^url\\([\"']?([^\\)\"']+)[\"']?\\)/i.test(text)){ //URI\n" +
    "        this.type   = \"uri\";\n" +
    "        this.uri    = RegExp.$1;\n" +
    "    } else if (/^([^\\(]+)\\(/i.test(text)){\n" +
    "        this.type   = \"function\";\n" +
    "        this.name   = RegExp.$1;\n" +
    "        this.value  = text;\n" +
    "    } else if (/^[\"'][^\"']*[\"']/.test(text)){    //string\n" +
    "        this.type   = \"string\";\n" +
    "        this.value  = eval(text);\n" +
    "    } else if (Colors[text.toLowerCase()]){  //named color\n" +
    "        this.type   = \"color\";\n" +
    "        temp        = Colors[text.toLowerCase()].substring(1);\n" +
    "        this.red    = parseInt(temp.substring(0,2),16);\n" +
    "        this.green  = parseInt(temp.substring(2,4),16);\n" +
    "        this.blue   = parseInt(temp.substring(4,6),16);\n" +
    "    } else if (/^[\\,\\/]$/.test(text)){\n" +
    "        this.type   = \"operator\";\n" +
    "        this.value  = text;\n" +
    "    } else if (/^[a-z\\-_\u0080-\uFFFF][a-z0-9\\-_\u0080-\uFFFF]*$/i.test(text)){\n" +
    "        this.type   = \"identifier\";\n" +
    "        this.value  = text;\n" +
    "    }\n" +
    "\n" +
    "}\n" +
    "\n" +
    "PropertyValuePart.prototype = new SyntaxUnit();\n" +
    "PropertyValuePart.prototype.constructor = PropertyValuePart;\n" +
    "PropertyValuePart.fromToken = function(token){\n" +
    "    return new PropertyValuePart(token.value, token.startLine, token.startCol);\n" +
    "};\n" +
    "var Pseudos = {\n" +
    "    \":first-letter\": 1,\n" +
    "    \":first-line\":   1,\n" +
    "    \":before\":       1,\n" +
    "    \":after\":        1\n" +
    "};\n" +
    "\n" +
    "Pseudos.ELEMENT = 1;\n" +
    "Pseudos.CLASS = 2;\n" +
    "\n" +
    "Pseudos.isElement = function(pseudo){\n" +
    "    return pseudo.indexOf(\"::\") === 0 || Pseudos[pseudo.toLowerCase()] == Pseudos.ELEMENT;\n" +
    "};\n" +
    "function Selector(parts, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, parts.join(\" \"), line, col, Parser.SELECTOR_TYPE);\n" +
    "    this.parts = parts;\n" +
    "    this.specificity = Specificity.calculate(this);\n" +
    "\n" +
    "}\n" +
    "\n" +
    "Selector.prototype = new SyntaxUnit();\n" +
    "Selector.prototype.constructor = Selector;\n" +
    "function SelectorPart(elementName, modifiers, text, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, text, line, col, Parser.SELECTOR_PART_TYPE);\n" +
    "    this.elementName = elementName;\n" +
    "    this.modifiers = modifiers;\n" +
    "\n" +
    "}\n" +
    "\n" +
    "SelectorPart.prototype = new SyntaxUnit();\n" +
    "SelectorPart.prototype.constructor = SelectorPart;\n" +
    "function SelectorSubPart(text, type, line, col){\n" +
    "\n" +
    "    SyntaxUnit.call(this, text, line, col, Parser.SELECTOR_SUB_PART_TYPE);\n" +
    "    this.type = type;\n" +
    "    this.args = [];\n" +
    "\n" +
    "}\n" +
    "\n" +
    "SelectorSubPart.prototype = new SyntaxUnit();\n" +
    "SelectorSubPart.prototype.constructor = SelectorSubPart;\n" +
    "function Specificity(a, b, c, d){\n" +
    "    this.a = a;\n" +
    "    this.b = b;\n" +
    "    this.c = c;\n" +
    "    this.d = d;\n" +
    "}\n" +
    "\n" +
    "Specificity.prototype = {\n" +
    "    constructor: Specificity,\n" +
    "    compare: function(other){\n" +
    "        var comps = [\"a\", \"b\", \"c\", \"d\"],\n" +
    "            i, len;\n" +
    "\n" +
    "        for (i=0, len=comps.length; i < len; i++){\n" +
    "            if (this[comps[i]] < other[comps[i]]){\n" +
    "                return -1;\n" +
    "            } else if (this[comps[i]] > other[comps[i]]){\n" +
    "                return 1;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return 0;\n" +
    "    },\n" +
    "    valueOf: function(){\n" +
    "        return (this.a * 1000) + (this.b * 100) + (this.c * 10) + this.d;\n" +
    "    },\n" +
    "    toString: function(){\n" +
    "        return this.a + \",\" + this.b + \",\" + this.c + \",\" + this.d;\n" +
    "    }\n" +
    "\n" +
    "};\n" +
    "Specificity.calculate = function(selector){\n" +
    "\n" +
    "    var i, len,\n" +
    "        part,\n" +
    "        b=0, c=0, d=0;\n" +
    "\n" +
    "    function updateValues(part){\n" +
    "\n" +
    "        var i, j, len, num,\n" +
    "            elementName = part.elementName ? part.elementName.text : \"\",\n" +
    "            modifier;\n" +
    "\n" +
    "        if (elementName && elementName.charAt(elementName.length-1) != \"*\") {\n" +
    "            d++;\n" +
    "        }\n" +
    "\n" +
    "        for (i=0, len=part.modifiers.length; i < len; i++){\n" +
    "            modifier = part.modifiers[i];\n" +
    "            switch(modifier.type){\n" +
    "                case \"class\":\n" +
    "                case \"attribute\":\n" +
    "                    c++;\n" +
    "                    break;\n" +
    "\n" +
    "                case \"id\":\n" +
    "                    b++;\n" +
    "                    break;\n" +
    "\n" +
    "                case \"pseudo\":\n" +
    "                    if (Pseudos.isElement(modifier.text)){\n" +
    "                        d++;\n" +
    "                    } else {\n" +
    "                        c++;\n" +
    "                    }\n" +
    "                    break;\n" +
    "\n" +
    "                case \"not\":\n" +
    "                    for (j=0, num=modifier.args.length; j < num; j++){\n" +
    "                        updateValues(modifier.args[j]);\n" +
    "                    }\n" +
    "            }\n" +
    "         }\n" +
    "    }\n" +
    "\n" +
    "    for (i=0, len=selector.parts.length; i < len; i++){\n" +
    "        part = selector.parts[i];\n" +
    "\n" +
    "        if (part instanceof SelectorPart){\n" +
    "            updateValues(part);\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "    return new Specificity(0, b, c, d);\n" +
    "};\n" +
    "\n" +
    "var h = /^[0-9a-fA-F]$/,\n" +
    "    nonascii = /^[\u0080-\uFFFF]$/,\n" +
    "    nl = /\\n|\\r\\n|\\r|\\f/;\n" +
    "\n" +
    "\n" +
    "function isHexDigit(c){\n" +
    "    return c !== null && h.test(c);\n" +
    "}\n" +
    "\n" +
    "function isDigit(c){\n" +
    "    return c !== null && /\\d/.test(c);\n" +
    "}\n" +
    "\n" +
    "function isWhitespace(c){\n" +
    "    return c !== null && /\\s/.test(c);\n" +
    "}\n" +
    "\n" +
    "function isNewLine(c){\n" +
    "    return c !== null && nl.test(c);\n" +
    "}\n" +
    "\n" +
    "function isNameStart(c){\n" +
    "    return c !== null && (/[a-z_\u0080-\uFFFF\\\\]/i.test(c));\n" +
    "}\n" +
    "\n" +
    "function isNameChar(c){\n" +
    "    return c !== null && (isNameStart(c) || /[0-9\\-\\\\]/.test(c));\n" +
    "}\n" +
    "\n" +
    "function isIdentStart(c){\n" +
    "    return c !== null && (isNameStart(c) || /\\-\\\\/.test(c));\n" +
    "}\n" +
    "\n" +
    "function mix(receiver, supplier){\n" +
    "    for (var prop in supplier){\n" +
    "        if (supplier.hasOwnProperty(prop)){\n" +
    "            receiver[prop] = supplier[prop];\n" +
    "        }\n" +
    "    }\n" +
    "    return receiver;\n" +
    "}\n" +
    "function TokenStream(input){\n" +
    "    TokenStreamBase.call(this, input, Tokens);\n" +
    "}\n" +
    "\n" +
    "TokenStream.prototype = mix(new TokenStreamBase(), {\n" +
    "    _getToken: function(channel){\n" +
    "\n" +
    "        var c,\n" +
    "            reader = this._reader,\n" +
    "            token   = null,\n" +
    "            startLine   = reader.getLine(),\n" +
    "            startCol    = reader.getCol();\n" +
    "\n" +
    "        c = reader.read();\n" +
    "\n" +
    "\n" +
    "        while(c){\n" +
    "            switch(c){\n" +
    "                case \"/\":\n" +
    "\n" +
    "                    if(reader.peek() == \"*\"){\n" +
    "                        token = this.commentToken(c, startLine, startCol);\n" +
    "                    } else {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "                    break;\n" +
    "                case \"|\":\n" +
    "                case \"~\":\n" +
    "                case \"^\":\n" +
    "                case \"$\":\n" +
    "                case \"*\":\n" +
    "                    if(reader.peek() == \"=\"){\n" +
    "                        token = this.comparisonToken(c, startLine, startCol);\n" +
    "                    } else {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "                    break;\n" +
    "                case \"\\\"\":\n" +
    "                case \"'\":\n" +
    "                    token = this.stringToken(c, startLine, startCol);\n" +
    "                    break;\n" +
    "                case \"#\":\n" +
    "                    if (isNameChar(reader.peek())){\n" +
    "                        token = this.hashToken(c, startLine, startCol);\n" +
    "                    } else {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "                    break;\n" +
    "                case \".\":\n" +
    "                    if (isDigit(reader.peek())){\n" +
    "                        token = this.numberToken(c, startLine, startCol);\n" +
    "                    } else {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "                    break;\n" +
    "                case \"-\":\n" +
    "                    if (reader.peek() == \"-\"){  //could be closing HTML-style comment\n" +
    "                        token = this.htmlCommentEndToken(c, startLine, startCol);\n" +
    "                    } else if (isNameStart(reader.peek())){\n" +
    "                        token = this.identOrFunctionToken(c, startLine, startCol);\n" +
    "                    } else {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "                    break;\n" +
    "                case \"!\":\n" +
    "                    token = this.importantToken(c, startLine, startCol);\n" +
    "                    break;\n" +
    "                case \"@\":\n" +
    "                    token = this.atRuleToken(c, startLine, startCol);\n" +
    "                    break;\n" +
    "                case \":\":\n" +
    "                    token = this.notToken(c, startLine, startCol);\n" +
    "                    break;\n" +
    "                case \"<\":\n" +
    "                    token = this.htmlCommentStartToken(c, startLine, startCol);\n" +
    "                    break;\n" +
    "                case \"U\":\n" +
    "                case \"u\":\n" +
    "                    if (reader.peek() == \"+\"){\n" +
    "                        token = this.unicodeRangeToken(c, startLine, startCol);\n" +
    "                        break;\n" +
    "                    }\n" +
    "                default:\n" +
    "                    if (isDigit(c)){\n" +
    "                        token = this.numberToken(c, startLine, startCol);\n" +
    "                    } else\n" +
    "                    if (isWhitespace(c)){\n" +
    "                        token = this.whitespaceToken(c, startLine, startCol);\n" +
    "                    } else\n" +
    "                    if (isIdentStart(c)){\n" +
    "                        token = this.identOrFunctionToken(c, startLine, startCol);\n" +
    "                    } else\n" +
    "                    {\n" +
    "                        token = this.charToken(c, startLine, startCol);\n" +
    "                    }\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n" +
    "            }\n" +
    "            break;\n" +
    "        }\n" +
    "\n" +
    "        if (!token && c === null){\n" +
    "            token = this.createToken(Tokens.EOF,null,startLine,startCol);\n" +
    "        }\n" +
    "\n" +
    "        return token;\n" +
    "    },\n" +
    "    createToken: function(tt, value, startLine, startCol, options){\n" +
    "        var reader = this._reader;\n" +
    "        options = options || {};\n" +
    "\n" +
    "        return {\n" +
    "            value:      value,\n" +
    "            type:       tt,\n" +
    "            channel:    options.channel,\n" +
    "            endChar:    options.endChar,\n" +
    "            hide:       options.hide || false,\n" +
    "            startLine:  startLine,\n" +
    "            startCol:   startCol,\n" +
    "            endLine:    reader.getLine(),\n" +
    "            endCol:     reader.getCol()\n" +
    "        };\n" +
    "    },\n" +
    "    atRuleToken: function(first, startLine, startCol){\n" +
    "        var rule    = first,\n" +
    "            reader  = this._reader,\n" +
    "            tt      = Tokens.CHAR,\n" +
    "            valid   = false,\n" +
    "            ident,\n" +
    "            c;\n" +
    "        reader.mark();\n" +
    "        ident = this.readName();\n" +
    "        rule = first + ident;\n" +
    "        tt = Tokens.type(rule.toLowerCase());\n" +
    "        if (tt == Tokens.CHAR || tt == Tokens.UNKNOWN){\n" +
    "            if (rule.length > 1){\n" +
    "                tt = Tokens.UNKNOWN_SYM;\n" +
    "            } else {\n" +
    "                tt = Tokens.CHAR;\n" +
    "                rule = first;\n" +
    "                reader.reset();\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, rule, startLine, startCol);\n" +
    "    },\n" +
    "    charToken: function(c, startLine, startCol){\n" +
    "        var tt = Tokens.type(c);\n" +
    "        var opts = {};\n" +
    "\n" +
    "        if (tt == -1){\n" +
    "            tt = Tokens.CHAR;\n" +
    "        } else {\n" +
    "            opts.endChar = Tokens[tt].endChar;\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, c, startLine, startCol, opts);\n" +
    "    },\n" +
    "    commentToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            comment = this.readComment(first);\n" +
    "\n" +
    "        return this.createToken(Tokens.COMMENT, comment, startLine, startCol);\n" +
    "    },\n" +
    "    comparisonToken: function(c, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            comparison  = c + reader.read(),\n" +
    "            tt      = Tokens.type(comparison) || Tokens.CHAR;\n" +
    "\n" +
    "        return this.createToken(tt, comparison, startLine, startCol);\n" +
    "    },\n" +
    "    hashToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            name    = this.readName(first);\n" +
    "\n" +
    "        return this.createToken(Tokens.HASH, name, startLine, startCol);\n" +
    "    },\n" +
    "    htmlCommentStartToken: function(first, startLine, startCol){\n" +
    "        var reader      = this._reader,\n" +
    "            text        = first;\n" +
    "\n" +
    "        reader.mark();\n" +
    "        text += reader.readCount(3);\n" +
    "\n" +
    "        if (text == \"<!--\"){\n" +
    "            return this.createToken(Tokens.CDO, text, startLine, startCol);\n" +
    "        } else {\n" +
    "            reader.reset();\n" +
    "            return this.charToken(first, startLine, startCol);\n" +
    "        }\n" +
    "    },\n" +
    "    htmlCommentEndToken: function(first, startLine, startCol){\n" +
    "        var reader      = this._reader,\n" +
    "            text        = first;\n" +
    "\n" +
    "        reader.mark();\n" +
    "        text += reader.readCount(2);\n" +
    "\n" +
    "        if (text == \"-->\"){\n" +
    "            return this.createToken(Tokens.CDC, text, startLine, startCol);\n" +
    "        } else {\n" +
    "            reader.reset();\n" +
    "            return this.charToken(first, startLine, startCol);\n" +
    "        }\n" +
    "    },\n" +
    "    identOrFunctionToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            ident   = this.readName(first),\n" +
    "            tt      = Tokens.IDENT;\n" +
    "        if (reader.peek() == \"(\"){\n" +
    "            ident += reader.read();\n" +
    "            if (ident.toLowerCase() == \"url(\"){\n" +
    "                tt = Tokens.URI;\n" +
    "                ident = this.readURI(ident);\n" +
    "                if (ident.toLowerCase() == \"url(\"){\n" +
    "                    tt = Tokens.FUNCTION;\n" +
    "                }\n" +
    "            } else {\n" +
    "                tt = Tokens.FUNCTION;\n" +
    "            }\n" +
    "        } else if (reader.peek() == \":\"){  //might be an IE function\n" +
    "            if (ident.toLowerCase() == \"progid\"){\n" +
    "                ident += reader.readTo(\"(\");\n" +
    "                tt = Tokens.IE_FUNCTION;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, ident, startLine, startCol);\n" +
    "    },\n" +
    "    importantToken: function(first, startLine, startCol){\n" +
    "        var reader      = this._reader,\n" +
    "            important   = first,\n" +
    "            tt          = Tokens.CHAR,\n" +
    "            temp,\n" +
    "            c;\n" +
    "\n" +
    "        reader.mark();\n" +
    "        c = reader.read();\n" +
    "\n" +
    "        while(c){\n" +
    "            if (c == \"/\"){\n" +
    "                if (reader.peek() != \"*\"){\n" +
    "                    break;\n" +
    "                } else {\n" +
    "                    temp = this.readComment(c);\n" +
    "                    if (temp === \"\"){    //broken!\n" +
    "                        break;\n" +
    "                    }\n" +
    "                }\n" +
    "            } else if (isWhitespace(c)){\n" +
    "                important += c + this.readWhitespace();\n" +
    "            } else if (/i/i.test(c)){\n" +
    "                temp = reader.readCount(8);\n" +
    "                if (/mportant/i.test(temp)){\n" +
    "                    important += c + temp;\n" +
    "                    tt = Tokens.IMPORTANT_SYM;\n" +
    "\n" +
    "                }\n" +
    "                break;  //we're done\n" +
    "            } else {\n" +
    "                break;\n" +
    "            }\n" +
    "\n" +
    "            c = reader.read();\n" +
    "        }\n" +
    "\n" +
    "        if (tt == Tokens.CHAR){\n" +
    "            reader.reset();\n" +
    "            return this.charToken(first, startLine, startCol);\n" +
    "        } else {\n" +
    "            return this.createToken(tt, important, startLine, startCol);\n" +
    "        }\n" +
    "\n" +
    "\n" +
    "    },\n" +
    "    notToken: function(first, startLine, startCol){\n" +
    "        var reader      = this._reader,\n" +
    "            text        = first;\n" +
    "\n" +
    "        reader.mark();\n" +
    "        text += reader.readCount(4);\n" +
    "\n" +
    "        if (text.toLowerCase() == \":not(\"){\n" +
    "            return this.createToken(Tokens.NOT, text, startLine, startCol);\n" +
    "        } else {\n" +
    "            reader.reset();\n" +
    "            return this.charToken(first, startLine, startCol);\n" +
    "        }\n" +
    "    },\n" +
    "    numberToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            value   = this.readNumber(first),\n" +
    "            ident,\n" +
    "            tt      = Tokens.NUMBER,\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        if (isIdentStart(c)){\n" +
    "            ident = this.readName(reader.read());\n" +
    "            value += ident;\n" +
    "\n" +
    "            if (/^em$|^ex$|^px$|^gd$|^rem$|^vw$|^vh$|^vmax$|^vmin$|^ch$|^cm$|^mm$|^in$|^pt$|^pc$/i.test(ident)){\n" +
    "                tt = Tokens.LENGTH;\n" +
    "            } else if (/^deg|^rad$|^grad$/i.test(ident)){\n" +
    "                tt = Tokens.ANGLE;\n" +
    "            } else if (/^ms$|^s$/i.test(ident)){\n" +
    "                tt = Tokens.TIME;\n" +
    "            } else if (/^hz$|^khz$/i.test(ident)){\n" +
    "                tt = Tokens.FREQ;\n" +
    "            } else if (/^dpi$|^dpcm$/i.test(ident)){\n" +
    "                tt = Tokens.RESOLUTION;\n" +
    "            } else {\n" +
    "                tt = Tokens.DIMENSION;\n" +
    "            }\n" +
    "\n" +
    "        } else if (c == \"%\"){\n" +
    "            value += reader.read();\n" +
    "            tt = Tokens.PERCENTAGE;\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, value, startLine, startCol);\n" +
    "    },\n" +
    "    stringToken: function(first, startLine, startCol){\n" +
    "        var delim   = first,\n" +
    "            string  = first,\n" +
    "            reader  = this._reader,\n" +
    "            prev    = first,\n" +
    "            tt      = Tokens.STRING,\n" +
    "            c       = reader.read();\n" +
    "\n" +
    "        while(c){\n" +
    "            string += c;\n" +
    "            if (c == delim && prev != \"\\\\\"){\n" +
    "                break;\n" +
    "            }\n" +
    "            if (isNewLine(reader.peek()) && c != \"\\\\\"){\n" +
    "                tt = Tokens.INVALID;\n" +
    "                break;\n" +
    "            }\n" +
    "            prev = c;\n" +
    "            c = reader.read();\n" +
    "        }\n" +
    "        if (c === null){\n" +
    "            tt = Tokens.INVALID;\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, string, startLine, startCol);\n" +
    "    },\n" +
    "\n" +
    "    unicodeRangeToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            value   = first,\n" +
    "            temp,\n" +
    "            tt      = Tokens.CHAR;\n" +
    "        if (reader.peek() == \"+\"){\n" +
    "            reader.mark();\n" +
    "            value += reader.read();\n" +
    "            value += this.readUnicodeRangePart(true);\n" +
    "            if (value.length == 2){\n" +
    "                reader.reset();\n" +
    "            } else {\n" +
    "\n" +
    "                tt = Tokens.UNICODE_RANGE;\n" +
    "                if (value.indexOf(\"?\") == -1){\n" +
    "\n" +
    "                    if (reader.peek() == \"-\"){\n" +
    "                        reader.mark();\n" +
    "                        temp = reader.read();\n" +
    "                        temp += this.readUnicodeRangePart(false);\n" +
    "                        if (temp.length == 1){\n" +
    "                            reader.reset();\n" +
    "                        } else {\n" +
    "                            value += temp;\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return this.createToken(tt, value, startLine, startCol);\n" +
    "    },\n" +
    "    whitespaceToken: function(first, startLine, startCol){\n" +
    "        var reader  = this._reader,\n" +
    "            value   = first + this.readWhitespace();\n" +
    "        return this.createToken(Tokens.S, value, startLine, startCol);\n" +
    "    },\n" +
    "\n" +
    "    readUnicodeRangePart: function(allowQuestionMark){\n" +
    "        var reader  = this._reader,\n" +
    "            part = \"\",\n" +
    "            c       = reader.peek();\n" +
    "        while(isHexDigit(c) && part.length < 6){\n" +
    "            reader.read();\n" +
    "            part += c;\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "        if (allowQuestionMark){\n" +
    "            while(c == \"?\" && part.length < 6){\n" +
    "                reader.read();\n" +
    "                part += c;\n" +
    "                c = reader.peek();\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return part;\n" +
    "    },\n" +
    "\n" +
    "    readWhitespace: function(){\n" +
    "        var reader  = this._reader,\n" +
    "            whitespace = \"\",\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        while(isWhitespace(c)){\n" +
    "            reader.read();\n" +
    "            whitespace += c;\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "\n" +
    "        return whitespace;\n" +
    "    },\n" +
    "    readNumber: function(first){\n" +
    "        var reader  = this._reader,\n" +
    "            number  = first,\n" +
    "            hasDot  = (first == \".\"),\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "\n" +
    "        while(c){\n" +
    "            if (isDigit(c)){\n" +
    "                number += reader.read();\n" +
    "            } else if (c == \".\"){\n" +
    "                if (hasDot){\n" +
    "                    break;\n" +
    "                } else {\n" +
    "                    hasDot = true;\n" +
    "                    number += reader.read();\n" +
    "                }\n" +
    "            } else {\n" +
    "                break;\n" +
    "            }\n" +
    "\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "\n" +
    "        return number;\n" +
    "    },\n" +
    "    readString: function(){\n" +
    "        var reader  = this._reader,\n" +
    "            delim   = reader.read(),\n" +
    "            string  = delim,\n" +
    "            prev    = delim,\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        while(c){\n" +
    "            c = reader.read();\n" +
    "            string += c;\n" +
    "            if (c == delim && prev != \"\\\\\"){\n" +
    "                break;\n" +
    "            }\n" +
    "            if (isNewLine(reader.peek()) && c != \"\\\\\"){\n" +
    "                string = \"\";\n" +
    "                break;\n" +
    "            }\n" +
    "            prev = c;\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "        if (c === null){\n" +
    "            string = \"\";\n" +
    "        }\n" +
    "\n" +
    "        return string;\n" +
    "    },\n" +
    "    readURI: function(first){\n" +
    "        var reader  = this._reader,\n" +
    "            uri     = first,\n" +
    "            inner   = \"\",\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        reader.mark();\n" +
    "        while(c && isWhitespace(c)){\n" +
    "            reader.read();\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "        if (c == \"'\" || c == \"\\\"\"){\n" +
    "            inner = this.readString();\n" +
    "        } else {\n" +
    "            inner = this.readURL();\n" +
    "        }\n" +
    "\n" +
    "        c = reader.peek();\n" +
    "        while(c && isWhitespace(c)){\n" +
    "            reader.read();\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "        if (inner === \"\" || c != \")\"){\n" +
    "            uri = first;\n" +
    "            reader.reset();\n" +
    "        } else {\n" +
    "            uri += inner + reader.read();\n" +
    "        }\n" +
    "\n" +
    "        return uri;\n" +
    "    },\n" +
    "    readURL: function(){\n" +
    "        var reader  = this._reader,\n" +
    "            url     = \"\",\n" +
    "            c       = reader.peek();\n" +
    "        while (/^[!#$%&\\\\*-~]$/.test(c)){\n" +
    "            url += reader.read();\n" +
    "            c = reader.peek();\n" +
    "        }\n" +
    "\n" +
    "        return url;\n" +
    "\n" +
    "    },\n" +
    "    readName: function(first){\n" +
    "        var reader  = this._reader,\n" +
    "            ident   = first || \"\",\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        while(true){\n" +
    "            if (c == \"\\\\\"){\n" +
    "                ident += this.readEscape(reader.read());\n" +
    "                c = reader.peek();\n" +
    "            } else if(c && isNameChar(c)){\n" +
    "                ident += reader.read();\n" +
    "                c = reader.peek();\n" +
    "            } else {\n" +
    "                break;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return ident;\n" +
    "    },\n" +
    "\n" +
    "    readEscape: function(first){\n" +
    "        var reader  = this._reader,\n" +
    "            cssEscape = first || \"\",\n" +
    "            i       = 0,\n" +
    "            c       = reader.peek();\n" +
    "\n" +
    "        if (isHexDigit(c)){\n" +
    "            do {\n" +
    "                cssEscape += reader.read();\n" +
    "                c = reader.peek();\n" +
    "            } while(c && isHexDigit(c) && ++i < 6);\n" +
    "        }\n" +
    "\n" +
    "        if (cssEscape.length == 3 && /\\s/.test(c) ||\n" +
    "            cssEscape.length == 7 || cssEscape.length == 1){\n" +
    "                reader.read();\n" +
    "        } else {\n" +
    "            c = \"\";\n" +
    "        }\n" +
    "\n" +
    "        return cssEscape + c;\n" +
    "    },\n" +
    "\n" +
    "    readComment: function(first){\n" +
    "        var reader  = this._reader,\n" +
    "            comment = first || \"\",\n" +
    "            c       = reader.read();\n" +
    "\n" +
    "        if (c == \"*\"){\n" +
    "            while(c){\n" +
    "                comment += c;\n" +
    "                if (comment.length > 2 && c == \"*\" && reader.peek() == \"/\"){\n" +
    "                    comment += reader.read();\n" +
    "                    break;\n" +
    "                }\n" +
    "\n" +
    "                c = reader.read();\n" +
    "            }\n" +
    "\n" +
    "            return comment;\n" +
    "        } else {\n" +
    "            return \"\";\n" +
    "        }\n" +
    "\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "var Tokens  = [\n" +
    "    { name: \"CDO\"},\n" +
    "    { name: \"CDC\"},\n" +
    "    { name: \"S\", whitespace: true/*, channel: \"ws\"*/},\n" +
    "    { name: \"COMMENT\", comment: true, hide: true, channel: \"comment\" },\n" +
    "    { name: \"INCLUDES\", text: \"~=\"},\n" +
    "    { name: \"DASHMATCH\", text: \"|=\"},\n" +
    "    { name: \"PREFIXMATCH\", text: \"^=\"},\n" +
    "    { name: \"SUFFIXMATCH\", text: \"$=\"},\n" +
    "    { name: \"SUBSTRINGMATCH\", text: \"*=\"},\n" +
    "    { name: \"STRING\"},\n" +
    "    { name: \"IDENT\"},\n" +
    "    { name: \"HASH\"},\n" +
    "    { name: \"IMPORT_SYM\", text: \"@import\"},\n" +
    "    { name: \"PAGE_SYM\", text: \"@page\"},\n" +
    "    { name: \"MEDIA_SYM\", text: \"@media\"},\n" +
    "    { name: \"FONT_FACE_SYM\", text: \"@font-face\"},\n" +
    "    { name: \"CHARSET_SYM\", text: \"@charset\"},\n" +
    "    { name: \"NAMESPACE_SYM\", text: \"@namespace\"},\n" +
    "    { name: \"VIEWPORT_SYM\", text: [\"@viewport\", \"@-ms-viewport\"]},\n" +
    "    { name: \"UNKNOWN_SYM\" },\n" +
    "    { name: \"KEYFRAMES_SYM\", text: [ \"@keyframes\", \"@-webkit-keyframes\", \"@-moz-keyframes\", \"@-o-keyframes\" ] },\n" +
    "    { name: \"IMPORTANT_SYM\"},\n" +
    "    { name: \"LENGTH\"},\n" +
    "    { name: \"ANGLE\"},\n" +
    "    { name: \"TIME\"},\n" +
    "    { name: \"FREQ\"},\n" +
    "    { name: \"DIMENSION\"},\n" +
    "    { name: \"PERCENTAGE\"},\n" +
    "    { name: \"NUMBER\"},\n" +
    "    { name: \"URI\"},\n" +
    "    { name: \"FUNCTION\"},\n" +
    "    { name: \"UNICODE_RANGE\"},\n" +
    "    { name: \"INVALID\"},\n" +
    "    { name: \"PLUS\", text: \"+\" },\n" +
    "    { name: \"GREATER\", text: \">\"},\n" +
    "    { name: \"COMMA\", text: \",\"},\n" +
    "    { name: \"TILDE\", text: \"~\"},\n" +
    "    { name: \"NOT\"},\n" +
    "    { name: \"TOPLEFTCORNER_SYM\", text: \"@top-left-corner\"},\n" +
    "    { name: \"TOPLEFT_SYM\", text: \"@top-left\"},\n" +
    "    { name: \"TOPCENTER_SYM\", text: \"@top-center\"},\n" +
    "    { name: \"TOPRIGHT_SYM\", text: \"@top-right\"},\n" +
    "    { name: \"TOPRIGHTCORNER_SYM\", text: \"@top-right-corner\"},\n" +
    "    { name: \"BOTTOMLEFTCORNER_SYM\", text: \"@bottom-left-corner\"},\n" +
    "    { name: \"BOTTOMLEFT_SYM\", text: \"@bottom-left\"},\n" +
    "    { name: \"BOTTOMCENTER_SYM\", text: \"@bottom-center\"},\n" +
    "    { name: \"BOTTOMRIGHT_SYM\", text: \"@bottom-right\"},\n" +
    "    { name: \"BOTTOMRIGHTCORNER_SYM\", text: \"@bottom-right-corner\"},\n" +
    "    { name: \"LEFTTOP_SYM\", text: \"@left-top\"},\n" +
    "    { name: \"LEFTMIDDLE_SYM\", text: \"@left-middle\"},\n" +
    "    { name: \"LEFTBOTTOM_SYM\", text: \"@left-bottom\"},\n" +
    "    { name: \"RIGHTTOP_SYM\", text: \"@right-top\"},\n" +
    "    { name: \"RIGHTMIDDLE_SYM\", text: \"@right-middle\"},\n" +
    "    { name: \"RIGHTBOTTOM_SYM\", text: \"@right-bottom\"},\n" +
    "    { name: \"RESOLUTION\", state: \"media\"},\n" +
    "    { name: \"IE_FUNCTION\" },\n" +
    "    { name: \"CHAR\" },\n" +
    "    {\n" +
    "        name: \"PIPE\",\n" +
    "        text: \"|\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"SLASH\",\n" +
    "        text: \"/\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"MINUS\",\n" +
    "        text: \"-\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"STAR\",\n" +
    "        text: \"*\"\n" +
    "    },\n" +
    "\n" +
    "    {\n" +
    "        name: \"LBRACE\",\n" +
    "        endChar: \"}\",\n" +
    "        text: \"{\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"RBRACE\",\n" +
    "        text: \"}\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"LBRACKET\",\n" +
    "        endChar: \"]\",\n" +
    "        text: \"[\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"RBRACKET\",\n" +
    "        text: \"]\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"EQUALS\",\n" +
    "        text: \"=\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"COLON\",\n" +
    "        text: \":\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"SEMICOLON\",\n" +
    "        text: \";\"\n" +
    "    },\n" +
    "\n" +
    "    {\n" +
    "        name: \"LPAREN\",\n" +
    "        endChar: \")\",\n" +
    "        text: \"(\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"RPAREN\",\n" +
    "        text: \")\"\n" +
    "    },\n" +
    "    {\n" +
    "        name: \"DOT\",\n" +
    "        text: \".\"\n" +
    "    }\n" +
    "];\n" +
    "\n" +
    "(function(){\n" +
    "\n" +
    "    var nameMap = [],\n" +
    "        typeMap = {};\n" +
    "\n" +
    "    Tokens.UNKNOWN = -1;\n" +
    "    Tokens.unshift({name:\"EOF\"});\n" +
    "    for (var i=0, len = Tokens.length; i < len; i++){\n" +
    "        nameMap.push(Tokens[i].name);\n" +
    "        Tokens[Tokens[i].name] = i;\n" +
    "        if (Tokens[i].text){\n" +
    "            if (Tokens[i].text instanceof Array){\n" +
    "                for (var j=0; j < Tokens[i].text.length; j++){\n" +
    "                    typeMap[Tokens[i].text[j]] = i;\n" +
    "                }\n" +
    "            } else {\n" +
    "                typeMap[Tokens[i].text] = i;\n" +
    "            }\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "    Tokens.name = function(tt){\n" +
    "        return nameMap[tt];\n" +
    "    };\n" +
    "\n" +
    "    Tokens.type = function(c){\n" +
    "        return typeMap[c] || -1;\n" +
    "    };\n" +
    "\n" +
    "})();\n" +
    "var Validation = {\n" +
    "\n" +
    "    validate: function(property, value){\n" +
    "        var name        = property.toString().toLowerCase(),\n" +
    "            parts       = value.parts,\n" +
    "            expression  = new PropertyValueIterator(value),\n" +
    "            spec        = Properties[name],\n" +
    "            part,\n" +
    "            valid,\n" +
    "            j, count,\n" +
    "            msg,\n" +
    "            types,\n" +
    "            last,\n" +
    "            literals,\n" +
    "            max, multi, group;\n" +
    "\n" +
    "        if (!spec) {\n" +
    "            if (name.indexOf(\"-\") !== 0){    //vendor prefixed are ok\n" +
    "                throw new ValidationError(\"Unknown property '\" + property + \"'.\", property.line, property.col);\n" +
    "            }\n" +
    "        } else if (typeof spec != \"number\"){\n" +
    "            if (typeof spec == \"string\"){\n" +
    "                if (spec.indexOf(\"||\") > -1) {\n" +
    "                    this.groupProperty(spec, expression);\n" +
    "                } else {\n" +
    "                    this.singleProperty(spec, expression, 1);\n" +
    "                }\n" +
    "\n" +
    "            } else if (spec.multi) {\n" +
    "                this.multiProperty(spec.multi, expression, spec.comma, spec.max || Infinity);\n" +
    "            } else if (typeof spec == \"function\") {\n" +
    "                spec(expression);\n" +
    "            }\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "    },\n" +
    "\n" +
    "    singleProperty: function(types, expression, max, partial) {\n" +
    "\n" +
    "        var result      = false,\n" +
    "            value       = expression.value,\n" +
    "            count       = 0,\n" +
    "            part;\n" +
    "\n" +
    "        while (expression.hasNext() && count < max) {\n" +
    "            result = ValidationTypes.isAny(expression, types);\n" +
    "            if (!result) {\n" +
    "                break;\n" +
    "            }\n" +
    "            count++;\n" +
    "        }\n" +
    "\n" +
    "        if (!result) {\n" +
    "            if (expression.hasNext() && !expression.isFirst()) {\n" +
    "                part = expression.peek();\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                 throw new ValidationError(\"Expected (\" + types + \") but found '\" + value + \"'.\", value.line, value.col);\n" +
    "            }\n" +
    "        } else if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "        }\n" +
    "\n" +
    "    },\n" +
    "\n" +
    "    multiProperty: function (types, expression, comma, max) {\n" +
    "\n" +
    "        var result      = false,\n" +
    "            value       = expression.value,\n" +
    "            count       = 0,\n" +
    "            sep         = false,\n" +
    "            part;\n" +
    "\n" +
    "        while(expression.hasNext() && !result && count < max) {\n" +
    "            if (ValidationTypes.isAny(expression, types)) {\n" +
    "                count++;\n" +
    "                if (!expression.hasNext()) {\n" +
    "                    result = true;\n" +
    "\n" +
    "                } else if (comma) {\n" +
    "                    if (expression.peek() == \",\") {\n" +
    "                        part = expression.next();\n" +
    "                    } else {\n" +
    "                        break;\n" +
    "                    }\n" +
    "                }\n" +
    "            } else {\n" +
    "                break;\n" +
    "\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        if (!result) {\n" +
    "            if (expression.hasNext() && !expression.isFirst()) {\n" +
    "                part = expression.peek();\n" +
    "                throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                part = expression.previous();\n" +
    "                if (comma && part == \",\") {\n" +
    "                    throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "                } else {\n" +
    "                    throw new ValidationError(\"Expected (\" + types + \") but found '\" + value + \"'.\", value.line, value.col);\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        } else if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "        }\n" +
    "\n" +
    "    },\n" +
    "\n" +
    "    groupProperty: function (types, expression, comma) {\n" +
    "\n" +
    "        var result      = false,\n" +
    "            value       = expression.value,\n" +
    "            typeCount   = types.split(\"||\").length,\n" +
    "            groups      = { count: 0 },\n" +
    "            partial     = false,\n" +
    "            name,\n" +
    "            part;\n" +
    "\n" +
    "        while(expression.hasNext() && !result) {\n" +
    "            name = ValidationTypes.isAnyOfGroup(expression, types);\n" +
    "            if (name) {\n" +
    "                if (groups[name]) {\n" +
    "                    break;\n" +
    "                } else {\n" +
    "                    groups[name] = 1;\n" +
    "                    groups.count++;\n" +
    "                    partial = true;\n" +
    "\n" +
    "                    if (groups.count == typeCount || !expression.hasNext()) {\n" +
    "                        result = true;\n" +
    "                    }\n" +
    "                }\n" +
    "            } else {\n" +
    "                break;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        if (!result) {\n" +
    "            if (partial && expression.hasNext()) {\n" +
    "                    part = expression.peek();\n" +
    "                    throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "            } else {\n" +
    "                throw new ValidationError(\"Expected (\" + types + \") but found '\" + value + \"'.\", value.line, value.col);\n" +
    "            }\n" +
    "        } else if (expression.hasNext()) {\n" +
    "            part = expression.next();\n" +
    "            throw new ValidationError(\"Expected end of value but found '\" + part + \"'.\", part.line, part.col);\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "\n" +
    "\n" +
    "};\n" +
    "function ValidationError(message, line, col){\n" +
    "    this.col = col;\n" +
    "    this.line = line;\n" +
    "    this.message = message;\n" +
    "\n" +
    "}\n" +
    "ValidationError.prototype = new Error();\n" +
    "var ValidationTypes = {\n" +
    "\n" +
    "    isLiteral: function (part, literals) {\n" +
    "        var text = part.text.toString().toLowerCase(),\n" +
    "            args = literals.split(\" | \"),\n" +
    "            i, len, found = false;\n" +
    "\n" +
    "        for (i=0,len=args.length; i < len && !found; i++){\n" +
    "            if (text == args[i].toLowerCase()){\n" +
    "                found = true;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return found;\n" +
    "    },\n" +
    "\n" +
    "    isSimple: function(type) {\n" +
    "        return !!this.simple[type];\n" +
    "    },\n" +
    "\n" +
    "    isComplex: function(type) {\n" +
    "        return !!this.complex[type];\n" +
    "    },\n" +
    "    isAny: function (expression, types) {\n" +
    "        var args = types.split(\" | \"),\n" +
    "            i, len, found = false;\n" +
    "\n" +
    "        for (i=0,len=args.length; i < len && !found && expression.hasNext(); i++){\n" +
    "            found = this.isType(expression, args[i]);\n" +
    "        }\n" +
    "\n" +
    "        return found;\n" +
    "    },\n" +
    "    isAnyOfGroup: function(expression, types) {\n" +
    "        var args = types.split(\" || \"),\n" +
    "            i, len, found = false;\n" +
    "\n" +
    "        for (i=0,len=args.length; i < len && !found; i++){\n" +
    "            found = this.isType(expression, args[i]);\n" +
    "        }\n" +
    "\n" +
    "        return found ? args[i-1] : false;\n" +
    "    },\n" +
    "    isType: function (expression, type) {\n" +
    "        var part = expression.peek(),\n" +
    "            result = false;\n" +
    "\n" +
    "        if (type.charAt(0) != \"<\") {\n" +
    "            result = this.isLiteral(part, type);\n" +
    "            if (result) {\n" +
    "                expression.next();\n" +
    "            }\n" +
    "        } else if (this.simple[type]) {\n" +
    "            result = this.simple[type](part);\n" +
    "            if (result) {\n" +
    "                expression.next();\n" +
    "            }\n" +
    "        } else {\n" +
    "            result = this.complex[type](expression);\n" +
    "        }\n" +
    "\n" +
    "        return result;\n" +
    "    },\n" +
    "\n" +
    "\n" +
    "\n" +
    "    simple: {\n" +
    "\n" +
    "        \"<absolute-size>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"xx-small | x-small | small | medium | large | x-large | xx-large\");\n" +
    "        },\n" +
    "\n" +
    "        \"<attachment>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"scroll | fixed | local\");\n" +
    "        },\n" +
    "\n" +
    "        \"<attr>\": function(part){\n" +
    "            return part.type == \"function\" && part.name == \"attr\";\n" +
    "        },\n" +
    "\n" +
    "        \"<bg-image>\": function(part){\n" +
    "            return this[\"<image>\"](part) || this[\"<gradient>\"](part) ||  part == \"none\";\n" +
    "        },\n" +
    "\n" +
    "        \"<gradient>\": function(part) {\n" +
    "            return part.type == \"function\" && /^(?:\\-(?:ms|moz|o|webkit)\\-)?(?:repeating\\-)?(?:radial\\-|linear\\-)?gradient/i.test(part);\n" +
    "        },\n" +
    "\n" +
    "        \"<box>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"padding-box | border-box | content-box\");\n" +
    "        },\n" +
    "\n" +
    "        \"<content>\": function(part){\n" +
    "            return part.type == \"function\" && part.name == \"content\";\n" +
    "        },\n" +
    "\n" +
    "        \"<relative-size>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"smaller | larger\");\n" +
    "        },\n" +
    "        \"<ident>\": function(part){\n" +
    "            return part.type == \"identifier\";\n" +
    "        },\n" +
    "\n" +
    "        \"<length>\": function(part){\n" +
    "            if (part.type == \"function\" && /^(?:\\-(?:ms|moz|o|webkit)\\-)?calc/i.test(part)){\n" +
    "                return true;\n" +
    "            }else{\n" +
    "                return part.type == \"length\" || part.type == \"number\" || part.type == \"integer\" || part == \"0\";\n" +
    "            }\n" +
    "        },\n" +
    "\n" +
    "        \"<color>\": function(part){\n" +
    "            return part.type == \"color\" || part == \"transparent\";\n" +
    "        },\n" +
    "\n" +
    "        \"<number>\": function(part){\n" +
    "            return part.type == \"number\" || this[\"<integer>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<integer>\": function(part){\n" +
    "            return part.type == \"integer\";\n" +
    "        },\n" +
    "\n" +
    "        \"<line>\": function(part){\n" +
    "            return part.type == \"integer\";\n" +
    "        },\n" +
    "\n" +
    "        \"<angle>\": function(part){\n" +
    "            return part.type == \"angle\";\n" +
    "        },\n" +
    "\n" +
    "        \"<uri>\": function(part){\n" +
    "            return part.type == \"uri\";\n" +
    "        },\n" +
    "\n" +
    "        \"<image>\": function(part){\n" +
    "            return this[\"<uri>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<percentage>\": function(part){\n" +
    "            return part.type == \"percentage\" || part == \"0\";\n" +
    "        },\n" +
    "\n" +
    "        \"<border-width>\": function(part){\n" +
    "            return this[\"<length>\"](part) || ValidationTypes.isLiteral(part, \"thin | medium | thick\");\n" +
    "        },\n" +
    "\n" +
    "        \"<border-style>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset\");\n" +
    "        },\n" +
    "\n" +
    "        \"<content-sizing>\": function(part){ // http://www.w3.org/TR/css3-sizing/#width-height-keywords\n" +
    "            return ValidationTypes.isLiteral(part, \"fill-available | -moz-available | -webkit-fill-available | max-content | -moz-max-content | -webkit-max-content | min-content | -moz-min-content | -webkit-min-content | fit-content | -moz-fit-content | -webkit-fit-content\");\n" +
    "        },\n" +
    "\n" +
    "        \"<margin-width>\": function(part){\n" +
    "            return this[\"<length>\"](part) || this[\"<percentage>\"](part) || ValidationTypes.isLiteral(part, \"auto\");\n" +
    "        },\n" +
    "\n" +
    "        \"<padding-width>\": function(part){\n" +
    "            return this[\"<length>\"](part) || this[\"<percentage>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<shape>\": function(part){\n" +
    "            return part.type == \"function\" && (part.name == \"rect\" || part.name == \"inset-rect\");\n" +
    "        },\n" +
    "\n" +
    "        \"<time>\": function(part) {\n" +
    "            return part.type == \"time\";\n" +
    "        },\n" +
    "\n" +
    "        \"<flex-grow>\": function(part){\n" +
    "            return this[\"<number>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<flex-shrink>\": function(part){\n" +
    "            return this[\"<number>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<width>\": function(part){\n" +
    "            return this[\"<margin-width>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<flex-basis>\": function(part){\n" +
    "            return this[\"<width>\"](part);\n" +
    "        },\n" +
    "\n" +
    "        \"<flex-direction>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"row | row-reverse | column | column-reverse\");\n" +
    "        },\n" +
    "\n" +
    "        \"<flex-wrap>\": function(part){\n" +
    "            return ValidationTypes.isLiteral(part, \"nowrap | wrap | wrap-reverse\");\n" +
    "        }\n" +
    "    },\n" +
    "\n" +
    "    complex: {\n" +
    "\n" +
    "        \"<bg-position>\": function(expression){\n" +
    "            var types   = this,\n" +
    "                result  = false,\n" +
    "                numeric = \"<percentage> | <length>\",\n" +
    "                xDir    = \"left | right\",\n" +
    "                yDir    = \"top | bottom\",\n" +
    "                count = 0,\n" +
    "                hasNext = function() {\n" +
    "                    return expression.hasNext() && expression.peek() != \",\";\n" +
    "                };\n" +
    "\n" +
    "            while (expression.peek(count) && expression.peek(count) != \",\") {\n" +
    "                count++;\n" +
    "            }\n" +
    "\n" +
    "            if (count < 3) {\n" +
    "                if (ValidationTypes.isAny(expression, xDir + \" | center | \" + numeric)) {\n" +
    "                        result = true;\n" +
    "                        ValidationTypes.isAny(expression, yDir + \" | center | \" + numeric);\n" +
    "                } else if (ValidationTypes.isAny(expression, yDir)) {\n" +
    "                        result = true;\n" +
    "                        ValidationTypes.isAny(expression, xDir + \" | center\");\n" +
    "                }\n" +
    "            } else {\n" +
    "                if (ValidationTypes.isAny(expression, xDir)) {\n" +
    "                    if (ValidationTypes.isAny(expression, yDir)) {\n" +
    "                        result = true;\n" +
    "                        ValidationTypes.isAny(expression, numeric);\n" +
    "                    } else if (ValidationTypes.isAny(expression, numeric)) {\n" +
    "                        if (ValidationTypes.isAny(expression, yDir)) {\n" +
    "                            result = true;\n" +
    "                            ValidationTypes.isAny(expression, numeric);\n" +
    "                        } else if (ValidationTypes.isAny(expression, \"center\")) {\n" +
    "                            result = true;\n" +
    "                        }\n" +
    "                    }\n" +
    "                } else if (ValidationTypes.isAny(expression, yDir)) {\n" +
    "                    if (ValidationTypes.isAny(expression, xDir)) {\n" +
    "                        result = true;\n" +
    "                        ValidationTypes.isAny(expression, numeric);\n" +
    "                    } else if (ValidationTypes.isAny(expression, numeric)) {\n" +
    "                        if (ValidationTypes.isAny(expression, xDir)) {\n" +
    "                                result = true;\n" +
    "                                ValidationTypes.isAny(expression, numeric);\n" +
    "                        } else if (ValidationTypes.isAny(expression, \"center\")) {\n" +
    "                            result = true;\n" +
    "                        }\n" +
    "                    }\n" +
    "                } else if (ValidationTypes.isAny(expression, \"center\")) {\n" +
    "                    if (ValidationTypes.isAny(expression, xDir + \" | \" + yDir)) {\n" +
    "                        result = true;\n" +
    "                        ValidationTypes.isAny(expression, numeric);\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "        },\n" +
    "\n" +
    "        \"<bg-size>\": function(expression){\n" +
    "            var types   = this,\n" +
    "                result  = false,\n" +
    "                numeric = \"<percentage> | <length> | auto\",\n" +
    "                part,\n" +
    "                i, len;\n" +
    "\n" +
    "            if (ValidationTypes.isAny(expression, \"cover | contain\")) {\n" +
    "                result = true;\n" +
    "            } else if (ValidationTypes.isAny(expression, numeric)) {\n" +
    "                result = true;\n" +
    "                ValidationTypes.isAny(expression, numeric);\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "        },\n" +
    "\n" +
    "        \"<repeat-style>\": function(expression){\n" +
    "            var result  = false,\n" +
    "                values  = \"repeat | space | round | no-repeat\",\n" +
    "                part;\n" +
    "\n" +
    "            if (expression.hasNext()){\n" +
    "                part = expression.next();\n" +
    "\n" +
    "                if (ValidationTypes.isLiteral(part, \"repeat-x | repeat-y\")) {\n" +
    "                    result = true;\n" +
    "                } else if (ValidationTypes.isLiteral(part, values)) {\n" +
    "                    result = true;\n" +
    "\n" +
    "                    if (expression.hasNext() && ValidationTypes.isLiteral(expression.peek(), values)) {\n" +
    "                        expression.next();\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "\n" +
    "        },\n" +
    "\n" +
    "        \"<shadow>\": function(expression) {\n" +
    "            var result  = false,\n" +
    "                count   = 0,\n" +
    "                inset   = false,\n" +
    "                color   = false,\n" +
    "                part;\n" +
    "\n" +
    "            if (expression.hasNext()) {\n" +
    "\n" +
    "                if (ValidationTypes.isAny(expression, \"inset\")){\n" +
    "                    inset = true;\n" +
    "                }\n" +
    "\n" +
    "                if (ValidationTypes.isAny(expression, \"<color>\")) {\n" +
    "                    color = true;\n" +
    "                }\n" +
    "\n" +
    "                while (ValidationTypes.isAny(expression, \"<length>\") && count < 4) {\n" +
    "                    count++;\n" +
    "                }\n" +
    "\n" +
    "\n" +
    "                if (expression.hasNext()) {\n" +
    "                    if (!color) {\n" +
    "                        ValidationTypes.isAny(expression, \"<color>\");\n" +
    "                    }\n" +
    "\n" +
    "                    if (!inset) {\n" +
    "                        ValidationTypes.isAny(expression, \"inset\");\n" +
    "                    }\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "                result = (count >= 2 && count <= 4);\n" +
    "\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "        },\n" +
    "\n" +
    "        \"<x-one-radius>\": function(expression) {\n" +
    "            var result  = false,\n" +
    "                simple = \"<length> | <percentage> | inherit\";\n" +
    "\n" +
    "            if (ValidationTypes.isAny(expression, simple)){\n" +
    "                result = true;\n" +
    "                ValidationTypes.isAny(expression, simple);\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "        },\n" +
    "\n" +
    "        \"<flex>\": function(expression) {\n" +
    "            var part,\n" +
    "                result = false;\n" +
    "            if (ValidationTypes.isAny(expression, \"none | inherit\")) {\n" +
    "                result = true;\n" +
    "            } else {\n" +
    "                if (ValidationTypes.isType(expression, \"<flex-grow>\")) {\n" +
    "                    if (expression.peek()) {\n" +
    "                        if (ValidationTypes.isType(expression, \"<flex-shrink>\")) {\n" +
    "                            if (expression.peek()) {\n" +
    "                                result = ValidationTypes.isType(expression, \"<flex-basis>\");\n" +
    "                            } else {\n" +
    "                                result = true;\n" +
    "                            }\n" +
    "                        } else if (ValidationTypes.isType(expression, \"<flex-basis>\")) {\n" +
    "                            result = expression.peek() === null;\n" +
    "                        }\n" +
    "                    } else {\n" +
    "                        result = true;\n" +
    "                    }\n" +
    "                } else if (ValidationTypes.isType(expression, \"<flex-basis>\")) {\n" +
    "                    result = true;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            if (!result) {\n" +
    "                part = expression.peek();\n" +
    "                throw new ValidationError(\"Expected (none | [ <flex-grow> <flex-shrink>? || <flex-basis> ]) but found '\" + expression.value.text + \"'.\", part.line, part.col);\n" +
    "            }\n" +
    "\n" +
    "            return result;\n" +
    "        }\n" +
    "    }\n" +
    "};\n" +
    "\n" +
    "parserlib.css = {\n" +
    "Colors              :Colors,\n" +
    "Combinator          :Combinator,\n" +
    "Parser              :Parser,\n" +
    "PropertyName        :PropertyName,\n" +
    "PropertyValue       :PropertyValue,\n" +
    "PropertyValuePart   :PropertyValuePart,\n" +
    "MediaFeature        :MediaFeature,\n" +
    "MediaQuery          :MediaQuery,\n" +
    "Selector            :Selector,\n" +
    "SelectorPart        :SelectorPart,\n" +
    "SelectorSubPart     :SelectorSubPart,\n" +
    "Specificity         :Specificity,\n" +
    "TokenStream         :TokenStream,\n" +
    "Tokens              :Tokens,\n" +
    "ValidationError     :ValidationError\n" +
    "};\n" +
    "})();\n" +
    "\n" +
    "(function(){\n" +
    "for(var prop in parserlib){\n" +
    "exports[prop] = parserlib[prop];\n" +
    "}\n" +
    "})();\n" +
    "\n" +
    "\n" +
    "function objectToString(o) {\n" +
    "  return Object.prototype.toString.call(o);\n" +
    "}\n" +
    "var util = {\n" +
    "  isArray: function (ar) {\n" +
    "    return Array.isArray(ar) || (typeof ar === 'object' && objectToString(ar) === '[object Array]');\n" +
    "  },\n" +
    "  isDate: function (d) {\n" +
    "    return typeof d === 'object' && objectToString(d) === '[object Date]';\n" +
    "  },\n" +
    "  isRegExp: function (re) {\n" +
    "    return typeof re === 'object' && objectToString(re) === '[object RegExp]';\n" +
    "  },\n" +
    "  getRegExpFlags: function (re) {\n" +
    "    var flags = '';\n" +
    "    re.global && (flags += 'g');\n" +
    "    re.ignoreCase && (flags += 'i');\n" +
    "    re.multiline && (flags += 'm');\n" +
    "    return flags;\n" +
    "  }\n" +
    "};\n" +
    "\n" +
    "\n" +
    "if (typeof module === 'object')\n" +
    "  module.exports = clone;\n" +
    "\n" +
    "function clone(parent, circular, depth, prototype) {\n" +
    "  var allParents = [];\n" +
    "  var allChildren = [];\n" +
    "\n" +
    "  var useBuffer = typeof Buffer != 'undefined';\n" +
    "\n" +
    "  if (typeof circular == 'undefined')\n" +
    "    circular = true;\n" +
    "\n" +
    "  if (typeof depth == 'undefined')\n" +
    "    depth = Infinity;\n" +
    "  function _clone(parent, depth) {\n" +
    "    if (parent === null)\n" +
    "      return null;\n" +
    "\n" +
    "    if (depth == 0)\n" +
    "      return parent;\n" +
    "\n" +
    "    var child;\n" +
    "    if (typeof parent != 'object') {\n" +
    "      return parent;\n" +
    "    }\n" +
    "\n" +
    "    if (util.isArray(parent)) {\n" +
    "      child = [];\n" +
    "    } else if (util.isRegExp(parent)) {\n" +
    "      child = new RegExp(parent.source, util.getRegExpFlags(parent));\n" +
    "      if (parent.lastIndex) child.lastIndex = parent.lastIndex;\n" +
    "    } else if (util.isDate(parent)) {\n" +
    "      child = new Date(parent.getTime());\n" +
    "    } else if (useBuffer && Buffer.isBuffer(parent)) {\n" +
    "      child = new Buffer(parent.length);\n" +
    "      parent.copy(child);\n" +
    "      return child;\n" +
    "    } else {\n" +
    "      if (typeof prototype == 'undefined') child = Object.create(Object.getPrototypeOf(parent));\n" +
    "      else child = Object.create(prototype);\n" +
    "    }\n" +
    "\n" +
    "    if (circular) {\n" +
    "      var index = allParents.indexOf(parent);\n" +
    "\n" +
    "      if (index != -1) {\n" +
    "        return allChildren[index];\n" +
    "      }\n" +
    "      allParents.push(parent);\n" +
    "      allChildren.push(child);\n" +
    "    }\n" +
    "\n" +
    "    for (var i in parent) {\n" +
    "      child[i] = _clone(parent[i], depth - 1);\n" +
    "    }\n" +
    "\n" +
    "    return child;\n" +
    "  }\n" +
    "\n" +
    "  return _clone(parent, depth);\n" +
    "}\n" +
    "clone.clonePrototype = function(parent) {\n" +
    "  if (parent === null)\n" +
    "    return null;\n" +
    "\n" +
    "  var c = function () {};\n" +
    "  c.prototype = parent;\n" +
    "  return new c();\n" +
    "};\n" +
    "\n" +
    "var CSSLint = (function(){\n" +
    "\n" +
    "    var rules           = [],\n" +
    "        formatters      = [],\n" +
    "        embeddedRuleset = /\\/\\*csslint([^\\*]*)\\*\\//,\n" +
    "        api             = new parserlib.util.EventTarget();\n" +
    "\n" +
    "    api.version = \"@VERSION@\";\n" +
    "    api.addRule = function(rule){\n" +
    "        rules.push(rule);\n" +
    "        rules[rule.id] = rule;\n" +
    "    };\n" +
    "    api.clearRules = function(){\n" +
    "        rules = [];\n" +
    "    };\n" +
    "    api.getRules = function(){\n" +
    "        return [].concat(rules).sort(function(a,b){\n" +
    "            return a.id > b.id ? 1 : 0;\n" +
    "        });\n" +
    "    };\n" +
    "    api.getRuleset = function() {\n" +
    "        var ruleset = {},\n" +
    "            i = 0,\n" +
    "            len = rules.length;\n" +
    "\n" +
    "        while (i < len){\n" +
    "            ruleset[rules[i++].id] = 1;    //by default, everything is a warning\n" +
    "        }\n" +
    "\n" +
    "        return ruleset;\n" +
    "    };\n" +
    "    function applyEmbeddedRuleset(text, ruleset){\n" +
    "        var valueMap,\n" +
    "            embedded = text && text.match(embeddedRuleset),\n" +
    "            rules = embedded && embedded[1];\n" +
    "\n" +
    "        if (rules) {\n" +
    "            valueMap = {\n" +
    "                \"true\": 2,  // true is error\n" +
    "                \"\": 1,      // blank is warning\n" +
    "                \"false\": 0, // false is ignore\n" +
    "\n" +
    "                \"2\": 2,     // explicit error\n" +
    "                \"1\": 1,     // explicit warning\n" +
    "                \"0\": 0      // explicit ignore\n" +
    "            };\n" +
    "\n" +
    "            rules.toLowerCase().split(\",\").forEach(function(rule){\n" +
    "                var pair = rule.split(\":\"),\n" +
    "                    property = pair[0] || \"\",\n" +
    "                    value = pair[1] || \"\";\n" +
    "\n" +
    "                ruleset[property.trim()] = valueMap[value.trim()];\n" +
    "            });\n" +
    "        }\n" +
    "\n" +
    "        return ruleset;\n" +
    "    }\n" +
    "    api.addFormatter = function(formatter) {\n" +
    "        formatters[formatter.id] = formatter;\n" +
    "    };\n" +
    "    api.getFormatter = function(formatId){\n" +
    "        return formatters[formatId];\n" +
    "    };\n" +
    "    api.format = function(results, filename, formatId, options) {\n" +
    "        var formatter = this.getFormatter(formatId),\n" +
    "            result = null;\n" +
    "\n" +
    "        if (formatter){\n" +
    "            result = formatter.startFormat();\n" +
    "            result += formatter.formatResults(results, filename, options || {});\n" +
    "            result += formatter.endFormat();\n" +
    "        }\n" +
    "\n" +
    "        return result;\n" +
    "    };\n" +
    "    api.hasFormat = function(formatId){\n" +
    "        return formatters.hasOwnProperty(formatId);\n" +
    "    };\n" +
    "    api.verify = function(text, ruleset){\n" +
    "\n" +
    "        var i = 0,\n" +
    "            reporter,\n" +
    "            lines,\n" +
    "            report,\n" +
    "            parser = new parserlib.css.Parser({ starHack: true, ieFilters: true,\n" +
    "                                                underscoreHack: true, strict: false });\n" +
    "        lines = text.replace(/\\n\\r?/g, \"$split$\").split(\"$split$\");\n" +
    "\n" +
    "        if (!ruleset){\n" +
    "            ruleset = this.getRuleset();\n" +
    "        }\n" +
    "\n" +
    "        if (embeddedRuleset.test(text)){\n" +
    "            ruleset = clone(ruleset);\n" +
    "            ruleset = applyEmbeddedRuleset(text, ruleset);\n" +
    "        }\n" +
    "\n" +
    "        reporter = new Reporter(lines, ruleset);\n" +
    "\n" +
    "        ruleset.errors = 2;       //always report parsing errors as errors\n" +
    "        for (i in ruleset){\n" +
    "            if(ruleset.hasOwnProperty(i) && ruleset[i]){\n" +
    "                if (rules[i]){\n" +
    "                    rules[i].init(parser, reporter);\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "        try {\n" +
    "            parser.parse(text);\n" +
    "        } catch (ex) {\n" +
    "            reporter.error(\"Fatal error, cannot continue: \" + ex.message, ex.line, ex.col, {});\n" +
    "        }\n" +
    "\n" +
    "        report = {\n" +
    "            messages    : reporter.messages,\n" +
    "            stats       : reporter.stats,\n" +
    "            ruleset     : reporter.ruleset\n" +
    "        };\n" +
    "        report.messages.sort(function (a, b){\n" +
    "            if (a.rollup && !b.rollup){\n" +
    "                return 1;\n" +
    "            } else if (!a.rollup && b.rollup){\n" +
    "                return -1;\n" +
    "            } else {\n" +
    "                return a.line - b.line;\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        return report;\n" +
    "    };\n" +
    "\n" +
    "    return api;\n" +
    "\n" +
    "})();\n" +
    "function Reporter(lines, ruleset){\n" +
    "    this.messages = [];\n" +
    "    this.stats = [];\n" +
    "    this.lines = lines;\n" +
    "    this.ruleset = ruleset;\n" +
    "}\n" +
    "\n" +
    "Reporter.prototype = {\n" +
    "    constructor: Reporter,\n" +
    "    error: function(message, line, col, rule){\n" +
    "        this.messages.push({\n" +
    "            type    : \"error\",\n" +
    "            line    : line,\n" +
    "            col     : col,\n" +
    "            message : message,\n" +
    "            evidence: this.lines[line-1],\n" +
    "            rule    : rule || {}\n" +
    "        });\n" +
    "    },\n" +
    "    warn: function(message, line, col, rule){\n" +
    "        this.report(message, line, col, rule);\n" +
    "    },\n" +
    "    report: function(message, line, col, rule){\n" +
    "        this.messages.push({\n" +
    "            type    : this.ruleset[rule.id] === 2 ? \"error\" : \"warning\",\n" +
    "            line    : line,\n" +
    "            col     : col,\n" +
    "            message : message,\n" +
    "            evidence: this.lines[line-1],\n" +
    "            rule    : rule\n" +
    "        });\n" +
    "    },\n" +
    "    info: function(message, line, col, rule){\n" +
    "        this.messages.push({\n" +
    "            type    : \"info\",\n" +
    "            line    : line,\n" +
    "            col     : col,\n" +
    "            message : message,\n" +
    "            evidence: this.lines[line-1],\n" +
    "            rule    : rule\n" +
    "        });\n" +
    "    },\n" +
    "    rollupError: function(message, rule){\n" +
    "        this.messages.push({\n" +
    "            type    : \"error\",\n" +
    "            rollup  : true,\n" +
    "            message : message,\n" +
    "            rule    : rule\n" +
    "        });\n" +
    "    },\n" +
    "    rollupWarn: function(message, rule){\n" +
    "        this.messages.push({\n" +
    "            type    : \"warning\",\n" +
    "            rollup  : true,\n" +
    "            message : message,\n" +
    "            rule    : rule\n" +
    "        });\n" +
    "    },\n" +
    "    stat: function(name, value){\n" +
    "        this.stats[name] = value;\n" +
    "    }\n" +
    "};\n" +
    "CSSLint._Reporter = Reporter;\n" +
    "CSSLint.Util = {\n" +
    "    mix: function(receiver, supplier){\n" +
    "        var prop;\n" +
    "\n" +
    "        for (prop in supplier){\n" +
    "            if (supplier.hasOwnProperty(prop)){\n" +
    "                receiver[prop] = supplier[prop];\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return prop;\n" +
    "    },\n" +
    "    indexOf: function(values, value){\n" +
    "        if (values.indexOf){\n" +
    "            return values.indexOf(value);\n" +
    "        } else {\n" +
    "            for (var i=0, len=values.length; i < len; i++){\n" +
    "                if (values[i] === value){\n" +
    "                    return i;\n" +
    "                }\n" +
    "            }\n" +
    "            return -1;\n" +
    "        }\n" +
    "    },\n" +
    "    forEach: function(values, func) {\n" +
    "        if (values.forEach){\n" +
    "            return values.forEach(func);\n" +
    "        } else {\n" +
    "            for (var i=0, len=values.length; i < len; i++){\n" +
    "                func(values[i], i, values);\n" +
    "            }\n" +
    "        }\n" +
    "    }\n" +
    "};\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"adjoining-classes\",\n" +
    "    name: \"Disallow adjoining classes\",\n" +
    "    desc: \"Don't use adjoining classes.\",\n" +
    "    browsers: \"IE6\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                modifier,\n" +
    "                classCount,\n" +
    "                i, j, k;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "                for (j=0; j < selector.parts.length; j++){\n" +
    "                    part = selector.parts[j];\n" +
    "                    if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                        classCount = 0;\n" +
    "                        for (k=0; k < part.modifiers.length; k++){\n" +
    "                            modifier = part.modifiers[k];\n" +
    "                            if (modifier.type === \"class\"){\n" +
    "                                classCount++;\n" +
    "                            }\n" +
    "                            if (classCount > 1){\n" +
    "                                reporter.report(\"Don't use adjoining classes.\", part.line, part.col, rule);\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "CSSLint.addRule({\n" +
    "    id: \"box-model\",\n" +
    "    name: \"Beware of broken box size\",\n" +
    "    desc: \"Don't use width or height when using padding or border.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            widthProperties = {\n" +
    "                border: 1,\n" +
    "                \"border-left\": 1,\n" +
    "                \"border-right\": 1,\n" +
    "                padding: 1,\n" +
    "                \"padding-left\": 1,\n" +
    "                \"padding-right\": 1\n" +
    "            },\n" +
    "            heightProperties = {\n" +
    "                border: 1,\n" +
    "                \"border-bottom\": 1,\n" +
    "                \"border-top\": 1,\n" +
    "                padding: 1,\n" +
    "                \"padding-bottom\": 1,\n" +
    "                \"padding-top\": 1\n" +
    "            },\n" +
    "            properties,\n" +
    "            boxSizing = false;\n" +
    "\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "            boxSizing = false;\n" +
    "        }\n" +
    "\n" +
    "        function endRule(){\n" +
    "            var prop, value;\n" +
    "\n" +
    "            if (!boxSizing) {\n" +
    "                if (properties.height){\n" +
    "                    for (prop in heightProperties){\n" +
    "                        if (heightProperties.hasOwnProperty(prop) && properties[prop]){\n" +
    "                            value = properties[prop].value;\n" +
    "                            if (!(prop === \"padding\" && value.parts.length === 2 && value.parts[0].value === 0)){\n" +
    "                                reporter.report(\"Using height with \" + prop + \" can sometimes make elements larger than you expect.\", properties[prop].line, properties[prop].col, rule);\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                if (properties.width){\n" +
    "                    for (prop in widthProperties){\n" +
    "                        if (widthProperties.hasOwnProperty(prop) && properties[prop]){\n" +
    "                            value = properties[prop].value;\n" +
    "\n" +
    "                            if (!(prop === \"padding\" && value.parts.length === 2 && value.parts[1].value === 0)){\n" +
    "                                reporter.report(\"Using width with \" + prop + \" can sometimes make elements larger than you expect.\", properties[prop].line, properties[prop].col, rule);\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text.toLowerCase();\n" +
    "\n" +
    "            if (heightProperties[name] || widthProperties[name]){\n" +
    "                if (!/^0\\S*$/.test(event.value) && !(name === \"border\" && event.value.toString() === \"none\")){\n" +
    "                    properties[name] = { line: event.property.line, col: event.property.col, value: event.value };\n" +
    "                }\n" +
    "            } else {\n" +
    "                if (/^(width|height)/i.test(name) && /^(length|percentage)/.test(event.value.parts[0].type)){\n" +
    "                    properties[name] = 1;\n" +
    "                } else if (name === \"box-sizing\") {\n" +
    "                    boxSizing = true;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "        parser.addListener(\"endpage\", endRule);\n" +
    "        parser.addListener(\"endpagemargin\", endRule);\n" +
    "        parser.addListener(\"endkeyframerule\", endRule);\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"box-sizing\",\n" +
    "    name: \"Disallow use of box-sizing\",\n" +
    "    desc: \"The box-sizing properties isn't supported in IE6 and IE7.\",\n" +
    "    browsers: \"IE6, IE7\",\n" +
    "    tags: [\"Compatibility\"],\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text.toLowerCase();\n" +
    "\n" +
    "            if (name === \"box-sizing\"){\n" +
    "                reporter.report(\"The box-sizing property isn't supported in IE6 and IE7.\", event.line, event.col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"bulletproof-font-face\",\n" +
    "    name: \"Use the bulletproof @font-face syntax\",\n" +
    "    desc: \"Use the bulletproof @font-face syntax to avoid 404's in old IE (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax).\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            fontFaceRule = false,\n" +
    "            firstSrc     = true,\n" +
    "            ruleFailed    = false,\n" +
    "            line, col;\n" +
    "        parser.addListener(\"startfontface\", function(){\n" +
    "            fontFaceRule = true;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            if (!fontFaceRule) {\n" +
    "                return;\n" +
    "            }\n" +
    "\n" +
    "            var propertyName = event.property.toString().toLowerCase(),\n" +
    "                value        = event.value.toString();\n" +
    "            line = event.line;\n" +
    "            col  = event.col;\n" +
    "            if (propertyName === \"src\") {\n" +
    "                var regex = /^\\s?url\\(['\"].+\\.eot\\?.*['\"]\\)\\s*format\\(['\"]embedded-opentype['\"]\\).*$/i;\n" +
    "                if (!value.match(regex) && firstSrc) {\n" +
    "                    ruleFailed = true;\n" +
    "                    firstSrc = false;\n" +
    "                } else if (value.match(regex) && !firstSrc) {\n" +
    "                    ruleFailed = false;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "\n" +
    "        });\n" +
    "        parser.addListener(\"endfontface\", function(){\n" +
    "            fontFaceRule = false;\n" +
    "\n" +
    "            if (ruleFailed) {\n" +
    "                reporter.report(\"@font-face declaration doesn't follow the fontspring bulletproof syntax.\", line, col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"compatible-vendor-prefixes\",\n" +
    "    name: \"Require compatible vendor prefixes\",\n" +
    "    desc: \"Include all compatible vendor prefixes to reach a wider range of users.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function (parser, reporter) {\n" +
    "        var rule = this,\n" +
    "            compatiblePrefixes,\n" +
    "            properties,\n" +
    "            prop,\n" +
    "            variations,\n" +
    "            prefixed,\n" +
    "            i,\n" +
    "            len,\n" +
    "            inKeyFrame = false,\n" +
    "            arrayPush = Array.prototype.push,\n" +
    "            applyTo = [];\n" +
    "        compatiblePrefixes = {\n" +
    "            \"animation\"                  : \"webkit moz\",\n" +
    "            \"animation-delay\"            : \"webkit moz\",\n" +
    "            \"animation-direction\"        : \"webkit moz\",\n" +
    "            \"animation-duration\"         : \"webkit moz\",\n" +
    "            \"animation-fill-mode\"        : \"webkit moz\",\n" +
    "            \"animation-iteration-count\"  : \"webkit moz\",\n" +
    "            \"animation-name\"             : \"webkit moz\",\n" +
    "            \"animation-play-state\"       : \"webkit moz\",\n" +
    "            \"animation-timing-function\"  : \"webkit moz\",\n" +
    "            \"appearance\"                 : \"webkit moz\",\n" +
    "            \"border-end\"                 : \"webkit moz\",\n" +
    "            \"border-end-color\"           : \"webkit moz\",\n" +
    "            \"border-end-style\"           : \"webkit moz\",\n" +
    "            \"border-end-width\"           : \"webkit moz\",\n" +
    "            \"border-image\"               : \"webkit moz o\",\n" +
    "            \"border-radius\"              : \"webkit\",\n" +
    "            \"border-start\"               : \"webkit moz\",\n" +
    "            \"border-start-color\"         : \"webkit moz\",\n" +
    "            \"border-start-style\"         : \"webkit moz\",\n" +
    "            \"border-start-width\"         : \"webkit moz\",\n" +
    "            \"box-align\"                  : \"webkit moz ms\",\n" +
    "            \"box-direction\"              : \"webkit moz ms\",\n" +
    "            \"box-flex\"                   : \"webkit moz ms\",\n" +
    "            \"box-lines\"                  : \"webkit ms\",\n" +
    "            \"box-ordinal-group\"          : \"webkit moz ms\",\n" +
    "            \"box-orient\"                 : \"webkit moz ms\",\n" +
    "            \"box-pack\"                   : \"webkit moz ms\",\n" +
    "            \"box-sizing\"                 : \"webkit moz\",\n" +
    "            \"box-shadow\"                 : \"webkit moz\",\n" +
    "            \"column-count\"               : \"webkit moz ms\",\n" +
    "            \"column-gap\"                 : \"webkit moz ms\",\n" +
    "            \"column-rule\"                : \"webkit moz ms\",\n" +
    "            \"column-rule-color\"          : \"webkit moz ms\",\n" +
    "            \"column-rule-style\"          : \"webkit moz ms\",\n" +
    "            \"column-rule-width\"          : \"webkit moz ms\",\n" +
    "            \"column-width\"               : \"webkit moz ms\",\n" +
    "            \"hyphens\"                    : \"epub moz\",\n" +
    "            \"line-break\"                 : \"webkit ms\",\n" +
    "            \"margin-end\"                 : \"webkit moz\",\n" +
    "            \"margin-start\"               : \"webkit moz\",\n" +
    "            \"marquee-speed\"              : \"webkit wap\",\n" +
    "            \"marquee-style\"              : \"webkit wap\",\n" +
    "            \"padding-end\"                : \"webkit moz\",\n" +
    "            \"padding-start\"              : \"webkit moz\",\n" +
    "            \"tab-size\"                   : \"moz o\",\n" +
    "            \"text-size-adjust\"           : \"webkit ms\",\n" +
    "            \"transform\"                  : \"webkit moz ms o\",\n" +
    "            \"transform-origin\"           : \"webkit moz ms o\",\n" +
    "            \"transition\"                 : \"webkit moz o\",\n" +
    "            \"transition-delay\"           : \"webkit moz o\",\n" +
    "            \"transition-duration\"        : \"webkit moz o\",\n" +
    "            \"transition-property\"        : \"webkit moz o\",\n" +
    "            \"transition-timing-function\" : \"webkit moz o\",\n" +
    "            \"user-modify\"                : \"webkit moz\",\n" +
    "            \"user-select\"                : \"webkit moz ms\",\n" +
    "            \"word-break\"                 : \"epub ms\",\n" +
    "            \"writing-mode\"               : \"epub ms\"\n" +
    "        };\n" +
    "\n" +
    "\n" +
    "        for (prop in compatiblePrefixes) {\n" +
    "            if (compatiblePrefixes.hasOwnProperty(prop)) {\n" +
    "                variations = [];\n" +
    "                prefixed = compatiblePrefixes[prop].split(\" \");\n" +
    "                for (i = 0, len = prefixed.length; i < len; i++) {\n" +
    "                    variations.push(\"-\" + prefixed[i] + \"-\" + prop);\n" +
    "                }\n" +
    "                compatiblePrefixes[prop] = variations;\n" +
    "                arrayPush.apply(applyTo, variations);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function () {\n" +
    "            properties = [];\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"startkeyframes\", function (event) {\n" +
    "            inKeyFrame = event.prefix || true;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endkeyframes\", function () {\n" +
    "            inKeyFrame = false;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"property\", function (event) {\n" +
    "            var name = event.property;\n" +
    "            if (CSSLint.Util.indexOf(applyTo, name.text) > -1) {\n" +
    "                if (!inKeyFrame || typeof inKeyFrame !== \"string\" ||\n" +
    "                        name.text.indexOf(\"-\" + inKeyFrame + \"-\") !== 0) {\n" +
    "                    properties.push(name);\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", function () {\n" +
    "            if (!properties.length) {\n" +
    "                return;\n" +
    "            }\n" +
    "\n" +
    "            var propertyGroups = {},\n" +
    "                i,\n" +
    "                len,\n" +
    "                name,\n" +
    "                prop,\n" +
    "                variations,\n" +
    "                value,\n" +
    "                full,\n" +
    "                actual,\n" +
    "                item,\n" +
    "                propertiesSpecified;\n" +
    "\n" +
    "            for (i = 0, len = properties.length; i < len; i++) {\n" +
    "                name = properties[i];\n" +
    "\n" +
    "                for (prop in compatiblePrefixes) {\n" +
    "                    if (compatiblePrefixes.hasOwnProperty(prop)) {\n" +
    "                        variations = compatiblePrefixes[prop];\n" +
    "                        if (CSSLint.Util.indexOf(variations, name.text) > -1) {\n" +
    "                            if (!propertyGroups[prop]) {\n" +
    "                                propertyGroups[prop] = {\n" +
    "                                    full : variations.slice(0),\n" +
    "                                    actual : [],\n" +
    "                                    actualNodes: []\n" +
    "                                };\n" +
    "                            }\n" +
    "                            if (CSSLint.Util.indexOf(propertyGroups[prop].actual, name.text) === -1) {\n" +
    "                                propertyGroups[prop].actual.push(name.text);\n" +
    "                                propertyGroups[prop].actualNodes.push(name);\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            for (prop in propertyGroups) {\n" +
    "                if (propertyGroups.hasOwnProperty(prop)) {\n" +
    "                    value = propertyGroups[prop];\n" +
    "                    full = value.full;\n" +
    "                    actual = value.actual;\n" +
    "\n" +
    "                    if (full.length > actual.length) {\n" +
    "                        for (i = 0, len = full.length; i < len; i++) {\n" +
    "                            item = full[i];\n" +
    "                            if (CSSLint.Util.indexOf(actual, item) === -1) {\n" +
    "                                propertiesSpecified = (actual.length === 1) ? actual[0] : (actual.length === 2) ? actual.join(\" and \") : actual.join(\", \");\n" +
    "                                reporter.report(\"The property \" + item + \" is compatible with \" + propertiesSpecified + \" and should be included as well.\", value.actualNodes[0].line, value.actualNodes[0].col, rule);\n" +
    "                            }\n" +
    "                        }\n" +
    "\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"display-property-grouping\",\n" +
    "    name: \"Require properties appropriate for display\",\n" +
    "    desc: \"Certain properties shouldn't be used with certain display property values.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        var propertiesToCheck = {\n" +
    "                display: 1,\n" +
    "                \"float\": \"none\",\n" +
    "                height: 1,\n" +
    "                width: 1,\n" +
    "                margin: 1,\n" +
    "                \"margin-left\": 1,\n" +
    "                \"margin-right\": 1,\n" +
    "                \"margin-bottom\": 1,\n" +
    "                \"margin-top\": 1,\n" +
    "                padding: 1,\n" +
    "                \"padding-left\": 1,\n" +
    "                \"padding-right\": 1,\n" +
    "                \"padding-bottom\": 1,\n" +
    "                \"padding-top\": 1,\n" +
    "                \"vertical-align\": 1\n" +
    "            },\n" +
    "            properties;\n" +
    "\n" +
    "        function reportProperty(name, display, msg){\n" +
    "            if (properties[name]){\n" +
    "                if (typeof propertiesToCheck[name] !== \"string\" || properties[name].value.toLowerCase() !== propertiesToCheck[name]){\n" +
    "                    reporter.report(msg || name + \" can't be used with display: \" + display + \".\", properties[name].line, properties[name].col, rule);\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "        }\n" +
    "\n" +
    "        function endRule(){\n" +
    "\n" +
    "            var display = properties.display ? properties.display.value : null;\n" +
    "            if (display){\n" +
    "                switch(display){\n" +
    "\n" +
    "                    case \"inline\":\n" +
    "                        reportProperty(\"height\", display);\n" +
    "                        reportProperty(\"width\", display);\n" +
    "                        reportProperty(\"margin\", display);\n" +
    "                        reportProperty(\"margin-top\", display);\n" +
    "                        reportProperty(\"margin-bottom\", display);\n" +
    "                        reportProperty(\"float\", display, \"display:inline has no effect on floated elements (but may be used to fix the IE6 double-margin bug).\");\n" +
    "                        break;\n" +
    "\n" +
    "                    case \"block\":\n" +
    "                        reportProperty(\"vertical-align\", display);\n" +
    "                        break;\n" +
    "\n" +
    "                    case \"inline-block\":\n" +
    "                        reportProperty(\"float\", display);\n" +
    "                        break;\n" +
    "\n" +
    "                    default:\n" +
    "                        if (display.indexOf(\"table-\") === 0){\n" +
    "                            reportProperty(\"margin\", display);\n" +
    "                            reportProperty(\"margin-left\", display);\n" +
    "                            reportProperty(\"margin-right\", display);\n" +
    "                            reportProperty(\"margin-top\", display);\n" +
    "                            reportProperty(\"margin-bottom\", display);\n" +
    "                            reportProperty(\"float\", display);\n" +
    "                        }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text.toLowerCase();\n" +
    "\n" +
    "            if (propertiesToCheck[name]){\n" +
    "                properties[name] = { value: event.value.text, line: event.property.line, col: event.property.col };\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "        parser.addListener(\"endkeyframerule\", endRule);\n" +
    "        parser.addListener(\"endpagemargin\", endRule);\n" +
    "        parser.addListener(\"endpage\", endRule);\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"duplicate-background-images\",\n" +
    "    name: \"Disallow duplicate background images\",\n" +
    "    desc: \"Every background-image should be unique. Use a common class for e.g. sprites.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            stack = {};\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text,\n" +
    "                value = event.value,\n" +
    "                i, len;\n" +
    "\n" +
    "            if (name.match(/background/i)) {\n" +
    "                for (i=0, len=value.parts.length; i < len; i++) {\n" +
    "                    if (value.parts[i].type === \"uri\") {\n" +
    "                        if (typeof stack[value.parts[i].uri] === \"undefined\") {\n" +
    "                            stack[value.parts[i].uri] = event;\n" +
    "                        }\n" +
    "                        else {\n" +
    "                            reporter.report(\"Background image '\" + value.parts[i].uri + \"' was used multiple times, first declared at line \" + stack[value.parts[i].uri].line + \", col \" + stack[value.parts[i].uri].col + \".\", event.line, event.col, rule);\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"duplicate-properties\",\n" +
    "    name: \"Disallow duplicate properties\",\n" +
    "    desc: \"Duplicate properties must appear one after the other.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            properties,\n" +
    "            lastProperty;\n" +
    "\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var property = event.property,\n" +
    "                name = property.text.toLowerCase();\n" +
    "\n" +
    "            if (properties[name] && (lastProperty !== name || properties[name] === event.value.text)){\n" +
    "                reporter.report(\"Duplicate property '\" + event.property + \"' found.\", event.line, event.col, rule);\n" +
    "            }\n" +
    "\n" +
    "            properties[name] = event.value.text;\n" +
    "            lastProperty = name;\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"empty-rules\",\n" +
    "    name: \"Disallow empty rules\",\n" +
    "    desc: \"Rules without any properties specified should be removed.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            count = 0;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(){\n" +
    "            count=0;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"property\", function(){\n" +
    "            count++;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", function(event){\n" +
    "            var selectors = event.selectors;\n" +
    "            if (count === 0){\n" +
    "                reporter.report(\"Rule is empty.\", selectors[0].line, selectors[0].col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"errors\",\n" +
    "    name: \"Parsing Errors\",\n" +
    "    desc: \"This rule looks for recoverable syntax errors.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"error\", function(event){\n" +
    "            reporter.error(event.message, event.line, event.col, rule);\n" +
    "        });\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"fallback-colors\",\n" +
    "    name: \"Require fallback colors\",\n" +
    "    desc: \"For older browsers that don't support RGBA, HSL, or HSLA, provide a fallback color.\",\n" +
    "    browsers: \"IE6,IE7,IE8\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            lastProperty,\n" +
    "            propertiesToCheck = {\n" +
    "                color: 1,\n" +
    "                background: 1,\n" +
    "                \"border-color\": 1,\n" +
    "                \"border-top-color\": 1,\n" +
    "                \"border-right-color\": 1,\n" +
    "                \"border-bottom-color\": 1,\n" +
    "                \"border-left-color\": 1,\n" +
    "                border: 1,\n" +
    "                \"border-top\": 1,\n" +
    "                \"border-right\": 1,\n" +
    "                \"border-bottom\": 1,\n" +
    "                \"border-left\": 1,\n" +
    "                \"background-color\": 1\n" +
    "            },\n" +
    "            properties;\n" +
    "\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "            lastProperty = null;\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var property = event.property,\n" +
    "                name = property.text.toLowerCase(),\n" +
    "                parts = event.value.parts,\n" +
    "                i = 0,\n" +
    "                colorType = \"\",\n" +
    "                len = parts.length;\n" +
    "\n" +
    "            if(propertiesToCheck[name]){\n" +
    "                while(i < len){\n" +
    "                    if (parts[i].type === \"color\"){\n" +
    "                        if (\"alpha\" in parts[i] || \"hue\" in parts[i]){\n" +
    "\n" +
    "                            if (/([^\\)]+)\\(/.test(parts[i])){\n" +
    "                                colorType = RegExp.$1.toUpperCase();\n" +
    "                            }\n" +
    "\n" +
    "                            if (!lastProperty || (lastProperty.property.text.toLowerCase() !== name || lastProperty.colorType !== \"compat\")){\n" +
    "                                reporter.report(\"Fallback \" + name + \" (hex or RGB) should precede \" + colorType + \" \" + name + \".\", event.line, event.col, rule);\n" +
    "                            }\n" +
    "                        } else {\n" +
    "                            event.colorType = \"compat\";\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                    i++;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            lastProperty = event;\n" +
    "        });\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"floats\",\n" +
    "    name: \"Disallow too many floats\",\n" +
    "    desc: \"This rule tests if the float property is used too many times\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        var count = 0;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            if (event.property.text.toLowerCase() === \"float\" &&\n" +
    "                    event.value.text.toLowerCase() !== \"none\"){\n" +
    "                count++;\n" +
    "            }\n" +
    "        });\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            reporter.stat(\"floats\", count);\n" +
    "            if (count >= 10){\n" +
    "                reporter.rollupWarn(\"Too many floats (\" + count + \"), you're probably using them for layout. Consider using a grid system instead.\", rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"font-faces\",\n" +
    "    name: \"Don't use too many web fonts\",\n" +
    "    desc: \"Too many different web fonts in the same stylesheet.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            count = 0;\n" +
    "\n" +
    "\n" +
    "        parser.addListener(\"startfontface\", function(){\n" +
    "            count++;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            if (count > 5){\n" +
    "                reporter.rollupWarn(\"Too many @font-face declarations (\" + count + \").\", rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"font-sizes\",\n" +
    "    name: \"Disallow too many font sizes\",\n" +
    "    desc: \"Checks the number of font-size declarations.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            count = 0;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            if (event.property.toString() === \"font-size\"){\n" +
    "                count++;\n" +
    "            }\n" +
    "        });\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            reporter.stat(\"font-sizes\", count);\n" +
    "            if (count >= 10){\n" +
    "                reporter.rollupWarn(\"Too many font-size declarations (\" + count + \"), abstraction needed.\", rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"gradients\",\n" +
    "    name: \"Require all gradient definitions\",\n" +
    "    desc: \"When using a vendor-prefixed gradient, make sure to use them all.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            gradients;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(){\n" +
    "            gradients = {\n" +
    "                moz: 0,\n" +
    "                webkit: 0,\n" +
    "                oldWebkit: 0,\n" +
    "                o: 0\n" +
    "            };\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "\n" +
    "            if (/\\-(moz|o|webkit)(?:\\-(?:linear|radial))\\-gradient/i.test(event.value)){\n" +
    "                gradients[RegExp.$1] = 1;\n" +
    "            } else if (/\\-webkit\\-gradient/i.test(event.value)){\n" +
    "                gradients.oldWebkit = 1;\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", function(event){\n" +
    "            var missing = [];\n" +
    "\n" +
    "            if (!gradients.moz){\n" +
    "                missing.push(\"Firefox 3.6+\");\n" +
    "            }\n" +
    "\n" +
    "            if (!gradients.webkit){\n" +
    "                missing.push(\"Webkit (Safari 5+, Chrome)\");\n" +
    "            }\n" +
    "\n" +
    "            if (!gradients.oldWebkit){\n" +
    "                missing.push(\"Old Webkit (Safari 4+, Chrome)\");\n" +
    "            }\n" +
    "\n" +
    "            if (!gradients.o){\n" +
    "                missing.push(\"Opera 11.1+\");\n" +
    "            }\n" +
    "\n" +
    "            if (missing.length && missing.length < 4){\n" +
    "                reporter.report(\"Missing vendor-prefixed CSS gradients for \" + missing.join(\", \") + \".\", event.selectors[0].line, event.selectors[0].col, rule);\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"ids\",\n" +
    "    name: \"Disallow IDs in selectors\",\n" +
    "    desc: \"Selectors should not contain IDs.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                modifier,\n" +
    "                idCount,\n" +
    "                i, j, k;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "                idCount = 0;\n" +
    "\n" +
    "                for (j=0; j < selector.parts.length; j++){\n" +
    "                    part = selector.parts[j];\n" +
    "                    if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                        for (k=0; k < part.modifiers.length; k++){\n" +
    "                            modifier = part.modifiers[k];\n" +
    "                            if (modifier.type === \"id\"){\n" +
    "                                idCount++;\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "                if (idCount === 1){\n" +
    "                    reporter.report(\"Don't use IDs in selectors.\", selector.line, selector.col, rule);\n" +
    "                } else if (idCount > 1){\n" +
    "                    reporter.report(idCount + \" IDs in the selector, really?\", selector.line, selector.col, rule);\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"import\",\n" +
    "    name: \"Disallow @import\",\n" +
    "    desc: \"Don't use @import, use <link> instead.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"import\", function(event){\n" +
    "            reporter.report(\"@import prevents parallel downloads, use <link> instead.\", event.line, event.col, rule);\n" +
    "        });\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"important\",\n" +
    "    name: \"Disallow !important\",\n" +
    "    desc: \"Be careful when using !important declaration\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            count = 0;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            if (event.important === true){\n" +
    "                count++;\n" +
    "                reporter.report(\"Use of !important\", event.line, event.col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            reporter.stat(\"important\", count);\n" +
    "            if (count >= 10){\n" +
    "                reporter.rollupWarn(\"Too many !important declarations (\" + count + \"), try to use less than 10 to avoid specificity issues.\", rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"known-properties\",\n" +
    "    name: \"Require use of known properties\",\n" +
    "    desc: \"Properties should be known (listed in CSS3 specification) or be a vendor-prefixed property.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            if (event.invalid) {\n" +
    "                reporter.report(event.invalid.message, event.line, event.col, rule);\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "CSSLint.addRule({\n" +
    "    id: \"order-alphabetical\",\n" +
    "    name: \"Alphabetical order\",\n" +
    "    desc: \"Assure properties are in alphabetical order\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            properties;\n" +
    "\n" +
    "        var startRule = function () {\n" +
    "            properties = [];\n" +
    "        };\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text,\n" +
    "                lowerCasePrefixLessName = name.toLowerCase().replace(/^-.*?-/, \"\");\n" +
    "\n" +
    "            properties.push(lowerCasePrefixLessName);\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", function(event){\n" +
    "            var currentProperties = properties.join(\",\"),\n" +
    "                expectedProperties = properties.sort().join(\",\");\n" +
    "\n" +
    "            if (currentProperties !== expectedProperties){\n" +
    "                reporter.report(\"Rule doesn't have all its properties in alphabetical ordered.\", event.line, event.col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"outline-none\",\n" +
    "    name: \"Disallow outline: none\",\n" +
    "    desc: \"Use of outline: none or outline: 0 should be limited to :focus rules.\",\n" +
    "    browsers: \"All\",\n" +
    "    tags: [\"Accessibility\"],\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            lastRule;\n" +
    "\n" +
    "        function startRule(event){\n" +
    "            if (event.selectors){\n" +
    "                lastRule = {\n" +
    "                    line: event.line,\n" +
    "                    col: event.col,\n" +
    "                    selectors: event.selectors,\n" +
    "                    propCount: 0,\n" +
    "                    outline: false\n" +
    "                };\n" +
    "            } else {\n" +
    "                lastRule = null;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        function endRule(){\n" +
    "            if (lastRule){\n" +
    "                if (lastRule.outline){\n" +
    "                    if (lastRule.selectors.toString().toLowerCase().indexOf(\":focus\") === -1){\n" +
    "                        reporter.report(\"Outlines should only be modified using :focus.\", lastRule.line, lastRule.col, rule);\n" +
    "                    } else if (lastRule.propCount === 1) {\n" +
    "                        reporter.report(\"Outlines shouldn't be hidden unless other visual changes are made.\", lastRule.line, lastRule.col, rule);\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text.toLowerCase(),\n" +
    "                value = event.value;\n" +
    "\n" +
    "            if (lastRule){\n" +
    "                lastRule.propCount++;\n" +
    "                if (name === \"outline\" && (value.toString() === \"none\" || value.toString() === \"0\")){\n" +
    "                    lastRule.outline = true;\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "        parser.addListener(\"endpage\", endRule);\n" +
    "        parser.addListener(\"endpagemargin\", endRule);\n" +
    "        parser.addListener(\"endkeyframerule\", endRule);\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"overqualified-elements\",\n" +
    "    name: \"Disallow overqualified elements\",\n" +
    "    desc: \"Don't use classes or IDs with elements (a.foo or a#foo).\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            classes = {};\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                modifier,\n" +
    "                i, j, k;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "\n" +
    "                for (j=0; j < selector.parts.length; j++){\n" +
    "                    part = selector.parts[j];\n" +
    "                    if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                        for (k=0; k < part.modifiers.length; k++){\n" +
    "                            modifier = part.modifiers[k];\n" +
    "                            if (part.elementName && modifier.type === \"id\"){\n" +
    "                                reporter.report(\"Element (\" + part + \") is overqualified, just use \" + modifier + \" without element name.\", part.line, part.col, rule);\n" +
    "                            } else if (modifier.type === \"class\"){\n" +
    "\n" +
    "                                if (!classes[modifier]){\n" +
    "                                    classes[modifier] = [];\n" +
    "                                }\n" +
    "                                classes[modifier].push({ modifier: modifier, part: part });\n" +
    "                            }\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "\n" +
    "            var prop;\n" +
    "            for (prop in classes){\n" +
    "                if (classes.hasOwnProperty(prop)){\n" +
    "                    if (classes[prop].length === 1 && classes[prop][0].part.elementName){\n" +
    "                        reporter.report(\"Element (\" + classes[prop][0].part + \") is overqualified, just use \" + classes[prop][0].modifier + \" without element name.\", classes[prop][0].part.line, classes[prop][0].part.col, rule);\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"qualified-headings\",\n" +
    "    name: \"Disallow qualified headings\",\n" +
    "    desc: \"Headings should not be qualified (namespaced).\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                i, j;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "\n" +
    "                for (j=0; j < selector.parts.length; j++){\n" +
    "                    part = selector.parts[j];\n" +
    "                    if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                        if (part.elementName && /h[1-6]/.test(part.elementName.toString()) && j > 0){\n" +
    "                            reporter.report(\"Heading (\" + part.elementName + \") should not be qualified.\", part.line, part.col, rule);\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"regex-selectors\",\n" +
    "    name: \"Disallow selectors that look like regexs\",\n" +
    "    desc: \"Selectors that look like regular expressions are slow and should be avoided.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                modifier,\n" +
    "                i, j, k;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "                for (j=0; j < selector.parts.length; j++){\n" +
    "                    part = selector.parts[j];\n" +
    "                    if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                        for (k=0; k < part.modifiers.length; k++){\n" +
    "                            modifier = part.modifiers[k];\n" +
    "                            if (modifier.type === \"attribute\"){\n" +
    "                                if (/([\\~\\|\\^\\$\\*]=)/.test(modifier)){\n" +
    "                                    reporter.report(\"Attribute selectors with \" + RegExp.$1 + \" are slow!\", modifier.line, modifier.col, rule);\n" +
    "                                }\n" +
    "                            }\n" +
    "\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"rules-count\",\n" +
    "    name: \"Rules Count\",\n" +
    "    desc: \"Track how many rules there are.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var count = 0;\n" +
    "        parser.addListener(\"startrule\", function(){\n" +
    "            count++;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            reporter.stat(\"rule-count\", count);\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"selector-max-approaching\",\n" +
    "    name: \"Warn when approaching the 4095 selector limit for IE\",\n" +
    "    desc: \"Will warn when selector count is >= 3800 selectors.\",\n" +
    "    browsers: \"IE\",\n" +
    "    init: function(parser, reporter) {\n" +
    "        var rule = this, count = 0;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event) {\n" +
    "            count += event.selectors.length;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function() {\n" +
    "            if (count >= 3800) {\n" +
    "                reporter.report(\"You have \" + count + \" selectors. Internet Explorer supports a maximum of 4095 selectors per stylesheet. Consider refactoring.\",0,0,rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"selector-max\",\n" +
    "    name: \"Error when past the 4095 selector limit for IE\",\n" +
    "    desc: \"Will error when selector count is > 4095.\",\n" +
    "    browsers: \"IE\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this, count = 0;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event) {\n" +
    "            count += event.selectors.length;\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function() {\n" +
    "            if (count > 4095) {\n" +
    "                reporter.report(\"You have \" + count + \" selectors. Internet Explorer supports a maximum of 4095 selectors per stylesheet. Consider refactoring.\",0,0,rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"selector-newline\",\n" +
    "    name: \"Disallow new-line characters in selectors\",\n" +
    "    desc: \"New-line characters in selectors are usually a forgotten comma and not a descendant combinator.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter) {\n" +
    "        var rule = this;\n" +
    "\n" +
    "        function startRule(event) {\n" +
    "            var i, len, selector, p, n, pLen, part, part2, type, currentLine, nextLine,\n" +
    "                selectors = event.selectors;\n" +
    "\n" +
    "            for (i = 0, len = selectors.length; i < len; i++) {\n" +
    "                selector = selectors[i];\n" +
    "                for (p = 0, pLen = selector.parts.length; p < pLen; p++) {\n" +
    "                    for (n = p + 1; n < pLen; n++) {\n" +
    "                        part = selector.parts[p];\n" +
    "                        part2 = selector.parts[n];\n" +
    "                        type = part.type;\n" +
    "                        currentLine = part.line;\n" +
    "                        nextLine = part2.line;\n" +
    "\n" +
    "                        if (type === \"descendant\" && nextLine > currentLine) {\n" +
    "                            reporter.report(\"newline character found in selector (forgot a comma?)\", currentLine, selectors[i].parts[0].col, rule);\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"shorthand\",\n" +
    "    name: \"Require shorthand properties\",\n" +
    "    desc: \"Use shorthand properties where possible.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            prop, i, len,\n" +
    "            propertiesToCheck = {},\n" +
    "            properties,\n" +
    "            mapping = {\n" +
    "                \"margin\": [\n" +
    "                    \"margin-top\",\n" +
    "                    \"margin-bottom\",\n" +
    "                    \"margin-left\",\n" +
    "                    \"margin-right\"\n" +
    "                ],\n" +
    "                \"padding\": [\n" +
    "                    \"padding-top\",\n" +
    "                    \"padding-bottom\",\n" +
    "                    \"padding-left\",\n" +
    "                    \"padding-right\"\n" +
    "                ]\n" +
    "            };\n" +
    "        for (prop in mapping){\n" +
    "            if (mapping.hasOwnProperty(prop)){\n" +
    "                for (i=0, len=mapping[prop].length; i < len; i++){\n" +
    "                    propertiesToCheck[mapping[prop][i]] = prop;\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "        }\n" +
    "        function endRule(event){\n" +
    "\n" +
    "            var prop, i, len, total;\n" +
    "            for (prop in mapping){\n" +
    "                if (mapping.hasOwnProperty(prop)){\n" +
    "                    total=0;\n" +
    "\n" +
    "                    for (i=0, len=mapping[prop].length; i < len; i++){\n" +
    "                        total += properties[mapping[prop][i]] ? 1 : 0;\n" +
    "                    }\n" +
    "\n" +
    "                    if (total === mapping[prop].length){\n" +
    "                        reporter.report(\"The properties \" + mapping[prop].join(\", \") + \" can be replaced by \" + prop + \".\", event.line, event.col, rule);\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.toString().toLowerCase();\n" +
    "\n" +
    "            if (propertiesToCheck[name]){\n" +
    "                properties[name] = 1;\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"star-property-hack\",\n" +
    "    name: \"Disallow properties with a star prefix\",\n" +
    "    desc: \"Checks for the star property hack (targets IE6/7)\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var property = event.property;\n" +
    "\n" +
    "            if (property.hack === \"*\") {\n" +
    "                reporter.report(\"Property with star prefix found.\", event.property.line, event.property.col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"text-indent\",\n" +
    "    name: \"Disallow negative text-indent\",\n" +
    "    desc: \"Checks for text indent less than -99px\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            textIndent,\n" +
    "            direction;\n" +
    "\n" +
    "\n" +
    "        function startRule(){\n" +
    "            textIndent = false;\n" +
    "            direction = \"inherit\";\n" +
    "        }\n" +
    "        function endRule(){\n" +
    "            if (textIndent && direction !== \"ltr\"){\n" +
    "                reporter.report(\"Negative text-indent doesn't work well with RTL. If you use text-indent for image replacement explicitly set direction for that item to ltr.\", textIndent.line, textIndent.col, rule);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.toString().toLowerCase(),\n" +
    "                value = event.value;\n" +
    "\n" +
    "            if (name === \"text-indent\" && value.parts[0].value < -99){\n" +
    "                textIndent = event.property;\n" +
    "            } else if (name === \"direction\" && value.toString() === \"ltr\"){\n" +
    "                direction = \"ltr\";\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"underscore-property-hack\",\n" +
    "    name: \"Disallow properties with an underscore prefix\",\n" +
    "    desc: \"Checks for the underscore property hack (targets IE6)\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var property = event.property;\n" +
    "\n" +
    "            if (property.hack === \"_\") {\n" +
    "                reporter.report(\"Property with underscore prefix found.\", event.property.line, event.property.col, rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"unique-headings\",\n" +
    "    name: \"Headings should only be defined once\",\n" +
    "    desc: \"Headings should be defined only once.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        var headings = {\n" +
    "                h1: 0,\n" +
    "                h2: 0,\n" +
    "                h3: 0,\n" +
    "                h4: 0,\n" +
    "                h5: 0,\n" +
    "                h6: 0\n" +
    "            };\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                pseudo,\n" +
    "                i, j;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "                part = selector.parts[selector.parts.length-1];\n" +
    "\n" +
    "                if (part.elementName && /(h[1-6])/i.test(part.elementName.toString())){\n" +
    "\n" +
    "                    for (j=0; j < part.modifiers.length; j++){\n" +
    "                        if (part.modifiers[j].type === \"pseudo\"){\n" +
    "                            pseudo = true;\n" +
    "                            break;\n" +
    "                        }\n" +
    "                    }\n" +
    "\n" +
    "                    if (!pseudo){\n" +
    "                        headings[RegExp.$1]++;\n" +
    "                        if (headings[RegExp.$1] > 1) {\n" +
    "                            reporter.report(\"Heading (\" + part.elementName + \") has already been defined.\", part.line, part.col, rule);\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endstylesheet\", function(){\n" +
    "            var prop,\n" +
    "                messages = [];\n" +
    "\n" +
    "            for (prop in headings){\n" +
    "                if (headings.hasOwnProperty(prop)){\n" +
    "                    if (headings[prop] > 1){\n" +
    "                        messages.push(headings[prop] + \" \" + prop + \"s\");\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            if (messages.length){\n" +
    "                reporter.rollupWarn(\"You have \" + messages.join(\", \") + \" defined in this stylesheet.\", rule);\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"universal-selector\",\n" +
    "    name: \"Disallow universal selector\",\n" +
    "    desc: \"The universal selector (*) is known to be slow.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                i;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "\n" +
    "                part = selector.parts[selector.parts.length-1];\n" +
    "                if (part.elementName === \"*\"){\n" +
    "                    reporter.report(rule.desc, part.line, part.col, rule);\n" +
    "                }\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"unqualified-attributes\",\n" +
    "    name: \"Disallow unqualified attribute selectors\",\n" +
    "    desc: \"Unqualified attribute selectors are known to be slow.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "\n" +
    "        parser.addListener(\"startrule\", function(event){\n" +
    "\n" +
    "            var selectors = event.selectors,\n" +
    "                selector,\n" +
    "                part,\n" +
    "                modifier,\n" +
    "                i, k;\n" +
    "\n" +
    "            for (i=0; i < selectors.length; i++){\n" +
    "                selector = selectors[i];\n" +
    "\n" +
    "                part = selector.parts[selector.parts.length-1];\n" +
    "                if (part.type === parser.SELECTOR_PART_TYPE){\n" +
    "                    for (k=0; k < part.modifiers.length; k++){\n" +
    "                        modifier = part.modifiers[k];\n" +
    "                        if (modifier.type === \"attribute\" && (!part.elementName || part.elementName === \"*\")){\n" +
    "                            reporter.report(rule.desc, part.line, part.col, rule);\n" +
    "                        }\n" +
    "                    }\n" +
    "                }\n" +
    "\n" +
    "            }\n" +
    "        });\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"vendor-prefix\",\n" +
    "    name: \"Require standard property with vendor prefix\",\n" +
    "    desc: \"When using a vendor-prefixed property, make sure to include the standard one.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this,\n" +
    "            properties,\n" +
    "            num,\n" +
    "            propertiesToCheck = {\n" +
    "                \"-webkit-border-radius\": \"border-radius\",\n" +
    "                \"-webkit-border-top-left-radius\": \"border-top-left-radius\",\n" +
    "                \"-webkit-border-top-right-radius\": \"border-top-right-radius\",\n" +
    "                \"-webkit-border-bottom-left-radius\": \"border-bottom-left-radius\",\n" +
    "                \"-webkit-border-bottom-right-radius\": \"border-bottom-right-radius\",\n" +
    "\n" +
    "                \"-o-border-radius\": \"border-radius\",\n" +
    "                \"-o-border-top-left-radius\": \"border-top-left-radius\",\n" +
    "                \"-o-border-top-right-radius\": \"border-top-right-radius\",\n" +
    "                \"-o-border-bottom-left-radius\": \"border-bottom-left-radius\",\n" +
    "                \"-o-border-bottom-right-radius\": \"border-bottom-right-radius\",\n" +
    "\n" +
    "                \"-moz-border-radius\": \"border-radius\",\n" +
    "                \"-moz-border-radius-topleft\": \"border-top-left-radius\",\n" +
    "                \"-moz-border-radius-topright\": \"border-top-right-radius\",\n" +
    "                \"-moz-border-radius-bottomleft\": \"border-bottom-left-radius\",\n" +
    "                \"-moz-border-radius-bottomright\": \"border-bottom-right-radius\",\n" +
    "\n" +
    "                \"-moz-column-count\": \"column-count\",\n" +
    "                \"-webkit-column-count\": \"column-count\",\n" +
    "\n" +
    "                \"-moz-column-gap\": \"column-gap\",\n" +
    "                \"-webkit-column-gap\": \"column-gap\",\n" +
    "\n" +
    "                \"-moz-column-rule\": \"column-rule\",\n" +
    "                \"-webkit-column-rule\": \"column-rule\",\n" +
    "\n" +
    "                \"-moz-column-rule-style\": \"column-rule-style\",\n" +
    "                \"-webkit-column-rule-style\": \"column-rule-style\",\n" +
    "\n" +
    "                \"-moz-column-rule-color\": \"column-rule-color\",\n" +
    "                \"-webkit-column-rule-color\": \"column-rule-color\",\n" +
    "\n" +
    "                \"-moz-column-rule-width\": \"column-rule-width\",\n" +
    "                \"-webkit-column-rule-width\": \"column-rule-width\",\n" +
    "\n" +
    "                \"-moz-column-width\": \"column-width\",\n" +
    "                \"-webkit-column-width\": \"column-width\",\n" +
    "\n" +
    "                \"-webkit-column-span\": \"column-span\",\n" +
    "                \"-webkit-columns\": \"columns\",\n" +
    "\n" +
    "                \"-moz-box-shadow\": \"box-shadow\",\n" +
    "                \"-webkit-box-shadow\": \"box-shadow\",\n" +
    "\n" +
    "                \"-moz-transform\" : \"transform\",\n" +
    "                \"-webkit-transform\" : \"transform\",\n" +
    "                \"-o-transform\" : \"transform\",\n" +
    "                \"-ms-transform\" : \"transform\",\n" +
    "\n" +
    "                \"-moz-transform-origin\" : \"transform-origin\",\n" +
    "                \"-webkit-transform-origin\" : \"transform-origin\",\n" +
    "                \"-o-transform-origin\" : \"transform-origin\",\n" +
    "                \"-ms-transform-origin\" : \"transform-origin\",\n" +
    "\n" +
    "                \"-moz-box-sizing\" : \"box-sizing\",\n" +
    "                \"-webkit-box-sizing\" : \"box-sizing\"\n" +
    "            };\n" +
    "        function startRule(){\n" +
    "            properties = {};\n" +
    "            num = 1;\n" +
    "        }\n" +
    "        function endRule(){\n" +
    "            var prop,\n" +
    "                i,\n" +
    "                len,\n" +
    "                needed,\n" +
    "                actual,\n" +
    "                needsStandard = [];\n" +
    "\n" +
    "            for (prop in properties){\n" +
    "                if (propertiesToCheck[prop]){\n" +
    "                    needsStandard.push({ actual: prop, needed: propertiesToCheck[prop]});\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "            for (i=0, len=needsStandard.length; i < len; i++){\n" +
    "                needed = needsStandard[i].needed;\n" +
    "                actual = needsStandard[i].actual;\n" +
    "\n" +
    "                if (!properties[needed]){\n" +
    "                    reporter.report(\"Missing standard property '\" + needed + \"' to go along with '\" + actual + \"'.\", properties[actual][0].name.line, properties[actual][0].name.col, rule);\n" +
    "                } else {\n" +
    "                    if (properties[needed][0].pos < properties[actual][0].pos){\n" +
    "                        reporter.report(\"Standard property '\" + needed + \"' should come after vendor-prefixed property '\" + actual + \"'.\", properties[actual][0].name.line, properties[actual][0].name.col, rule);\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "        parser.addListener(\"startrule\", startRule);\n" +
    "        parser.addListener(\"startfontface\", startRule);\n" +
    "        parser.addListener(\"startpage\", startRule);\n" +
    "        parser.addListener(\"startpagemargin\", startRule);\n" +
    "        parser.addListener(\"startkeyframerule\", startRule);\n" +
    "\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var name = event.property.text.toLowerCase();\n" +
    "\n" +
    "            if (!properties[name]){\n" +
    "                properties[name] = [];\n" +
    "            }\n" +
    "\n" +
    "            properties[name].push({ name: event.property, value : event.value, pos:num++ });\n" +
    "        });\n" +
    "\n" +
    "        parser.addListener(\"endrule\", endRule);\n" +
    "        parser.addListener(\"endfontface\", endRule);\n" +
    "        parser.addListener(\"endpage\", endRule);\n" +
    "        parser.addListener(\"endpagemargin\", endRule);\n" +
    "        parser.addListener(\"endkeyframerule\", endRule);\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "CSSLint.addRule({\n" +
    "    id: \"zero-units\",\n" +
    "    name: \"Disallow units for 0 values\",\n" +
    "    desc: \"You don't need to specify units when a value is 0.\",\n" +
    "    browsers: \"All\",\n" +
    "    init: function(parser, reporter){\n" +
    "        var rule = this;\n" +
    "        parser.addListener(\"property\", function(event){\n" +
    "            var parts = event.value.parts,\n" +
    "                i = 0,\n" +
    "                len = parts.length;\n" +
    "\n" +
    "            while(i < len){\n" +
    "                if ((parts[i].units || parts[i].type === \"percentage\") && parts[i].value === 0 && parts[i].type !== \"time\"){\n" +
    "                    reporter.report(\"Values of 0 shouldn't have units specified.\", parts[i].line, parts[i].col, rule);\n" +
    "                }\n" +
    "                i++;\n" +
    "            }\n" +
    "\n" +
    "        });\n" +
    "\n" +
    "    }\n" +
    "\n" +
    "});\n" +
    "\n" +
    "(function() {\n" +
    "    var xmlEscape = function(str) {\n" +
    "        if (!str || str.constructor !== String) {\n" +
    "            return \"\";\n" +
    "        }\n" +
    "\n" +
    "        return str.replace(/[\\\"&><]/g, function(match) {\n" +
    "            switch (match) {\n" +
    "                case \"\\\"\":\n" +
    "                    return \"&quot;\";\n" +
    "                case \"&\":\n" +
    "                    return \"&amp;\";\n" +
    "                case \"<\":\n" +
    "                    return \"&lt;\";\n" +
    "                case \">\":\n" +
    "                    return \"&gt;\";\n" +
    "            }\n" +
    "        });\n" +
    "    };\n" +
    "\n" +
    "    CSSLint.addFormatter({\n" +
    "        id: \"checkstyle-xml\",\n" +
    "        name: \"Checkstyle XML format\",\n" +
    "        startFormat: function(){\n" +
    "            return \"<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\"?><checkstyle>\";\n" +
    "        },\n" +
    "        endFormat: function(){\n" +
    "            return \"</checkstyle>\";\n" +
    "        },\n" +
    "        readError: function(filename, message) {\n" +
    "            return \"<file name=\\\"\" + xmlEscape(filename) + \"\\\"><error line=\\\"0\\\" column=\\\"0\\\" severty=\\\"error\\\" message=\\\"\" + xmlEscape(message) + \"\\\"></error></file>\";\n" +
    "        },\n" +
    "        formatResults: function(results, filename/*, options*/) {\n" +
    "            var messages = results.messages,\n" +
    "                output = [];\n" +
    "            var generateSource = function(rule) {\n" +
    "                if (!rule || !(\"name\" in rule)) {\n" +
    "                    return \"\";\n" +
    "                }\n" +
    "                return \"net.csslint.\" + rule.name.replace(/\\s/g,\"\");\n" +
    "            };\n" +
    "\n" +
    "\n" +
    "\n" +
    "            if (messages.length > 0) {\n" +
    "                output.push(\"<file name=\\\"\"+filename+\"\\\">\");\n" +
    "                CSSLint.Util.forEach(messages, function (message) {\n" +
    "                    if (!message.rollup) {\n" +
    "                        output.push(\"<error line=\\\"\" + message.line + \"\\\" column=\\\"\" + message.col + \"\\\" severity=\\\"\" + message.type + \"\\\"\" +\n" +
    "                          \" message=\\\"\" + xmlEscape(message.message) + \"\\\" source=\\\"\" + generateSource(message.rule) +\"\\\"/>\");\n" +
    "                    }\n" +
    "                });\n" +
    "                output.push(\"</file>\");\n" +
    "            }\n" +
    "\n" +
    "            return output.join(\"\");\n" +
    "        }\n" +
    "    });\n" +
    "\n" +
    "}());\n" +
    "\n" +
    "CSSLint.addFormatter({\n" +
    "    id: \"compact\",\n" +
    "    name: \"Compact, 'porcelain' format\",\n" +
    "    startFormat: function() {\n" +
    "        return \"\";\n" +
    "    },\n" +
    "    endFormat: function() {\n" +
    "        return \"\";\n" +
    "    },\n" +
    "    formatResults: function(results, filename, options) {\n" +
    "        var messages = results.messages,\n" +
    "            output = \"\";\n" +
    "        options = options || {};\n" +
    "        var capitalize = function(str) {\n" +
    "            return str.charAt(0).toUpperCase() + str.slice(1);\n" +
    "        };\n" +
    "\n" +
    "        if (messages.length === 0) {\n" +
    "              return options.quiet ? \"\" : filename + \": Lint Free!\";\n" +
    "        }\n" +
    "\n" +
    "        CSSLint.Util.forEach(messages, function(message) {\n" +
    "            if (message.rollup) {\n" +
    "                output += filename + \": \" + capitalize(message.type) + \" - \" + message.message + \"\\n\";\n" +
    "            } else {\n" +
    "                output += filename + \": \" + \"line \" + message.line +\n" +
    "                    \", col \" + message.col + \", \" + capitalize(message.type) + \" - \" + message.message + \" (\" + message.rule.id + \")\\n\";\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        return output;\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addFormatter({\n" +
    "    id: \"csslint-xml\",\n" +
    "    name: \"CSSLint XML format\",\n" +
    "    startFormat: function(){\n" +
    "        return \"<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\"?><csslint>\";\n" +
    "    },\n" +
    "    endFormat: function(){\n" +
    "        return \"</csslint>\";\n" +
    "    },\n" +
    "    formatResults: function(results, filename/*, options*/) {\n" +
    "        var messages = results.messages,\n" +
    "            output = [];\n" +
    "        var escapeSpecialCharacters = function(str) {\n" +
    "            if (!str || str.constructor !== String) {\n" +
    "                return \"\";\n" +
    "            }\n" +
    "            return str.replace(/\\\"/g, \"'\").replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\");\n" +
    "        };\n" +
    "\n" +
    "        if (messages.length > 0) {\n" +
    "            output.push(\"<file name=\\\"\"+filename+\"\\\">\");\n" +
    "            CSSLint.Util.forEach(messages, function (message) {\n" +
    "                if (message.rollup) {\n" +
    "                    output.push(\"<issue severity=\\\"\" + message.type + \"\\\" reason=\\\"\" + escapeSpecialCharacters(message.message) + \"\\\" evidence=\\\"\" + escapeSpecialCharacters(message.evidence) + \"\\\"/>\");\n" +
    "                } else {\n" +
    "                    output.push(\"<issue line=\\\"\" + message.line + \"\\\" char=\\\"\" + message.col + \"\\\" severity=\\\"\" + message.type + \"\\\"\" +\n" +
    "                        \" reason=\\\"\" + escapeSpecialCharacters(message.message) + \"\\\" evidence=\\\"\" + escapeSpecialCharacters(message.evidence) + \"\\\"/>\");\n" +
    "                }\n" +
    "            });\n" +
    "            output.push(\"</file>\");\n" +
    "        }\n" +
    "\n" +
    "        return output.join(\"\");\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addFormatter({\n" +
    "    id: \"junit-xml\",\n" +
    "    name: \"JUNIT XML format\",\n" +
    "    startFormat: function(){\n" +
    "        return \"<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\"?><testsuites>\";\n" +
    "    },\n" +
    "    endFormat: function() {\n" +
    "        return \"</testsuites>\";\n" +
    "    },\n" +
    "    formatResults: function(results, filename/*, options*/) {\n" +
    "\n" +
    "        var messages = results.messages,\n" +
    "            output = [],\n" +
    "            tests = {\n" +
    "                \"error\": 0,\n" +
    "                \"failure\": 0\n" +
    "            };\n" +
    "        var generateSource = function(rule) {\n" +
    "            if (!rule || !(\"name\" in rule)) {\n" +
    "                return \"\";\n" +
    "            }\n" +
    "            return \"net.csslint.\" + rule.name.replace(/\\s/g,\"\");\n" +
    "        };\n" +
    "        var escapeSpecialCharacters = function(str) {\n" +
    "\n" +
    "            if (!str || str.constructor !== String) {\n" +
    "                return \"\";\n" +
    "            }\n" +
    "\n" +
    "            return str.replace(/\\\"/g, \"'\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\");\n" +
    "\n" +
    "        };\n" +
    "\n" +
    "        if (messages.length > 0) {\n" +
    "\n" +
    "            messages.forEach(function (message) {\n" +
    "                var type = message.type === \"warning\" ? \"error\" : message.type;\n" +
    "                if (!message.rollup) {\n" +
    "                    output.push(\"<testcase time=\\\"0\\\" name=\\\"\" + generateSource(message.rule) + \"\\\">\");\n" +
    "                    output.push(\"<\" + type + \" message=\\\"\" + escapeSpecialCharacters(message.message) + \"\\\"><![CDATA[\" + message.line + \":\" + message.col + \":\" + escapeSpecialCharacters(message.evidence)  + \"]]></\" + type + \">\");\n" +
    "                    output.push(\"</testcase>\");\n" +
    "\n" +
    "                    tests[type] += 1;\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "            });\n" +
    "\n" +
    "            output.unshift(\"<testsuite time=\\\"0\\\" tests=\\\"\" + messages.length + \"\\\" skipped=\\\"0\\\" errors=\\\"\" + tests.error + \"\\\" failures=\\\"\" + tests.failure + \"\\\" package=\\\"net.csslint\\\" name=\\\"\" + filename + \"\\\">\");\n" +
    "            output.push(\"</testsuite>\");\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "        return output.join(\"\");\n" +
    "\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addFormatter({\n" +
    "    id: \"lint-xml\",\n" +
    "    name: \"Lint XML format\",\n" +
    "    startFormat: function(){\n" +
    "        return \"<?xml version=\\\"1.0\\\" encoding=\\\"utf-8\\\"?><lint>\";\n" +
    "    },\n" +
    "    endFormat: function(){\n" +
    "        return \"</lint>\";\n" +
    "    },\n" +
    "    formatResults: function(results, filename/*, options*/) {\n" +
    "        var messages = results.messages,\n" +
    "            output = [];\n" +
    "        var escapeSpecialCharacters = function(str) {\n" +
    "            if (!str || str.constructor !== String) {\n" +
    "                return \"\";\n" +
    "            }\n" +
    "            return str.replace(/\\\"/g, \"'\").replace(/&/g, \"&amp;\").replace(/</g, \"&lt;\").replace(/>/g, \"&gt;\");\n" +
    "        };\n" +
    "\n" +
    "        if (messages.length > 0) {\n" +
    "\n" +
    "            output.push(\"<file name=\\\"\"+filename+\"\\\">\");\n" +
    "            CSSLint.Util.forEach(messages, function (message) {\n" +
    "                if (message.rollup) {\n" +
    "                    output.push(\"<issue severity=\\\"\" + message.type + \"\\\" reason=\\\"\" + escapeSpecialCharacters(message.message) + \"\\\" evidence=\\\"\" + escapeSpecialCharacters(message.evidence) + \"\\\"/>\");\n" +
    "                } else {\n" +
    "                    output.push(\"<issue line=\\\"\" + message.line + \"\\\" char=\\\"\" + message.col + \"\\\" severity=\\\"\" + message.type + \"\\\"\" +\n" +
    "                        \" reason=\\\"\" + escapeSpecialCharacters(message.message) + \"\\\" evidence=\\\"\" + escapeSpecialCharacters(message.evidence) + \"\\\"/>\");\n" +
    "                }\n" +
    "            });\n" +
    "            output.push(\"</file>\");\n" +
    "        }\n" +
    "\n" +
    "        return output.join(\"\");\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "CSSLint.addFormatter({\n" +
    "    id: \"text\",\n" +
    "    name: \"Plain Text\",\n" +
    "    startFormat: function() {\n" +
    "        return \"\";\n" +
    "    },\n" +
    "    endFormat: function() {\n" +
    "        return \"\";\n" +
    "    },\n" +
    "    formatResults: function(results, filename, options) {\n" +
    "        var messages = results.messages,\n" +
    "            output = \"\";\n" +
    "        options = options || {};\n" +
    "\n" +
    "        if (messages.length === 0) {\n" +
    "            return options.quiet ? \"\" : \"\\n\\ncsslint: No errors in \" + filename + \".\";\n" +
    "        }\n" +
    "\n" +
    "        output = \"\\n\\ncsslint: There \";\n" +
    "        if (messages.length === 1) {\n" +
    "            output += \"is 1 problem\";\n" +
    "        } else {\n" +
    "            output += \"are \" + messages.length  +  \" problems\";\n" +
    "        }\n" +
    "        output += \" in \" + filename + \".\";\n" +
    "\n" +
    "        var pos = filename.lastIndexOf(\"/\"),\n" +
    "            shortFilename = filename;\n" +
    "\n" +
    "        if (pos === -1){\n" +
    "            pos = filename.lastIndexOf(\"\\\\\");\n" +
    "        }\n" +
    "        if (pos > -1){\n" +
    "            shortFilename = filename.substring(pos+1);\n" +
    "        }\n" +
    "\n" +
    "        CSSLint.Util.forEach(messages, function (message, i) {\n" +
    "            output = output + \"\\n\\n\" + shortFilename;\n" +
    "            if (message.rollup) {\n" +
    "                output += \"\\n\" + (i+1) + \": \" + message.type;\n" +
    "                output += \"\\n\" + message.message;\n" +
    "            } else {\n" +
    "                output += \"\\n\" + (i+1) + \": \" + message.type + \" at line \" + message.line + \", col \" + message.col;\n" +
    "                output += \"\\n\" + message.message;\n" +
    "                output += \"\\n\" + message.evidence;\n" +
    "            }\n" +
    "        });\n" +
    "\n" +
    "        return output;\n" +
    "    }\n" +
    "});\n" +
    "\n" +
    "module.exports.CSSLint = CSSLint;\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/mode/css_worker\",[], function(require, exports, module) {\n" +
    "\"use strict\";\n" +
    "\n" +
    "var oop = require(\"../lib/oop\");\n" +
    "var lang = require(\"../lib/lang\");\n" +
    "var Mirror = require(\"../worker/mirror\").Mirror;\n" +
    "var CSSLint = require(\"./css/csslint\").CSSLint;\n" +
    "\n" +
    "var Worker = exports.Worker = function(sender) {\n" +
    "    Mirror.call(this, sender);\n" +
    "    this.setTimeout(400);\n" +
    "    this.ruleset = null;\n" +
    "    this.setDisabledRules(\"ids|order-alphabetical\");\n" +
    "    this.setInfoRules(\n" +
    "      \"adjoining-classes|qualified-headings|zero-units|gradients|\" +\n" +
    "      \"import|outline-none|vendor-prefix\"\n" +
    "    );\n" +
    "};\n" +
    "\n" +
    "oop.inherits(Worker, Mirror);\n" +
    "\n" +
    "(function() {\n" +
    "    this.setInfoRules = function(ruleNames) {\n" +
    "        if (typeof ruleNames == \"string\")\n" +
    "            ruleNames = ruleNames.split(\"|\");\n" +
    "        this.infoRules = lang.arrayToMap(ruleNames);\n" +
    "        this.doc.getValue() && this.deferredUpdate.schedule(100);\n" +
    "    };\n" +
    "\n" +
    "    this.setDisabledRules = function(ruleNames) {\n" +
    "        if (!ruleNames) {\n" +
    "            this.ruleset = null;\n" +
    "        } else {\n" +
    "            if (typeof ruleNames == \"string\")\n" +
    "                ruleNames = ruleNames.split(\"|\");\n" +
    "            var all = {};\n" +
    "\n" +
    "            CSSLint.getRules().forEach(function(x){\n" +
    "                all[x.id] = true;\n" +
    "            });\n" +
    "            ruleNames.forEach(function(x) {\n" +
    "                delete all[x];\n" +
    "            });\n" +
    "            \n" +
    "            this.ruleset = all;\n" +
    "        }\n" +
    "        this.doc.getValue() && this.deferredUpdate.schedule(100);\n" +
    "    };\n" +
    "\n" +
    "    this.onUpdate = function() {\n" +
    "        var value = this.doc.getValue();\n" +
    "        if (!value)\n" +
    "            return this.sender.emit(\"annotate\", []);\n" +
    "        var infoRules = this.infoRules;\n" +
    "\n" +
    "        var result = CSSLint.verify(value, this.ruleset);\n" +
    "        this.sender.emit(\"annotate\", result.messages.map(function(msg) {\n" +
    "            return {\n" +
    "                row: msg.line - 1,\n" +
    "                column: msg.col - 1,\n" +
    "                text: msg.message,\n" +
    "                type: infoRules[msg.rule.id] ? \"info\" : msg.type,\n" +
    "                rule: msg.rule.name\n" +
    "            };\n" +
    "        }));\n" +
    "    };\n" +
    "\n" +
    "}).call(Worker.prototype);\n" +
    "\n" +
    "});\n" +
    "\n" +
    "define(\"ace/lib/es5-shim\",[], function(require, exports, module) {\n" +
    "\n" +
    "function Empty() {}\n" +
    "\n" +
    "if (!Function.prototype.bind) {\n" +
    "    Function.prototype.bind = function bind(that) { // .length is 1\n" +
    "        var target = this;\n" +
    "        if (typeof target != \"function\") {\n" +
    "            throw new TypeError(\"Function.prototype.bind called on incompatible \" + target);\n" +
    "        }\n" +
    "        var args = slice.call(arguments, 1); // for normal call\n" +
    "        var bound = function () {\n" +
    "\n" +
    "            if (this instanceof bound) {\n" +
    "\n" +
    "                var result = target.apply(\n" +
    "                    this,\n" +
    "                    args.concat(slice.call(arguments))\n" +
    "                );\n" +
    "                if (Object(result) === result) {\n" +
    "                    return result;\n" +
    "                }\n" +
    "                return this;\n" +
    "\n" +
    "            } else {\n" +
    "                return target.apply(\n" +
    "                    that,\n" +
    "                    args.concat(slice.call(arguments))\n" +
    "                );\n" +
    "\n" +
    "            }\n" +
    "\n" +
    "        };\n" +
    "        if(target.prototype) {\n" +
    "            Empty.prototype = target.prototype;\n" +
    "            bound.prototype = new Empty();\n" +
    "            Empty.prototype = null;\n" +
    "        }\n" +
    "        return bound;\n" +
    "    };\n" +
    "}\n" +
    "var call = Function.prototype.call;\n" +
    "var prototypeOfArray = Array.prototype;\n" +
    "var prototypeOfObject = Object.prototype;\n" +
    "var slice = prototypeOfArray.slice;\n" +
    "var _toString = call.bind(prototypeOfObject.toString);\n" +
    "var owns = call.bind(prototypeOfObject.hasOwnProperty);\n" +
    "var defineGetter;\n" +
    "var defineSetter;\n" +
    "var lookupGetter;\n" +
    "var lookupSetter;\n" +
    "var supportsAccessors;\n" +
    "if ((supportsAccessors = owns(prototypeOfObject, \"__defineGetter__\"))) {\n" +
    "    defineGetter = call.bind(prototypeOfObject.__defineGetter__);\n" +
    "    defineSetter = call.bind(prototypeOfObject.__defineSetter__);\n" +
    "    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);\n" +
    "    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);\n" +
    "}\n" +
    "if ([1,2].splice(0).length != 2) {\n" +
    "    if(function() { // test IE < 9 to splice bug - see issue #138\n" +
    "        function makeArray(l) {\n" +
    "            var a = new Array(l+2);\n" +
    "            a[0] = a[1] = 0;\n" +
    "            return a;\n" +
    "        }\n" +
    "        var array = [], lengthBefore;\n" +
    "        \n" +
    "        array.splice.apply(array, makeArray(20));\n" +
    "        array.splice.apply(array, makeArray(26));\n" +
    "\n" +
    "        lengthBefore = array.length; //46\n" +
    "        array.splice(5, 0, \"XXX\"); // add one element\n" +
    "\n" +
    "        lengthBefore + 1 == array.length\n" +
    "\n" +
    "        if (lengthBefore + 1 == array.length) {\n" +
    "            return true;// has right splice implementation without bugs\n" +
    "        }\n" +
    "    }()) {//IE 6/7\n" +
    "        var array_splice = Array.prototype.splice;\n" +
    "        Array.prototype.splice = function(start, deleteCount) {\n" +
    "            if (!arguments.length) {\n" +
    "                return [];\n" +
    "            } else {\n" +
    "                return array_splice.apply(this, [\n" +
    "                    start === void 0 ? 0 : start,\n" +
    "                    deleteCount === void 0 ? (this.length - start) : deleteCount\n" +
    "                ].concat(slice.call(arguments, 2)))\n" +
    "            }\n" +
    "        };\n" +
    "    } else {//IE8\n" +
    "        Array.prototype.splice = function(pos, removeCount){\n" +
    "            var length = this.length;\n" +
    "            if (pos > 0) {\n" +
    "                if (pos > length)\n" +
    "                    pos = length;\n" +
    "            } else if (pos == void 0) {\n" +
    "                pos = 0;\n" +
    "            } else if (pos < 0) {\n" +
    "                pos = Math.max(length + pos, 0);\n" +
    "            }\n" +
    "\n" +
    "            if (!(pos+removeCount < length))\n" +
    "                removeCount = length - pos;\n" +
    "\n" +
    "            var removed = this.slice(pos, pos+removeCount);\n" +
    "            var insert = slice.call(arguments, 2);\n" +
    "            var add = insert.length;            \n" +
    "            if (pos === length) {\n" +
    "                if (add) {\n" +
    "                    this.push.apply(this, insert);\n" +
    "                }\n" +
    "            } else {\n" +
    "                var remove = Math.min(removeCount, length - pos);\n" +
    "                var tailOldPos = pos + remove;\n" +
    "                var tailNewPos = tailOldPos + add - remove;\n" +
    "                var tailCount = length - tailOldPos;\n" +
    "                var lengthAfterRemove = length - remove;\n" +
    "\n" +
    "                if (tailNewPos < tailOldPos) { // case A\n" +
    "                    for (var i = 0; i < tailCount; ++i) {\n" +
    "                        this[tailNewPos+i] = this[tailOldPos+i];\n" +
    "                    }\n" +
    "                } else if (tailNewPos > tailOldPos) { // case B\n" +
    "                    for (i = tailCount; i--; ) {\n" +
    "                        this[tailNewPos+i] = this[tailOldPos+i];\n" +
    "                    }\n" +
    "                } // else, add == remove (nothing to do)\n" +
    "\n" +
    "                if (add && pos === lengthAfterRemove) {\n" +
    "                    this.length = lengthAfterRemove; // truncate array\n" +
    "                    this.push.apply(this, insert);\n" +
    "                } else {\n" +
    "                    this.length = lengthAfterRemove + add; // reserves space\n" +
    "                    for (i = 0; i < add; ++i) {\n" +
    "                        this[pos+i] = insert[i];\n" +
    "                    }\n" +
    "                }\n" +
    "            }\n" +
    "            return removed;\n" +
    "        };\n" +
    "    }\n" +
    "}\n" +
    "if (!Array.isArray) {\n" +
    "    Array.isArray = function isArray(obj) {\n" +
    "        return _toString(obj) == \"[object Array]\";\n" +
    "    };\n" +
    "}\n" +
    "var boxedString = Object(\"a\"),\n" +
    "    splitString = boxedString[0] != \"a\" || !(0 in boxedString);\n" +
    "\n" +
    "if (!Array.prototype.forEach) {\n" +
    "    Array.prototype.forEach = function forEach(fun /*, thisp*/) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            thisp = arguments[1],\n" +
    "            i = -1,\n" +
    "            length = self.length >>> 0;\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(); // TODO message\n" +
    "        }\n" +
    "\n" +
    "        while (++i < length) {\n" +
    "            if (i in self) {\n" +
    "                fun.call(thisp, self[i], i, object);\n" +
    "            }\n" +
    "        }\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.map) {\n" +
    "    Array.prototype.map = function map(fun /*, thisp*/) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            length = self.length >>> 0,\n" +
    "            result = Array(length),\n" +
    "            thisp = arguments[1];\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "\n" +
    "        for (var i = 0; i < length; i++) {\n" +
    "            if (i in self)\n" +
    "                result[i] = fun.call(thisp, self[i], i, object);\n" +
    "        }\n" +
    "        return result;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.filter) {\n" +
    "    Array.prototype.filter = function filter(fun /*, thisp */) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                    object,\n" +
    "            length = self.length >>> 0,\n" +
    "            result = [],\n" +
    "            value,\n" +
    "            thisp = arguments[1];\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "\n" +
    "        for (var i = 0; i < length; i++) {\n" +
    "            if (i in self) {\n" +
    "                value = self[i];\n" +
    "                if (fun.call(thisp, value, i, object)) {\n" +
    "                    result.push(value);\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "        return result;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.every) {\n" +
    "    Array.prototype.every = function every(fun /*, thisp */) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            length = self.length >>> 0,\n" +
    "            thisp = arguments[1];\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "\n" +
    "        for (var i = 0; i < length; i++) {\n" +
    "            if (i in self && !fun.call(thisp, self[i], i, object)) {\n" +
    "                return false;\n" +
    "            }\n" +
    "        }\n" +
    "        return true;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.some) {\n" +
    "    Array.prototype.some = function some(fun /*, thisp */) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            length = self.length >>> 0,\n" +
    "            thisp = arguments[1];\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "\n" +
    "        for (var i = 0; i < length; i++) {\n" +
    "            if (i in self && fun.call(thisp, self[i], i, object)) {\n" +
    "                return true;\n" +
    "            }\n" +
    "        }\n" +
    "        return false;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.reduce) {\n" +
    "    Array.prototype.reduce = function reduce(fun /*, initial*/) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            length = self.length >>> 0;\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "        if (!length && arguments.length == 1) {\n" +
    "            throw new TypeError(\"reduce of empty array with no initial value\");\n" +
    "        }\n" +
    "\n" +
    "        var i = 0;\n" +
    "        var result;\n" +
    "        if (arguments.length >= 2) {\n" +
    "            result = arguments[1];\n" +
    "        } else {\n" +
    "            do {\n" +
    "                if (i in self) {\n" +
    "                    result = self[i++];\n" +
    "                    break;\n" +
    "                }\n" +
    "                if (++i >= length) {\n" +
    "                    throw new TypeError(\"reduce of empty array with no initial value\");\n" +
    "                }\n" +
    "            } while (true);\n" +
    "        }\n" +
    "\n" +
    "        for (; i < length; i++) {\n" +
    "            if (i in self) {\n" +
    "                result = fun.call(void 0, result, self[i], i, object);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        return result;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.reduceRight) {\n" +
    "    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {\n" +
    "        var object = toObject(this),\n" +
    "            self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                object,\n" +
    "            length = self.length >>> 0;\n" +
    "        if (_toString(fun) != \"[object Function]\") {\n" +
    "            throw new TypeError(fun + \" is not a function\");\n" +
    "        }\n" +
    "        if (!length && arguments.length == 1) {\n" +
    "            throw new TypeError(\"reduceRight of empty array with no initial value\");\n" +
    "        }\n" +
    "\n" +
    "        var result, i = length - 1;\n" +
    "        if (arguments.length >= 2) {\n" +
    "            result = arguments[1];\n" +
    "        } else {\n" +
    "            do {\n" +
    "                if (i in self) {\n" +
    "                    result = self[i--];\n" +
    "                    break;\n" +
    "                }\n" +
    "                if (--i < 0) {\n" +
    "                    throw new TypeError(\"reduceRight of empty array with no initial value\");\n" +
    "                }\n" +
    "            } while (true);\n" +
    "        }\n" +
    "\n" +
    "        do {\n" +
    "            if (i in this) {\n" +
    "                result = fun.call(void 0, result, self[i], i, object);\n" +
    "            }\n" +
    "        } while (i--);\n" +
    "\n" +
    "        return result;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {\n" +
    "    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {\n" +
    "        var self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                toObject(this),\n" +
    "            length = self.length >>> 0;\n" +
    "\n" +
    "        if (!length) {\n" +
    "            return -1;\n" +
    "        }\n" +
    "\n" +
    "        var i = 0;\n" +
    "        if (arguments.length > 1) {\n" +
    "            i = toInteger(arguments[1]);\n" +
    "        }\n" +
    "        i = i >= 0 ? i : Math.max(0, length + i);\n" +
    "        for (; i < length; i++) {\n" +
    "            if (i in self && self[i] === sought) {\n" +
    "                return i;\n" +
    "            }\n" +
    "        }\n" +
    "        return -1;\n" +
    "    };\n" +
    "}\n" +
    "if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {\n" +
    "    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {\n" +
    "        var self = splitString && _toString(this) == \"[object String]\" ?\n" +
    "                this.split(\"\") :\n" +
    "                toObject(this),\n" +
    "            length = self.length >>> 0;\n" +
    "\n" +
    "        if (!length) {\n" +
    "            return -1;\n" +
    "        }\n" +
    "        var i = length - 1;\n" +
    "        if (arguments.length > 1) {\n" +
    "            i = Math.min(i, toInteger(arguments[1]));\n" +
    "        }\n" +
    "        i = i >= 0 ? i : length - Math.abs(i);\n" +
    "        for (; i >= 0; i--) {\n" +
    "            if (i in self && sought === self[i]) {\n" +
    "                return i;\n" +
    "            }\n" +
    "        }\n" +
    "        return -1;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.getPrototypeOf) {\n" +
    "    Object.getPrototypeOf = function getPrototypeOf(object) {\n" +
    "        return object.__proto__ || (\n" +
    "            object.constructor ?\n" +
    "            object.constructor.prototype :\n" +
    "            prototypeOfObject\n" +
    "        );\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.getOwnPropertyDescriptor) {\n" +
    "    var ERR_NON_OBJECT = \"Object.getOwnPropertyDescriptor called on a \" +\n" +
    "                         \"non-object: \";\n" +
    "    Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {\n" +
    "        if ((typeof object != \"object\" && typeof object != \"function\") || object === null)\n" +
    "            throw new TypeError(ERR_NON_OBJECT + object);\n" +
    "        if (!owns(object, property))\n" +
    "            return;\n" +
    "\n" +
    "        var descriptor, getter, setter;\n" +
    "        descriptor =  { enumerable: true, configurable: true };\n" +
    "        if (supportsAccessors) {\n" +
    "            var prototype = object.__proto__;\n" +
    "            object.__proto__ = prototypeOfObject;\n" +
    "\n" +
    "            var getter = lookupGetter(object, property);\n" +
    "            var setter = lookupSetter(object, property);\n" +
    "            object.__proto__ = prototype;\n" +
    "\n" +
    "            if (getter || setter) {\n" +
    "                if (getter) descriptor.get = getter;\n" +
    "                if (setter) descriptor.set = setter;\n" +
    "                return descriptor;\n" +
    "            }\n" +
    "        }\n" +
    "        descriptor.value = object[property];\n" +
    "        return descriptor;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.getOwnPropertyNames) {\n" +
    "    Object.getOwnPropertyNames = function getOwnPropertyNames(object) {\n" +
    "        return Object.keys(object);\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.create) {\n" +
    "    var createEmpty;\n" +
    "    if (Object.prototype.__proto__ === null) {\n" +
    "        createEmpty = function () {\n" +
    "            return { \"__proto__\": null };\n" +
    "        };\n" +
    "    } else {\n" +
    "        createEmpty = function () {\n" +
    "            var empty = {};\n" +
    "            for (var i in empty)\n" +
    "                empty[i] = null;\n" +
    "            empty.constructor =\n" +
    "            empty.hasOwnProperty =\n" +
    "            empty.propertyIsEnumerable =\n" +
    "            empty.isPrototypeOf =\n" +
    "            empty.toLocaleString =\n" +
    "            empty.toString =\n" +
    "            empty.valueOf =\n" +
    "            empty.__proto__ = null;\n" +
    "            return empty;\n" +
    "        }\n" +
    "    }\n" +
    "\n" +
    "    Object.create = function create(prototype, properties) {\n" +
    "        var object;\n" +
    "        if (prototype === null) {\n" +
    "            object = createEmpty();\n" +
    "        } else {\n" +
    "            if (typeof prototype != \"object\")\n" +
    "                throw new TypeError(\"typeof prototype[\"+(typeof prototype)+\"] != 'object'\");\n" +
    "            var Type = function () {};\n" +
    "            Type.prototype = prototype;\n" +
    "            object = new Type();\n" +
    "            object.__proto__ = prototype;\n" +
    "        }\n" +
    "        if (properties !== void 0)\n" +
    "            Object.defineProperties(object, properties);\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "\n" +
    "function doesDefinePropertyWork(object) {\n" +
    "    try {\n" +
    "        Object.defineProperty(object, \"sentinel\", {});\n" +
    "        return \"sentinel\" in object;\n" +
    "    } catch (exception) {\n" +
    "    }\n" +
    "}\n" +
    "if (Object.defineProperty) {\n" +
    "    var definePropertyWorksOnObject = doesDefinePropertyWork({});\n" +
    "    var definePropertyWorksOnDom = typeof document == \"undefined\" ||\n" +
    "        doesDefinePropertyWork(document.createElement(\"div\"));\n" +
    "    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {\n" +
    "        var definePropertyFallback = Object.defineProperty;\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "if (!Object.defineProperty || definePropertyFallback) {\n" +
    "    var ERR_NON_OBJECT_DESCRIPTOR = \"Property description must be an object: \";\n" +
    "    var ERR_NON_OBJECT_TARGET = \"Object.defineProperty called on non-object: \"\n" +
    "    var ERR_ACCESSORS_NOT_SUPPORTED = \"getters & setters can not be defined \" +\n" +
    "                                      \"on this javascript engine\";\n" +
    "\n" +
    "    Object.defineProperty = function defineProperty(object, property, descriptor) {\n" +
    "        if ((typeof object != \"object\" && typeof object != \"function\") || object === null)\n" +
    "            throw new TypeError(ERR_NON_OBJECT_TARGET + object);\n" +
    "        if ((typeof descriptor != \"object\" && typeof descriptor != \"function\") || descriptor === null)\n" +
    "            throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);\n" +
    "        if (definePropertyFallback) {\n" +
    "            try {\n" +
    "                return definePropertyFallback.call(Object, object, property, descriptor);\n" +
    "            } catch (exception) {\n" +
    "            }\n" +
    "        }\n" +
    "        if (owns(descriptor, \"value\")) {\n" +
    "\n" +
    "            if (supportsAccessors && (lookupGetter(object, property) ||\n" +
    "                                      lookupSetter(object, property)))\n" +
    "            {\n" +
    "                var prototype = object.__proto__;\n" +
    "                object.__proto__ = prototypeOfObject;\n" +
    "                delete object[property];\n" +
    "                object[property] = descriptor.value;\n" +
    "                object.__proto__ = prototype;\n" +
    "            } else {\n" +
    "                object[property] = descriptor.value;\n" +
    "            }\n" +
    "        } else {\n" +
    "            if (!supportsAccessors)\n" +
    "                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);\n" +
    "            if (owns(descriptor, \"get\"))\n" +
    "                defineGetter(object, property, descriptor.get);\n" +
    "            if (owns(descriptor, \"set\"))\n" +
    "                defineSetter(object, property, descriptor.set);\n" +
    "        }\n" +
    "\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.defineProperties) {\n" +
    "    Object.defineProperties = function defineProperties(object, properties) {\n" +
    "        for (var property in properties) {\n" +
    "            if (owns(properties, property))\n" +
    "                Object.defineProperty(object, property, properties[property]);\n" +
    "        }\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.seal) {\n" +
    "    Object.seal = function seal(object) {\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.freeze) {\n" +
    "    Object.freeze = function freeze(object) {\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "try {\n" +
    "    Object.freeze(function () {});\n" +
    "} catch (exception) {\n" +
    "    Object.freeze = (function freeze(freezeObject) {\n" +
    "        return function freeze(object) {\n" +
    "            if (typeof object == \"function\") {\n" +
    "                return object;\n" +
    "            } else {\n" +
    "                return freezeObject(object);\n" +
    "            }\n" +
    "        };\n" +
    "    })(Object.freeze);\n" +
    "}\n" +
    "if (!Object.preventExtensions) {\n" +
    "    Object.preventExtensions = function preventExtensions(object) {\n" +
    "        return object;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.isSealed) {\n" +
    "    Object.isSealed = function isSealed(object) {\n" +
    "        return false;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.isFrozen) {\n" +
    "    Object.isFrozen = function isFrozen(object) {\n" +
    "        return false;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.isExtensible) {\n" +
    "    Object.isExtensible = function isExtensible(object) {\n" +
    "        if (Object(object) === object) {\n" +
    "            throw new TypeError(); // TODO message\n" +
    "        }\n" +
    "        var name = '';\n" +
    "        while (owns(object, name)) {\n" +
    "            name += '?';\n" +
    "        }\n" +
    "        object[name] = true;\n" +
    "        var returnValue = owns(object, name);\n" +
    "        delete object[name];\n" +
    "        return returnValue;\n" +
    "    };\n" +
    "}\n" +
    "if (!Object.keys) {\n" +
    "    var hasDontEnumBug = true,\n" +
    "        dontEnums = [\n" +
    "            \"toString\",\n" +
    "            \"toLocaleString\",\n" +
    "            \"valueOf\",\n" +
    "            \"hasOwnProperty\",\n" +
    "            \"isPrototypeOf\",\n" +
    "            \"propertyIsEnumerable\",\n" +
    "            \"constructor\"\n" +
    "        ],\n" +
    "        dontEnumsLength = dontEnums.length;\n" +
    "\n" +
    "    for (var key in {\"toString\": null}) {\n" +
    "        hasDontEnumBug = false;\n" +
    "    }\n" +
    "\n" +
    "    Object.keys = function keys(object) {\n" +
    "\n" +
    "        if (\n" +
    "            (typeof object != \"object\" && typeof object != \"function\") ||\n" +
    "            object === null\n" +
    "        ) {\n" +
    "            throw new TypeError(\"Object.keys called on a non-object\");\n" +
    "        }\n" +
    "\n" +
    "        var keys = [];\n" +
    "        for (var name in object) {\n" +
    "            if (owns(object, name)) {\n" +
    "                keys.push(name);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        if (hasDontEnumBug) {\n" +
    "            for (var i = 0, ii = dontEnumsLength; i < ii; i++) {\n" +
    "                var dontEnum = dontEnums[i];\n" +
    "                if (owns(object, dontEnum)) {\n" +
    "                    keys.push(dontEnum);\n" +
    "                }\n" +
    "            }\n" +
    "        }\n" +
    "        return keys;\n" +
    "    };\n" +
    "\n" +
    "}\n" +
    "if (!Date.now) {\n" +
    "    Date.now = function now() {\n" +
    "        return new Date().getTime();\n" +
    "    };\n" +
    "}\n" +
    "var ws = \"\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\" +\n" +
    "    \"\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\" +\n" +
    "    \"\u2029\uFEFF\";\n" +
    "if (!String.prototype.trim || ws.trim()) {\n" +
    "    ws = \"[\" + ws + \"]\";\n" +
    "    var trimBeginRegexp = new RegExp(\"^\" + ws + ws + \"*\"),\n" +
    "        trimEndRegexp = new RegExp(ws + ws + \"*$\");\n" +
    "    String.prototype.trim = function trim() {\n" +
    "        return String(this).replace(trimBeginRegexp, \"\").replace(trimEndRegexp, \"\");\n" +
    "    };\n" +
    "}\n" +
    "\n" +
    "function toInteger(n) {\n" +
    "    n = +n;\n" +
    "    if (n !== n) { // isNaN\n" +
    "        n = 0;\n" +
    "    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {\n" +
    "        n = (n > 0 || -1) * Math.floor(Math.abs(n));\n" +
    "    }\n" +
    "    return n;\n" +
    "}\n" +
    "\n" +
    "function isPrimitive(input) {\n" +
    "    var type = typeof input;\n" +
    "    return (\n" +
    "        input === null ||\n" +
    "        type === \"undefined\" ||\n" +
    "        type === \"boolean\" ||\n" +
    "        type === \"number\" ||\n" +
    "        type === \"string\"\n" +
    "    );\n" +
    "}\n" +
    "\n" +
    "function toPrimitive(input) {\n" +
    "    var val, valueOf, toString;\n" +
    "    if (isPrimitive(input)) {\n" +
    "        return input;\n" +
    "    }\n" +
    "    valueOf = input.valueOf;\n" +
    "    if (typeof valueOf === \"function\") {\n" +
    "        val = valueOf.call(input);\n" +
    "        if (isPrimitive(val)) {\n" +
    "            return val;\n" +
    "        }\n" +
    "    }\n" +
    "    toString = input.toString;\n" +
    "    if (typeof toString === \"function\") {\n" +
    "        val = toString.call(input);\n" +
    "        if (isPrimitive(val)) {\n" +
    "            return val;\n" +
    "        }\n" +
    "    }\n" +
    "    throw new TypeError();\n" +
    "}\n" +
    "var toObject = function (o) {\n" +
    "    if (o == null) { // this matches both null and undefined\n" +
    "        throw new TypeError(\"can't convert \"+o+\" to object\");\n" +
    "    }\n" +
    "    return Object(o);\n" +
    "};\n" +
    "\n"