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
