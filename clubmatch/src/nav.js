import { createContext, useContext } from 'react';

export const NavCtx = createContext({ go: () => {}, openThread: () => {} });
export const useNav = () => useContext(NavCtx);
