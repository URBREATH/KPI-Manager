export default {
  namespaced: true,

  state: () => ({
    user: null,
  }),
  mutations: {
    setUser(state, value) {
      state.user = value;
    },
    setState(state, value) {
      state.user = value.user;
      state.token = value.token;
    },
  },
  actions: {
    setUser({ commit }, value) {
      commit("setUser", value);
    },
    setState({ commit }, value) {
      commit("setState", value);
    },
  },
  getters: {
    getState: (state) => {
      return state;
    },
    getUser: (state) => {
      return state.user;
    },
  },
};
