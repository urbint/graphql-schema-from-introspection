import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString
} from 'graphql'
import _ from 'lodash'

function createSchema (schemaSpec) {
  let customTypes = schemaSpec.data.__schema.types
    .filter(isCustomType)
    .map(createType.bind(null, createFields))

  function createFields (fieldSpecs) {
    return () => {
      let fields = {}

      fieldSpecs.forEach(fieldSpec => {
        fields[fieldSpec.name] = createField(fieldSpec, customTypes)
      })

      return fields
    }
  }

  return new GraphQLSchema({
    query: _.find(customTypes, {name: schemaSpec.data.__schema.queryType.name})
  })
}

function createField (fieldSpec, customTypes) {
  return {
    description: fieldSpec.description ? fieldSpec.description : undefined,
    type: getType(fieldSpec.type, customTypes)
  }
}

function createType (createFields, typeSpec) {
  return new GraphQLObjectType({
    name: typeSpec.name,
    fields: createFields(typeSpec.fields)
  })
}

function getType (typeSpec, customTypes) {
  if (typeSpec.name === 'Int' && typeSpec.kind === 'SCALAR') {
    return GraphQLInt
  }
  if (typeSpec.name === 'Float' && typeSpec.kind === 'SCALAR') {
    return GraphQLFloat
  }
  if (typeSpec.name === 'Boolean' && typeSpec.kind === 'SCALAR') {
    return GraphQLBoolean
  }
  if (typeSpec.name === 'String' && typeSpec.kind === 'SCALAR') {
    return GraphQLString
  }
  let customType = _.find(customTypes, {name: typeSpec.name})
  if (customType) {
    return customType
  }
  throw new TypeError('Unknown type: ' + JSON.stringify(typeSpec))
}

function isCustomType (type) {
  return !isBuiltInType(type)
}

let builtInTypes = ['Int', 'Float', 'Boolean', 'String', '__Schema', '__Type', '__TypeKind', '__Field', '__InputValue', '__EnumValue', '__Directive']

function isBuiltInType (type) {
  return builtInTypes.indexOf(type.name) !== -1
}

createSchema.introspectionQuery = `{
  __schema {
    types {
      name, description
      fields {
        name, description
        type {
          name, kind
          ofType {
            name, kind
          }
        }
        args {
          name, description
          type {
            name, kind
            ofType {
              name, kind
            }
          }
        }
      }
    }
    mutationType {
      name
    }
    queryType {
      name
    }
  }
}`

export default createSchema
