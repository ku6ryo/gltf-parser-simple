import { JsonValidator } from "../JsonValidator"

enum AccessorComponentType {
  BYTE = 5120,
  UBYTE = 5121,
  SHORT = 5122,
  USHORT = 5123,
  UINT = 5125,
  FLOAT = 5126,
}

export async function loadAndParseGLB(url: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const buffer = await blob.arrayBuffer()
  return await parseGLB(buffer)
}

export async function parseGLB(buffer: ArrayBuffer) {
  checkHeaders(buffer)
  const chunks = extractChunks(buffer)
  console.log(chunks)
  const jsonValidator = new JsonValidator()
  if (jsonValidator.validate(chunks.json)) {
    const { nodes, meshes, bufferViews, accessors } = chunks.json

    if (!chunks.bin || !nodes || !meshes || !bufferViews || !accessors) {
      throw new Error("No mesh")
    }

    // Create array of buffers
    const buffers = accessors.map(a => {
      if (a.bufferView === undefined) {
        return null
      }
      if (!chunks.bin) {
        return null
      }
      const bufferView = bufferViews[a.bufferView]
      const byteOffset = (bufferView.byteOffset || 0) + (a.byteOffset || 0)
      const { componentType, type, count } = a
      const buffer = chunks.bin.slice(byteOffset, byteOffset + bufferView.byteLength)
      return {
        type,
        componentType,
        count,
        buffer,
      }
    })

    const models = nodes.map((n) => {
      if (n.mesh === undefined) {
        return null
      }
      const mesh = meshes[n.mesh]
      const primitive = mesh.primitives[0]
      if (primitive) {
        const positionIndex = primitive.attributes["POSITION"]
        let posBuf: ArrayBuffer | null = null
        let count = 0
        if (positionIndex != undefined && buffers[positionIndex]) {
          const b = buffers[positionIndex]!
          count = b.count
          if (b.componentType !== AccessorComponentType.FLOAT) {
            return null
          }
          if (b.type !== "VEC3") {
            return null
          }
          posBuf = b.buffer
        } else {
          return null
        }
        const normalIndex = primitive.attributes["NORMAL"]
        let normBuf: ArrayBuffer | null = null
        if (normalIndex !== undefined && buffers[normalIndex]) {
          const b = buffers[normalIndex]!
          if (b.componentType !== AccessorComponentType.FLOAT) {
            return null
          }
          if (b.type !== "VEC3") {
            return null
          }
          normBuf = b.buffer
        } else {
          return null
        }
        const textcoordIndex = primitive.attributes["TEXCOORD_0"]
        let tcBuf: ArrayBuffer | null = null
        if (textcoordIndex !== undefined && buffers[textcoordIndex]) {
          const b = buffers[textcoordIndex]!
          if (b.count !== count) {
            return null
          }
          if (b.componentType !== AccessorComponentType.FLOAT) {
            return null
          }
          if (b.type !== "VEC2") {
            return null
          }
          tcBuf = b.buffer
        } else {
          return null
        }
        const indicesIndex = primitive.indices
        let indBuf: ArrayBuffer | null = null
        if (indicesIndex !== undefined && buffers[indicesIndex]) {
          const b = buffers[indicesIndex]!
          if (b.count % 3 !== 0) {
            return null
          }
          if (b.componentType !== AccessorComponentType.USHORT) {
            return null
          }
          if (b.type !== "SCALAR") {
            return null
          }
          indBuf = b.buffer
        } else {
          return null
        }
        return {
          position: posBuf,
          normal: normBuf,
          texCoord: tcBuf,
          indices: indBuf,
          translation: n.translation || [0, 0, 0],
          rotation: n.rotation || [0, 0, 0, 0],
          scale: n.scale || [1, 1, 1]
        }
      } else {
        return null
      }
    })
    return models
  }
  throw new Error("Failed to parse")
}

export function checkHeaders(buffer: ArrayBuffer) {
  const header = new Uint32Array(buffer.slice(0, 12))
  const [magic, version, length] = header
  if (magic != 0x46546C67) {
    throw new Error("Unxpected magic")
  }
  if (version != 2) {
    throw new Error(`Only supports only version 2. Given : ${version}`)
  }
  if (length != buffer.byteLength) {
    throw new Error(`The byte length of the file and the length in header does not match.`)
  }
}

export function extractChunks(buffer: ArrayBuffer) {
  const jsonHeader = new Uint32Array(buffer.slice(12, 20))
  const [jsonLength, jsonType] = jsonHeader
  if (jsonType != 0x4E4F534A) {
    throw new Error("The first chunkType must be JSON")
  }
  const jsonData = buffer.slice(20, 20 + jsonLength)
  const decoder = new TextDecoder()
  const json = JSON.parse((decoder.decode(jsonData)))
  let bin: ArrayBuffer | null = null
  if (20 + jsonLength < buffer.byteLength) {
    const begin = 20 + jsonLength
    const header = new Uint32Array(buffer.slice(begin, begin + 8))
    const [length, type] = header
    if (type != 0x004E4942) {
      throw new Error("The second chunkType must be BIN")
    }
    bin = buffer.slice(begin + 8)
    if (bin.byteLength != length) {
      throw new Error("BIN chunk byte length and the specified value in the header is different")
    }
  }
  return {
    json,
    bin,
  }
}