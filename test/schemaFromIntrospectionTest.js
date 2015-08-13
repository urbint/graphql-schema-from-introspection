import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLString
} from 'graphql'
import { describe, it } from 'mocha'

import createSchema from '../'

describe('Schema from Introspection', () => {

  it('handles built in scalars', () => {

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          int: {
            type: GraphQLInt,
            resolve: () => 123
          },
          float: {
            type: GraphQLFloat,
            resolve: () => -1.0
          },
          bool: {
            type: GraphQLBoolean,
            resolve: () => true
          },
          string: {
            type: GraphQLString,
            resolve: () => 'Hello World!'
          }
        }
      })
    })

    return graphql(schema, createSchema.introspectionQuery).then(schemaSpec => {
      schema.should.containSubset(createSchema(schemaSpec))
    })
  })

})
