# 在 React 应用中使用 Hooks 与 Context 替代 Redux 状态管理

React Hooks 在 2018 年年底就已经公布了，正式发布是在 2019 年 5 月，关于它到底能做什么用，并不在本文的探讨范围之内，本文旨在摸索，如何基于 Hooks 以及 Context，实现多组件的状态共享，完成一个精简版的 Redux。

## 初始化一个 React 项目

```sh
yarn create create-app hooks-context-based-state-management-react-app
cd hooks-context-based-state-management-react-app
yarn start
```

或者可以直接 `clone` 本文完成的项目：

```sh
git clone https://github.com/pantao/hooks-context-based-state-management-react-app.git
```

## 设置我们的 state

绝大多数情况下，我们其实只需要共享会话状态即可，在本文的示例中，我们也就只共享这个，在 `src` 目录下，创建一个 `store/types.js` 文件，它定义我们的 action 类型：

```js
// 设置 session
const SET_SESSION = "SET_TOKEN";
// 销毁会话
const DESTROY_SESSION = "DESTROY_SESSION";

export { SET_SESSION, DESTROY_SESSION };

export default { SET_SESSION, DESTROY_SESSION };
```

接着定义我们的 `src/reducers.js`：

```js
import { SET_SESSION, DESTROY_SESSION } from "./types";

const initialState = {
  // 会话信息
  session: {
    // J.W.T Token
    token: "",
    // 用户信息
    user: null,
    // 过期时间
    expireTime: null
  }
};

const reducer = (state = initialState, action) => {
  console.log({ oldState: state, ...action });

  const { type, payload } = action;
  switch (type) {
    case SET_SESSION:
      return {
        ...state,
        session: {
          ...state.session,
          ...payload
        }
      };
    case DESTROY_SESSION:
      return {
        ...state,
        session: { ...initialState }
      };
    default:
      throw new Error("Unexpected action");
  }
};

export { initialState, reducer };
```

## 创建 `src/actions.js`

```js
import { SET_SESSION, DESTROY_SESSION } from "./types";

export const useActions = (state, dispatch) => {
  return {
    login: async (username, password) => {
      console.log(`login with ${username} & ${password}`);
      const session = await new Promise(resolve => {
        // 模拟接口请求费事 1 秒
        setTimeout(
          () =>
            resolve({
              token: "J.W.T",
              expireTime: new Date("2030-09-09"),
              user: {
                username,
                password
              }
            }),
          1000
        );
      });

      // dispatch SET_TOKEN
      dispatch({
        type: SET_SESSION,
        payload: session
      });

      return session;
    },
    logout: () => {
      dispatch({
        type: DESTROY_SESSION
      });
    }
  };
};
```

## 关键时刻，创建 `store/StoreContext.js`

```js
import React, { createContext, useReducer, useEffect } from "react";
import { reducer, initialState } from "./reducers";
import { useActions } from "./actions";

const StoreContext = createContext(initialState);

function StoreProvider({ children }) {
  // 设置 reducer，得到 `dispatch` 方法以及 `state`
  const [state, dispatch] = useReducer(reducer, initialState);

  // 生成 `actions` 对象
  const actions = useActions(state, dispatch);

  // 打印出新的 `state`
  useEffect(() => {
    console.log({ newState: state });
  }, [state]);

  // 渲染 state, dispatch 以及 actions
  return (
    <StoreContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export { StoreContext, StoreProvider };
```

## 修改 `src/index.js`

打开 `src/index.js`：

```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```

做如下修改：

```js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { StoreProvider } from "./context/StoreContext"; // 导入 StoreProvider 组件

ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
```

## `src/App.js`

内容如下：

```js
import React, { useContext, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import { StoreContext } from "./store/StoreContext";
import { DESTROY_SESSION } from "./store/types";

function App() {
  const { state, dispatch, actions } = useContext(StoreContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, expireTime } = state.session;

  const login = async () => {
    if (!username) {
      return alert("请输入用户名");
    }
    if (!password) {
      return alert("请输入密码");
    }
    setLoading(true);
    try {
      await actions.login(username, password);
      setLoading(false);
      alert("登录成功");
    } catch (error) {
      setLoading(false);
      alert(`登录失败：${error.message}`);
    }
  };

  const logout = () => {
    dispatch({
      type: DESTROY_SESSION
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {loading ? <div className="loading">登录中……</div> : null}
        {user ? (
          <div className="user">
            <div className="field">用户名：{user.username}</div>
            <div className="field">过期时间：{`${expireTime}`}</div>
            <div className="button" onClick={actions.logout}>
              使用 actions.logout 退出登录
            </div>
            <div className="button" onClick={logout}>
              使用 dispatch 退出登录
            </div>
          </div>
        ) : (
          <div className="form">
            <label className="field">
              用户名：
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </label>
            <label className="field">
              密码：
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
              />
            </label>
            <div className="button" onClick={login}>
              登录
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
```

## 总结

整个实现我们使用到了 `React` 的 `useContext` 共享上下文关系，这个是关系、`useEffect` 用来实现 `reducer` 的 `log`，`useReducer` 实现 `redux` 里面的 `combineReducer` 功能，整体上来讲，实现还是足够绝大多数中小型项目使用的。
