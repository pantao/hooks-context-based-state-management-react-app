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
