import React, { useEffect } from 'react';
import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCode as faCodeSolid } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import store from './store';
import { Provider } from 'react-redux';
import Alert from './components/layout/Alert';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/SetAuthToken';
library.add(faCodeSolid);

const App = () => {
  //console.log(localStorage.token);
  setAuthToken(localStorage.token);

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Navbar />
          <Route path='/' exact component={Landing} />
          <section className='container'>
            <Alert />
            <Switch>
              <Route path='/register' exact component={Register} />
              <Route path='/login' exact component={Login} />
              <PrivateRoute path='/dashboard' exact component={Dashboard} />
            </Switch>
          </section>
        </BrowserRouter>
      </Provider>
    </>
  );
};

export default App;
