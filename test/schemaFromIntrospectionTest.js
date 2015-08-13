import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLFloat
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
            description: 'This is a description',
            type: GraphQLInt,
            resolve: () => 123
          },
          float: {
            type: GraphQLFloat,
            resolve: () => -1.0
          }
        }
      })
    })

    return graphql(schema, createSchema.introspectionQuery).then(schemaSpec => {
      schema.should.containSubset(createSchema(schemaSpec))
    })
  })

})
