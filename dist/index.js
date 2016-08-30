'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _graphql = require('graphql');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function createSchema(schemaSpec, customResolve) {
  var schema = schemaSpec.data.__schema;

  var customTypes = schema.types.filter(isCustomType).map(createType);

  function createType(typeSpec) {
    if (typeSpec.kind === 'SCALAR') {
      return new _graphql.GraphQLScalarType({
        name: typeSpec.name,
        serialize: function serialize(value) {
          return value;
        }
      });
    } else if (typeSpec.kind === 'OBJECT') {
      return new _graphql.GraphQLObjectType({
        name: typeSpec.name,
        fields: function fields() {
          return createFields(typeSpec.fields, customTypes, customResolve);
        }
      });
    } else if (typeSpec.kind === 'ENUM') {
      console.log("WARN: Enum types not supported by graphql-schema-from-introspection");
    } else if (typeSpec.kind === 'INPUT_OBJECT') {
      return new _graphql.GraphQLInputObjectType({
        name: typeSpec.name,
        fields: function fields() {
          return createFields(typeSpec.inputFields, customTypes, customResolve);
        }
      });
    } else {
      console.log(new Error('Cannot create type, unknown kind: ' + JSON.stringify(typeSpec)));
    }
  }

  return new _graphql.GraphQLSchema({
    query: findQueryType(schema, customTypes),
    mutation: findMutationType(schema, customTypes)
  });
}

function findQueryType(schema, customTypes) {
  if (!schema.queryType || !schema.queryType.name) return undefined;
  return _lodash2['default'].find(customTypes, { name: schema.queryType.name });
}

function findMutationType(schema, customTypes) {
  if (!schema.mutationType || !schema.mutationType.name) return undefined;
  return _lodash2['default'].find(customTypes, { name: schema.mutationType.name });
}

function createFields(fieldSpecs, customTypes, customResolve) {
  var fields = {};

  fieldSpecs.forEach(function (fieldSpec) {
    fields[fieldSpec.name] = createField(fieldSpec, customTypes, customResolve);
  });

  return fields;
}

function createField(fieldSpec, customTypes, customResolve) {
  return {
    description: fieldSpec.description ? fieldSpec.description : undefined,
    type: getType(fieldSpec.type, customTypes),
    args: createArgs(fieldSpec.args, customTypes),
    resolve: customResolve ? customResolve(fieldSpec) : function () {
      return null;
    }
  };
}

function createArgs(argSpecs, customTypes) {
  if (!argSpecs) return undefined;

  var args = {};

  argSpecs.forEach(function (argSpec) {
    args[argSpec.name] = createArg(argSpec, customTypes);
  });

  return args;
}

function createArg(argSpec, customTypes) {
  return {
    type: getType(argSpec.type, customTypes)
  };
}

function getType(typeSpec, customTypes) {
  if (typeSpec.name === 'Int' && typeSpec.kind === 'SCALAR') {
    return _graphql.GraphQLInt;
  }
  if (typeSpec.name === 'Float' && typeSpec.kind === 'SCALAR') {
    return _graphql.GraphQLFloat;
  }
  if (typeSpec.name === 'Boolean' && typeSpec.kind === 'SCALAR') {
    return _graphql.GraphQLBoolean;
  }
  if (typeSpec.name === 'String' && typeSpec.kind === 'SCALAR') {
    return _graphql.GraphQLString;
  }
  var customType = _lodash2['default'].find(customTypes, { name: typeSpec.name });
  if (customType) {
    return customType;
  }
  if (typeSpec.kind === 'LIST') {
    var ofType = getType(typeSpec.ofType, customTypes);
    return new _graphql.GraphQLList(ofType);
  }
  if (typeSpec.kind === 'NON_NULL') {
    var ofType = getType(typeSpec.ofType, customTypes);
    return new _graphql.GraphQLNonNull(ofType);
  }
  throw new TypeError('Unknown type: ' + JSON.stringify(typeSpec) + ', custom types: ' + JSON.stringify(customTypes));
}

function isCustomType(type) {
  return !isBuiltInType(type);
}

var builtInTypes = ['Int', 'Float', 'Boolean', 'String', '__Schema', '__Type', '__TypeKind', '__Field', '__InputValue', '__EnumValue', '__Directive'];

function isBuiltInType(type) {
  return builtInTypes.indexOf(type.name) !== -1;
}

createSchema.introspectionQuery = '{\n  __schema {\n    types {\n      name, description, kind\n      fields {\n        name, description\n        type {\n          name, kind\n          ofType {\n            name, kind\n          }\n        }\n        args {\n          name, description\n          type {\n            name, kind\n            ofType {\n              name, kind\n            }\n          }\n        }\n      }\n      inputFields {\n        name\n        type {\n          name, kind\n          ofType {\n            name, kind\n            ofType {\n              name, kind\n            }\n          }\n        }\n        args {\n          name, description\n          type {\n            name, kind\n            ofType {\n              name, kind\n            }\n          }\n        }\n      }\n    }\n    mutationType {\n      name\n    }\n    queryType {\n      name\n    }\n  }\n}';

exports['default'] = createSchema;
module.exports = exports['default'];