utils = {} unless utils?

# Диспетчер событий
class utils.EventDispatcherMixin
  events: {}
  constructor: () ->
    @events = {}

  # Добавляет обработчик события
  # @param key {String} - имя события
  # @param func {Function} - колбек
  # @param context {Object} - контекст
  on: (key, func, context) ->
    func.context = context or this
    @events[key] = []  unless @events.hasOwnProperty(key)
    @events[key].push func

  # Удаляет обработчик события
  # @param key {String} - имя события
  # @param func {Function} - колбек
  off: (key, func) ->
    if @events.hasOwnProperty(key)
      for i of events[key]
        @events[key].splice i, 1  if @events[key][i] is func

  # Инициирует события
  # @param key {String} - имя события
  # @param ... {Any} - остальные аргументы
  emit: (key) ->
    args = [].slice.call(arguments).slice(1)
    if @events.hasOwnProperty(key)
      for i of @events[key]
        func = @events[key][i]
        func.apply func.context, args

