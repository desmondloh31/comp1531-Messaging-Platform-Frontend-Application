import { setData } from "./dataStore";

export function clearV1(){
    setData({users: [],
            channels: []})      
}