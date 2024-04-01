import { atom } from "nanostores"; 
import { persistentAtom, persistentMap } from "@nanostores/persistent";
export const isLogin = atom(false);
export const isHolder = atom(false); 
export const isLoginPersistent = persistentAtom( false );
export const botTypePersistent = persistentAtom( 0 );
export const botConfig = persistentAtom('config','basic');

export const userInfo = persistentMap(
    {
        address: '',
        balance: 0,
})