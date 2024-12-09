import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profiles: [],
  currentProfile: null,
  matches: [],
  loading: false,
  error: null,
};

const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    setProfiles: (state, action) => {
      state.profiles = action.payload;
      state.loading = false;
    },
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload;
    },
    addMatch: (state, action) => {
      state.matches.push(action.payload);
    },
    setMatches: (state, action) => {
      state.matches = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setProfiles,
  setCurrentProfile,
  addMatch,
  setMatches,
  setLoading,
  setError,
} = matchingSlice.actions;

export default matchingSlice.reducer;