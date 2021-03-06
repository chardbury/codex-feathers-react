import { createSlice } from "redux-starter-kit";

import { authActions } from "../auth/slice";
import { lobbyActions } from "../lobby/slice";
import CodexGame from "@adam.biltcliffe/codex";

import { annotateDisplayNames } from "../../util";

function advance(state) {
  const begin = Date.now();
  let count = 0;
  while (state.current.steps[state.states.length.toString()] !== undefined) {
    const index = state.states.length;
    const step = state.current.steps[index.toString()];
    const prevState =
      index == "0"
        ? state.current.startState
        : state.states[(index - 1).toString()];
    const newState = CodexGame.replayAction(
      prevState,
      step.action,
      step.newInfo
    );
    state.states.push(annotateDisplayNames(newState));
    count++;
  }
  const elapsed = Date.now() - begin;
  console.log(`Advanced ${count} steps in ${elapsed}ms`);
}

const gameSlice = createSlice({
  slice: "game",
  initialState: {
    current: null,
    states: null,
    loaded: false,
    failed: false,
    pendingAction: false,
    shownIndex: undefined
  },
  reducers: {
    openGame(state, action) {
      state.current = null;
      state.states = [];
      state.loaded = false;
    },
    openGameSuccess(state, action) {
      state.current = action.payload;
      state.loaded = true;
      advance(state);
      state.shownIndex = state.states.length - 1;
    },
    openGameFailure(state, action) {
      state.failed = true;
    },
    closeGame(state, actions) {
      state.current = null;
      state.loaded = false;
      state.failed = false;
      state.states = null;
    },
    act(state, action) {
      state.pendingAction = true;
    },
    actSuccess(state, action) {
      state.pendingAction = false;
    },
    actFailure(state, action) {
      state.pendingAction = false;
    },
    setShownState(state, action) {
      state.shownIndex = action.payload;
    },
    onStepCreated(state, action) {
      if (state.current !== null) {
        const isShowingLatest = state.shownIndex == state.states.length - 1;
        if (action.payload.game == state.current._id) {
          state.current.steps[action.payload.index] = action.payload;
        }
        advance(state);
        if (isShowingLatest) {
          state.shownIndex = state.states.length - 1;
        }
      }
    }
  },
  extraReducers: {
    [authActions.authenticate]: (state, action) => {
      state.current = null;
      state.loaded = false;
      state.failed = false;
      state.states = null;
    },
    [lobbyActions.onGameChanged]: (state, action) => {
      if (state.current !== null && action.payload._id == state.current._id) {
        state.current = { ...action.payload, steps: state.current.steps };
      }
    }
  }
});

export default gameSlice;
export const gameActions = gameSlice.actions;
