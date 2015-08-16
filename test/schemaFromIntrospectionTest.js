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

import createSchema from '../index'

function introspect (schema) {
  var result = {}

  return graphql(schema, createSchema.introspectionQuery)
    .then(schemaSpec => {
      result.original = schemaSpec
      return graphql(createSchema(schemaSpec), createSchema.introspectionQuery)
    })
    .then(createdSchemaSpec => {
      result.created = createdSchemaSpec
      return result
    })
}

describe('Schema from Introspection', () => {

  it('supports built in scalars', () => {

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

    return introspect(schema).then(schemaSpecs => {
      schemaSpecs.created.should.eql(schemaSpecs.original)
    })
  })

  it('supports custom GraphQLObjectType', () => {

    let customType = new GraphQLObjectType({
      name: 'Custom Type',
      fields: {
        name: {
          type: GraphQLString,
          resolve: () => 'A name'
        }
      }
    })

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          obj: {
            type: customType,
            resolve: () => ({})
          }
        }
      })
    })

    return introspect(schema).then(schemaSpecs => {
      schemaSpecs.created.should.eql(schemaSpecs.original)
    })
  })

  it('supports fields with arguments', () => {

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          aQuery: {
            type: GraphQLInt,
            args: {
              id: {
                type: GraphQLInt
              }
            },
            resolve: () => 1
          }
        }
      })
    })

    return introspect(schema).then(schemaSpecs => {
      schemaSpecs.created.should.eql(schemaSpecs.original)
    })
  })

  it('supports mutation', () => {

    let schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          dummy: {
            type: GraphQLString,
            resolve: () => 'a query type with at least one field is required by graphql'
          }
        }
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
          rand: {
            type: GraphQLInt,
            args: {
              min: {
                type: GraphQLInt
              },
              max: {
                type: GraphQLInt
              }
            },
            resolve: (_, {min, max}) => Math.random() * max + min
          }
        }
      })
    })

    return introspect(schema).then(schemaSpecs => {
      schemaSpecs.created.should.eql(schemaSpecs.original)
    })
  })

})
