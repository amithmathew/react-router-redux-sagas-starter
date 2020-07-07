/////////////////////////// Imports

import React from 'react';

// Redux Store init
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';

// React Router
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';


// Redux Reducers
import { combineReducers } from 'redux';

// Connect Redux to Components - HOC
import { connect } from 'react-redux'; 

// Sagas Init Main
import { applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

// Sagas Individual Sagas
import { put, call, takeLatest, takeEvery, all } from 'redux-saga/effects';

/////////////////////////// End of Imports

///////////////////////////
//// 1. Actions and Creators
///////////////////////////

const LOGIN_REQUESTED_ACTION = (username) => ({
  type: "LOGIN_REQUESTED_ACTION",
  payload: username
})

const LOGIN_REQUESTED_ASYNC_ACTION = (username) => ({
  type: "LOGIN_REQUESTED_ASYNC_ACTION",
  payload: username
})

const userLoginActionCreator = (username) => {
  console.log("Within the userLogin Action Creator");
  return LOGIN_REQUESTED_ACTION(username);
}

const userLoginAsyncActionCreator = (username) => {
  console.log("Within the userLoginASYNC Action Creator");
  return LOGIN_REQUESTED_ASYNC_ACTION(username);
}


///////////////////////////
//// 2. Sagas
///////////////////////////

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Worker Saga to update username
function* updateUserNameAsync(action) {
  console.log("Within the Async worker saga. Starting delay");
  console.log(action);
  yield delay(5000);
  //const resp = yield call(fetch, "http://worldtimeapi.org/api/timezone/America/Argentina/Salta");
  //const data = yield resp.json();
  //console.log("Response received.");
  //console.log(data);
  yield put(userLoginActionCreator(action.payload));
}

// Watcher Saga to deal with multiple events
function* watchUpdateUserAsync() {
  console.log("Within the Async Watcher Saga.");
  yield takeEvery("LOGIN_REQUESTED_ASYNC_ACTION", updateUserNameAsync)
}

function* rootSaga() {
  console.log("Inside the root saga.");
  yield all([
    watchUpdateUserAsync()
  ])
}

///////////////////////////
//// 3. Reducers
///////////////////////////

const initialStore = {
  username: null,
  friendlyname: "Unknown"
}

const userLoginReducer = (store = initialStore, action) => {
  console.log ({ ...store, username: action.payload });
  switch (action.type) {
    case 'LOGIN_REQUESTED_ACTION':
      return { ...store, username: action.payload };
    default:
      return store;
  }
};


let reducers = combineReducers({
  userDetails: userLoginReducer
});


///////////////////////////
//// 4. Components
///////////////////////////

function HomePage() {
  return (
    <>
      <header className="App-header">
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
      <ul>
        <li>Hello <a href="/hello"> here</a></li>
        <li>World</li>
      </ul>
    </>
  )
}

// This is a component.
function Hello(helloprops) {
  console.log("My props are ");
  console.log(helloprops);
  return (
    <div>
      <p>The Hello Component - { helloprops.username } and { helloprops.friendlyname } </p>
      <p>Click <button onClick={() => helloprops.modifyUser("Amith")}>here</button> to set name to Amith</p>
      <p>Click <button onClick={() => helloprops.modifyUser()}>here</button> to reset to Null</p>
      <p>Click <button onClick={() => helloprops.modifyUserAsync("Amith")}>here</button> to set name to Amith after 5 seconds.</p>
    </div>
  )
}

// This is an HOC that wraps the above Component for Redux - or a container
const mapStateToProps = (state) => {
  console.log("I'm inside mapStateToProps")
  console.log(state);
  return {
  username: state.userDetails.username,
  friendlyname: state.userDetails.friendlyname
  };
};

const mapDispatchToProps = (dispatch) => ({
  modifyUser: (newName) => dispatch(userLoginActionCreator(newName)),
  modifyUserAsync: (newName) => dispatch(userLoginAsyncActionCreator(newName))
})

const HelloContainer = connect(mapStateToProps, mapDispatchToProps)(Hello);

///////////////////////////
//// 5. MAIN
///////////////////////////

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Redux Dev Tools

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  reducers,
  composeEnhancers(applyMiddleware(sagaMiddleware))
  );

sagaMiddleware.run(rootSaga);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage}></Route>
          <Route path="/hello" component={HelloContainer}></Route>
        </Switch>
      </Router>
      </Provider>
    </div>
  );
}

export default App;
