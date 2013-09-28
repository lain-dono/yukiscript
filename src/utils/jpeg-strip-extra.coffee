utils = {} unless utils?

utils.arrayBufferDataUri = (raw) ->
  base64 = ""
  encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  bytes = new Uint8Array(raw)
  byteLength = bytes.byteLength
  byteRemainder = byteLength % 3
  mainLength = byteLength - byteRemainder
  a = undefined
  b = undefined
  c = undefined
  d = undefined
  chunk = undefined
  
  i = 0

  # Main loop deals with bytes in chunks of 3
  while i < mainLength
    
    # Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    
    # Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 # 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 # 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 # 4032     = (2^6 - 1) << 6
    d = chunk & 63 # 63       = 2^6 - 1
    # Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    i = i + 3
  
  # Deal with the remaining bytes and padding
  if byteRemainder is 1
    chunk = bytes[mainLength]
    a = (chunk & 252) >> 2 # 252 = (2^6 - 1) << 2
    # Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 # 3   = 2^2 - 1
    base64 += encodings[a] + encodings[b] + "=="
  else if byteRemainder is 2
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
    a = (chunk & 16128) >> 8 # 16128 = (2^6 - 1) << 8
    b = (chunk & 1008) >> 4 # 1008  = (2^6 - 1) << 4
    # Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 # 15    = 2^4 - 1
    base64 += encodings[a] + encodings[b] + encodings[c] + "="
  base64

utils.jpegStripExtra = (input) ->
  # Decode the dataURL
  binary = atob(input.split(",")[1])
  
  # Create 8-bit unsigned array
  array = []

  for x,i in binary
    array.push binary.charCodeAt(i)

  orig = new Uint8Array(array)
  outData = new ArrayBuffer(orig.byteLength)
  output = new Uint8Array(outData)
  posO = 2
  posT = 2
  output[0] = orig[0]
  output[1] = orig[1]

  while true
    x = not (orig[posO] is 0xFF and orig[posO + 1] is 0xD9) and
    y = posO <= orig.byteLength
    break  if x and y

    if orig[posO] is 0xFF and orig[posO + 1] is 0xFE
      posO += 2 + orig[posO + 2] * 256 + orig[posO + 3]

    else if orig[posO] is 0xFF and (orig[posO + 1] >> 4) is 0xE
      posO += 2 + orig[posO + 2] * 256 + orig[posO + 3]

    else if orig[posO] is 0xFF and orig[posO + 1] is 0xDA
      l = (2 + orig[posO + 2] * 256 + orig[posO + 3])
      i = 0

      while i < l
        output[posT++] = orig[posO++]
        i++

      while true
        a = orig[posO] is 0xFF and orig[posO + 1] isnt 0
        b = orig[posO + 1] < 0xD0 and orig[posO + 1] > 0xD7
        c =  posO <= orig.byteLength
        break  if not(a and b) and c
        output[posT++] = orig[posO++]

    else
      l = (2 + orig[posO + 2] * 256 + orig[posO + 3])
      i = 0

      while i < l
        output[posT++] = orig[posO++]
        i++

  output[posT] = orig[posO]
  output[posT + 1] = orig[posO + 1]
  output = new Uint8Array(outData, 0, posT + 2)
  "data:image/jpeg;base64," + utils.arrayBufferDataUri(output)

