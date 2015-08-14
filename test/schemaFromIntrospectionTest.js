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

    return graphql(schema, createSchema.introspectionQuery)
      .then(schemaSpec => {
        let createdSchema = createSchema(schemaSpec)

        return graphql(createdSchema, createSchema.introspectionQuery)
          .then(createdSchemaSpec => {
            createdSchemaSpec.should.eql(schemaSpec)
          })
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

    return graphql(schema, createSchema.introspectionQuery)
      .then(schemaSpec => {
        let createdSchema = createSchema(schemaSpec)

        return graphql(createdSchema, createSchema.introspectionQuery)
          .then(createdSchemaSpec => {
            createdSchemaSpec.should.eql(schemaSpec)
          })
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

    return graphql(schema, createSchema.introspectionQuery)
      .then(schemaSpec => {
        let createdSchema = createSchema(schemaSpec)

        return graphql(createdSchema, createSchema.introspectionQuery)
          .then(createdSchemaSpec => {
            createdSchemaSpec.should.eql(schemaSpec)
          })
      })
  })

})
