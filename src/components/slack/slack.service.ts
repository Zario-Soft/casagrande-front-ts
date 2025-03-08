import axios from "axios";
import { SLACK_TOKEN } from "src/infrastructure/env"

export class SlackService {
    private readonly BASE_URL: string = 'https://api.slack.com/';

    async sendMessageAsync(message: string, channelId: string): Promise<void> {
        const response = await axios.post(
            'chat.postMessage',
            {
                token: SLACK_TOKEN,
                channel: channelId,
                text: message
            },
            {
                baseURL: this.BASE_URL,
                timeout: 30000,
                responseType: 'json',
            }
        );

        return response.data.id;
    }

    
}