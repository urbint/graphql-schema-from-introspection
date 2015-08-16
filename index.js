import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList
} from 'graphql'
import _ from 'lodash'

function createSchema (schemaSpec) {
  let schema = schemaSpec.data.__schema

  let customTypes = schema.types
    .filter(isCustomType)
    .map(createType)

  function createType (typeSpec) {
    return new GraphQLObjectType({
      name: typeSpec.name,
      fields: () => createFields(typeSpec.fields, customTypes)
    })
  }

  return new GraphQLSchema({
    query: findQueryType(schema, customTypes),
    mutation: findMutationType(schema, customTypes)
  })
}

function findQueryType (schema, customTypes) {
  if (!schema.queryType || !schema.queryType.name) return undefined
  return _.find(customTypes, {name: schema.queryType.name})
}

function findMutationType (schema, customTypes) {
  if (!schema.mutationType || !schema.mutationType.name) return undefined
  return _.find(customTypes, {name: schema.mutationType.name})
}

function createFields (fieldSpecs, customTypes) {
  let fields = {}

  fieldSpecs.forEach(fieldSpec => {
    fields[fieldSpec.name] = createField(fieldSpec, customTypes)
  })

  return fields
}

function createField (fieldSpec, customTypes) {
  return {
    description: fieldSpec.description ? fieldSpec.description : undefined,
    type: getType(fieldSpec.type, customTypes),
    args: createArgs(fieldSpec.args, customTypes)
  }
}

function createArgs (argSpecs, customTypes) {
  if (!argSpecs) return undefined

  let args = {}

  argSpecs.forEach(argSpec => {
    args[argSpec.name] = createArg(argSpec, customTypes)
  })

  return args
}

function createArg (argSpec, customTypes) {
  return {
    type: getType(argSpec.type, customTypes)
  }
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
  if (typeSpec.kind === 'LIST') {
    let ofType = getType(typeSpec.ofType, customTypes)
    return new GraphQLList(ofType)
  }
  throw new TypeError(`Unknown type: ${JSON.stringify(typeSpec)}, custom types: ${JSON.stringify(customTypes)}`)
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
