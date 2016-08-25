import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull
} from 'graphql'
import _ from 'lodash'

function createSchema (schemaSpec, customResolve) {
  let schema = schemaSpec.data.__schema

  let customTypes = schema.types
    .filter(isCustomType)
    .map(createType)

  function createType (typeSpec) {
    if (typeSpec.kind === 'SCALAR') {
      return new GraphQLScalarType({
        name: typeSpec.name,
        serialize (value) {
          return value
        }
      })
    } else if (typeSpec.kind === 'OBJECT') {
      return new GraphQLObjectType({
        name: typeSpec.name,
        fields: () => createFields(typeSpec.fields, customTypes, customResolve)
      })
    } else if (typeSpec.kind === 'ENUM') {
      console.log("WARN: Enum types not supported by graphql-schema-from-introspection");
    } else if (typeSpec.kind === 'INPUT_OBJECT') {
      return new GraphQLInputObjectType({
        name: typeSpec.name,
        fields: function fields() {
          if (!typeSpec.fields) {
            typeSpec.fields = [
              {type: {ofType: null, name: 'String', kind: 'SCALAR'}, name: 'inputField'}
            ]
          }
          return createFields(typeSpec.fields, customTypes, customResolve);
        }
      });
    } else {
      console.log(new Error('Cannot create type, unknown kind: ' + JSON.stringify(typeSpec)));
    }
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

function createFields (fieldSpecs, customTypes, customResolve) {
  let fields = {}

  fieldSpecs.forEach(fieldSpec => {
    fields[fieldSpec.name] = createField(fieldSpec, customTypes, customResolve)
  })

  return fields
}

function createField (fieldSpec, customTypes, customResolve) {
  return {
    description: fieldSpec.description ? fieldSpec.description : undefined,
    type: getType(fieldSpec.type, customTypes),
    args: createArgs(fieldSpec.args, customTypes),
    resolve: customResolve ? customResolve(fieldSpec) : () => null
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
  if (typeSpec.kind === 'NON_NULL') {
    let ofType = getType(typeSpec.ofType, customTypes)
    return new GraphQLNonNull(ofType)
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
      name, description, kind
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
