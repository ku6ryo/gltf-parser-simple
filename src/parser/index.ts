import { JsonValidator } from "../JsonValidator"

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
  jsonValidator.validate(chunks.json)
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