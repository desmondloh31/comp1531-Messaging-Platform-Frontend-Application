
import { getData, setData } from './dataStore';

function standupStart(channelId: number, length: number) {
    const data = getData();
    const channel = data.channels.find(i => i.channelId === channelId);
    
}