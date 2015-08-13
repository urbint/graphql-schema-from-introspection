graphql-schema-from-introspection
=================================

This module can convert results from a GraphQL introspection query to a local
GraphQL schema. The purpose of doing this is to validate GraphQL queries
against that schema.

It is not meant to generate a schema that can connect to data sources since no
resolve functions are created.