import { Validator } from "jsonschema"
import accessorSchema from "./schemas/accessor.schema.json"
import accessorSparseIndicesSchema from "./schemas/accessor.sparse.indices.schema.json"
import accessorSparseSchema from "./schemas/accessor.sparse.schema.json"
import accessorSparseValuesSchema from "./schemas/accessor.sparse.values.schema.json"
import animationChannelSchema from "./schemas/animation.channel.schema.json"
import animationChannelTargetSchema from "./schemas/animation.channel.target.schema.json"
import animationSamplerSchema from "./schemas/animation.sampler.schema.json"
import animationSchema from "./schemas/animation.schema.json"
import assetSchema from "./schemas/asset.schema.json"
import bufferSchema from "./schemas/buffer.schema.json"
import bufferView from "./schemas/bufferView.schema.json"
import cameraOrthographicSchema from "./schemas/camera.orthographic.schema.json"
import cameraPerspectiveSchema from "./schemas/camera.perspective.schema.json"
import cameraSchema from "./schemas/camera.schema.json" 
import extensionSchema from "./schemas/extension.schema.json"
import extraSchema from "./schemas/extras.schema.json"
import glTFSchema from "./schemas/glTF.schema.json"
import glTFChildOfRootPropertySchema from "./schemas/glTFChildOfRootProperty.schema.json"
import glTFidSchema from "./schemas/glTFid.schema.json"
import glTFPropertySchema from "./schemas/glTFProperty.schema.json"
import imageSchema from "./schemas/image.schema.json"
import materialNormalTextureInfoSchema from "./schemas/material.normalTextureInfo.schema.json"
import materialOcclusionTextureInfoSchema from "./schemas/material.occlusionTextureInfo.schema.json"
import materialPbrMetallicRoughnessSchema from "./schemas/material.pbrMetallicRoughness.schema.json"
import materialSchema from "./schemas/material.schema.json"
import meshPrimitiveSchema from "./schemas/mesh.primitive.schema.json"
import meshSchema from "./schemas/mesh.schema.json"
import nodeSchema from "./schemas/node.schema.json"
import samplerSchema from "./schemas/sampler.schema.json"
import sceneSchema from "./schemas/scene.schema.json"
import skinSchema from "./schemas/skin.schema.json"
import textureSchema from "./schemas/texture.schema.json"
import textureInfoSchema from "./schemas/textureInfo.schema.json"
import { GlTF } from "./types"

export class JsonValidator {
  validator: Validator

  constructor() {
    this.validator = new Validator()
    this.validator.addSchema(accessorSchema)
    this.validator.addSchema(accessorSparseIndicesSchema)
    this.validator.addSchema(accessorSparseSchema)
    this.validator.addSchema(accessorSparseValuesSchema)
    this.validator.addSchema(animationChannelSchema)
    this.validator.addSchema(animationChannelTargetSchema)
    this.validator.addSchema(animationSamplerSchema)
    this.validator.addSchema(animationSchema)
    this.validator.addSchema(assetSchema)
    this.validator.addSchema(bufferSchema)
    this.validator.addSchema(bufferView)
    this.validator.addSchema(cameraOrthographicSchema)
    this.validator.addSchema(cameraPerspectiveSchema)
    this.validator.addSchema(cameraSchema)
    this.validator.addSchema(extensionSchema)
    this.validator.addSchema(extraSchema)
    this.validator.addSchema(glTFChildOfRootPropertySchema)
    this.validator.addSchema(glTFidSchema)
    this.validator.addSchema(glTFPropertySchema)
    this.validator.addSchema(imageSchema)
    this.validator.addSchema(materialNormalTextureInfoSchema)
    this.validator.addSchema(materialOcclusionTextureInfoSchema)
    this.validator.addSchema(materialPbrMetallicRoughnessSchema)
    this.validator.addSchema(materialSchema)
    this.validator.addSchema(meshPrimitiveSchema)
    this.validator.addSchema(meshSchema)
    this.validator.addSchema(nodeSchema)
    this.validator.addSchema(samplerSchema)
    this.validator.addSchema(sceneSchema)
    this.validator.addSchema(skinSchema)
    this.validator.addSchema(textureSchema)
    this.validator.addSchema(textureInfoSchema)
  }

  validate(json: any): json is GlTF {
    const result = this.validator.validate(json, glTFSchema)
    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message)
    }
    return true
  }
}