utils = {} unless utils?

utils.makeRandId = (size) ->
  text = ""
  possible = "0123456789abcdef"
  i = 0

  while i < size
    text += possible.charAt(Math.floor(Math.random() * possible.length))
    i++
  text
