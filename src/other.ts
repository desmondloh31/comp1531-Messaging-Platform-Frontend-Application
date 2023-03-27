import { setData } from "./dataStore.js";

export function clearV1(){
    setData({users: [],
            channels: [],
            dms: []})      
}