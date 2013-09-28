yuki = {} unless yuki?

#utils.EventDispatcherMixin.call yuki
yuki[name] = method for name, method of utils.EventDispatcherMixin.prototype
yuki.modules = {}

yuki.PleaseInitModules = ->
  for name, module of yuki.modules when module.init()
    console.log 'init module', name
    for ev of module when ev != 'init'
      yuki.on ev, module[ev]

