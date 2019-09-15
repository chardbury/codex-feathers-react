const { authenticate } = require("@feathersjs/authentication").hooks;
const { restrictToOwner } = require("feathers-authentication-hooks");
const {
  alterItems,
  disallow,
  discard,
  iff,
  isProvider,
  keep,
  setNow
} = require("feathers-hooks-common");

const disallowIfStarted = require("../../hooks/disallow-if-started");
const addHostToNewGame = require("../../hooks/add-host-to-new-game");

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [],
    get: [],
    create: [
      keep("comment"),
      setNow("createdAt"),
      alterItems((item, context) => {
        item.host = context.params.user._id;
        item.started = false;
      })
    ],
    update: [disallow()],
    patch: [
      iff(
        isProvider("external"),
        restrictToOwner({ ownerField: "host" }),
        keep("comment"),
        disallowIfStarted()
      )
    ],
    remove: [disallow()]
  },

  after: {
    all: [iff(isProvider("external"), discard("currentState"))],
    find: [],
    get: [],
    create: [addHostToNewGame()],
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
