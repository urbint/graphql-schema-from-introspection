import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString
} from 'graphql'

function createSchema (schemaSpec) {
  let queryFields = {}

  schemaSpec.data.__schema.queryType.fields.forEach(fieldSpec => {
    queryFields[fieldSpec.name] = createField(fieldSpec)
  })

  let query = new GraphQLObjectType({
    name: 'Query',
    fields: queryFields
  })

  return new GraphQLSchema({
    query: query
  })
}

function createField (fieldSpec) {
  return {
    description: fieldSpec.description ? fieldSpec.description : undefined,
    type: createType(fieldSpec.type)
  }
}

function createType (typeSpec) {
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
  throw new TypeError('Unknown type: ' + JSON.stringify(typeSpec))
}

createSchema.introspectionQuery = `{
  __schema {
    mutationType {
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
    queryType {
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
  }
}`

export default createSchema
