const { authenticate } = require("@feathersjs/authentication").hooks;
const { restrictToOwner } = require("feathers-authentication-hooks");
const {
  disallow,
  discardQuery,
  iff,
  isProvider,
  keep,
  required,
  setNow
} = require("feathers-hooks-common");

const {
  hashPassword,
  protect
} = require("@feathersjs/authentication-local").hooks;

module.exports = {
  before: {
    all: [],
    find: [
      iff(isProvider("external"), discardQuery("password")),
      authenticate("jwt")
    ],
    get: [authenticate("jwt")],
    create: [
      keep("username", "email", "password"),
      required("username", "email", "password"),
      hashPassword("password"),
      setNow("createdAt")
    ],
    update: [disallow()],
    patch: [
      keep("username", "email", "password"),
      hashPassword("password"),
      authenticate("jwt"),
      restrictToOwner({ ownerField: "_id" })
    ],
    remove: [disallow()]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password")
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
