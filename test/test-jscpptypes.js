const { Cu, Cc, Ci } = require("chrome");
const { CppObject, declare } = require("jscpptypes");
const { createFromURL } = require("sdk/test/tmp-file");

Cu.import("resource://gre/modules/ctypes.jsm");

const { XPCOMABI } = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
const ARCH = XPCOMABI.split("-")[0]; // x86, x86_64

function getSharedLib(name) {
  let filename = "lib" + name + "-" + ARCH + ".so";
  let url = module.uri.replace("test-jscpptypes.js", "shared_libs/" + filename);
  return createFromURL(url, filename);
}

exports["test C library"] = function (assert) {
  let path = getSharedLib("c");
  let lib = ctypes.open(path);
  let MyFunction = declare(lib, "MyFunction", ctypes.long, ctypes.int.ptr, ctypes.int);
  let i = ctypes.int(1);
  let rv = MyFunction(i.address(), 2);
  assert.equal(rv, 3, "MyFunction works");

  let MyClass = CppObject("MyClass");
  let GetObject = declare(lib, "GetObject", MyClass, ctypes.int);
  let obj = GetObject(42);
  assert.ok(parseInt(obj), "GetObject doesn't return a null pointer");
  let GetObjectAttr = declare(lib, "GetObjectAttr", ctypes.int, MyClass);
  let attr = GetObjectAttr(obj);
  assert.equal(attr, 42, "GetObjectAttr works");
}
  
exports["test C++ library"] = function (assert) {
  let path = getSharedLib("cpp");
  let lib = ctypes.open(path);
  let MyFunction = declare(lib, "MyFunction", ctypes.long, ctypes.int.ptr, ctypes.int);
  let i = ctypes.int(1);
  let rv = MyFunction(i.address(), 2);
  assert.equal(rv, 3, "MyFunction works");

  let MyClass = CppObject("MyClass");
  let GetObject = declare(lib, "GetObject", MyClass, ctypes.int);
  let obj = GetObject(42);
  assert.ok(parseInt(obj), "GetObject doesn't return a null pointer");
  let GetObjectAttr = declare(lib, "GetObjectAttr", ctypes.int, MyClass);
  let attr = GetObjectAttr(obj);
  assert.equal(attr, 42, "GetObjectAttr works");
}

require('sdk/test').run(exports);
